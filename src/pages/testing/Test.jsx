import React, { useState } from 'react';

const GeometryVisualizer = () => {
  // Исходные координаты точек отрезка (A и B)
  const [pointA, setPointA] = useState({ x: 50, y: 60, z: 40 });
  const [pointB, setPointB] = useState({ x: 130, y: 120, z: 110 });
  
  // Угол поворота в градусах
  const [angleDeg, setAngleDeg] = useState(0);

  // Ось вращения теперь динамически привязана к точке А
  const axisX = pointA.x;
  const axisY = pointA.y;

  // Функция применения матрицы поворота
  const rotatePoint = (point, axX, axY, angle) => {
    const rad = (angle * Math.PI) / 180;
    const newX = axX + (point.x - axX) * Math.cos(rad) - (point.y - axY) * Math.sin(rad);
    const newY = axY + (point.x - axX) * Math.sin(rad) + (point.y - axY) * Math.cos(rad);
    return { x: newX, y: newY, z: point.z };
  };

  // Вычисляем новые координаты после поворота
  const rotatedA = rotatePoint(pointA, axisX, axisY, angleDeg);
  const rotatedB = rotatePoint(pointB, axisX, axisY, angleDeg);

  const canvasSize = 200;

  // Компонент отрисовки плоскости
  const ProjectionPlane = ({ title, pA, pB, rA, rB, getX, getY, showAxis }) => (
    <div style={{ border: '1px solid #ccc', padding: '10px', background: '#f9f9f9', width: 'max-content' }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', textAlign: 'center' }}>{title}</h3>
      <svg width={canvasSize} height={canvasSize} style={{ background: '#fff', border: '1px solid #ddd' }}>
        {/* Исходный отрезок (серый) */}
        <line x1={getX(pA)} y1={getY(pA)} x2={getX(pB)} y2={getY(pB)} stroke="#999" strokeWidth="2" strokeDasharray="4 4" />
        {/* Повернутый отрезок (синий) */}
        <line x1={getX(rA)} y1={getY(rA)} x2={getX(rB)} y2={getY(rB)} stroke="#007bff" strokeWidth="3" />
        {/* Точки */}
        <circle cx={getX(rA)} cy={getY(rA)} r="4" fill="#dc3545" />
        <circle cx={getX(rB)} cy={getY(rB)} r="4" fill="#dc3545" />
        {/* Ось вращения в точке А */}
        {showAxis && (
           <circle cx={getX(rA)} cy={getY(rA)} r="7" fill="none" stroke="#28a745" strokeWidth="2" />
        )}
      </svg>
    </div>
  );

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Интерактивный эпюр</h2>
      
      {/* CSS Grid для классической компоновки чертежа */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'max-content max-content', 
        gridTemplateRows: 'max-content max-content', 
        gap: '20px', 
        justifyContent: 'center',
        marginBottom: '30px'
      }}>
        {/* П2: Вид спереди (Слева сверху) */}
        <div style={{ gridColumn: 1, gridRow: 1 }}>
          <ProjectionPlane 
            title="П2 (Вид спереди)" 
            pA={pointA} pB={pointB} rA={rotatedA} rB={rotatedB}
            getX={(p) => p.x} getY={(p) => canvasSize - p.z} showAxis={false}
          />
        </div>

        {/* П3: Вид слева (Справа сверху) */}
        <div style={{ gridColumn: 2, gridRow: 1 }}>
          <ProjectionPlane 
            title="П3 (Вид слева)" 
            pA={pointA} pB={pointB} rA={rotatedA} rB={rotatedB}
            getX={(p) => p.y} getY={(p) => canvasSize - p.z} showAxis={false}
          />
        </div>

        {/* П1: Вид сверху (Слева снизу) */}
        <div style={{ gridColumn: 1, gridRow: 2 }}>
          <ProjectionPlane 
            title="П1 (Вид сверху)" 
            pA={pointA} pB={pointB} rA={rotatedA} rB={rotatedB}
            getX={(p) => p.x} getY={(p) => p.y} showAxis={true}
          />
        </div>
      </div>

      {/* Панель управления */}
      <div style={{ background: '#eee', padding: '20px', borderRadius: '8px' }}>
        <h3>Вращение вокруг оси, проходящей через т. А</h3>
        <label style={{ display: 'block', margin: '15px 0' }}>
          <strong>Угол: {angleDeg}°</strong>
          <input 
            type="range" min="-180" max="180" value={angleDeg} 
            onChange={(e) => setAngleDeg(Number(e.target.value))}
            style={{ width: '100%', marginTop: '10px' }}
          />
        </label>
        
        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ccc' }} />

        <h3>Координаты точек</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <strong>Точка A (Ось вращения)</strong>
            <div style={{ marginTop: '5px' }}>X: <input type="number" value={pointA.x} onChange={e => setPointA({...pointA, x: +e.target.value})} style={{width: '60px'}}/></div>
            <div style={{ marginTop: '5px' }}>Y: <input type="number" value={pointA.y} onChange={e => setPointA({...pointA, y: +e.target.value})} style={{width: '60px'}}/></div>
            <div style={{ marginTop: '5px' }}>Z: <input type="number" value={pointA.z} onChange={e => setPointA({...pointA, z: +e.target.value})} style={{width: '60px'}}/></div>
          </div>
          <div>
            <strong>Точка B (Вращающаяся)</strong>
            <div style={{ marginTop: '5px' }}>X: <input type="number" value={pointB.x} onChange={e => setPointB({...pointB, x: +e.target.value})} style={{width: '60px'}}/></div>
            <div style={{ marginTop: '5px' }}>Y: <input type="number" value={pointB.y} onChange={e => setPointB({...pointB, y: +e.target.value})} style={{width: '60px'}}/></div>
            <div style={{ marginTop: '5px' }}>Z: <input type="number" value={pointB.z} onChange={e => setPointB({...pointB, z: +e.target.value})} style={{width: '60px'}}/></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeometryVisualizer;