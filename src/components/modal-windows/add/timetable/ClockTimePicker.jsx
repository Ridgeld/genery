import React, { useRef, useState } from 'react';
import styles from './ClockTimePicker.module.scss';

function parseTime(str, defaultH = 8, defaultM = 30) {
  if (!str || typeof str !== 'string') return { h: defaultH, m: defaultM };
  const parts = str.split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return {
    h: isNaN(h) ? defaultH : Math.max(0, Math.min(23, h)),
    m: isNaN(m) ? defaultM : Math.max(0, Math.min(59, m))
  };
}

function formatTime(h, m) {
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function ClockTimePicker({
  timeStart,
  setTimeStart,
  timeEnd,
  setTimeEnd,
  theme
}) {
  const [target, setTarget] = useState('start'); // 'start' | 'end'
  const [unit, setUnit] = useState('hours'); // 'hours' | 'minutes'
  const dialRef = useRef(null);

  const currentTimeStr = target === 'start' ? timeStart : timeEnd;
  const setTime = target === 'start' ? setTimeStart : setTimeEnd;
  const { h, m } = parseTime(currentTimeStr, target === 'start' ? 8 : 10, target === 'start' ? 30 : 0);

  const updateHours = (newH) => {
    const nextH = Math.max(0, Math.min(23, newH));
    setTime(formatTime(nextH, m));
  };

  const updateMinutes = (newM) => {
    const nextM = Math.max(0, Math.min(59, newM));
    setTime(formatTime(h, nextM));
  };

  // Add minutes to start time and set end time
  const handleAddDuration = (durationMinutes) => {
    const startObj = parseTime(timeStart, 8, 30);
    const totalMinutes = startObj.h * 60 + startObj.m + durationMinutes;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    setTimeEnd(formatTime(endH, endM));
    setTarget('end');
  };

  // Dial touch / mouse interaction
  const handleDialPointer = (e) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = clientX - rect.left - centerX;
    const y = clientY - rect.top - centerY;

    const dist = Math.sqrt(x * x + y * y);
    // Angle in degrees from 12 o'clock (top) clockwise
    const deg = (Math.atan2(y, x) * (180 / Math.PI) + 90 + 360) % 360;

    if (unit === 'hours') {
      const isInner = dist < 68;
      const step = Math.round(deg / 30) % 12;
      let selectedH;
      if (isInner) {
        selectedH = step === 0 ? 0 : step + 12; // 00, 13..23
      } else {
        selectedH = step === 0 ? 12 : step; // 12, 1..11
      }
      updateHours(selectedH);
      // Auto-switch to minutes mode
      setTimeout(() => {
        setUnit('minutes');
      }, 180);
    } else {
      const selectedM = Math.round(deg / 6) % 60;
      updateMinutes(selectedM);
    }
  };

  // Geometry for clock hand and active circle
  let handAngleDeg = 0;
  let handLengthPx = 80;

  if (unit === 'hours') {
    const isInner = h === 0 || (h >= 13 && h <= 23);
    const step = h % 12;
    handAngleDeg = step * 30;
    handLengthPx = isInner ? 50 : 80;
  } else {
    handAngleDeg = m * 6;
    handLengthPx = 80;
  }

  // End circle coordinates for clock hand
  const handRad = (handAngleDeg * Math.PI) / 180;
  const endCircleX = 110 + Math.sin(handRad) * handLengthPx;
  const endCircleY = 110 - Math.cos(handRad) * handLengthPx;

  // Numbers arrays
  const outerHours = [
    { label: '12', h: 12, angle: 0 },
    { label: '1', h: 1, angle: 30 },
    { label: '2', h: 2, angle: 60 },
    { label: '3', h: 3, angle: 90 },
    { label: '4', h: 4, angle: 120 },
    { label: '5', h: 5, angle: 150 },
    { label: '6', h: 6, angle: 180 },
    { label: '7', h: 7, angle: 210 },
    { label: '8', h: 8, angle: 240 },
    { label: '9', h: 9, angle: 270 },
    { label: '10', h: 10, angle: 300 },
    { label: '11', h: 11, angle: 330 }
  ];

  const innerHours = [
    { label: '00', h: 0, angle: 0 },
    { label: '13', h: 13, angle: 30 },
    { label: '14', h: 14, angle: 60 },
    { label: '15', h: 15, angle: 90 },
    { label: '16', h: 16, angle: 120 },
    { label: '17', h: 17, angle: 150 },
    { label: '18', h: 18, angle: 180 },
    { label: '19', h: 19, angle: 210 },
    { label: '20', h: 20, angle: 240 },
    { label: '21', h: 21, angle: 270 },
    { label: '22', h: 22, angle: 300 },
    { label: '23', h: 23, angle: 330 }
  ];

  const minutesList = [
    { label: '00', m: 0, angle: 0 },
    { label: '05', m: 5, angle: 30 },
    { label: '10', m: 10, angle: 60 },
    { label: '15', m: 15, angle: 90 },
    { label: '20', m: 20, angle: 120 },
    { label: '25', m: 25, angle: 150 },
    { label: '30', m: 30, angle: 180 },
    { label: '35', m: 35, angle: 210 },
    { label: '40', m: 40, angle: 240 },
    { label: '45', m: 45, angle: 270 },
    { label: '50', m: 50, angle: 300 },
    { label: '55', m: 55, angle: 330 }
  ];

  return (
    <div className={styles.timePickerContainer}>
      {/* 1. TABS: НАЧАЛО / КОНЕЦ */}
      <div
        className={styles.targetTabs}
        style={{ background: theme.element_second_color }}
      >
        <button
          type="button"
          className={styles.targetTab}
          onClick={() => {
            setTarget('start');
            setUnit('hours');
          }}
          style={{
            background: target === 'start' ? theme.first_color : 'transparent',
            color: target === 'start' ? theme.text_third_color || '#fff' : theme.text_first_color
          }}
        >
          <span className={styles.targetLabel}>Начало</span>
          <span className={styles.targetTimeValue}>{timeStart || '08:30'}</span>
        </button>

        <button
          type="button"
          className={styles.targetTab}
          onClick={() => {
            setTarget('end');
            setUnit('hours');
          }}
          style={{
            background: target === 'end' ? theme.first_color : 'transparent',
            color: target === 'end' ? theme.text_third_color || '#fff' : theme.text_first_color
          }}
        >
          <span className={styles.targetLabel}>Конец</span>
          <span className={styles.targetTimeValue}>{timeEnd || '10:00'}</span>
        </button>
      </div>

      {/* 2. DIGITAL READOUT: ЧАСЫ : МИНУТЫ */}
      <div className={styles.digitalDisplayRow}>
        <button
          type="button"
          className={styles.digitalSegment}
          onClick={() => setUnit('hours')}
          style={{
            background: unit === 'hours' ? theme.first_color : theme.element_second_color,
            color: unit === 'hours' ? theme.text_third_color || '#fff' : theme.text_first_color
          }}
        >
          {String(h).padStart(2, '0')}
        </button>

        <span className={styles.digitalColon} style={{ color: theme.text_first_color }}>
          :
        </span>

        <button
          type="button"
          className={styles.digitalSegment}
          onClick={() => setUnit('minutes')}
          style={{
            background: unit === 'minutes' ? theme.first_color : theme.element_second_color,
            color: unit === 'minutes' ? theme.text_third_color || '#fff' : theme.text_first_color
          }}
        >
          {String(m).padStart(2, '0')}
        </button>
      </div>

      {/* 3. CIRCULAR CLOCK DIAL (MATERIAL CLOCK FACE) */}
      <div
        ref={dialRef}
        className={styles.clockDialWrapper}
        onPointerDown={handleDialPointer}
        style={{
          background: theme.element_second_color,
          border: `1px solid ${theme.block_border_color !== 'none' ? theme.block_border_color : 'rgba(255,255,255,0.06)'}`
        }}
      >
        {/* Center Pivot */}
        <div
          className={styles.clockCenterPivot}
          style={{ background: theme.first_color }}
        />

        {/* Hand Line */}
        <div
          className={styles.clockHandLine}
          style={{
            height: `${handLengthPx}px`,
            background: theme.first_color,
            transform: `rotate(${handAngleDeg}deg)`
          }}
        />

        {/* Hand End Circle Selector */}
        <div
          className={styles.clockHandEndCircle}
          style={{
            left: `${endCircleX}px`,
            top: `${endCircleY}px`,
            background: theme.first_color
          }}
        />

        {/* Dial Numbers: Hours or Minutes */}
        {unit === 'hours' ? (
          <>
            {/* Outer ring (1 to 12) */}
            {outerHours.map((item) => {
              const rad = (item.angle * Math.PI) / 180;
              const x = 110 + Math.sin(rad) * 80;
              const y = 110 - Math.cos(rad) * 80;
              const isActive = h === item.h;

              return (
                <div
                  key={item.label}
                  className={`${styles.clockNumber} ${isActive ? styles.clockNumberActive : ''}`}
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    color: isActive ? theme.text_third_color || '#fff' : theme.text_first_color
                  }}
                >
                  {item.label}
                </div>
              );
            })}

            {/* Inner ring (00, 13 to 23) */}
            {innerHours.map((item) => {
              const rad = (item.angle * Math.PI) / 180;
              const x = 110 + Math.sin(rad) * 50;
              const y = 110 - Math.cos(rad) * 50;
              const isActive = h === item.h;

              return (
                <div
                  key={item.label}
                  className={`${styles.clockNumber} ${styles.clockNumberInner} ${isActive ? styles.clockNumberActive : ''}`}
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    color: isActive ? theme.text_third_color || '#fff' : theme.text_second_color
                  }}
                >
                  {item.label}
                </div>
              );
            })}
          </>
        ) : (
          /* Minutes dial */
          minutesList.map((item) => {
            const rad = (item.angle * Math.PI) / 180;
            const x = 110 + Math.sin(rad) * 80;
            const y = 110 - Math.cos(rad) * 80;
            const isActive = m === item.m;

            return (
              <div
                key={item.label}
                className={`${styles.clockNumber} ${isActive ? styles.clockNumberActive : ''}`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  color: isActive ? theme.text_third_color || '#fff' : theme.text_first_color
                }}
              >
                {item.label}
              </div>
            );
          })
        )}
      </div>

      {/* 4. QUICK DURATION PRESETS */}
      <div className={styles.quickPresetsRow}>
        <button
          type="button"
          className={styles.presetBtn}
          onClick={() => handleAddDuration(45)}
          style={{
            background: theme.element_second_color,
            color: theme.text_first_color
          }}
        >
          +45 мин
        </button>
        <button
          type="button"
          className={styles.presetBtn}
          onClick={() => handleAddDuration(80)}
          style={{
            background: theme.element_second_color,
            color: theme.text_first_color
          }}
        >
          +80 мин (пара)
        </button>
        <button
          type="button"
          className={styles.presetBtn}
          onClick={() => handleAddDuration(90)}
          style={{
            background: theme.element_second_color,
            color: theme.text_first_color
          }}
        >
          +90 мин
        </button>
      </div>
    </div>
  );
}

