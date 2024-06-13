import React, { useEffect, useRef, useState } from 'react';
import styles from './Wheel.module.scss';
import { loadScripts  } from '../utils/loadScript';

function Wheel({isShow, onStop}){
    const [wheel, setWheel] = useState(null);
    const canvasRef = useRef(null);
    const rootStyles = getComputedStyle(document.documentElement);

    useEffect(() => {
        // Путь к вашему скрипту в папке public
        // const scriptSrc = '/genery/public/script/Winwheel.min.js';
        const scriptSrcs = [
            'https://cdnjs.cloudflare.com/ajax/libs/gsap/latest/TweenMax.min.js',
            `/genery/public/script/Winwheel.min.js`
        ];
        const colors = {
            green: rootStyles.getPropertyValue('--casino-first-color').trim(),
            red: rootStyles.getPropertyValue('--casino-second-color').trim(),
            black: rootStyles.getPropertyValue('--casino-third-color').trim(),
            text: rootStyles.getPropertyValue('--text-first-color').trim()
        }
        loadScripts(scriptSrcs, () => {
            // Инициализация библиотеки после загрузки скрипта
            const newWheel = new Winwheel({
                'canvasId': canvasRef.current.id,
                'numSegments': 37,
                'innerRadius'     : 75,         // Make wheel hollow so segments dont go all way to center.
                'textFontSize'    : 12,         // Set default font size for the segments.
                'textOrientation' : 'curved', // Make text vertial so goes down from the outside of wheel.
                'textAlignment'   : 'center',
                'textFillStyle' : colors.text,
                'segments': [
                    { 'fillStyle': colors.green, 'text': '0',  },
                    { 'fillStyle': colors.red, 'text': '32' },
                    { 'fillStyle': colors.black, 'text': '15' },
                    { 'fillStyle': colors.red, 'text': '19' },
                    { 'fillStyle': colors.black, 'text': '4' },
                    { 'fillStyle': colors.red, 'text': '21' },
                    { 'fillStyle': colors.black, 'text': '2' },
                    { 'fillStyle': colors.red, 'text': '25' },
                    { 'fillStyle': colors.black, 'text': '17' },
                    { 'fillStyle': colors.red, 'text': '34' },
                    { 'fillStyle': colors.black, 'text': '6' },
                    { 'fillStyle': colors.red, 'text': '27' },
                    { 'fillStyle': colors.black, 'text': '13' },
                    { 'fillStyle': colors.red, 'text': '36' },
                    { 'fillStyle': colors.black, 'text': '11' },
                    { 'fillStyle': colors.red, 'text': '30' },
                    { 'fillStyle': colors.black, 'text': '8' },
                    { 'fillStyle': colors.red, 'text': '23' },
                    { 'fillStyle': colors.black, 'text': '10' },
                    { 'fillStyle': colors.red, 'text': '5' },
                    { 'fillStyle': colors.black, 'text': '24' },
                    { 'fillStyle': colors.red, 'text': '16' },
                    { 'fillStyle': colors.black, 'text': '33' },
                    { 'fillStyle': colors.red, 'text': '1' },
                    { 'fillStyle': colors.black, 'text': '20' },
                    { 'fillStyle': colors.red, 'text': '14' },
                    { 'fillStyle': colors.black, 'text': '31' },
                    { 'fillStyle': colors.red, 'text': '9' },
                    { 'fillStyle': colors.black, 'text': '22' },
                    { 'fillStyle': colors.red, 'text': '18' },
                    { 'fillStyle': colors.black, 'text': '29' },
                    { 'fillStyle': colors.red, 'text': '7' },
                    { 'fillStyle': colors.black, 'text': '28' },
                    { 'fillStyle': colors.red, 'text': '12' },
                    { 'fillStyle': colors.black, 'text': '35' },
                    { 'fillStyle': colors.red, 'text': '3' },
                    { 'fillStyle': colors.black, 'text': '26' },
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
            let stopAt = (45 + Math.floor((Math.random() * 2)))
            wheel.animation.stopAngle = stopAt;
            wheel.startAnimation();
        }
    };

    return(
        <div className={`${styles['overlay']} ${styles['animated']} ${isShow ? styles['show'] : ''}`}>
            <div className={styles.wheel}
                style={{
                    background: 'var(--casino-first-color)',
                    border: '10px solid var(--element-second-color)'
                }}>
                <canvas ref={canvasRef} id='canvas' width='310' height='310'>
                    Canvas not supported, use another browser.
                </canvas>
                <div className={styles.arrow}>
                    <svg width="40" height="18" viewBox="0 0 40 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M40 0L20 18L0 0H40Z" fill={'var(--element-second-color)'}/>
                    </svg>
                </div>
                <button className={styles.spin}
                    style={{
                        background: 'var(--element-first-color)',
                        border: '10px solid var(--element-second-color)',
                        color: 'var(--text-first-color)'
                    }}
                    onClick={handleSpinClick}>крутить</button>
            </div>
        </div>
    )
}
export default Wheel