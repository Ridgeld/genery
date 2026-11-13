import { useMemo, useRef, useState } from 'react';
import styles from './CanteenOccupancy.module.scss';
import CanteenChart from './CanteenChart.jsx';
import {
  WEEKDAYS, dayHighlights, fmtTime, forecastFree, loadLevel, typicalDay, valueAt, weekdayIndex
} from './canteenStats.js';

const ICONS = {
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  peak: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  leaf: '<path d="M20 6 9 17l-5-5"/>',
  arrow: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
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

const LEVEL_COLORS = { free: '#C3F82B', mid: '#FFFFFF', busy: '#FFC24B', full: '#FF4365' };

// Отображение страницы. Все данные приходят готовыми — компонент ничего не загружает.
export default function CanteenView({
  theme, name, capacity, occupied, hasDevices, status, curves, today, now, onDevices,
}) {
  const todayWd = weekdayIndex(today);
  const [selectedWd, setSelectedWd] = useState(todayWd);
  const chartRef = useRef(null);
  const accent = theme.gradient_first_color || '#0040F9';
  const tile = theme.element_first_color;
  const muted = theme.text_second_color;

  const typicalToday = useMemo(() => typicalDay(curves, todayWd, today), [curves, todayWd, today]);
  const typicalSel = useMemo(() => typicalDay(curves, selectedWd, today), [curves, selectedWd, today]);
  const highlights = useMemo(() => dayHighlights(typicalSel), [typicalSel]);
  const todayOcc = curves.get(today) || null;

  const free = Math.max(0, capacity - occupied);
  const pct = capacity ? Math.min(1, occupied / capacity) : 0;
  const level = loadLevel(occupied, capacity);
  const forecast = hasDevices ? forecastFree(typicalToday, occupied, capacity, now) : { state: 'nodevices' };
  const usual = typicalToday ? Math.round(valueAt(typicalToday.occ, now)) : null;
  const diff = usual === null ? 0 : occupied - usual;
  const isToday = selectedWd === todayWd;
  const scrollToChart = () => chartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Плитка «Освободится»
  let fcValue = '—';
  let fcSub = '';
  if (forecast.state === 'free') {
    fcValue = 'Сейчас';
    fcSub = highlights?.rush && isToday && now < highlights.rush.from
      ? `людно будет с ${fmtTime(highlights.rush.from)}` : 'свободных мест много';
  } else if (forecast.state === 'busy') {
    const h = Math.floor(forecast.minutes / 60);
    const m = forecast.minutes % 60;
    fcValue = `к ${forecast.at}`;
    fcSub = `примерно через ${h ? `${h} ч ` : ''}${m ? `${m} мин` : ''}`.trim();
  } else if (forecast.state === 'late') {
    fcValue = 'Не скоро';
    fcSub = 'до вечера будет людно';
  } else if (forecast.state === 'nodata') {
    fcSub = 'прогноз появится после первого дня работы';
  } else {
    fcSub = 'счётчики не подключены';
  }

  const R = 34;
  const C = 2 * Math.PI * R;

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <div>
          <div className={styles.headerTitle} style={{ color: theme.text_first_color }}>
            {name || 'Столовая'}
          </div>
          <div className={styles.liveStatus} style={{ color: muted }}>
            <span className={styles.liveDot} style={{ background: status.color }} />
            {status.text}
          </div>
        </div>
        {onDevices && (
          <button type="button" className={styles.devicesLink} onClick={onDevices} style={{ background: tile, color: theme.text_first_color }}>
            Управление
          </button>
        )}
      </div>

      {/* Главное: заполненность */}
      <button type="button" className={styles.hero} style={{ background: theme.first_color }} onClick={scrollToChart}>
        <div className={styles.heroText}>
          <span className={styles.heroLabel}>Сейчас в столовой</span>
          <span className={styles.heroValue}>
            {hasDevices ? occupied : '—'}
            <small> / {capacity}</small>
          </span>
          <span className={styles.heroPill}>
            <i style={{ background: hasDevices ? LEVEL_COLORS[level.key] : 'rgba(255,255,255,.5)' }} />
            {hasDevices ? `${level.text} · свободно ${free}` : 'нет данных'}
          </span>
        </div>
        <svg className={styles.heroRing} viewBox="0 0 84 84">
          <circle cx="42" cy="42" r={R} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="8" />
          <circle
            cx="42"
            cy="42"
            r={R}
            fill="none"
            stroke="#fff"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(C * (hasDevices ? pct : 0)).toFixed(1)} ${C.toFixed(1)}`}
            transform="rotate(-90 42 42)"
          />
          <text x="42" y="47" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="700">
            {hasDevices ? `${Math.round(pct * 100)}%` : '—'}
          </text>
        </svg>
      </button>

      {/* Прогноз */}
      <div className={styles.grid2}>
        <button type="button" className={styles.tile} style={{ background: tile }} onClick={scrollToChart}>
          <div className={styles.tileHead}>
            <span className={styles.tileIcon} style={{ color: theme.text_first_color }}><Icon name="clock" /></span>
            <span className={styles.tileGo} style={{ background: theme.background_color, color: theme.text_first_color }}><Icon name="arrow" size={18} /></span>
          </div>
          <span className={styles.tileLabel} style={{ color: muted }}>Освободится</span>
          <span className={styles.tileValue} style={{ color: theme.text_first_color }}>{fcValue}</span>
          <span className={styles.tileSub} style={{ color: muted }}>{fcSub}</span>
        </button>

        <div className={styles.tile} style={{ background: tile }}>
          <div className={styles.tileHead}>
            <span className={styles.tileIcon} style={{ color: theme.text_first_color }}><Icon name="history" /></span>
          </div>
          <span className={styles.tileLabel} style={{ color: muted }}>Обычно в это время</span>
          <span className={styles.tileValue} style={{ color: theme.text_first_color }}>
            {usual === null ? '—' : usual}
            {usual !== null && <small> чел.</small>}
          </span>
          <span className={styles.tileSub} style={{ color: muted }}>
            {usual === null || !hasDevices ? 'мало данных'
              : Math.abs(diff) < Math.max(3, usual * 0.1) ? 'сегодня как обычно'
                : diff > 0 ? `сегодня на ${diff} больше` : `сегодня на ${-diff} меньше`}
          </span>
        </div>
      </div>

      {/* График */}
      <div ref={chartRef} className={styles.sectionTitle} style={{ color: theme.text_first_color }}>
        {isToday ? 'Сегодня' : `Обычно: ${WEEKDAYS[selectedWd].name}`}
      </div>
      <div className={styles.week}>
        {WEEKDAYS.map((d, i) => (
          <button
            key={d.short}
            type="button"
            onClick={() => setSelectedWd(i)}
            className={styles.day}
            style={{
              background: selectedWd === i ? theme.first_color : tile,
              color: selectedWd === i ? '#FFFFFF' : theme.text_first_color
            }}
          >
            {d.short}
            {i === todayWd && <i className={styles.todayDot} style={{ background: selectedWd === i ? '#fff' : accent }} />}
          </button>
        ))}
      </div>

      <div className={styles.chartCard} style={{ background: tile }}>
        {typicalSel || (isToday && todayOcc) ? (
          <CanteenChart
            theme={theme}
            accent={accent}
            capacity={capacity}
            typical={typicalSel}
            todayOcc={todayOcc}
            now={now}
            occupied={occupied}
            isToday={isToday}
          />
        ) : (
          <div className={styles.empty} style={{ color: muted }}>
            Данных пока нет. График появится, когда счётчики проработают хотя бы день.
          </div>
        )}
      </div>

      {/* Пик и лучшее время выбранного дня */}
      <div className={styles.grid2}>
        <div className={styles.tile} style={{ background: tile }}>
          <div className={styles.tileHead}>
            <span className={styles.tileIcon} style={{ color: theme.text_first_color }}><Icon name="peak" /></span>
          </div>
          <span className={styles.tileLabel} style={{ color: muted }}>Пик</span>
          <span className={styles.tileValue} style={{ color: theme.text_first_color }}>
            {highlights?.peak.value >= 3 ? fmtTime(highlights.peak.minute) : '—'}
          </span>
          <span className={styles.tileSub} style={{ color: muted }}>
            {highlights?.peak.value >= 3 ? `около ${Math.round(highlights.peak.value)} чел.` : 'мало данных'}
          </span>
        </div>
        <div className={styles.tile} style={{ background: tile }}>
          <div className={styles.tileHead}>
            <span className={styles.tileIcon} style={{ color: theme.text_first_color }}><Icon name="leaf" /></span>
          </div>
          <span className={styles.tileLabel} style={{ color: muted }}>Лучше прийти</span>
          <span className={styles.tileValue} style={{ color: theme.text_first_color }}>
            {highlights?.rush ? `до ${fmtTime(highlights.rush.from)}` : '—'}
          </span>
          <span className={styles.tileSub} style={{ color: muted }}>
            {highlights?.rush ? `или после ${fmtTime(highlights.rush.to + 10)}` : 'мало данных'}
          </span>
        </div>
      </div>

      {(typicalSel || typicalToday) && (
        <div className={styles.source} style={{ color: muted }}>
          Прогноз {(isToday ? typicalToday : typicalSel)?.source}
          {(isToday ? typicalToday : typicalSel)?.approximate ? ' (таких же дней недели ещё нет)' : ''}
        </div>
      )}
    </div>
  );
}
