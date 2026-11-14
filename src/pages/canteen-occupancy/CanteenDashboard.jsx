import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import s from './AdminDashboard.module.scss';
import Icon from './AdminIcons.jsx';
import CanteenChart from './CanteenChart.jsx';
import StatusBadge, { STATUS, StatusIcon } from './StatusBadge.jsx';
import { cmpVersion } from './FirmwareSection.jsx';
import {
  CANTEEN_STATUSES, DEFAULT_SCHEDULE, ONLINE_TIMEOUT_MS, correctionFor, effectiveCap, feedbackSummary,
  fmtTime, liveOccupancy, toMin, typicalDay, weekdayIndex
} from './canteenStats.js';

import { C, tint } from './themeColors.js';

// Цвета берутся из темы через CSS-переменные (их задаёт AdminShell)
const GREEN = C.ok;
const AMBER = C.warn;
const RED = C.bad;

const seenOf = (d) => (d.lastSeen?.toMillis ? d.lastSeen.toMillis() : 0);
export const isOnline = (d) => Date.now() - seenOf(d) < ONLINE_TIMEOUT_MS;
export function ago(ms) {
  if (!ms) return 'не выходил на связь';
  const min = Math.round((Date.now() - ms) / 60000);
  if (min < 1) return 'только что';
  if (min < 60) return `${min} мин назад`;
  const h = Math.round(min / 60);
  return h < 48 ? `${h} ч назад` : new Date(ms).toLocaleDateString('ru-RU');
}
export function signalLabel(rssi) {
  if (!rssi) return '—';
  if (rssi > -67) return 'хороший';
  if (rssi > -78) return 'нормальный';
  return 'слабый, возможны потери';
}
export function SignalBars({ rssi }) {
  const lv = !rssi ? 0 : rssi > -55 ? 4 : rssi > -67 ? 3 : rssi > -78 ? 2 : 1;
  return (
    <span className={s.bars}>
      {[5, 8, 11, 14].map((h, i) => <i key={h} style={{ height: h, background: i < lv ? (lv <= 1 ? RED : 'currentColor') : 'rgba(127,127,140,.35)' }} />)}
    </span>
  );
}
// Статус счётчика для плашки
export function deviceStatus(d, latestFw) {
  if (!isOnline(d)) return 'offline';
  if (/Загружаю/i.test(d.ota || '')) return 'updating';
  if (d.sim) return 'sim';
  if (latestFw?.version && cmpVersion(d.fw, latestFw.version) < 0) return 'outdated';
  return 'online';
}

const STATUS_HINTS = {
  open: 'обычная работа',
  sanitary: 'зал закрыт на уборку',
  break: 'временно не обслуживаем',
  takeaway: 'сесть негде, еда с собой',
  closed: 'столовая не работает',
};

