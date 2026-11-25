// Система движения панели управления (framer-motion).
// Правила: двигаем только transform/opacity, быстро (120–450 мс), при «уменьшить движение» — без анимаций.
import { useEffect, useId, useRef, useState } from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';

export const EASE = [0.22, 1, 0.36, 1];          // мягкий «выдох» в конце
export const SPRING = { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 };

// Контейнер, дети которого появляются по очереди
export function Stagger({ children, className, style, delay = 0, step = 0.05, as = 'div' }) {
  const reduce = useReducedMotion();
  const M = motion[as];
  return (
    <M
      className={className}
      style={style}
      initial={reduce ? false : 'hidden'}
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: step, delayChildren: delay } } }}
    >
      {children}
    </M>
  );
}

// Элемент внутри Stagger: всплывает на 12px и проявляется
export function Item({ children, className, style, as = 'div', ...rest }) {
  const M = motion[as];
  return (
    <M
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y: 12, scale: 0.985 },
        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } },
      }}
      {...rest}
    >
      {children}
    </M>
  );
}

// Число, которое «докручивается» до нового значения
export function AnimatedNumber({ value, duration = 0.7, format = (v) => Math.round(v).toLocaleString('ru-RU') }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reduce || typeof value !== 'number' || Number.isNaN(value)) { setShown(value); from.current = value; return undefined; }
    const ctrl = animate(from.current, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => setShown(v),
    });
    from.current = value;
    return () => ctrl.stop();
  }, [value, duration, reduce]);
  return <span className="num-anim">{typeof shown === 'number' ? format(shown) : shown}</span>;
}

// Кольцо прогресса, которое дорисовывается
export function Ring({ value, size = 120, stroke = 10, color = 'currentColor', trackOpacity = 0.2, children }) {
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  const v = Math.max(0, Math.min(1, value || 0));
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* Цвет — через style: так работает и CSS-переменная вида var(--c-ok) */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" style={{ stroke: color }} strokeOpacity={trackOpacity} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          style={{ stroke: color }}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: v }}
          transition={{ duration: 1.1, ease: EASE }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{children}</div>
    </div>
  );
}

// Мини-график, который рисуется слева направо
export function Sparkline({ data, width = 260, height = 56, color = 'currentColor', fill = true, marker = true }) {
  const reduce = useReducedMotion();
  const gid = `spk${useId().replace(/:/g, '')}`;
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const X = (i) => (i / (data.length - 1)) * width;
  const Y = (v) => height - 4 - (v / max) * (height - 10);
  const d = data.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
  const area = `${d} L${width} ${height} L0 ${height} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
      {fill && (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.32" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path d={area} fill={`url(#${gid})`} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} />
        </>
      )}
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: EASE }}
      />
      {marker && (
        <motion.circle
          cx={X(data.length - 1)}
          cy={Y(data[data.length - 1])}
          r="4"
          fill={color}
          initial={reduce ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.1, ...SPRING }}
        />
      )}
    </svg>
  );
}

// Маячок «на связи»: точка с расходящимся кольцом
export function Pulse({ color = 'currentColor', size = 8, on = true }) {
  return (
    <span className="pulse-dot" style={{ '--pc': color, width: size, height: size }} data-on={on ? '1' : '0'} />
  );
}
