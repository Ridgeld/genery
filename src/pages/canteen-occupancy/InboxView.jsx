import { useState } from 'react';
import s from './AdminDashboard.module.scss';
import Icon from './AdminIcons.jsx';
import { SENSOR_TEXT, SignalBars, ago, isOnline, sensorState } from './CanteenDashboard.jsx';

import { C } from './themeColors.js';
import { AnimatePresence, motion } from 'framer-motion';
import { EASE } from './motion.jsx';

// Карточка уходит из списка: сжимается по высоте и уезжает вправо
const LEAVE = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
  exit: { opacity: 0, x: 40, height: 0, transition: { duration: 0.3, ease: EASE } },
  style: { overflow: 'hidden' },
};

const GREEN = C.ok;
const RED = C.bad;

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
        {sensorState(d) !== 'ok' && <span style={{ color: C.warn }}>{SENSOR_TEXT[sensorState(d)]}</span>}
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

// Плата сменила ключ входа (например, после смены проекта в её настройках) — без подтверждения
// сервер её не пускает: документ платы привязан к старому ключу.
function ClaimCard({ theme, c, device, canteens, onAccept, onReject }) {
  const [busy, setBusy] = useState(false);
  const canteen = canteens.find((x) => x.id === device?.canteenId);
  const at = c.at?.toMillis ? c.at.toMillis() : 0;
  const run = (fn) => async () => { setBusy(true); try { await fn(); } finally { setBusy(false); } };
  return (
    <div className={s.devItem}>
      <div className={s.doorCell}>
        <span className={s.doorIcon} style={{ background: theme.element_second_color }}><Icon name="chip" size={17} /></span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <b>{device?.door || c.id}</b>
          <small>
            {c.id}{canteen ? ` · ${canteen.name || canteen.id}` : ''} · прошивка v{c.fw || '?'} · заявка {ago(at)}
          </small>
        </div>
        <span className={s.pill} style={{ color: C.warn }}><i style={{ background: C.warn }} />ждёт подтверждения</span>
      </div>
      <div className={s.devMetrics}>
        <span>Плата вошла в Firebase с новым ключом и не может отправлять данные. Так бывает, если в её настройках меняли проект.
          Подтвердите, если это ваша плата и вы недавно её настраивали.</span>
      </div>
      <div className={s.inline}>
        <button type="button" className={`${s.btn} ${s.btnPrimary}`} disabled={busy} onClick={run(onAccept)}>
          <Icon name="check" size={16} />{busy ? 'Сохраняю…' : 'Подтвердить новый ключ'}
        </button>
        <button type="button" className={`${s.btn} ${s.btnDanger}`} disabled={busy} onClick={run(onReject)}>Отклонить</button>
      </div>
    </div>
  );
}

// «Новые платы»: устройства, которые ещё не подключены ни к одной столовой (или отключены)
export default function InboxView({ theme, devices, canteens, claims = [], allDevices = [], onConnect, onCreateCanteen, onAcceptClaim, onRejectClaim }) {
  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1>Новые платы</h1>
          <p>Платы появляются здесь через несколько секунд после того, как мастер настроил Wi‑Fi.</p>
        </div>
      </div>

      {claims.length > 0 && (
        <div className={s.card}>
          <div className={s.cardHead}>
            <h3><span className={s.cardIcon}><Icon name="chip" size={18} /></span>Платы сменили ключ</h3>
            <small>без подтверждения они не отправляют данные</small>
          </div>
          <div className={s.devList}>
            <AnimatePresence initial={false}>
              {claims.map((c) => (
                <motion.div key={c.id} layout {...LEAVE}>
                  <ClaimCard
                    theme={theme}
                    c={c}
                    device={allDevices.find((d) => d.id === c.id)}
                    canteens={canteens}
                    onAccept={() => onAcceptClaim(c)}
                    onReject={() => onRejectClaim(c)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

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
        claims.length ? null : <div className={s.card}><div className={s.empty}>Новых плат нет. Все платы подключены к столовым.</div></div>
      ) : (
        <div className={s.card}>
          <div className={s.devList}>
            <AnimatePresence initial={false}>
              {devices.map((d) => (
                <motion.div key={d.id} layout {...LEAVE}>
                  <PendingCard theme={theme} d={d} canteens={canteens} onConnect={onConnect} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </>
  );
}
