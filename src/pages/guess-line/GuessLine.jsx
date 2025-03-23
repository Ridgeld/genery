import React, { useContext, useEffect, useRef, useState } from 'react';
import styles from './GuessLine.module.scss';
import { ElementContext } from '../../providers/ElementProvider';
import AlertNotification from '../../components/notifictions/AlertNotification/AlertNotification';
import ScoreContainer from '../../components/score-container/ScoreContainer';
import { useNavigate } from 'react-router-dom';
import shapesData from './linedata';

export default function GuessLine() {
  const { theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);
  const navigateTo = useNavigate();
  const canvasRef = useRef();
  const [score, setScore] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  
  const [alertProp, setAlertProp] = useState({
    isShow: false,
    title: 'Заголовок',
    text: 'текст',
    firstButtonName: 'выйти',
    secondButtonName: 'играть',
  });

  const [dimensions, setDimensions] = useState({
    width: 400,
    height: 600
  });

  useEffect(() => {
    setElementColors({
      iconColor: theme.icon_color,
      titleColor: theme.text_first_color,
      showArrow: true,
      arrowLink: () => navigateTo(`/game-menu`),
      arrowColor: theme.text_first_color,
      isHeaderBackground: true,
      headerBackground: theme.background_color,
      isHeader: true,
      isFooter: false,
      footerBackground: theme.background_color,
      activeElementIndex: 0,
      background: theme.background_color
    });
    document.body.style.background = theme.background_color;
  }, [theme]);

//   const handleResize = () => {
//     const isMobile = window.innerWidth < 768;
//     const newWidth = Math.min(window.innerWidth - 40, 400);
//     const newHeight = isMobile ? 600 : Math.min(window.innerHeight - 100, 600);
    
//     setDimensions({
//       width: newWidth,
//       height: newHeight
//     });
//   };

//   useEffect(() => {
//     window.addEventListener("resize", handleResize);
//     handleResize();
    
//     // Выбор случайной линии при первой загрузке
//     const randomIndex = Math.floor(Math.random() * linesData.length);
//     setCurrentLineIndex(randomIndex);
    
//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext("2d");
//     const cellSize = 20;
//     const gridWidth = Math.floor(dimensions.width / cellSize);
//     const gridHeight = Math.floor(dimensions.height / cellSize);
    
//     // Очистка холста
//     ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    
//     // Рисуем фон (сетка)
//     drawGrid(ctx, cellSize, gridWidth, gridHeight);
    
//     // Рисуем фронтальную проекцию (верхняя часть)
//     const frontalArea = {
//       x: 0,
//       y: 0,
//       width: dimensions.width,
//       height: dimensions.height / 3
//     };
    
//     // Рисуем горизонтальную проекцию (нижняя часть)
//     const horizontalArea = {
//       x: 0,
//       y: dimensions.height * 2/3,
//       width: dimensions.width,
//       height: dimensions.height / 3
//     };
    
//     // Рисуем координатную ось (разделитель)
//     ctx.beginPath();
//     ctx.moveTo(0, dimensions.height / 3);
//     ctx.lineTo(dimensions.width, dimensions.height / 3);
//     ctx.strokeStyle = 'black';
//     ctx.lineWidth = 2;
//     ctx.stroke();
    
//     ctx.beginPath();
//     ctx.moveTo(0, dimensions.height * 2/3);
//     ctx.lineTo(dimensions.width, dimensions.height * 2/3);
//     ctx.stroke();
    
//     // Получаем текущую линию
//     const currentLine = linesData[currentLineIndex];
    
//     // Рисуем фронтальную проекцию
//     drawProjection(
//       ctx, 
//       currentLine.frontalProjection, 
//       cellSize, 
//       frontalArea,
//       'red'
//     );
    
//     // Рисуем горизонтальную проекцию
//     drawProjection(
//       ctx, 
//       currentLine.horizontalProjection, 
//       cellSize, 
//       horizontalArea,
//       'blue'
//     );
    
//     // Добавляем подписи
//     ctx.font = '16px Inter';
//     ctx.fillStyle = 'black';
//     ctx.fillText('Фронтальная проекция', 10, 20);
//     ctx.fillText('Горизонтальная проекция', 10, dimensions.height * 2/3 + 20);
    
//   }, [dimensions, currentLineIndex]);

//   // Функция для рисования сетки
//   const drawGrid = (ctx, cellSize, gridWidth, gridHeight) => {
//     ctx.beginPath();
//     ctx.strokeStyle = '#ccc';
//     ctx.lineWidth = 0.5;
    
//     // Вертикальные линии
//     for (let i = 0; i <= gridWidth; i++) {
//       ctx.moveTo(i * cellSize, 0);
//       ctx.lineTo(i * cellSize, dimensions.height);
//     }
    
//     // Горизонтальные линии
//     for (let i = 0; i <= gridHeight; i++) {
//       ctx.moveTo(0, i * cellSize);
//       ctx.lineTo(dimensions.width, i * cellSize);
//     }
    
//     ctx.stroke();
//   };

//   // Функция для рисования проекции
//   const drawProjection = (ctx, points, cellSize, area, color) => {
//     if (points.length < 2) return;
    
//     ctx.beginPath();
//     const startX = area.x + points[0].x * cellSize;
//     const startY = area.y + points[0].y * cellSize;
//     ctx.moveTo(startX, startY);
    
//     for (let i = 1; i < points.length; i++) {
//       const x = area.x + points[i].x * cellSize;
//       const y = area.y + points[i].y * cellSize;
//       ctx.lineTo(x, y);
//     }
    
//     ctx.strokeStyle = color;
//     ctx.lineWidth = 2;
//     ctx.stroke();
    
//     // Рисуем точки
//     ctx.fillStyle = color;
//     points.forEach(point => {
//       ctx.beginPath();
//       ctx.arc(
//         area.x + point.x * cellSize, 
//         area.y + point.y * cellSize, 
//         4, 0, Math.PI * 2
//       );
//       ctx.fill();
//     });
//   };
// const handleResize = () => {
//     const isMobile = window.innerWidth < 768;
//     const newWidth = Math.min(window.innerWidth - 40, 400);
//     // Фиксированная высота 350px
//     const newHeight = 350;
    
//     setDimensions({
//       width: newWidth,
//       height: newHeight
//     });
//   };
  
//   useEffect(() => {
//     window.addEventListener("resize", handleResize);
//     handleResize();
    
//     // Выбор случайной линии при первой загрузке
//     const randomIndex = Math.floor(Math.random() * linesData.length);
//     setCurrentLineIndex(randomIndex);
    
//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);
const handleResize = () => {
    const isMobile = window.innerWidth < 768;
    const maxWidth = isMobile ? window.innerWidth - 40 : 600; // Динамический размер
    const maxHeight = isMobile ? 350 : Math.min(window.innerHeight - 100, 300); // Ограничение по высоте
  
    setDimensions({
      width: Math.min(window.innerWidth - 40, maxWidth),
      height: maxHeight
    });
  };
  
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
  
    const randomIndex = Math.floor(Math.random() * shapesData.length);
    setCurrentLineIndex(randomIndex);
  
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const ctx = canvas.getContext("2d");
    const cellSize = 20;
    const gridWidth = Math.floor(dimensions.width / cellSize);
    const gridHeight = Math.floor(dimensions.height / cellSize);
    
    // Очистка холста
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    
    // Рисуем фон (сетка)
    drawGrid(ctx, cellSize, gridWidth, gridHeight);
    
    // Рисуем фронтальную проекцию (верхняя часть)
    const frontalArea = {
      x: 0,
      y: 0,
      width: dimensions.width,
      height: dimensions.height / 2
    };
    
    // Рисуем горизонтальную проекцию (нижняя часть)
    const horizontalArea = {
      x: 0,
      y: dimensions.height / 2,
      width: dimensions.width,
      height: dimensions.height / 2
    };
    
    // Рисуем только одну координатную ось (разделитель между двумя проекциями)
    ctx.beginPath();
    ctx.moveTo(0, dimensions.height / 2);
    ctx.lineTo(dimensions.width, dimensions.height / 2);
    ctx.strokeStyle = theme.text_first_color;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Получаем текущую линию
    const currentLine = shapesData[currentLineIndex];
    
    // Рисуем фронтальную проекцию
    drawProjection(
      ctx, 
      currentLine.frontalProjection, 
      cellSize, 
      frontalArea,
      theme.third_color
    );
    
    // Рисуем горизонтальную проекцию
    drawProjection(
      ctx, 
      currentLine.horizontalProjection, 
      cellSize, 
      horizontalArea,
      theme.first_color
    );
    
    // Добавляем подписи
    ctx.font = '16px Inter';
    ctx.fillStyle = theme.text_first_color;
    ctx.fillText('Фронтальная проекция', 10, 20);
    ctx.fillText('Горизонтальная проекция', 10, dimensions.height / 2 + 20);
    
  }, [dimensions, currentLineIndex]);
  
  // Функция для рисования сетки
  const drawGrid = (ctx, cellSize, gridWidth, gridHeight) => {
    ctx.beginPath();
    ctx.strokeStyle = theme.element_second_color;
    ctx.lineWidth = 0.5;
    
    // Вертикальные линии
    for (let i = 0; i <= gridWidth; i++) {
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, dimensions.height);
    }
    
    // Горизонтальные линии
    for (let i = 0; i <= gridHeight; i++) {
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(dimensions.width, i * cellSize);
    }
    
    ctx.stroke();
  };

