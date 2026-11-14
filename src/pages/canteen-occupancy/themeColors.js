// Цвета страницы и панели от текущей темы Genery.
// Смысловые цвета (зелёный/жёлтый/красный) остаются узнаваемыми, но на светлой теме
// берутся более тёмные оттенки, чтобы текст читался. Акцент — из темы.
//
// Использование:
//   const pal = themePalette(theme);           // реальные hex-цвета (для SVG и вычислений)
//   <div style={themeVars(theme)}>             // CSS-переменные --c-ok, --c-bad … для вложенных компонентов
//   C.ok / tint(C.bad, 15)                     // ссылки на переменные и полупрозрачные заливки

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const hex = (c) => (typeof c === 'string' && HEX.test(c.trim()) ? c.trim() : null);

function rgb(c) {
  let h = c.slice(1);
  if (h.length === 3) h = h.split('').map((x) => x + x).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function lum(c) {
  const [r, g, b] = rgb(c).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const DARK = { ok: '#C3F82B', warn: '#FFC24B', bad: '#FF4365', info: '#6E9BFF', orange: '#FF9F43' };
const LIGHT = { ok: '#3B8C00', warn: '#B57300', bad: '#E3173E', info: '#2D63E8', orange: '#CF5F0E' };

export function themePalette(theme = {}) {
  const bg = hex(theme.background_color) || '#0A0B10';
  const light = lum(bg) > 0.45;
  const text = hex(theme.text_first_color) || (light ? '#0A0B10' : '#FFFFFF');
  const panel = hex(theme.element_first_color) || (light ? '#E8E8E8' : '#1C1C23');
  // Акцент: первый цвет темы, который читается на фоне (у «Кыргызстана» жёлтый не годится — берём красный)
  const accent = [theme.gradient_first_color, theme.gradient_second_color, theme.icon_color, theme.first_color]
    .map(hex).filter(Boolean).find((c) => contrast(c, bg) >= 2) || text;
  const onAccent = contrast('#FFFFFF', accent) >= contrast('#0A0B10', accent) ? '#FFFFFF' : '#0A0B10';
  const sem = light ? LIGHT : DARK;
  // Главная плашка («Свободно», выбранный день) красится first_color темы — он бывает градиентом
  const heroHex = hex(theme.first_color);
  const onHero = heroHex && contrast('#0A0B10', heroHex) > contrast('#FFFFFF', heroHex) ? '#0A0B10' : '#FFFFFF';
  // Цвет обычных столбцов графика: акцент, но если он похож на «людно»/«мест нет» — нейтральный текстовый
  const dist = (a, b) => { const x = rgb(a); const y = rgb(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };
  const base = [sem.bad, sem.warn, DARK.bad, DARK.warn].some((c) => dist(accent, c) < 110) ? text : accent;
  return {
    light, bg, text, panel, accent, onAccent, onHero, base,
    muted: light ? '#6B6B78' : '#8A8A99',
    ...sem,
    neutral: text,
    // Цвета поверх главной плашки (кольцо в «Свободно»)
    onHeroSet: onHero === '#FFFFFF' ? { ...DARK, neutral: '#FFFFFF' } : { ...LIGHT, neutral: '#0A0B10' },
  };
}

export function themeVars(theme) {
  const p = themePalette(theme);
  return {
    '--c-ok': p.ok,
    '--c-warn': p.warn,
    '--c-bad': p.bad,
    '--c-info': p.info,
    '--c-orange': p.orange,
    '--c-neutral': p.neutral,
    '--c-muted': p.muted,
    '--c-accent': p.accent,
    '--c-on-accent': p.onAccent,
    '--c-glyph': p.light ? '#FFFFFF' : '#0A0B10',
  };
}

// Ссылки на переменные (работают внутри элемента со style={themeVars(theme)}), с запасным значением
export const C = {
  ok: 'var(--c-ok, #C3F82B)',
  warn: 'var(--c-warn, #FFC24B)',
  bad: 'var(--c-bad, #FF4365)',
  info: 'var(--c-info, #6E9BFF)',
  orange: 'var(--c-orange, #FF9F43)',
  neutral: 'var(--c-neutral, #FFFFFF)',
  muted: 'var(--c-muted, #8A8A99)',
  accent: 'var(--c-accent, #0040F9)',
  onAccent: 'var(--c-on-accent, #FFFFFF)',
};

// Полупрозрачная заливка любого цвета (hex или var(...))
export const tint = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;

// Цвет статуса работы столовой (реальный hex — для SVG)
export const statusHex = (key, p) => ({ open: p.ok, sanitary: p.warn, break: p.orange, takeaway: p.info, closed: p.bad }[key] || p.bad);

// Цвет уровня загрузки
export const levelColor = (key, p) => ({ free: p.ok, mid: p.neutral, busy: p.warn, full: p.bad }[key] || p.muted);
