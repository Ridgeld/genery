import React, { useContext, useEffect, useState } from 'react';
import styles from './Timetable.module.scss'
import timetable from './Timetable';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import '../../themes/default.scss'
import LessonBody from './LessonBody.jsx';
function Timetable(){
    const { theme, elementColors, setElementColors } = useContext(ElementContext);

    const [activeDay, setActiveDay] = useState(0);
    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowColor: theme.text_first_color,
            arrowLink: '#/list-menu',
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: true,
            footerBackground: theme.background_color,
            activeElementIndex: 3,
            background: theme.background_color
        });
        document.body.style.background = theme.background_color
        },[ElementContext]);


    return(
        <div className={styles.container}>
            <div className={styles.week}>
                {timetable.map((dayData, index) => (
                        <div key={index} 
                             onClick={() => setActiveDay(index)} 
                             className={`${styles['day']} ${activeDay === index ? styles['active'] : ''}`}
                             style={{
                                background: activeDay === index ? theme.first_color : theme.element_first_color,
                                color: theme.text_first_color,
                            }}>{dayData.day}</div>
                    ))}
            </div>
            <div className={styles['lessons-container']}>
                {timetable[activeDay].lessons.map((lesson, lessonIndex) => (
                    <LessonBody 
                        category={lesson.category}
                        backgroundColor={theme.element_first_color}  
                        circleBackgroundColor={theme.first_color} 
                        arrowColor={theme.text_first_color} 
                        textColor={theme.text_first_color} 
                        lessonName={lesson.name} 
                        lessonTime={lesson.time} 
                        lessonRoom={lesson.room} />
                ))}
            </div>
        </div>
    )

}
export default Timetable;