// const drawProjection = (ctx, points, cellSize, area, color) => {
//     if (points.length === 0) return; // Если нет точек, не рисуем
    
//     ctx.beginPath();
//     ctx.strokeStyle = color;
//     ctx.lineWidth = 2;
  
//     // Первая точка
//     const startX = area.x + points[0].x * cellSize;
//     const startY = area.y + points[0].y * cellSize;
//     ctx.moveTo(startX, startY);
  
//     // Соединяем все точки
//     for (let i = 1; i < points.length; i++) {
//       const x = area.x + points[i].x * cellSize;
//       const y = area.y + points[i].y * cellSize;
//       ctx.lineTo(x, y);
//     }
  
//     // Если нужно замкнуть фигуру, можно добавить:
//     // ctx.closePath();
  
//     ctx.stroke();
  
//     // Рисуем точки
//     ctx.fillStyle = color;
//     points.forEach(point => {
//       ctx.beginPath();
//       ctx.arc(
//         area.x + point.x * cellSize, 
//         area.y + point.y * cellSize, 
//         4, 0, Math.PI * 2
//       );
//       ctx.fill();
//     });
//   };
const drawProjection = (ctx, points, cellSize, area, color) => {
    if (points.length === 0) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.fillStyle = color;

    let prevPoint = null; // Запоминаем предыдущую точку

    points.forEach((point, index) => {
        if (point === null) {
            prevPoint = null; // Разрываем соединение
            return;
        }

        const x = area.x + point.x * cellSize;
        const y = area.y + point.y * cellSize;

        // Если есть предыдущая точка, соединяем линией
        if (prevPoint !== null) {
            ctx.beginPath();
            ctx.moveTo(prevPoint.x, prevPoint.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        }

        // Рисуем саму точку
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Обновляем предыдущую точку
        prevPoint = { x, y };
    });
};

  

  // Обработчик ввода ответа
  const handleAnswerChange = (e) => {
    setUserAnswer(e.target.value);
    setIsCorrect(null);
  };

  // Проверка ответа
  const checkAnswer = () => {
    const correctAnswer = shapesData[currentLineIndex].name.toLowerCase();
    const userInput = userAnswer.toLowerCase();
    
    if (userInput === correctAnswer) {
      setIsCorrect(true);
      setScore(prevScore => prevScore + 1);
      setAlertProp({
        isShow: true,
        title: 'Правильно!',
        text: 'Вы правильно определили линию.',
        firstButtonName: 'Выйти',
        secondButtonName: 'Далее',
        firstButtonOnClick: () => navigateTo('/game-menu'),
        secondButtonOnClick: goToNextLine
      });
    } else {
      setIsCorrect(false);
      setAlertProp({
        isShow: true,
        title: 'Неверно!',
        text: `Правильный ответ: ${shapesData[currentLineIndex].name}`,
        firstButtonName: 'Выйти',
        secondButtonName: 'Далее',
        firstButtonOnClick: () => navigateTo('/game-menu'),
        secondButtonOnClick: goToNextLine
      });
    }
  };

  // Переход к следующей линии
  const goToNextLine = () => {
    // Выбираем случайную линию, но не текущую
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * shapesData.length);
    } while (newIndex === currentLineIndex && shapesData.length > 1);
    
    setCurrentLineIndex(newIndex);
    setUserAnswer('');
    setShowAnswer(false);
    setIsCorrect(null);
    setAlertProp({
      isShow: false
    });
  };

  // Показать ответ
  const showCorrectAnswer = () => {
    setShowAnswer(true);
  };

  return(
    <div className={styles['container']}>
      {/* <ScoreContainer
        name={'Счет'}
        isBalance={false}
        count={score}
      /> */}
      <AlertNotification
        title={alertProp.title}
        text={alertProp.text}
        isShow={alertProp.isShow}
        firstButtonName={alertProp.firstButtonName}
        secondButtonName={alertProp.secondButtonName}
        firstButtonOnClick={alertProp.firstButtonOnClick}
        secondButtonOnClick={alertProp.secondButtonOnClick}
      />
      
      <canvas ref={canvasRef} 
        width={dimensions.width} 
        height={dimensions.height} 
        className={styles['board']}
        style={{
            background: theme.element_first_color
        }}
      ></canvas>
        {showAnswer && (
          <div className={styles['answer-display']}
            style={{
                background: theme.element_first_color,
                color: theme.text_first_color,
                border: `1px solid ${theme.text_first_color}`
            }}>
            Название: {shapesData[currentLineIndex].name}
          </div>
        )}
      <div className={styles['controls']}>
        <div className={styles['input-container']}>
          {/* <input
            type="text"
            value={userAnswer}
            onChange={handleAnswerChange}
            placeholder="Введите название линии"
            className={styles['answer-input']}
          /> */}
        <input type='text' placeholder='Название' value={userAnswer} className={styles['input-data']}
            style={{
                color: theme.text_first_color,
                caretColor: theme.first_color,
                backgroundColor: theme.element_first_color,
                '--placeholder-color': theme.text_third_color,

            }}
            onChange={handleAnswerChange}/>
            <button className={styles['check-button']}
                style={{
                    color: theme.text_first_color,
                    background: theme.first_color
                }}
                onClick={checkAnswer}>Проверить</button>
        </div>
        
        <div className={styles['bottom-controls']}>
          <button className={styles['show-name-button']}
                style={{
                    color: theme.text_first_color,
                    background: theme.element_first_color
                }}
                onClick={showCorrectAnswer}>Показать название</button>
          <button className={styles['next-button']}
                style={{
                    color: theme.text_first_color,
                    background: theme.first_color
                }}
                onClick={goToNextLine}>Далее</button>
        </div>
        
        
        {isCorrect !== null && !alertProp.isShow && (
          <div className={`${styles['result']} ${isCorrect ? styles['correct'] : styles['incorrect']}`}>
            {isCorrect ? 'Правильно!' : 'Неверно!'}
          </div>
        )}
      </div>
    </div>
  );
}