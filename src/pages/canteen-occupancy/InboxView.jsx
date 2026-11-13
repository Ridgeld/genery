import { useState } from 'react';
import s from './AdminDashboard.module.scss';
import Icon from './AdminIcons.jsx';
import { SignalBars, ago, isOnline } from './CanteenDashboard.jsx';

const GREEN = '#C3F82B';
const RED = '#FF4365';

function PendingCard({ theme, d, canteens, onConnect }) {
  const known = canteens.some((c) => c.id === d.canteenRequested);
  const [canteenId, setCanteenId] = useState(known ? d.canteenRequested : (canteens[0]?.id || ''));
  const [door, setDoor] = useState(d.door || '');
  const [busy, setBusy] = useState(false);
  const online = isOnline(d);
  const seen = d.lastSeen?.toMillis ? d.lastSeen.toMillis() : 0;

  return (
    <div className={s.devItem}>
      <div className={s.doorCell}>
        <span className={s.doorIcon} style={{ background: theme.element_second_color }}><Icon name="door" size={17} /></span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <b>{d.id}</b>
          <small>
            {d.canteenRequested
              ? <>мастер указал столовую: <b>{d.canteenRequested}</b>{!known && <span style={{ color: RED }}> (такой нет)</span>}</>
              : 'столовая не указана'}
          </small>
        </div>
        <span className={s.pill} style={{ color: online ? GREEN : RED }}><i style={{ background: online ? GREEN : RED }} />{online ? 'на связи' : 'нет связи'}</span>
      </div>
      <div className={s.devMetrics}>
        <span><SignalBars rssi={d.rssi} /><b>{d.rssi ? `${d.rssi} дБм` : '—'}</b></span>
        <span>Прошивка <b>v{d.fw || '?'}</b></span>
        <span>{ago(seen)}</span>
        {d.sim && <span style={{ color: '#FFC24B' }}>режим имитации</span>}
      </div>
      <div className={s.fields2} style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
        <label className={s.field}>
          <small>Столовая</small>
          <select value={canteenId} onChange={(e) => setCanteenId(e.target.value)}>
            {canteens.map((c) => <option key={c.id} value={c.id}>{c.name || c.id}</option>)}
          </select>
        </label>
        <label className={s.field}>
          <small>Название двери</small>
          <input value={door} placeholder="Например, «Главный вход»" onChange={(e) => setDoor(e.target.value)} />
        </label>
      </div>
      <button
        type="button"
        className={`${s.btn} ${s.btnPrimary}`}
        style={{ justifyContent: 'center', height: 44 }}
        disabled={!canteenId || busy}
        onClick={async () => { setBusy(true); try { await onConnect(d.id, { canteenId, door: door.trim(), approved: true }); } finally { setBusy(false); } }}
      >
        <Icon name="check" size={16} />{busy ? 'Подключаю…' : 'Подключить к столовой'}
      </button>
    </div>
  );
}

// «Новые платы»: устройства, которые ещё не подключены ни к одной столовой (или отключены)
export default function InboxView({ theme, devices, canteens, onConnect, onCreateCanteen }) {
  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1>Новые платы</h1>
          <p>Платы появляются здесь через несколько секунд после того, как мастер настроил Wi‑Fi.</p>
        </div>
      </div>

      {canteens.length === 0 ? (
        <div className={s.card}>
          <div className={s.empty}>
            Сначала создайте столовую — к ней будут подключаться платы.
            <div style={{ marginTop: 14 }}>
              <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={onCreateCanteen}><Icon name="plus" size={16} />Добавить столовую</button>
            </div>
          </div>
        </div>
      ) : devices.length === 0 ? (
        <div className={s.card}><div className={s.empty}>Новых плат нет. Все платы подключены к столовым.</div></div>
      ) : (
        <div className={s.card}>
          <div className={s.devList}>
            {devices.map((d) => <PendingCard key={d.id} theme={theme} d={d} canteens={canteens} onConnect={onConnect} />)}
          </div>
        </div>
      )}
    </>
  );
}
