import React, { useContext, useEffect, useRef, useState } from 'react';
import styles from './Wheel.module.scss';
import { loadScripts  } from '../utils/loadScript';
import { ElementContext } from '../../providers/ElementProvider';

function Wheel({isShow, onStop}){
    const [wheel, setWheel] = useState(null);
    const canvasRef = useRef(null);
    const rootStyles = getComputedStyle(document.documentElement);
    const {theme, elementColors, setElementColors } = useContext(ElementContext);
    const [outerRadius, setOuterRadius] = useState(125);
    const [innerRadius, setInnerRadius] = useState(100);
    const [textPosition, setTextPosition] = useState('center')

    const updateOuterRadius = () => {
        const screenWidth = window.innerWidth;
        if (screenWidth <= 700) {
          setOuterRadius(125);
          setInnerRadius(100);
          setTextPosition('outer')
        } else {
          setOuterRadius(155);
          setInnerRadius(100)
          setTextPosition('center')
        }
      };
      useEffect(() => {
        // Устанавливаем начальное значение
        updateOuterRadius();
        
        // Добавляем слушатель события на изменение размера окна
        window.addEventListener('resize', updateOuterRadius);
    
        // Удаляем слушатель при размонтировании компонента
        return () => {
          window.removeEventListener('resize', updateOuterRadius);
        };
      }, []);
    useEffect(() => {
        // Путь к вашему скрипту в папке public
        // const scriptSrc = '/genery/public/script/Winwheel.min.js';
        const scriptSrcs = [
            'https://cdnjs.cloudflare.com/ajax/libs/gsap/latest/TweenMax.min.js',
            `script/Winwheel.min.js`
        ];
        const colors = {
            green: theme.casino_first_color,
            red: theme.casino_second_color,
            black: theme.casino_third_color,
        }
        loadScripts(scriptSrcs, () => {
            // Инициализация библиотеки после загрузки скрипта
            const newWheel = new Winwheel({
                'canvasId': canvasRef.current.id,
                'numSegments': 37,
                'outerRadius'     : outerRadius,
                'innerRadius'     : innerRadius,         // Make wheel hollow so segments dont go all way to center.
                'textFontSize'    : 12,         // Set default font size for the segments.
                'textOrientation' : 'curved', // Make text vertial so goes down from the outside of wheel.
                'textAlignment'   : textPosition,
                // 'textFillStyle' : colors.text,
                'segments': [
                    { 'fillStyle': colors.green, 'text': '0', 'textFillStyle': theme.text_first_color},
                    { 'fillStyle': colors.red, 'text': '32','textFillStyle': theme.text_first_color },
                    { 'fillStyle': colors.black, 'text': '15', 'textFillStyle': theme.text_third_color },
                    { 'fillStyle': colors.red, 'text': '19', 'textFillStyle': theme.text_first_color },
                    { 'fillStyle': colors.black, 'text': '4', 'textFillStyle': theme.text_third_color },
                    { 'fillStyle': colors.red, 'text': '21', 'textFillStyle': theme.text_first_color  },
                    { 'fillStyle': colors.black, 'text': '2', 'textFillStyle': theme.text_third_color },
                    { 'fillStyle': colors.red, 'text': '25', 'textFillStyle': theme.text_first_color  },
                    { 'fillStyle': colors.black, 'text': '17', 'textFillStyle': theme.text_third_color },
                    { 'fillStyle': colors.red, 'text': '34', 'textFillStyle': theme.text_first_color  },
                    { 'fillStyle': colors.black, 'text': '6', 'textFillStyle': theme.text_third_color },
                    { 'fillStyle': colors.red, 'text': '27', 'textFillStyle': theme.text_first_color  },
                    { 'fillStyle': colors.black, 'text': '13', 'textFillStyle': theme.text_third_color },
                    { 'fillStyle': colors.red, 'text': '36', 'textFillStyle': theme.text_first_color  },
                    { 'fillStyle': colors.black, 'text': '11', 'textFillStyle': theme.text_third_color },
                    { 'fillStyle': colors.red, 'text': '30', 'textFillStyle': theme.text_first_color  },
                    { 'fillStyle': colors.black, 'text': '8', 'textFillStyle': theme.text_third_color },
                    { 'fillStyle': colors.red, 'text': '23', 'textFillStyle': theme.text_first_color  },
                    { 'fillStyle': colors.black, 'text': '10', 'textFillStyle': theme.text_third_color },
                    { 'fillStyle': colors.red, 'text': '5', 'textFillStyle': theme.text_first_color  },
                    { 'fillStyle': colors.black, 'text': '24', 'textFillStyle': theme.text_third_color },
                    { 'fillStyle': colors.red, 'text': '16', 'textFillStyle': theme.text_first_color  },
                    { 'fillStyle': colors.black, 'text': '33', 'textFillStyle': theme.text_third_color },
                    { 'fillStyle': colors.red, 'text': '1', 'textFillStyle': theme.text_first_color  },
                    { 'fillStyle': colors.black, 'text': '20', 'textFillStyle': theme.text_third_color },
                    { 'fillStyle': colors.red, 'text': '14', 'textFillStyle': theme.text_first_color  },
                    { 'fillStyle': colors.black, 'text': '31', 'textFillStyle': theme.text_third_color },
                    { 'fillStyle': colors.red, 'text': '9', 'textFillStyle': theme.text_first_color  },
                    { 'fillStyle': colors.black, 'text': '22', 'textFillStyle': theme.text_third_color },
                    { 'fillStyle': colors.red, 'text': '18', 'textFillStyle': theme.text_first_color  },
                    { 'fillStyle': colors.black, 'text': '29', 'textFillStyle': theme.text_third_color },
                    { 'fillStyle': colors.red, 'text': '7', 'textFillStyle': theme.text_first_color  },
                    { 'fillStyle': colors.black, 'text': '28', 'textFillStyle': theme.text_third_color },
                    { 'fillStyle': colors.red, 'text': '12', 'textFillStyle': theme.text_first_color  },
                    { 'fillStyle': colors.black, 'text': '35', 'textFillStyle': theme.text_third_color },
                    { 'fillStyle': colors.red, 'text': '3', 'textFillStyle': theme.text_first_color  },
                    { 'fillStyle': colors.black, 'text': '26', 'textFillStyle': theme.text_third_color },
                ],
                'animation': {
                    'type': 'spinToStop',
                    'duration': 5,
                    'spins': 8,
                    'callbackFinished' : onStop
                }
            });

            setWheel(newWheel);
        });
    }, [isShow]);
    const handleSpinClick = () => {
        if (wheel) {
            // let stopAt = (45 + Math.floor((Math.random() * 2)))
            // wheel.animation.stopAngle = stopAt;
            wheel.startAnimation();
        }
    };

    return(
        <div className={`${styles['overlay']} ${styles['animated']} ${isShow ? styles['show'] : ''}`}>
            <div className={styles.wheel}
                style={{
                    background: theme.casino_first_color,
                    border: `10px solid ${theme.element_second_color}`
                }}>
                <canvas ref={canvasRef} id='canvas' width='310' height='310'>
                    Canvas not supported, use another browser.
                </canvas>
                <div className={styles.arrow}>
                    <svg width="40" height="18" viewBox="0 0 40 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M40 0L20 18L0 0H40Z" fill={theme.element_second_color}/>
                    </svg>
                </div>
                <button className={styles.spin}
                    style={{
                        background: theme.element_first_color,
                        border: `10px solid ${theme.element_second_color}`,
                        color: theme.text_first_color
                    }}
                    onClick={handleSpinClick}>крутить</button>
            </div>
        </div>
    )
}
export default Wheel