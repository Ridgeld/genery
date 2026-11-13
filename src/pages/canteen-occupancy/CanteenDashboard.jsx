import { useEffect, useMemo, useState } from 'react';
import s from './AdminDashboard.module.scss';
import Icon from './AdminIcons.jsx';
import CanteenChart from './CanteenChart.jsx';
import { cmpVersion } from './FirmwareSection.jsx';
import { ONLINE_TIMEOUT_MS, liveOccupancy, typicalDay, weekdayIndex } from './canteenStats.js';

const GREEN = '#C3F82B';
const AMBER = '#FFC24B';
const RED = '#FF4365';

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
export function SignalBars({ rssi }) {
  const lv = !rssi ? 0 : rssi > -55 ? 4 : rssi > -67 ? 3 : rssi > -78 ? 2 : 1;
  return (
    <span className={s.bars}>
      {[5, 8, 11, 14].map((h, i) => <i key={h} style={{ height: h, background: i < lv ? (lv <= 1 ? RED : 'currentColor') : 'rgba(127,127,140,.35)' }} />)}
    </span>
  );
}

// Дашборд одной столовой: показатели, график, проблемы, таблица счётчиков, настройки
export default function CanteenDashboard({
  theme, canteen, devices, allCanteens, latestFw, curves, today, now, onSaveDevice, onSaveCanteen, onDeleteCanteen, onOpenPage, assignedTotal,
}) {
  const accent = theme.gradient_first_color || '#0040F9';
  const live = liveOccupancy(devices, today);
  const capacity = Number(canteen.capacity) || 0;
  const pct = capacity ? Math.min(100, Math.round((live.occupied / capacity) * 100)) : 0;
  const todayIn = devices.reduce((sum, d) => sum + (d.day === today ? Number(d.dayIn) || 0 : 0), 0);
  const todayOut = devices.reduce((sum, d) => sum + (d.day === today ? Number(d.dayOut) || 0 : 0), 0);
  const typical = useMemo(() => typicalDay(curves, weekdayIndex(today), today), [curves, today]);
  const todayOcc = curves.get(today) || null;

  const [name, setName] = useState(canteen.name || '');
  const [cap, setCap] = useState(String(canteen.capacity || ''));
  useEffect(() => { setName(canteen.name || ''); setCap(String(canteen.capacity || '')); }, [canteen.id, canteen.name, canteen.capacity]);

  // Что требует внимания
  const alerts = [];
  devices.forEach((d) => {
    const label = d.door || d.id;
    if (!isOnline(d)) alerts.push({ c: RED, icon: 'wifiOff', t: `${label}: нет связи`, s: `последний сигнал ${ago(seenOf(d))}` });
    else if (d.rssi && d.rssi < -80) alerts.push({ c: AMBER, icon: 'wifi', t: `${label}: слабый Wi‑Fi`, s: `${d.rssi} дБм — переставьте плату или роутер` });
    if (d.sim) alerts.push({ c: AMBER, icon: 'alert', t: `${label}: режим имитации`, s: 'датчик ещё не подключён, проходы не считаются' });
    if (/не прошла|Ошибка|недоступен|повреждён|прервалась/i.test(d.ota || '')) alerts.push({ c: RED, icon: 'chip', t: `${label}: ошибка обновления`, s: d.ota });
  });
  const outdated = latestFw?.version ? devices.filter((d) => cmpVersion(d.fw, latestFw.version) < 0).length : 0;
  if (outdated) alerts.push({ c: AMBER, icon: 'chip', t: `На старой прошивке: ${outdated}`, s: `обновятся до ${latestFw.version} в течение часа` });

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1>{canteen.name || canteen.id}</h1>
          <p>ID: {canteen.id} · мест: {capacity || '—'} · счётчиков: {devices.length}</p>
        </div>
        <div className={s.actions}>
          <button type="button" className={s.btn} onClick={onOpenPage}><Icon name="arrow" size={16} />Страница столовой</button>
        </div>
      </div>

      <div className={s.stats}>
        <div className={`${s.stat} ${s.statAccent}`}>
          <span className={s.statIcon}><Icon name="users" /></span>
          <small>Сейчас внутри</small>
          <b>{live.occupied}<em>/ {capacity || '—'}</em></b>
          <span>заполнено на {pct}%</span>
        </div>
        <div className={s.stat}>
          <span className={s.statIcon}><Icon name="door" /></span>
          <small>Свободно мест</small>
          <b>{Math.max(0, capacity - live.occupied)}</b>
          <span>из {capacity || '—'}</span>
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

      <div className={s.grid21}>
        <div className={s.card}>
          <div className={s.cardHead}>
            <h3><span className={s.cardIcon}><Icon name="chart" size={18} /></span>Загрузка сегодня</h3>
            <small>{typical ? typical.source : 'история ещё копится'}</small>
          </div>
          {typical || todayOcc ? (
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
              <CanteenChart theme={theme} accent={accent} capacity={capacity || 100} typical={typical} todayOcc={todayOcc} now={now} occupied={live.occupied} isToday />
            </div>
          ) : (
            <div className={s.empty}>График появится, когда счётчики проработают хотя бы день.</div>
          )}
        </div>

        <div className={s.card}>
          <div className={s.cardHead}>
            <h3><span className={s.cardIcon}><Icon name="alert" size={18} /></span>Требует внимания</h3>
          </div>
          <div className={s.alerts}>
            {alerts.length === 0 && (
              <div className={s.alert}>
                <span className={s.alertIcon} style={{ background: 'rgba(195,248,43,.14)', color: GREEN }}><Icon name="check" size={16} /></span>
                <div><b>Всё в порядке</b><small>{devices.length ? 'все счётчики на связи' : 'счётчиков пока нет'}</small></div>
              </div>
            )}
            {alerts.map((a) => (
              <div key={a.t} className={s.alert}>
                <span className={s.alertIcon} style={{ background: `${a.c}22`, color: a.c }}><Icon name={a.icon} size={16} /></span>
                <div><b>{a.t}</b><small>{a.s}</small></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={s.card}>
        <div className={s.cardHead}>
          <h3><span className={s.cardIcon}><Icon name="door" size={18} /></span>Счётчики</h3>
          <small>новые платы подключаются в разделе «Новые платы»</small>
        </div>
        {devices.length === 0 ? (
          <div className={s.empty}>В этой столовой пока нет счётчиков.</div>
        ) : (
          <DeviceTable theme={theme} devices={devices} allCanteens={allCanteens} latestFw={latestFw} today={today} onSave={onSaveDevice} />
        )}
      </div>

      <div className={s.card}>
        <div className={s.cardHead}>
          <h3><span className={s.cardIcon}><Icon name="settings" size={18} /></span>Настройки столовой</h3>
        </div>
        <div className={s.fields2}>
          <label className={s.field}><small>Название</small><input value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label className={s.field}><small>Мест</small><input type="number" min="1" inputMode="numeric" value={cap} onChange={(e) => setCap(e.target.value)} /></label>
        </div>
        <div className={s.actions} style={{ marginTop: 14 }}>
          <button
            type="button"
            className={`${s.btn} ${s.btnPrimary}`}
            disabled={!name.trim() || !(Number(cap) > 0) || (name.trim() === canteen.name && Number(cap) === Number(canteen.capacity))}
            onClick={() => onSaveCanteen({ name: name.trim(), capacity: Number(cap) })}
          >
            Сохранить
          </button>
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
        {assignedTotal > 0 && <p className={s.muted} style={{ fontSize: 13, margin: '10px 0 0' }}>Удалить можно, когда в столовой не останется счётчиков.</p>}
      </div>
    </>
  );
}

// Таблица счётчиков (на компьютере) и карточки (на телефоне)
export function DeviceTable({ theme, devices, allCanteens, latestFw, today, onSave }) {
  const outdated = (d) => latestFw?.version && cmpVersion(d.fw, latestFw.version) < 0;
  const status = (d) => (isOnline(d)
    ? <span className={s.pill} style={{ color: GREEN }}><i style={{ background: GREEN }} />на связи</span>
    : <span className={s.pill} style={{ color: RED }}><i style={{ background: RED }} />нет связи</span>);
  const doorName = (d) => (
    <input
      defaultValue={d.door || ''}
      placeholder="Название двери"
      onBlur={(e) => { const v = e.target.value.trim(); if (v !== (d.door || '')) onSave(d.id, { door: v }); }}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
    />
  );
  const moveSelect = (d) => (
    <select className={s.select} value={d.canteenId || ''} onChange={(e) => onSave(d.id, { canteenId: e.target.value })} aria-label="Столовая">
      {allCanteens.map((c) => <option key={c.id} value={c.id}>{c.name || c.id}</option>)}
    </select>
  );
  const disableBtn = (d) => (
    <button
      type="button"
      className={s.iconBtn}
      title="Отключить от столовой"
      onClick={() => { if (window.confirm(`Отключить «${d.door || d.id}»? Её данные перестанут учитываться.`)) onSave(d.id, { approved: false }); }}
    >
      <Icon name="pause" size={16} />
    </button>
  );
  const today2 = (d) => (d.day === today ? `+${d.dayIn || 0} / −${d.dayOut || 0}` : '+0 / −0');

  return (
    <>
      <div className={s.onlyDesktop} style={{ overflowX: 'auto' }}>
        <table className={s.table}>
          <thead>
            <tr><th>Дверь</th><th>Статус</th><th>Сегодня</th><th>Сигнал</th><th>Прошивка</th><th>Связь</th><th>Столовая</th><th /></tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d.id}>
                <td>
                  <div className={s.doorCell}>
                    <span className={s.doorIcon} style={{ background: theme.first_color }}><Icon name="door" size={17} /></span>
                    <div style={{ minWidth: 0, flex: 1 }}>{doorName(d)}<small>{d.id}</small></div>
                  </div>
                </td>
                <td>{status(d)}</td>
                <td>{today2(d)}</td>
                <td><SignalBars rssi={d.rssi} />{d.rssi ? `${d.rssi} дБм` : '—'}</td>
                <td title={d.ota || ''}>
                  <span style={{ color: outdated(d) ? AMBER : undefined }}>v{d.fw || '?'}</span>
                  {d.sim && <small className={s.muted}> · имитация</small>}
                </td>
                <td className={s.muted}>{ago(seenOf(d))}</td>
                <td>{moveSelect(d)}</td>
                <td><div className={s.rowActions}>{disableBtn(d)}</div></td>
              </tr>
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
              {status(d)}
            </div>
            <div className={s.devMetrics}>
              <span>Сегодня <b>{today2(d)}</b></span>
              <span><SignalBars rssi={d.rssi} /><b>{d.rssi ? `${d.rssi} дБм` : '—'}</b></span>
              <span>Прошивка <b style={{ color: outdated(d) ? AMBER : undefined }}>v{d.fw || '?'}</b></span>
              <span>{ago(seenOf(d))}</span>
            </div>
            <div className={s.devControls}>
              {moveSelect(d)}
              {disableBtn(d)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
