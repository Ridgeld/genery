import React, { useContext, useEffect, useState } from 'react';
import styles from './Timetable.module.scss';
import '../../themes/default.scss'
import { ElementContext } from '../../providers/ElementProvider.jsx';


function LessonBody({color, backgroundColor, textColor, lessonName, lessonTimeStart, lessonTimeEnd, lessonRoom, arrowColor }){
    const { theme, elementColors, setElementColors } = useContext(ElementContext);
    const [circleColor, setCircleColor] = useState('var(--first-color)');
    const [iconColor, setIconColor] = useState('var(--text-first-color)');

    // const categoryColors = {
    //     math: { circle: theme.first_color, icon: theme.text_first_color },
    //     language: { circle: theme.second_color, icon: theme.text_second_color },
    //     humanitarian: { circle: theme.third_color, icon: theme.text_first_color}
    // };
    // useEffect(() => {
    //     if (category in categoryColors) {
    //         setCircleColor(categoryColors[category].circle);
    //         setIconColor(categoryColors[category].icon);
    //     } else {
    //         setCircleColor(theme.first_color);
    //         setIconColor(theme.text_first_color);
    //     }
    // }, [category]);

    return(
        <div className={styles['lesson-body']}
        style={{
            background: backgroundColor
        }}>
            <circle className={styles['lesson-circle']}
                    style={{
                        background: color
                    }}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.29289 10.7071C9.68342 11.0976 10.3166 11.0976 10.7071 10.7071C11.0976 10.3166 11.0976 9.68342 10.7071 9.29289L9.29289 10.7071ZM1 4.72575e-08C0.447715 -3.74211e-07 -3.74211e-07 0.447715 4.72575e-08 1L-1.63477e-07 10C-1.63477e-07 10.5523 0.447715 11 1 11C1.55228 11 2 10.5523 2 10L2 2L10 2C10.5523 2 11 1.55228 11 1C11 0.447715 10.5523 -1.63477e-07 10 -1.63477e-07L1 4.72575e-08ZM10.7071 9.29289L1.70711 0.292893L0.292893 1.70711L9.29289 10.7071L10.7071 9.29289Z" fill={arrowColor}/>
                </svg>
            </circle>
            <div className={styles['lesson-info']}>
                <div className={styles['lesson-name']}
                     style={{
                        color:textColor
                     }}>{lessonName}</div>
                <div className={styles['lesson-time']}
                     style={{
                        color:textColor
                     }}>{`${lessonTimeStart} - ${lessonTimeEnd}`}</div>
            </div>
            <div className={styles['lesson-room']}
                 style={{
                    color: textColor
                 }}>{lessonRoom}</div>
        </div>
    )
}
export default LessonBody