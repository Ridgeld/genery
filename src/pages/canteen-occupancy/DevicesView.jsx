import { useState } from 'react';
import styles from './CanteenOccupancy.module.scss';
import { ONLINE_TIMEOUT_MS, dayKey } from './canteenStats.js';

const ICONS = {
  chip: '<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
  wifi: '<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.86a10 10 0 0 1 14 0"/><path d="M8.5 16.43a5 5 0 0 1 7 0"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  door: '<path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.56v16.16a1 1 0 0 1-1.24.97L5 20V5.56a2 2 0 0 1 1.52-1.94l4-1A2 2 0 0 1 13 4.56z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  pause: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
};
const Icon = ({ name, size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    dangerouslySetInnerHTML={{ __html: ICONS[name] }}
  />
);

const GREEN = '#C3F82B';
const RED = '#FF4365';

function ago(ms) {
  if (!ms) return 'ещё не выходил на связь';
  const min = Math.round((Date.now() - ms) / 60000);
  if (min < 1) return 'только что';
  if (min < 60) return `${min} мин назад`;
  const h = Math.round(min / 60);
  return h < 48 ? `${h} ч назад` : new Date(ms).toLocaleDateString('ru-RU');
}

// Список плат-счётчиков. Все данные и действия приходят снаружи.
// devices: [{ id, door, canteenId, approved, day, dayIn, dayOut, lastSeen, rssi, fw, sim }]
export default function DevicesView({ theme, devices, loaded, onSave }) {
  const [busy, setBusy] = useState('');
  const tile = theme.element_first_color;
  const text = theme.text_first_color;
  const muted = theme.text_second_color;
  const today = dayKey();

  const seenOf = (d) => (d.lastSeen?.toMillis ? d.lastSeen.toMillis() : 0);
  const isOnline = (d) => Date.now() - seenOf(d) < ONLINE_TIMEOUT_MS;
  const pending = devices.filter((d) => d.approved !== true);
  const active = devices.filter((d) => d.approved === true);
  const onlineCount = active.filter(isOnline).length;

  const save = async (id, data) => {
    setBusy(id);
    try { await onSave(id, data); } finally { setBusy(''); }
  };

  const card = (d) => {
    const online = isOnline(d);
    const approved = d.approved === true;
    const dayIn = d.day === today ? Number(d.dayIn) || 0 : 0;
    const dayOut = d.day === today ? Number(d.dayOut) || 0 : 0;
    return (
      <div key={d.id} className={styles.devCard} style={{ background: tile }}>
        <div className={styles.devHead}>
          <span className={styles.devIcon} style={{ background: approved ? theme.first_color : theme.element_second_color, color: '#fff' }}>
            <Icon name="door" />
          </span>
          <div className={styles.devTitle}>
            <b style={{ color: text }}>{d.door || 'Без названия'}</b>
            <span style={{ color: muted }}>{d.id}</span>
          </div>
          <span className={styles.devPill} style={{ color: online ? GREEN : RED, background: online ? 'rgba(195,248,43,.12)' : 'rgba(255,67,101,.12)' }}>
            <i style={{ background: online ? GREEN : RED }} />
            {online ? 'на связи' : 'нет связи'}
          </span>
        </div>

        <div className={styles.devStats}>
          <div style={{ background: theme.background_color }}>
            <small style={{ color: muted }}>Сегодня</small>
            <b style={{ color: text }}>+{dayIn} / −{dayOut}</b>
          </div>
          <div style={{ background: theme.background_color }}>
            <small style={{ color: muted }}>Столовая</small>
            <b style={{ color: text }}>{d.canteenId || '—'}</b>
          </div>
          <div style={{ background: theme.background_color }}>
            <small style={{ color: muted }}>Сигнал</small>
            <b style={{ color: text }}>{d.rssi ? `${d.rssi} дБм` : '—'}</b>
          </div>
        </div>

        <div className={styles.devMeta} style={{ color: muted }}>
          <span><Icon name="clock" size={14} />{ago(seenOf(d))}</span>
          {d.fw && <span><Icon name="chip" size={14} />v{d.fw}</span>}
          {d.sim && <span style={{ color: '#FFC24B' }}>режим имитации</span>}
        </div>

        <input
          className={styles.devInput}
          style={{ background: theme.background_color, color: text }}
          placeholder="Название двери, например «Главный вход»"
          defaultValue={d.door || ''}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v !== (d.door || '')) save(d.id, { door: v });
          }}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        />

        <button
          type="button"
          className={styles.devButton}
          disabled={busy === d.id}
          onClick={() => save(d.id, { approved: !approved })}
          style={{ background: approved ? theme.element_second_color : theme.first_color }}
        >
          <Icon name={approved ? 'pause' : 'check'} size={18} />
          {busy === d.id ? 'Сохраняю…' : approved ? 'Отключить от столовой' : 'Подключить к столовой'}
        </button>
      </div>
    );
  };

  return (
    <>
      <div className={styles.grid2}>
        <div className={`${styles.tile} ${styles.tileShort}`} style={{ background: theme.first_color, color: '#fff' }}>
          <div className={styles.tileHead}>
            <span className={styles.tileIcon} style={{ background: 'rgba(255,255,255,.16)' }}><Icon name="wifi" /></span>
          </div>
          <span className={styles.tileLabel}>На связи</span>
          <span className={styles.tileValue}>{onlineCount}<small> из {active.length}</small></span>
        </div>
        <div className={`${styles.tile} ${styles.tileShort}`} style={{ background: tile }}>
          <div className={styles.tileHead}>
            <span className={styles.tileIcon} style={{ color: text }}><Icon name="lock" /></span>
          </div>
          <span className={styles.tileLabel} style={{ color: muted }}>Ждут подключения</span>
          <span className={styles.tileValue} style={{ color: pending.length ? '#FFC24B' : text }}>{pending.length}</span>
        </div>
      </div>

      {loaded && devices.length === 0 && (
        <div className={styles.chartCard} style={{ background: tile }}>
          <div className={styles.empty} style={{ color: muted }}>
            Пока ни одна плата не выходила на связь. Новая плата появится здесь через несколько секунд после настройки Wi‑Fi.
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <>
          <div className={styles.sectionTitle} style={{ color: text }}>Ждут подключения</div>
          {pending.map(card)}
        </>
      )}
      {active.length > 0 && (
        <>
          <div className={styles.sectionTitle} style={{ color: text }}>Подключены</div>
          {active.map(card)}
        </>
      )}

      <div className={styles.source} style={{ color: muted }}>
        Столовую платы (ID) меняют в настройках самой платы. Название двери видно только здесь.
      </div>
    </>
  );
}
