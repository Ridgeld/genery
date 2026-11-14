import { useMemo, useRef, useState } from 'react';
import styles from './CanteenOccupancy.module.scss';
import BarsChart from './BarsChart.jsx';
import { STATUS, StatusIcon } from './StatusBadge.jsx';

const CLOSED_HINTS = {
  sanitary: 'Зал закрыт на уборку. Скоро откроемся',
  break: 'Временно не обслуживаем',
  takeaway: 'Сесть негде — еду можно взять с собой',
  closed: 'Сегодня столовая не работает',
};
import {
  CANTEEN_STATUSES, WEEKDAYS, dayHighlights, feedbackSummary, fmtTime, forecastFree, loadLevel, typicalDay, valueAt,
  waveInfo, weekdayIndex
} from './canteenStats.js';

const ICONS = {
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  peak: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  leaf: '<path d="M20 6 9 17l-5-5"/>',
  arrow: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
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
// canteen: { name, capacity, effectiveCapacity, status, statusNote, schedule }
export default function CanteenView({
  theme, canteen, capacity, occupied, hasDevices, status, curves, today, now, onDevices,
  votes, myVote, onVote,
}) {
  const name = canteen?.name;
  const schedule = canteen?.schedule;
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
  const fb = feedbackSummary(votes);

  const free = Math.max(0, capacity - occupied);
  const pct = capacity ? Math.min(1, occupied / capacity) : 0;
  let level = loadLevel(occupied, capacity);
  // Если несколько студентов подряд сообщили «мест нет» — показываем «плотно», даже если датчик считает меньше
  const byFeedback = fb.override === 'full' && (level.key === 'free' || level.key === 'mid');
  if (byFeedback) level = { key: 'busy', text: 'Плотно (по отзывам)' };
  const statusInfo = CANTEEN_STATUSES[canteen?.status || 'open'] || CANTEEN_STATUSES.open;
  const isOpen = !canteen?.status || canteen.status === 'open';

  const forecast = hasDevices ? forecastFree(typicalToday, occupied, capacity, now) : { state: 'nodevices' };
  const usual = typicalToday ? Math.round(valueAt(typicalToday.occ, now)) : null;
  const diff = usual === null ? 0 : occupied - usual;
  const isToday = selectedWd === todayWd;
  const wave = isOpen ? waveInfo(schedule, now) : null;
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

  // Подсказка про «волну» после пары
  let waveText = null;
  if (wave?.kind === 'soon') {
    waveText = level.key === 'free' || level.key === 'mid'
      ? `Сейчас ${level.key === 'free' ? 'свободно' : 'есть места'}, но через ${wave.minutes} мин закончится ${wave.lesson}-я пара — будет наплыв`
      : `Через ${wave.minutes} мин закончится ${wave.lesson}-я пара — станет ещё плотнее`;
  } else if (wave?.kind === 'break') {
    waveText = `Сейчас перемена после ${wave.lesson}-й пары — до ${wave.at}. Обычно в это время людно`;
  }

  const R = 34;
  const C = 2 * Math.PI * R;
  const pctText = Math.round(pct * 100);

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <div className={styles.headerTitle} style={{ color: theme.text_first_color }}>
          {name || 'Столовая'}
        </div>
        {onDevices && (
          <button type="button" className={styles.devicesLink} onClick={onDevices} style={{ background: tile, color: theme.text_first_color }}>
            Управление
          </button>
        )}
      </div>

      {!isOpen ? (
        /* Столовая не работает — это главное, что нужно увидеть */
        <div className={styles.closedHero} style={{ background: `${statusInfo.color}1a`, borderColor: `${statusInfo.color}55`, color: theme.text_first_color }}>
          <StatusIcon kind={canteen.status} size={56} />
          <b style={{ color: statusInfo.color }}>{STATUS[canteen.status]?.text || statusInfo.text}</b>
          <span>{canteen?.statusNote || CLOSED_HINTS[canteen.status] || 'Информация от столовой'}</span>
        </div>
      ) : (
        /* Главное: сколько свободно */
        <button type="button" className={styles.hero} style={{ background: theme.first_color }} onClick={scrollToChart}>
          <div className={styles.heroText}>
            <span className={styles.heroLabel}>Свободно</span>
            <span className={styles.heroValue}>{hasDevices ? free : '—'}</span>
            <span className={styles.heroLabel}>
              {hasDevices ? `занято ${occupied} из ${capacity}` : 'нет данных'}
              {byFeedback && ' · плотно по отзывам'}
            </span>
            {canteen?.statusNote && <span className={styles.heroNote}>{canteen.statusNote}</span>}
            {status.stale && <span className={styles.heroNote}>{status.text}</span>}
          </div>
          <svg className={styles.heroRing} viewBox="0 0 84 84">
            <circle cx="42" cy="42" r={R} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="8" />
            <circle
              cx="42"
              cy="42"
              r={R}
              fill="none"
              stroke={hasDevices ? LEVEL_COLORS[level.key] : '#fff'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(C * (hasDevices ? pct : 0)).toFixed(1)} ${C.toFixed(1)}`}
              transform="rotate(-90 42 42)"
            />
            <text x="42" y="47" textAnchor="middle" fill="#fff" fontSize="17" fontWeight="700">
              {hasDevices ? `${pctText}%` : '—'}
            </text>
          </svg>
        </button>
      )}

      {waveText && hasDevices && (
        <div className={styles.wave} style={{ background: tile, color: theme.text_first_color }}>
          <span style={{ color: '#FFC24B' }}><Icon name="bell" size={18} /></span>
          {waveText}
        </div>
      )}

      {/* Прогноз */}
      {isOpen && <div className={styles.grid2}>
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
      </div>}

      {/* Обратная связь */}
      {hasDevices && isOpen && onVote && (
        <div className={styles.feedback} style={{ background: tile, color: theme.text_first_color }}>
          {myVote ? (
            <span style={{ color: muted }}>Спасибо! Ответ учтён — он помогает проверять точность датчиков.</span>
          ) : (
            <>
              <b>Ты сейчас в столовой? Данные точные?</b>
              <div className={styles.feedbackBtns}>
                <button type="button" style={{ background: theme.background_color, color: theme.text_first_color }} onClick={() => onVote('ok')}>Да, верно</button>
                <button type="button" style={{ background: 'rgba(255,67,101,.16)', color: '#FF4365' }} onClick={() => onVote('full')}>Мест нет</button>
                <button type="button" style={{ background: 'rgba(195,248,43,.14)', color: '#C3F82B' }} onClick={() => onVote('free')}>Свободнее</button>
              </div>
            </>
          )}
        </div>
      )}

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
          <BarsChart
            theme={theme}
            accent={accent}
            capacity={capacity}
            typical={typicalSel}
            todayOcc={todayOcc}
            now={now}
            occupied={occupied}
            isToday={isToday}
            schedule={schedule}
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
