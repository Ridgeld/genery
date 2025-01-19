import React, { useContext, useEffect, useState } from 'react';
import styles from './Timetable.module.scss';
import '../../themes/default.scss'
import { ElementContext } from '../../providers/ElementProvider.jsx';


function RemoveBody({color, backgroundColor, textColor, arrowColor, lessonName, lessonTimeStart, lessonTimeEnd, lessonRoom, onRemove }){
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
                }}
                onClick={onRemove}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.8031 1.1967L6.49984 6.5M1.19654 11.8033L6.49984 6.5M6.49984 6.5L11.8031 11.8033M6.49984 6.5L1.19654 1.1967" stroke={arrowColor} stroke-width="2" stroke-linecap="round"/>
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
export default RemoveBody