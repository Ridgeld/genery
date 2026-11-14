import { useId, useState } from 'react';
import styles from './CanteenOccupancy.module.scss';
import { CLOSE_HOUR, OPEN_HOUR, breaks, fmtTime, loadLevel, predictAt, valueAt } from './canteenStats.js';
import { levelColor, tint } from './themeColors.js';

const W = 340;
const H = 168;
const PAD = { l: 2, r: 2, t: 4, b: 30 };
const TIP_W = 184;
const pad2 = (n) => String(n).padStart(2, '0');
const KIND_TEXT = { past: 'было', now: 'сейчас', future: 'прогноз', typical: 'обычно' };

// Загруженность по часам.
// Каждый час — «стакан» на всю высоту (это 100% мест), внутри — сколько занято.
// Было — сплошной столбец, прогноз — штриховка. Людные часы окрашены жёлтым/красным.
// Над графиком — подсказка по выбранному часу (по умолчанию — текущий час или пик дня).
export default function BarsChart({ pal, capacity, typical, todayOcc, now, occupied, isToday, schedule }) {
  const uid = useId().replace(/:/g, '');
  const hours = [];
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h += 1) hours.push(h);
  const curH = Math.floor(now / 60);

  const bars = hours.map((h) => {
    const mid = h * 60 + 30;
    let v;
    let kind;
    if (!isToday) { v = typical ? valueAt(typical.occ, mid) : 0; kind = 'typical'; }
    else if (h < curH) { v = todayOcc ? Math.max(todayOcc[h] || 0, todayOcc[h + 1] ?? todayOcc[h] ?? 0) : 0; kind = 'past'; }
    else if (h === curH) { v = occupied; kind = 'now'; }
    else { v = typical ? predictAt(typical, occupied, now, mid) : 0; kind = 'future'; }
    v = Math.max(0, Math.round(v));
    const level = loadLevel(v, capacity);
    const crowded = level.key === 'busy' || level.key === 'full';
    return { h, v, kind, level, color: crowded ? levelColor(level.key, pal) : pal.base };
  });

  const nowBar = bars.find((b) => b.kind === 'now');
  const peakBar = bars.reduce((a, b) => (b.v > a.v ? b : a), bars[0]);
  const [picked, setPicked] = useState(null);
  const sel = bars.find((b) => b.h === picked) || nowBar || peakBar;

  const plotW = W - PAD.l - PAD.r;
  const slot = plotW / hours.length;
  const bw = Math.min(24, slot * 0.72);
  const top = PAD.t;
  const bottom = H - PAD.b;
  const X = (h) => PAD.l + (h - OPEN_HOUR) * slot + slot / 2;
  const Xmin = (m) => PAD.l + ((m - OPEN_HOUR * 60) / 60) * slot;
  const barH = (v) => (capacity ? Math.min(1, v / capacity) : 0) * (bottom - top);

  const brs = breaks(schedule).filter((br) => br.to > OPEN_HOUR * 60 && br.from < CLOSE_HOUR * 60);
  const selBreak = brs.find((br) => br.from < (sel.h + 1) * 60 && br.to > sel.h * 60);
  const patternColors = [...new Set(bars.map((b) => b.color))];
  const pid = (c) => `${uid}h${patternColors.indexOf(c)}`;

  // Подсказка центрируется над столбцом, но не выходит за края карточки
  const tipPct = (X(sel.h) / W) * 100;
  const tipLeft = `clamp(0px, calc(${tipPct.toFixed(2)}% - ${TIP_W / 2}px), calc(100% - ${TIP_W}px))`;
  const freeSel = Math.max(0, capacity - sel.v);
  const pctSel = capacity ? Math.round((sel.v / capacity) * 100) : 0;
  const selColor = sel.color === pal.base ? pal.text : sel.color;

  return (
    <div className={styles.bars}>
      {/* Подсказка по выбранному часу */}
      <div className={styles.tipRow}>
        <div className={styles.tip} style={{ left: tipLeft, width: TIP_W, background: pal.bg, color: pal.text }}>
          <span className={styles.tipHead} style={{ color: pal.muted }}>
            {pad2(sel.h)}:00–{pad2(sel.h + 1)}:00 · {KIND_TEXT[sel.kind]}
          </span>
          <span className={styles.tipMain}>
            <b>{sel.kind === 'future' || sel.kind === 'typical' ? '≈ ' : ''}{sel.v}</b> чел.
            <em style={{ color: selColor, background: tint(sel.color, 16) }}>{pctSel}%</em>
          </span>
          <span className={styles.tipSub} style={{ color: pal.muted }}>
            {freeSel > 0 ? `свободно ~${freeSel} мест` : 'мест нет'}
          </span>
          {selBreak && (
            <span className={styles.tipSub} style={{ color: pal.warn }}>
              перемена {fmtTime(selBreak.from)}–{fmtTime(selBreak.to)}
            </span>
          )}
        </div>
      </div>

      <svg className={styles.chartSvg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Загруженность столовой по часам" onMouseLeave={() => setPicked(null)}>
        <defs>
          {patternColors.map((c) => (
            <pattern key={c} id={pid(c)} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
              <rect width="6" height="6" fill={c} fillOpacity="0.14" />
              <line x1="1.5" y1="0" x2="1.5" y2="6" stroke={c} strokeWidth="2.2" strokeOpacity="0.8" />
            </pattern>
          ))}
        </defs>

        {/* Линия от подсказки к выбранному столбцу */}
        <line x1={X(sel.h)} x2={X(sel.h)} y1={0} y2={bottom - barH(sel.v) - 6} stroke={pal.text} strokeOpacity="0.35" strokeDasharray="2 3" />

        {bars.map((b) => {
          const x = X(b.h) - bw / 2;
          const hgt = Math.max(b.v > 0 ? 4 : 0, barH(b.v));
          const ghost = b.kind === 'future';
          const isSel = b.h === sel.h;
          return (
            <g
              key={b.h}
              className={styles.barGroup}
              onClick={() => setPicked(b.h)}
              onMouseEnter={() => setPicked(b.h)}
            >
              <rect x={X(b.h) - slot / 2} y={0} width={slot} height={H} fill="transparent" />
              {/* «стакан» = 100% мест */}
              <rect x={x} y={top} width={bw} height={bottom - top} rx={bw / 2.6} fill={pal.text} fillOpacity={isSel ? 0.11 : 0.055} />
              {hgt > 0 && (
                <rect
                  x={x}
                  y={bottom - hgt}
                  width={bw}
                  height={hgt}
                  rx={Math.min(bw / 2.6, hgt / 2)}
                  fill={ghost ? `url(#${pid(b.color)})` : b.color}
                  fillOpacity={b.kind === 'typical' ? 0.9 : 1}
                  stroke={ghost ? b.color : 'none'}
                  strokeOpacity="0.55"
                  strokeWidth="1"
                  className={b.kind === 'now' ? styles.pulse : undefined}
                />
              )}
              {isSel && <circle cx={X(b.h)} cy={bottom - hgt - 6} r="3" fill={pal.text} />}
              <text
                x={X(b.h)}
                y={H - 8}
                textAnchor="middle"
                fill={b.kind === 'now' ? pal.base : pal.text}
                fillOpacity={isSel || b.kind === 'now' ? 1 : 0.5}
                fontSize="10.5"
                fontWeight={isSel || b.kind === 'now' ? 700 : 500}
              >
                {pad2(b.h)}
              </text>
            </g>
          );
        })}

        {/* Перемены — отметки под столбцами */}
        {brs.map((br) => (
          <rect
            key={br.from}
            x={Math.max(PAD.l, Xmin(br.from))}
            y={bottom + 4}
            width={Math.max(4, Math.min(Xmin(br.to), W - PAD.r) - Math.max(PAD.l, Xmin(br.from)))}
            height="3"
            rx="1.5"
            fill={pal.warn}
          />
        ))}
      </svg>

      <div className={styles.legend} style={{ color: pal.muted }}>
        {isToday ? (
          <>
            <span><i className={styles.swatchSq} style={{ background: pal.base }} />было</span>
            <span><i className={styles.swatchHatch} style={{ color: pal.base }} />прогноз</span>
          </>
        ) : (
          <span><i className={styles.swatchSq} style={{ background: pal.base }} />как обычно в этот день</span>
        )}
        <span><i className={styles.swatchSq} style={{ background: pal.warn }} />людно</span>
        <span><i className={styles.swatchSq} style={{ background: pal.bad }} />почти нет мест</span>
        {brs.length > 0 && <span><i className={styles.swatchLine} style={{ background: pal.warn }} />перемены</span>}
      </div>
    </div>
  );
}
