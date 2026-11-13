// Расчёт заполненности столовой по данным счётчиков (ESP32 + VL53L1X).
//
// Каждый счётчик (одна дверь) пишет в Firestore:
//   devices/{deviceId}             { canteenId, approved, day, dayIn, dayOut, lastSeen, ... }
//   devices/{deviceId}/days/{дата} { in: { h08: 3, ... }, out: { h08: 1, ... } }
// Здесь данные всех дверей складываются, строится «обычный» день и прогноз.

export const CANTEEN_TZ = 'Asia/Bishkek';
export const OPEN_HOUR = 8;     // начало графика
export const CLOSE_HOUR = 19;   // конец графика
export const ONLINE_TIMEOUT_MS = 12 * 60 * 1000; // счётчик шлёт «пульс» раз в 5 минут
export const HISTORY_DAYS = 35;  // 5 недель истории

export const WEEKDAYS = [
  { short: 'Пн', name: 'понедельник', plural: 'понедельников' },
  { short: 'Вт', name: 'вторник', plural: 'вторников' },
  { short: 'Ср', name: 'среда', plural: 'сред' },
  { short: 'Чт', name: 'четверг', plural: 'четвергов' },
  { short: 'Пт', name: 'пятница', plural: 'пятниц' },
  { short: 'Сб', name: 'суббота', plural: 'суббот' },
  { short: 'Вс', name: 'воскресенье', plural: 'воскресений' },
];

const pad = (n) => String(n).padStart(2, '0');
export const fmtTime = (min) => `${pad(Math.floor(min / 60) % 24)}:${pad(Math.round(min % 60))}`;
const millis = (ts) => (ts && typeof ts.toMillis === 'function' ? ts.toMillis() : 0);

// Дата в часовом поясе столовой в формате YYYY-MM-DD (так же её считает ESP)
export function dayKey(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: CANTEEN_TZ }).format(date);
}
export function daysAgoKey(n) {
  return dayKey(new Date(Date.now() - n * 24 * 3600 * 1000));
}
// Минуты от полуночи сейчас (в часовом поясе столовой)
export function nowMinutes(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: CANTEEN_TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const get = (t) => Number(parts.find((p) => p.type === t)?.value || 0);
  return get('hour') * 60 + get('minute');
}
// Индекс дня недели: 0 = Пн ... 6 = Вс
export function weekdayIndex(key) {
  return (new Date(`${key}T12:00:00`).getDay() + 6) % 7;
}

// ---------- Живое состояние ----------
export function liveOccupancy(devices, today = dayKey()) {
  let occupied = 0;
  let online = 0;
  let lastSeen = 0;
  devices.forEach((d) => {
    if (d.day === today) occupied += (Number(d.dayIn) || 0) - (Number(d.dayOut) || 0);
    const seen = millis(d.lastSeen);
    if (Date.now() - seen < ONLINE_TIMEOUT_MS) online += 1;
    lastSeen = Math.max(lastSeen, seen);
  });
  return { occupied: Math.max(0, occupied), online, total: devices.length, lastSeen };
}

// ---------- История ----------
// Складывает двери одной даты и превращает почасовые входы/выходы в заполненность
// на границах часов: occ[h] — сколько людей было в h:00 (h = 0..24).
export function buildDayCurves(dayDocs) {
  const byDate = new Map();
  dayDocs.forEach(({ date, in: inH = {}, out: outH = {} }) => {
    const acc = byDate.get(date) || { in: new Array(24).fill(0), out: new Array(24).fill(0) };
    for (let h = 0; h < 24; h += 1) {
      acc.in[h] += Number(inH[`h${pad(h)}`]) || 0;
      acc.out[h] += Number(outH[`h${pad(h)}`]) || 0;
    }
    byDate.set(date, acc);
  });
  const curves = new Map();
  byDate.forEach((acc, date) => {
    if (!acc.in.some((v) => v > 0)) return; // день без посетителей — не учитываем
    const occ = [0];
    for (let h = 0; h < 24; h += 1) occ.push(Math.max(0, occ[h] + acc.in[h] - acc.out[h]));
    curves.set(date, occ);
  });
  return curves;
}

const average = (arrays) => arrays[0].map((_, i) => arrays.reduce((s, a) => s + a[i], 0) / arrays.length);

// «Обычный» день для дня недели: среднее по тем же дням прошлых недель.
// Если таких дней ещё нет — среднее по всем прошлым дням.
export function typicalDay(curves, wd, today) {
  const same = [];
  const all = [];
  curves.forEach((occ, date) => {
    if (date >= today) return;
    all.push(occ);
    if (weekdayIndex(date) === wd) same.push(occ);
  });
  if (same.length) {
    return { occ: average(same), samples: same.length, source: `по данным прошлых ${WEEKDAYS[wd].plural}: ${same.length}` };
  }
  if (all.length) {
    return { occ: average(all), samples: all.length, source: `по данным прошлых дней: ${all.length}`, approximate: true };
  }
  return null;
}

// Значение кривой в произвольную минуту (линейно между часами)
export function valueAt(occ, minute) {
  const m = Math.max(0, Math.min(24 * 60, minute));
  const h = Math.floor(m / 60);
  if (h >= 24) return occ[24];
  const f = (m - h * 60) / 60;
  return occ[h] + (occ[h + 1] - occ[h]) * f;
}

// Прогноз на ближайшее время: «обычный» день, сдвинутый на сегодняшнюю разницу.
// Разница постепенно затухает (за ~час), потому что очередь рассасывается.
export function predictAt(typical, occupied, now, minute) {
  const diff = occupied - valueAt(typical.occ, now);
  return Math.max(0, valueAt(typical.occ, minute) + diff * Math.exp(-(minute - now) / 60));
}

// Когда освободится: первый момент, когда прогноз опустится до половины мест
export function forecastFree(typical, occupied, capacity, now) {
  const threshold = capacity * 0.5;
  if (!typical) return { state: 'nodata' };
  if (occupied <= threshold) return { state: 'free' };
  for (let m = now + 5; m <= CLOSE_HOUR * 60; m += 5) {
    if (predictAt(typical, occupied, now, m) <= threshold) {
      const minutes = Math.max(5, Math.round((m - now) / 5) * 5);
      return { state: 'busy', minutes, at: fmtTime(now + minutes) };
    }
  }
  return { state: 'late' };
}

// Пик и «часы пик» обычного дня (в часы работы)
export function dayHighlights(typical) {
  if (!typical) return null;
  let peak = { minute: OPEN_HOUR * 60, value: 0 };
  for (let m = OPEN_HOUR * 60; m <= CLOSE_HOUR * 60; m += 10) {
    const v = valueAt(typical.occ, m);
    if (v > peak.value) peak = { minute: m, value: v };
  }
  if (peak.value < 3) return { peak, rush: null };
  // Час пик — время, когда людей больше 60% от пика
  let start = null;
  let end = null;
  for (let m = OPEN_HOUR * 60; m <= CLOSE_HOUR * 60; m += 10) {
    if (valueAt(typical.occ, m) >= peak.value * 0.6) {
      if (start === null) start = m;
      end = m;
    }
  }
  return { peak, rush: start === null ? null : { from: start, to: end } };
}

// Уровень загрузки для подписи
export function loadLevel(occupied, capacity) {
  const p = capacity ? occupied / capacity : 0;
  if (p < 0.35) return { key: 'free', text: 'Свободно' };
  if (p < 0.65) return { key: 'mid', text: 'Умеренно' };
  if (p < 0.9) return { key: 'busy', text: 'Много людей' };
  return { key: 'full', text: 'Почти нет мест' };
}
