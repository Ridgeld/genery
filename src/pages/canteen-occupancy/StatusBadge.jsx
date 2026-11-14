import { C, tint } from './themeColors.js';

// Единые статусы с SVG-иконками: плашка «иконка + подпись» или только иконка.
// Используются и на странице студентов, и в панели управления.

const ICONS = {
  // Заполненный круг с галочкой
  ok: (c) => <><circle cx="12" cy="12" r="10" fill={c} /><path d="m7.5 12.2 3 3 6-6.2" fill="none" stroke="var(--c-glyph, #0A0B10)" style={{ stroke: 'var(--c-glyph, #0A0B10)' }} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></>,
  // Пунктирный круг — «черновик» / нет данных
  dashed: (c) => <circle cx="12" cy="12" r="9" fill="none" stroke={c} strokeWidth="2" strokeDasharray="3.2 3.2" strokeLinecap="round" />,
  // Наполовину закрашенный круг — «в процессе»
  half: (c) => <><circle cx="12" cy="12" r="9" fill="none" stroke={c} strokeWidth="2" /><path d="M12 6a6 6 0 0 1 0 12z" fill={c} /></>,
  // На три четверти — «почти»
  quarter: (c) => <><circle cx="12" cy="12" r="9" fill="none" stroke={c} strokeWidth="2" /><path d="M12 12V6a6 6 0 1 1-6 6z" fill={c} /></>,
  // Заполненный круг с крестиком
  stop: (c) => <><circle cx="12" cy="12" r="10" fill={c} /><path d="m8.5 8.5 7 7m0-7-7 7" stroke="var(--c-glyph, #0A0B10)" style={{ stroke: 'var(--c-glyph, #0A0B10)' }} strokeWidth="2.2" strokeLinecap="round" /></>,
  // Ключ — технический перерыв
  wrench: (c) => <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  // Пакет — только на вынос
  bag: (c) => <><path d="M6 7h12l1 13H5z" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" /><path d="M9 10V6a3 3 0 0 1 6 0v4" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" /></>,
  // Капля — санитарный час
  drop: (c) => <path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z" fill={c} fillOpacity="0.25" stroke={c} strokeWidth="2" strokeLinejoin="round" />,
  // Нет связи
  wifiOff: (c) => <g fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M12 20h.01" /><path d="M8.5 16.43a5 5 0 0 1 7 0" /><path d="M5 12.86a10 10 0 0 1 5.17-2.69" /><path d="M19 12.86a10 10 0 0 0-2-1.52" /><path d="M2 8.82a15 15 0 0 1 4.18-2.64" /><path d="M22 8.82a15 15 0 0 0-11.29-3.76" /><path d="m2 2 20 20" /></g>,
  // Стрелка вверх — нужна новая прошивка
  up: (c) => <><circle cx="12" cy="12" r="9" fill="none" stroke={c} strokeWidth="2" /><path d="M12 16V8m-3.5 3.5L12 8l3.5 3.5" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>,
  // Люди — по отзывам
  users: (c) => <g fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></g>,
};

// Статусы: цвет текста/иконки и иконка
export const STATUS = {
  // Работа столовой
  open:      { icon: 'ok', color: C.ok, text: 'Открыто' },
  sanitary:  { icon: 'drop', color: C.warn, text: 'Санитарный час' },
  break:     { icon: 'wrench', color: C.orange, text: 'Технический перерыв' },
  takeaway:  { icon: 'bag', color: C.info, text: 'Только на вынос' },
  closed:    { icon: 'stop', color: C.bad, text: 'Закрыто' },
  // Загрузка зала
  free:      { icon: 'ok', color: C.ok, text: 'Свободно' },
  mid:       { icon: 'half', color: C.neutral, text: 'Умеренно' },
  busy:      { icon: 'quarter', color: C.warn, text: 'Много людей' },
  full:      { icon: 'stop', color: C.bad, text: 'Мест нет' },
  // Счётчики
  online:    { icon: 'ok', color: C.ok, text: 'На связи' },
  offline:   { icon: 'wifiOff', color: C.bad, text: 'Нет связи' },
  sim:       { icon: 'dashed', color: C.muted, text: 'Имитация' },
  updating:  { icon: 'half', color: C.info, text: 'Обновляется' },
  outdated:  { icon: 'up', color: C.warn, text: 'Старая прошивка' },
  pending:   { icon: 'dashed', color: C.warn, text: 'Ждёт подключения' },
  feedback:  { icon: 'users', color: C.bad, text: 'По отзывам' },
};

export function StatusIcon({ kind, size = 18, color }) {
  const st = STATUS[kind] || STATUS.sim;
  const c = color || st.color;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: 'none', display: 'block', color: c }}>
      {ICONS[st.icon]('currentColor')}
    </svg>
  );
}

// Плашка: иконка + текст на полупрозрачном фоне цвета статуса. iconOnly — квадратная иконка.
export default function StatusBadge({ kind, text, size = 'md', iconOnly = false, style }) {
  const st = STATUS[kind] || STATUS.sim;
  const big = size === 'lg';
  const pad = iconOnly ? (big ? 10 : 6) : (big ? '8px 14px 8px 10px' : '4px 10px 4px 6px');
  return (
    <span
      title={iconOnly ? (text || st.text) : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: big ? 8 : 6,
        padding: pad,
        borderRadius: big ? 14 : 10,
        background: tint(st.color, 12),
        color: st.color,
        fontSize: big ? 15 : 12.5,
        fontWeight: 600,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <StatusIcon kind={kind} size={big ? 20 : 16} />
      {!iconOnly && (text || st.text)}
    </span>
  );
}