// ---------- Управление залом ----------
function HallControl({ canteen, live, today, onSave }) {
  const [exact, setExact] = useState('');
  const [note, setNote] = useState(canteen.statusNote || '');
  useEffect(() => { setNote(canteen.statusNote || ''); }, [canteen.id, canteen.statusNote]);
  const status = canteen.status || 'open';
  const corr = correctionFor(canteen, today);
  const setCorrection = (value) => onSave({ correction: { day: today, value, at: Date.now() } });

  return (
    <div className={s.card}>
      <div className={s.cardHead}>
        <h3><span className={s.cardIcon}><Icon name="settings" size={18} /></span>Управление залом</h3>
        <small>студенты видят изменения сразу</small>
      </div>

      <div className={s.statusGrid}>
        {Object.keys(CANTEEN_STATUSES).map((key) => {
          const st = STATUS[key];
          const on = status === key;
          return (
            <button
              key={key}
              type="button"
              className={`${s.statusTile} ${on ? s.statusTileOn : ''}`}
              style={on ? { borderColor: st.color, background: tint(st.color, 10) } : undefined}
              onClick={() => !on && onSave({ status: key })}
            >
              <StatusIcon kind={key} size={26} />
              <b style={on ? { color: st.color } : undefined}>{st.text}</b>
              <small>{STATUS_HINTS[key]}</small>
            </button>
          );
        })}
      </div>

      <div className={s.hallGrid}>
        <div className={s.hallBox}>
          <small>Сообщение для студентов</small>
          <div className={s.inline} style={{ width: '100%', flexWrap: 'wrap' }}>
            <input style={{ flex: '1 1 180px', width: 'auto', minWidth: 0 }} value={note} placeholder={status === 'open' ? 'Например: «Сегодня плов»' : 'Например: «Откроемся в 13:30»'} onChange={(e) => setNote(e.target.value)} />
            <button type="button" className={s.btn} disabled={note === (canteen.statusNote || '')} onClick={() => onSave({ statusNote: note.trim() })}>Сохранить</button>
          </div>
        </div>
        <div className={s.hallBox}>
          <small>Счёт людей {corr !== 0 && <>· поправка {corr > 0 ? '+' : ''}{corr} <button type="button" className={s.linkBtn} onClick={() => setCorrection(0)}>убрать</button></>}</small>
          <div className={s.inline} style={{ width: '100%', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`${s.btn} ${s.btnPrimary}`}
              onClick={() => { if (window.confirm('Отметить, что в зале сейчас никого нет? Счётчик станет 0.')) setCorrection(-live.raw); }}
            >
              Зал пуст (0)
            </button>
            <input type="number" min="0" inputMode="numeric" placeholder="Сейчас человек" value={exact} onChange={(e) => setExact(e.target.value)} />
            <button type="button" className={s.btn} disabled={exact === '' || Number(exact) < 0} onClick={() => { setCorrection(Number(exact) - live.raw); setExact(''); }}>
              Указать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Расписание звонков: модуль с карточкой на каждую пару ----------
function ScheduleModule({ canteen, readOnly, onSave }) {
  const [rows, setRows] = useState(canteen.schedule || []);
  useEffect(() => { setRows(canteen.schedule || []); }, [canteen.id, canteen.schedule]);
  const dirty = JSON.stringify(rows) !== JSON.stringify(canteen.schedule || []);
  const set = (i, key, v) => setRows(rows.map((r, j) => (j === i ? { ...r, [key]: v } : r)));
  const dur = (r) => toMin(r.to) - toMin(r.from);
  const invalid = rows.some((r) => !(dur(r) > 0)) || rows.some((r, i) => i && toMin(r.from) < toMin(rows[i - 1].to));

  return (
    <div className={s.card}>
      <div className={s.cardHead}>
        <h3><span className={s.cardIcon}><Icon name="clock" size={18} /></span>Расписание звонков</h3>
        <small>по нему прогноз предупреждает о «волнах» после пар</small>
      </div>

      {rows.length === 0 && (
        <div className={s.empty}>
          Расписание не задано — прогноз строится без учёта перемен.
          {!readOnly && (
            <div style={{ marginTop: 12 }}>
              <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => setRows(DEFAULT_SCHEDULE)}>Заполнить типовым</button>
            </div>
          )}
        </div>
      )}

      <div className={s.lessons}>
        {rows.map((r, i) => {
          const next = rows[i + 1];
          const gap = next ? toMin(next.from) - toMin(r.to) : null;
          return (
            <Fragment key={i}>
              <div className={s.lesson}>
                <span className={s.lessonNum}>{i + 1}</span>
                <b className={s.lessonTitle}>{i + 1}-я пара</b>
                <div className={s.lessonTime}>
                  {readOnly ? <span>{r.from}</span> : <input type="time" value={r.from} onChange={(e) => set(i, 'from', e.target.value)} />}
                  <span className={s.muted}>→</span>
                  {readOnly ? <span>{r.to}</span> : <input type="time" value={r.to} onChange={(e) => set(i, 'to', e.target.value)} />}
                </div>
                <small className={s.lessonDur} style={{ color: dur(r) > 0 ? undefined : RED }}>{dur(r) > 0 ? `${dur(r)} мин` : 'конец раньше начала'}</small>
                {!readOnly && (
                  <button type="button" className={s.iconBtn} aria-label="Удалить пару" onClick={() => setRows(rows.filter((_, j) => j !== i))}>
                    <Icon name="x" size={14} />
                  </button>
                )}
              </div>
              {gap !== null && (
                <div className={s.breakChip} style={{ color: gap < 0 ? RED : undefined }}>
                  {gap > 0 ? `перемена ${gap} мин` : gap === 0 ? 'без перемены' : 'пересечение'}
                </div>
              )}
            </Fragment>
          );
        })}
        {!readOnly && rows.length > 0 && (
          <button
            type="button"
            className={s.lessonAdd}
            onClick={() => {
              const last = rows[rows.length - 1];
              const start = last ? toMin(last.to) + 10 : 8 * 60;
              setRows([...rows, { from: fmtTime(start), to: fmtTime(start + 80) }]);
            }}
          >
            <Icon name="plus" size={20} />Добавить пару
          </button>
        )}
      </div>

      {!readOnly && (
        <div className={s.actions} style={{ marginTop: 16 }}>
          <button type="button" className={`${s.btn} ${s.btnPrimary}`} disabled={!dirty || invalid} onClick={() => onSave({ schedule: rows })}>Сохранить расписание</button>
          {dirty && <button type="button" className={s.btn} onClick={() => setRows(canteen.schedule || [])}>Отменить</button>}
          {invalid && <span style={{ color: RED, fontSize: 13 }}>Проверьте время пар</span>}
        </div>
      )}
    </div>
  );
}

// ---------- Колокольчик с уведомлениями ----------
function Bell({ alerts }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  const critical = alerts.filter((a) => a.c === RED).length;

  return (
    <div className={s.bellWrap} ref={ref}>
      <button type="button" className={s.iconBtn} style={{ width: 40, height: 40 }} onClick={() => setOpen(!open)} aria-label="Уведомления">
        <Icon name="bell" size={18} />
        {alerts.length > 0 && <span className={s.bellCount} style={{ background: critical ? RED : AMBER }}>{alerts.length}</span>}
      </button>
      {open && (
        <div className={s.popover}>
          <div className={s.popHead}><b>Требует внимания</b><small>{alerts.length ? `${alerts.length}` : 'всё в порядке'}</small></div>
          <AlertList alerts={alerts} />
        </div>
      )}
    </div>
  );
}

function AlertList({ alerts }) {
  if (!alerts.length) {
    return (
      <div className={s.alert}>
        <span className={s.alertIcon} style={{ background: tint(GREEN, 14), color: GREEN }}><Icon name="check" size={16} /></span>
        <div><b>Всё в порядке</b><small>проблем не найдено</small></div>
      </div>
    );
  }
  return (
    <div className={s.alerts}>
      {alerts.map((a) => (
        <div key={a.t} className={s.alert}>
          <span className={s.alertIcon} style={{ background: tint(a.c, 14), color: a.c }}><Icon name={a.icon} size={16} /></span>
          <div><b>{a.t}</b><small>{a.s}</small></div>
        </div>
      ))}
    </div>
  );
}

const TABS = [
  { key: 'overview', label: 'Обзор' },
  { key: 'analytics', label: 'Аналитика' },
  { key: 'schedule', label: 'Расписание' },
  { key: 'settings', label: 'Настройки', superOnly: true },
];

// ---------- Дашборд одной столовой ----------
export default function CanteenDashboard({
  theme, canteen, devices, allCanteens, latestFw, curves, today, now, votes, readOnly,
  onSaveDevice, onSaveCanteen, onDeleteCanteen, onOpenPage, assignedTotal,
}) {
  const [tab, setTab] = useState('overview');
  useEffect(() => { setTab('overview'); }, [canteen.id]);
  const accent = theme.gradient_first_color || '#0040F9';
  const corr = correctionFor(canteen, today);
  const live = liveOccupancy(devices, today, corr);
  const capacity = Number(canteen.capacity) || 0;
  const eff = effectiveCap(canteen);
  const pct = eff ? Math.min(100, Math.round((live.occupied / eff) * 100)) : 0;
  const todayIn = devices.reduce((sum, d) => sum + (d.day === today ? Number(d.dayIn) || 0 : 0), 0);
  const todayOut = devices.reduce((sum, d) => sum + (d.day === today ? Number(d.dayOut) || 0 : 0), 0);
  const typical = useMemo(() => typicalDay(curves, weekdayIndex(today), today), [curves, today]);
  const todayOcc = curves.get(today) || null;
  const fb = feedbackSummary(votes);

  // Что требует внимания
  const alerts = [];
  if (fb.override === 'full') alerts.push({ c: RED, icon: 'users', t: `Студенты сообщают: мест нет (${fb.full} за 15 мин)`, s: 'возможно, датчик пропустил группу людей — поправьте счёт' });
  if (fb.override === 'free') alerts.push({ c: AMBER, icon: 'users', t: `Студенты сообщают: свободно (${fb.free} за 15 мин)`, s: 'счётчик мог накопить лишнее — нажмите «Зал пуст» или укажите число' });
  if (todayIn >= 50 && todayIn - todayOut > Math.max(eff, 20) * 1.2) {
    alerts.push({ c: RED, icon: 'alert', t: `Аномалия: вошло ${todayIn}, вышло ${todayOut}`, s: 'один из лучей мог быть перекрыт или сбит — проверьте «сырые» срабатывания' });
  }
  devices.forEach((d) => {
    const label = d.door || d.id;
    if (!isOnline(d)) alerts.push({ c: RED, icon: 'wifiOff', t: `${label}: нет связи`, s: `последний сигнал ${ago(seenOf(d))}` });
    else if (d.rssi && d.rssi < -80) alerts.push({ c: AMBER, icon: 'wifi', t: `${label}: слабый Wi‑Fi`, s: `${d.rssi} дБм — переставьте плату или роутер` });
    if (d.sim) alerts.push({ c: AMBER, icon: 'alert', t: `${label}: режим имитации`, s: 'датчик не подключён, проходы не считаются' });
    const a = Number(d.rawA) || 0;
    const b = Number(d.rawB) || 0;
    if (!d.sim && Math.max(a, b) >= 30 && Math.min(a, b) < Math.max(a, b) * 0.6) {
      alerts.push({ c: AMBER, icon: 'alert', t: `${label}: зоны срабатывают неравномерно`, s: `A ${a}, B ${b} — одна из зон могла запылиться или сбиться` });
    }
    if (/не прошла|Ошибка|недоступен|повреждён|прервалась|SHA/i.test(d.ota || '')) alerts.push({ c: RED, icon: 'chip', t: `${label}: ошибка обновления`, s: d.ota });
  });
  const outdated = latestFw?.version ? devices.filter((d) => cmpVersion(d.fw, latestFw.version) < 0).length : 0;
  if (outdated) alerts.push({ c: AMBER, icon: 'chip', t: `На старой прошивке: ${outdated}`, s: `обновятся до ${latestFw.version} в течение часа` });
  const critical = alerts.filter((a) => a.c === RED);

  const saveHall = (data) => onSaveCanteen(data, null);

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1>{canteen.name || canteen.id}</h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <StatusBadge kind={canteen.status || 'open'} />
            <span>ID: {canteen.id} · счётчиков: {devices.length}</span>
          </p>
        </div>
        <div className={s.actions}>
          <Bell alerts={alerts} />
          <button type="button" className={s.btn} onClick={onOpenPage}><Icon name="arrow" size={16} />Страница столовой</button>
        </div>
      </div>

      {critical.length > 0 && (
        <div className={s.criticalBar}>
          <span className={s.alertIcon} style={{ background: tint(RED, 15), color: RED }}><Icon name={critical[0].icon} size={16} /></span>
          <div><b>{critical[0].t}</b><small>{critical[0].s}{critical.length > 1 ? ` · и ещё ${critical.length - 1}` : ''}</small></div>
        </div>
      )}

      <div className={s.tabs}>
        {TABS.filter((t) => !(t.superOnly && readOnly)).map((t) => (
          <button key={t.key} type="button" className={`${s.tab} ${tab === t.key ? s.tabOn : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className={s.stats}>
            <div className={`${s.stat} ${s.statAccent}`}>
              <span className={s.statIcon}><Icon name="users" /></span>
              <small>Сейчас внутри</small>
              <b>{live.occupied}<em>/ {eff || '—'}</em></b>
              <span>заполнено на {pct}%{corr ? ` · поправка ${corr > 0 ? '+' : ''}${corr}` : ''}</span>
            </div>
            <div className={s.stat}>
              <span className={s.statIcon}><Icon name="door" /></span>
              <small>Свободно мест</small>
              <b>{Math.max(0, eff - live.occupied)}</b>
              <span>комфортно {eff || '—'} из {capacity || '—'} стульев</span>
            </div>
            <div className={s.stat}>
              <span className={s.statIcon}><Icon name="wifi" /></span>
              <small>Счётчики на связи</small>
              <b style={{ color: devices.length && live.online < devices.length ? RED : undefined }}>{live.online}<em>из {devices.length}</em></b>
              <span>{devices.length ? (live.online === devices.length ? 'все работают' : 'есть проблемы') : 'подключите плату'}</span>
            </div>
            <div className={s.stat}>
              <span className={s.statIcon}><Icon name="login" /></span>
              <small>Сегодня вошло</small>
              <b>{todayIn}</b>
              <span>вышло {todayOut}</span>
            </div>
          </div>

          <HallControl canteen={canteen} live={live} today={today} onSave={saveHall} />

          <div className={s.card}>
            <div className={s.cardHead}>
              <h3><span className={s.cardIcon}><Icon name="door" size={18} /></span>Счётчики</h3>
              <small>{readOnly ? 'изменять может суперадминистратор' : 'нажмите на название двери, чтобы переименовать'}</small>
            </div>
            {devices.length === 0 ? (
              <div className={s.empty}>В этой столовой пока нет счётчиков. Новые платы подключаются в разделе «Новые платы».</div>
            ) : (
              <DeviceTable theme={theme} devices={devices} allCanteens={allCanteens} latestFw={latestFw} today={today} onSave={onSaveDevice} readOnly={readOnly} />
            )}
          </div>
        </>
      )}

      {tab === 'analytics' && (
        <>
          <div className={s.grid21}>
            <div className={s.card}>
              <div className={s.cardHead}>
                <h3><span className={s.cardIcon}><Icon name="chart" size={18} /></span>Загрузка сегодня</h3>
                <small>{typical ? typical.source : 'история ещё копится'}</small>
              </div>
              {typical || todayOcc ? (
                <div style={{ maxWidth: 620, margin: '0 auto' }}>
                  <CanteenChart theme={theme} accent={accent} capacity={eff || 100} typical={typical} todayOcc={todayOcc} now={now} occupied={live.occupied} isToday />
                </div>
              ) : (
                <div className={s.empty}>График появится, когда счётчики проработают хотя бы день.</div>
              )}
            </div>
            <div className={s.card}>
              <div className={s.cardHead}><h3><span className={s.cardIcon}><Icon name="users" size={18} /></span>Отзывы студентов</h3><small>за 15 минут</small></div>
              <div className={s.fbGrid}>
                <div><StatusIcon kind="online" size={22} /><b>{fb.ok}</b><small>данные верны</small></div>
                <div><StatusIcon kind="full" size={22} /><b>{fb.full}</b><small>мест нет</small></div>
                <div><StatusIcon kind="free" size={22} /><b>{fb.free}</b><small>свободнее</small></div>
              </div>
              <p className={s.muted} style={{ fontSize: 13, margin: '12px 0 0' }}>Если трое подряд пишут «мест нет», у студентов показывается «Плотно (по отзывам)», а здесь появляется предупреждение.</p>
            </div>
          </div>
          <div className={s.card}>
            <div className={s.cardHead}><h3><span className={s.cardIcon}><Icon name="door" size={18} /></span>Двери сегодня</h3></div>
            <div className={s.alerts}>
              {devices.map((d) => (
                <div key={d.id} className={s.alert} style={{ alignItems: 'center' }}>
                  <StatusBadge kind={deviceStatus(d, latestFw)} iconOnly />
                  <div style={{ flex: 1 }}><b>{d.door || d.id}</b><small>вошло {d.day === today ? d.dayIn || 0 : 0} · вышло {d.day === today ? d.dayOut || 0 : 0} · срабатываний A {d.rawA || 0} / B {d.rawB || 0}</small></div>
                </div>
              ))}
              {devices.length === 0 && <div className={s.empty}>Нет счётчиков.</div>}
            </div>
          </div>
        </>
      )}

      {tab === 'schedule' && <ScheduleModule canteen={canteen} readOnly={readOnly} onSave={(data) => onSaveCanteen(data, null)} />}

      {tab === 'settings' && !readOnly && (
        <CanteenSettings canteen={canteen} allCanteens={allCanteens} assignedTotal={assignedTotal} onSaveCanteen={onSaveCanteen} onDeleteCanteen={onDeleteCanteen} />
      )}
    </>
  );
}

// ---------- Настройки столовой ----------
function CanteenSettings({ canteen, allCanteens, assignedTotal, onSaveCanteen, onDeleteCanteen }) {
  const [form, setForm] = useState({});
  const [newId, setNewId] = useState(canteen.id);
  const [err, setErr] = useState('');
  useEffect(() => {
    setForm({ name: canteen.name || '', capacity: String(canteen.capacity || ''), effectiveCapacity: String(canteen.effectiveCapacity || ''), resetHour: Number(canteen.resetHour) || 0 });
    setNewId(canteen.id);
    setErr('');
  }, [canteen.id, canteen.name, canteen.capacity, canteen.effectiveCapacity, canteen.resetHour]);
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    const idChanged = newId !== canteen.id;
    if (idChanged) {
      if (!/^[a-z0-9-]{2,40}$/.test(newId)) { setErr('ID: только латиница, цифры и дефис, от 2 символов'); return; }
      if (allCanteens.some((c) => c.id === newId)) { setErr('Столовая с таким ID уже есть'); return; }
      if (!window.confirm(`Сменить ID «${canteen.id}» на «${newId}»?\n\nСсылка на страницу станет /canteen?id=${newId}. Все счётчики этой столовой перенесутся автоматически.`)) return;
    }
    const cap = Number(form.capacity);
    const effCap = Number(form.effectiveCapacity) || 0;
    if (!(cap > 0)) { setErr('Укажите количество мест'); return; }
    if (effCap > cap) { setErr('Эффективная вместимость не может быть больше количества мест'); return; }
    setErr('');
    await onSaveCanteen({ name: form.name.trim(), capacity: cap, effectiveCapacity: effCap || null, resetHour: Number(form.resetHour) || 0 }, idChanged ? newId : null);
  };

  return (
    <div className={s.card}>
      <div className={s.cardHead}><h3><span className={s.cardIcon}><Icon name="settings" size={18} /></span>Настройки столовой</h3></div>
      <div className={s.fields3}>
        <label className={s.field}><small>Название</small><input value={form.name || ''} onChange={(e) => setF('name', e.target.value)} /></label>
        <label className={s.field}><small>Стульев (физически)</small><input type="number" min="1" inputMode="numeric" value={form.capacity || ''} onChange={(e) => setF('capacity', e.target.value)} /></label>
        <label className={s.field}><small>Эффективная вместимость</small><input type="number" min="1" inputMode="numeric" placeholder="= стульев" value={form.effectiveCapacity || ''} onChange={(e) => setF('effectiveCapacity', e.target.value)} /></label>
      </div>
      <p className={s.muted} style={{ fontSize: 12.5, margin: '6px 0 0' }}>Эффективная — сколько человек, когда визуально сесть уже негде (например, 95 при 120 стульях). По ней считаются светофор и «свободно мест».</p>
      <div className={s.fields2} style={{ marginTop: 12 }}>
        <label className={s.field}>
          <small>ID столовой (латиницей, в ссылке /canteen?id=…)</small>
          <input value={newId} onChange={(e) => setNewId(e.target.value.toLowerCase().trim())} autoCapitalize="off" spellCheck="false" />
        </label>
        <label className={s.field}>
          <small>Ночное обнуление</small>
          <select value={form.resetHour || 0} onChange={(e) => setF('resetHour', Number(e.target.value))}>
            {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
          </select>
        </label>
      </div>
      {err && <p style={{ color: RED, fontSize: 13, margin: '10px 0 0' }}>{err}</p>}
      <div className={s.actions} style={{ marginTop: 16 }}>
        <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={save}>Сохранить</button>
        <button
          type="button"
          className={`${s.btn} ${s.btnDanger}`}
          disabled={assignedTotal > 0}
          title={assignedTotal > 0 ? 'Сначала перенесите или отключите все счётчики' : ''}
          onClick={() => { if (window.confirm(`Удалить столовую «${canteen.name || canteen.id}»?`)) onDeleteCanteen(); }}
        >
          Удалить столовую
        </button>
      </div>
    </div>
  );
}

// ---------- Настройки датчика (без перепрошивки) ----------
function SensorConfig({ d, onSave }) {
  const [thr, setThr] = useState(String(d.threshold ?? ''));
  const [deb, setDeb] = useState(String(d.debounceMs ?? 300));
  useEffect(() => { setThr(String(d.threshold ?? '')); setDeb(String(d.debounceMs ?? 300)); }, [d.threshold, d.debounceMs]);
  const a = Number(d.rawA) || 0;
  const b = Number(d.rawB) || 0;
  // Что сейчас реально стоит на плате (мастер мог поменять на месте)
  const local = d.effInvert !== undefined && (
    !!d.effInvert !== !!d.invert
    || (d.threshold !== undefined && Number(d.effThreshold) !== Number(d.threshold))
    || (d.debounceMs !== undefined && Number(d.effDebounce) !== Number(d.debounceMs)));
  return (
    <div className={s.sensorCfg}>
      <div className={s.cfgGrid}>
        <label className={s.toggle}>
          <input type="checkbox" checked={!!d.invert} onChange={(e) => onSave(d.id, { invert: e.target.checked })} />
          <span><b>Поменять вход и выход</b><small>если датчик повесили «задом наперёд»</small></span>
        </label>
        <label className={s.field}>
          <small>Порог срабатывания, мм {d.floorMm ? `(пол: ${d.floorMm} мм)` : ''}</small>
          <input type="number" min="0" placeholder={`авто${d.thresholdMm ? `: ${d.thresholdMm}` : ''}`} value={thr} onChange={(e) => setThr(e.target.value)} onBlur={() => onSave(d.id, { threshold: Number(thr) || 0 })} />
        </label>
        <label className={s.field}>
          <small>Антидребезг, мс</small>
          <input type="number" min="0" max="5000" value={deb} onChange={(e) => setDeb(e.target.value)} onBlur={() => onSave(d.id, { debounceMs: Number(deb) || 0 })} />
        </label>
      </div>
      <div className={s.devMetrics}>
        <span>Срабатывания за день: зона A <b>{a}</b> · зона B <b>{b}</b></span>
        <span>{d.sim ? 'датчик не подключён' : `пол ${d.floorMm || '—'} мм, действующий порог ${d.thresholdMm || '—'} мм`}</span>
        <span>применится в течение 5 минут</span>
      </div>
      {local && (
        <div className={s.devMetrics} style={{ color: AMBER }}>
          <span>На плате сейчас настроено на месте: {d.effInvert ? 'вход/выход поменяны' : 'обычное направление'}, порог {d.effThreshold || 'авто'}, антидребезг {d.effDebounce} мс. Изменение здесь заменит их.</span>
        </div>
      )}
    </div>
  );
}

// ---------- Таблица счётчиков (компьютер) и карточки (телефон) ----------
export function DeviceTable({ theme, devices, allCanteens, latestFw, today, onSave, readOnly }) {
  const [open, setOpen] = useState(null);
  const outdated = (d) => latestFw?.version && cmpVersion(d.fw, latestFw.version) < 0;
  const status = (d) => <StatusBadge kind={deviceStatus(d, latestFw)} />;
  const doorName = (d) => (readOnly ? <b>{d.door || 'Без названия'}</b> : (
    <div className={s.nameEdit} title="Нажмите, чтобы переименовать. Enter — сохранить">
      <input
        id={`door-${d.id}`}
        defaultValue={d.door || ''}
        placeholder="Назовите дверь"
        onBlur={(e) => { const v = e.target.value.trim(); if (v !== (d.door || '')) onSave(d.id, { door: v }); }}
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') { e.currentTarget.value = d.door || ''; e.currentTarget.blur(); } }}
      />
      <button type="button" className={s.penBtn} aria-label="Переименовать" onClick={() => document.getElementById(`door-${d.id}`)?.focus()}>
        <Icon name="pen" size={14} />
      </button>
    </div>
  ));
  const fwCell = (d) => (
    <span title={d.ota || ''}>
      <span style={{ color: outdated(d) ? AMBER : undefined }}>v{d.fw || '?'}</span>
      {d.ota && <small className={s.muted} style={{ display: 'block', fontSize: 11.5, maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.ota}</small>}
    </span>
  );
  const actions = (d) => (readOnly ? null : (
    <div className={s.rowActions}>
      <select className={s.select} value={d.canteenId || ''} onChange={(e) => onSave(d.id, { canteenId: e.target.value })} aria-label="Столовая" title="Перенести в другую столовую">
        {allCanteens.map((c) => <option key={c.id} value={c.id}>{c.name || c.id}</option>)}
      </select>
      <button type="button" className={s.iconBtn} title="Обновить прошивку этой платы сейчас" onClick={() => onSave(d.id, { otaRequest: Math.floor(Date.now() / 1000) })}>
        <Icon name="upload" size={16} />
      </button>
      <button type="button" className={`${s.iconBtn} ${open === d.id ? s.iconBtnOn : ''}`} title="Настройки датчика" onClick={() => setOpen(open === d.id ? null : d.id)}>
        <Icon name="settings" size={16} />
      </button>
      <button
        type="button"
        className={s.iconBtn}
        title="Отключить от столовой"
        onClick={() => { if (window.confirm(`Отключить «${d.door || d.id}»? Её данные перестанут учитываться.`)) onSave(d.id, { approved: false }); }}
      >
        <Icon name="pause" size={16} />
      </button>
    </div>
  ));
  const todayCell = (d) => (d.day === today ? `+${d.dayIn || 0} / −${d.dayOut || 0}` : '+0 / −0');

  return (
    <>
      <div className={s.onlyDesktop} style={{ overflowX: 'auto' }}>
        <table className={s.table}>
          <thead>
            <tr><th>Дверь</th><th>Статус</th><th>Сегодня</th><th>Сигнал</th><th>Прошивка</th><th>Связь</th><th /></tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <Fragment key={d.id}>
                <tr>
                  <td>
                    <div className={s.doorCell}>
                      <span className={s.doorIcon} style={{ background: theme.first_color }}><Icon name="door" size={17} /></span>
                      <div style={{ minWidth: 0, flex: 1 }}>{doorName(d)}<small>{d.id}</small></div>
                    </div>
                  </td>
                  <td>{status(d)}</td>
                  <td>{todayCell(d)}</td>
                  <td title={signalLabel(d.rssi)}><SignalBars rssi={d.rssi} />{d.rssi ? `${d.rssi} дБм` : '—'}</td>
                  <td>{fwCell(d)}</td>
                  <td className={s.muted}>{ago(seenOf(d))}</td>
                  <td>{actions(d)}</td>
                </tr>
                {open === d.id && !readOnly && (
                  <tr><td colSpan={7} className={s.cfgCell}><SensorConfig d={d} onSave={onSave} /></td></tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`${s.devList} ${s.onlyMobile}`} style={{ flexDirection: 'column' }}>
        {devices.map((d) => (
          <div key={d.id} className={s.devItem}>
            <div className={s.doorCell}>
              <span className={s.doorIcon} style={{ background: theme.first_color }}><Icon name="door" size={17} /></span>
              <div style={{ minWidth: 0, flex: 1 }}>{doorName(d)}<small>{d.id}</small></div>
              <StatusBadge kind={deviceStatus(d, latestFw)} iconOnly />
            </div>
            <div className={s.devMetrics}>
              <span>Сегодня <b>{todayCell(d)}</b></span>
              <span><SignalBars rssi={d.rssi} /><b>{d.rssi ? `${d.rssi} дБм` : '—'}</b> {signalLabel(d.rssi)}</span>
              <span>Прошивка <b style={{ color: outdated(d) ? AMBER : undefined }}>v{d.fw || '?'}</b></span>
              <span>{ago(seenOf(d))}</span>
            </div>
            {actions(d)}
            {open === d.id && !readOnly && <SensorConfig d={d} onSave={onSave} />}
          </div>
        ))}
      </div>
    </>
  );
}
