import { useState } from 'react';
import styles from './CanteenOccupancy.module.scss';
import { CLOSE_HOUR, OPEN_HOUR, breaks, predictAt, valueAt } from './canteenStats.js';

const W = 340;
const H = 190;
const PAD = { l: 26, r: 6, t: 16, b: 24 };
const pad2 = (n) => String(n).padStart(2, '0');

// Столбцы по часам: прошедшие — факт (сплошные), текущий — пульсирует, будущие — прогноз (полупрозрачные).
// Полосы на фоне — перемены из расписания звонков.
export default function BarsChart({ theme, accent, capacity, typical, todayOcc, now, occupied, isToday, schedule }) {
  const [sel, setSel] = useState(null);
  const hours = [];
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h += 1) hours.push(h);
  const curH = Math.floor(now / 60);

  const bars = hours.map((h) => {
    const mid = h * 60 + 30;
    if (!isToday) return { h, v: typical ? valueAt(typical.occ, mid) : 0, kind: 'typical' };
    if (h < curH) return { h, v: todayOcc ? Math.max(todayOcc[h], todayOcc[h + 1] ?? todayOcc[h]) : 0, kind: 'past' };
    if (h === curH) return { h, v: occupied, kind: 'now' };
    return { h, v: typical ? predictAt(typical, occupied, now, mid) : 0, kind: 'future' };
  });

  const maxV = Math.max(capacity, ...bars.map((b) => b.v)) * 1.08 || 1;
  const plotW = W - PAD.l - PAD.r;
  const slot = plotW / hours.length;
  const bw = slot * 0.62;
  const X = (h) => PAD.l + (h - OPEN_HOUR) * slot;
  const Xmin = (m) => PAD.l + ((m - OPEN_HOUR * 60) / 60) * slot;
  const Y = (v) => PAD.t + (1 - Math.max(0, v) / maxV) * (H - PAD.t - PAD.b);
  const bottom = H - PAD.b;
  const muted = theme.text_second_color;

  const fill = (b) => {
    if (b.kind === 'past' || b.kind === 'now') return accent;
    return 'none';
  };

  const info = sel === null ? null : bars.find((b) => b.h === sel);
  const kindText = { past: 'факт', now: 'сейчас', future: 'прогноз', typical: 'обычно' };

  return (
    <div>
      <svg className={styles.chartSvg} viewBox={`0 0 ${W} ${H}`}>
        {/* перемены */}
        {breaks(schedule).filter((br) => br.to > OPEN_HOUR * 60 && br.from < CLOSE_HOUR * 60).map((br) => (
          <rect key={br.from} x={Xmin(br.from)} y={PAD.t - 6} width={Math.max(3, Xmin(br.to) - Xmin(br.from))} height={bottom - PAD.t + 6}
            fill={theme.text_first_color} opacity="0.07" rx="3" />
        ))}

        {/* линия вместимости */}
        <line x1={PAD.l} x2={W - PAD.r} y1={Y(capacity)} y2={Y(capacity)} stroke="#FF4365" strokeOpacity="0.55" strokeDasharray="4 4" />
        <text x={W - PAD.r} y={Y(capacity) - 5} textAnchor="end" fill={muted} fillOpacity="0.7" fontSize="9.5">мест: {capacity}</text>
        {[0, Math.round(capacity / 2)].map((v) => (
          <text key={v} x={PAD.l - 5} y={Y(v) + 3} textAnchor="end" fill={muted} fillOpacity="0.6" fontSize="9.5">{v}</text>
        ))}

        {bars.map((b) => {
          const x = X(b.h) + (slot - bw) / 2;
          const y = Y(b.v);
          const hgt = Math.max(3, bottom - y);
          const ghost = b.kind === 'future' || b.kind === 'typical';
          return (
            <g key={b.h} onClick={() => setSel(sel === b.h ? null : b.h)} style={{ cursor: 'pointer' }}>
              <rect x={X(b.h)} y={PAD.t} width={slot} height={bottom - PAD.t} fill="transparent" />
              <rect
                x={x}
                y={bottom - hgt}
                width={bw}
                height={hgt}
                rx={Math.min(5, bw / 2)}
                fill={ghost ? accent : fill(b)}
                fillOpacity={ghost ? 0.18 : 1}
                stroke={ghost ? accent : 'none'}
                strokeOpacity={ghost ? 0.7 : 0}
                strokeDasharray={ghost ? '3 3' : undefined}
                className={b.kind === 'now' ? styles.pulse : undefined}
              />
              {sel === b.h && <rect x={x - 2} y={bottom - hgt - 2} width={bw + 4} height={hgt + 4} rx="6" fill="none" stroke={theme.text_first_color} strokeOpacity="0.6" />}
              {(b.h % 2 === 0) && (
                <text x={X(b.h) + slot / 2} y={H - 7} textAnchor="middle" fill={b.kind === 'now' ? theme.text_first_color : muted} fillOpacity={b.kind === 'now' ? 1 : 0.65} fontSize="10" fontWeight={b.kind === 'now' ? 700 : 400}>
                  {pad2(b.h)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className={styles.chartInfo} style={{ color: muted }}>
        {info ? (
          <>
            <b style={{ color: theme.text_first_color }}>{pad2(info.h)}:00–{pad2(info.h + 1)}:00</b>
            <span>{kindText[info.kind]}: {Math.round(info.v)} чел.</span>
          </>
        ) : (
          <>
            {isToday && <span><i className={styles.swatch} style={{ background: accent }} />факт</span>}
            <span><i className={styles.swatchGhost} style={{ borderColor: accent, background: `${accent}2e` }} />{isToday ? 'прогноз' : 'обычно'}</span>
            {breaks(schedule).length > 0 && <span><i className={styles.swatchBreak} style={{ background: theme.text_first_color }} />перемены</span>}
            <span className={styles.chartHint}>нажмите на столбец</span>
          </>
        )}
      </div>
    </div>
  );
}
