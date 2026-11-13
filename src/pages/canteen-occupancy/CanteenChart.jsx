import { useMemo, useState } from 'react';
import styles from './CanteenOccupancy.module.scss';
import { CLOSE_HOUR, OPEN_HOUR, fmtTime, predictAt, valueAt } from './canteenStats.js';

const W = 340;
const H = 200;
const PAD = { l: 30, r: 12, t: 22, b: 24 };
const START = OPEN_HOUR * 60;
const END = CLOSE_HOUR * 60;

// График дня: «обычно» (пунктир), «сегодня» (сплошная) и прогноз на 2 часа вперёд.
// typical — { occ: [25] } или null; todayOcc — массив [25] за сегодня или null.
export default function CanteenChart({ theme, accent, capacity, typical, todayOcc, now, occupied, isToday }) {
  const [hover, setHover] = useState(null);

  const geo = useMemo(() => {
    let maxV = capacity;
    if (typical) for (let m = START; m <= END; m += 10) maxV = Math.max(maxV, valueAt(typical.occ, m));
    if (isToday) maxV = Math.max(maxV, occupied);
    const top = maxV * 1.08;
    const x = (m) => PAD.l + ((Math.min(Math.max(m, START), END) - START) / (END - START)) * (W - PAD.l - PAD.r);
    const y = (v) => PAD.t + (1 - Math.max(0, v) / top) * (H - PAD.t - PAD.b);
    return { x, y, bottom: H - PAD.b };
  }, [capacity, typical, isToday, occupied]);

  const { x, y, bottom } = geo;
  const line = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${x(p[0]).toFixed(1)} ${y(p[1]).toFixed(1)}`).join(' ');
  const area = (pts) => (pts.length > 1
    ? `${line(pts)} L${x(pts[pts.length - 1][0]).toFixed(1)} ${bottom} L${x(pts[0][0]).toFixed(1)} ${bottom}Z` : '');

  // Обычный день
  const typPts = [];
  if (typical) for (let m = START; m <= END; m += 10) typPts.push([m, valueAt(typical.occ, m)]);

  // Сегодня: по часам до текущего часа + текущее значение
  const showNow = isToday && now >= START && now <= END;
  const todayPts = [];
  if (isToday && todayOcc && now > START) {
    for (let h = OPEN_HOUR; h * 60 < Math.min(now, END); h += 1) todayPts.push([h * 60, todayOcc[h]]);
  }
  if (showNow) todayPts.push([now, occupied]);

  // Прогноз на 2 часа
  const fcPts = [];
  if (showNow && typical) {
    for (let m = now; m <= Math.min(now + 120, END); m += 10) fcPts.push([m, predictAt(typical, occupied, now, m)]);
  }

  const muted = theme.text_second_color;
  const grid = [0, 0.5, 1].map((f) => Math.round(capacity * f));

  const onPointer = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const m = START + ((px - PAD.l) / (W - PAD.l - PAD.r)) * (END - START);
    setHover(Math.round(Math.min(Math.max(m, START), END) / 10) * 10);
  };

  const hoverToday = hover !== null && isToday && todayOcc && hover <= now
    ? (hover >= now - 10 ? occupied : Math.round(valueAt(todayOcc, hover))) : null;
  const hoverTyp = hover !== null && typical ? Math.round(valueAt(typical.occ, hover)) : null;
  const hoverFc = hover !== null && showNow && typical && hover > now && hover <= now + 120
    ? Math.round(predictAt(typical, occupied, now, hover)) : null;

  return (
    <div>
      <svg
        className={styles.chartSvg}
        viewBox={`0 0 ${W} ${H}`}
        onPointerMove={onPointer}
        onPointerDown={onPointer}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="todayArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={accent} stopOpacity="0.45" />
            <stop offset="1" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        {grid.map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke={muted} strokeOpacity="0.1" />
            <text x={PAD.l - 6} y={y(v) + 4} textAnchor="end" fill={muted} fillOpacity="0.6" fontSize="10">{v}</text>
          </g>
        ))}
        <text x={W - PAD.r} y={y(capacity) - 6} textAnchor="end" fill={muted} fillOpacity="0.6" fontSize="10">
          всего мест
        </text>

        {[8, 10, 12, 14, 16, 18].map((h) => (
          <text key={h} x={x(h * 60)} y={H - 6} textAnchor="middle" fill={muted} fillOpacity="0.6" fontSize="10">
            {String(h).padStart(2, '0')}:00
          </text>
        ))}

        {typPts.length > 1 && (
          <>
            <path d={area(typPts)} fill={muted} fillOpacity={isToday ? 0.05 : 0.1} />
            <path
              d={line(typPts)}
              fill="none"
              stroke={isToday ? muted : accent}
              strokeOpacity={isToday ? 0.55 : 1}
              strokeWidth={isToday ? 1.8 : 2.6}
              strokeDasharray={isToday ? '5 5' : undefined}
              strokeLinecap="round"
            />
          </>
        )}

        {todayPts.length > 1 && (
          <>
            <path d={area(todayPts)} fill="url(#todayArea)" />
            <path d={line(todayPts)} fill="none" stroke={accent} strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}

        {fcPts.length > 1 && (
          <path d={line(fcPts)} fill="none" stroke={accent} strokeWidth="2.2" strokeDasharray="2 5" strokeLinecap="round" />
        )}

        {showNow && (
          <g>
            <line x1={x(now)} x2={x(now)} y1={PAD.t - 8} y2={bottom} stroke={theme.text_first_color} strokeOpacity="0.25" />
            <circle cx={x(now)} cy={y(occupied)} r="5.5" fill={theme.text_first_color} stroke={accent} strokeWidth="3" />
            <text
              x={x(now)}
              y={PAD.t - 11}
              textAnchor={now > END - 90 ? 'end' : now < START + 90 ? 'start' : 'middle'}
              fill={theme.text_first_color}
              fontSize="11"
              fontWeight="600"
            >
              сейчас
            </text>
          </g>
        )}

        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={bottom} stroke={accent} strokeOpacity="0.6" strokeDasharray="3 3" />
        )}
      </svg>

      <div className={styles.chartInfo} style={{ color: muted }}>
        {hover !== null ? (
          <>
            <b style={{ color: theme.text_first_color }}>{fmtTime(hover)}</b>
            {hoverToday !== null && <span>сегодня {hoverToday}</span>}
            {hoverFc !== null && <span>прогноз {hoverFc}</span>}
            {hoverTyp !== null && <span>обычно {hoverTyp}</span>}
            {hoverToday === null && hoverFc === null && hoverTyp === null && <span>нет данных</span>}
          </>
        ) : (
          <>
            {isToday && <span><i className={styles.swatch} style={{ background: accent }} />сегодня</span>}
            {isToday && typical && <span><i className={styles.swatchDots} style={{ color: accent }} />прогноз</span>}
            {typical && (
              <span>
                <i className={isToday ? styles.swatchDash : styles.swatch} style={{ background: isToday ? 'none' : accent, color: muted }} />
                обычно
              </span>
            )}
            <span className={styles.chartHint}>нажмите на график</span>
          </>
        )}
      </div>
    </div>
  );
}
