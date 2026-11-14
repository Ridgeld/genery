import styles from './CanteenOccupancy.module.scss';
import { CANTEEN_STATUSES, loadLevel } from './canteenStats.js';
import { levelColor, statusHex, themePalette, themeVars } from './themeColors.js';

// Несколько столовых: список, отсортированный по загруженности — сразу видно, где свободнее.
// items: [{ id, name, occupied, capacity, status, hasDevices }]
export default function CanteenList({ theme, items, onOpen, onDevices }) {
  const sorted = [...items].sort((a, b) => {
    const open = (x) => (!x.status || x.status === 'open') && x.hasDevices;
    if (open(a) !== open(b)) return open(a) ? -1 : 1;
    return (a.capacity ? a.occupied / a.capacity : 1) - (b.capacity ? b.occupied / b.capacity : 1);
  });
  const C = 2 * Math.PI * 22;
  const pal = themePalette(theme);

  return (
    <div className={styles.container} style={themeVars(theme)}>
      <div className={styles.topRow}>
        <div>
          <div className={styles.headerTitle} style={{ color: theme.text_first_color }}>Столовые</div>
          <div className={styles.liveStatus} style={{ color: theme.text_second_color }}>Сверху — где свободнее прямо сейчас</div>
        </div>
        {onDevices && (
          <button type="button" className={styles.devicesLink} onClick={onDevices} style={{ background: theme.element_first_color, color: theme.text_first_color }}>
            Управление
          </button>
        )}
      </div>

      {sorted.map((c) => {
        const open = !c.status || c.status === 'open';
        const level = loadLevel(c.occupied, c.capacity);
        const color = !open ? statusHex(c.status, pal) : c.hasDevices ? levelColor(level.key, pal) : pal.muted;
        const pct = c.capacity ? Math.min(1, c.occupied / c.capacity) : 0;
        return (
          <button key={c.id} type="button" className={styles.listCard} style={{ background: theme.element_first_color, color: theme.text_first_color }} onClick={() => onOpen(c.id)}>
            <svg className={styles.listRing} viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(127,127,140,.25)" strokeWidth="6" />
              <circle cx="28" cy="28" r="22" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${(C * (c.hasDevices && open ? pct : 0)).toFixed(1)} ${C.toFixed(1)}`} transform="rotate(-90 28 28)" />
              <text x="28" y="32" textAnchor="middle" fill={theme.text_first_color} fontSize="12" fontWeight="700">
                {c.hasDevices && open ? `${Math.round(pct * 100)}%` : '—'}
              </text>
            </svg>
            <div className={styles.listText}>
              <b>{c.name || c.id}</b>
              <span>
                {!open ? CANTEEN_STATUSES[c.status]?.text
                  : c.hasDevices ? `${level.text} · ${c.occupied} из ${c.capacity}` : 'счётчики не подключены'}
              </span>
            </div>
            <span className={styles.liveDot} style={{ background: color, width: 10, height: 10 }} />
          </button>
        );
      })}

      {sorted.length === 0 && (
        <div className={styles.chartCard} style={{ background: theme.element_first_color }}>
          <div className={styles.empty} style={{ color: theme.text_second_color }}>Столовые ещё не добавлены.</div>
        </div>
      )}
    </div>
  );
}
