import React, { useContext, useEffect, useState } from 'react';
import styles from './Timetable.module.scss'
import timetable from './Timetable';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import '../../themes/default.scss'
import LessonBody from './LessonBody.jsx';
function Timetable(){
    const { elementColors, setElementColors } = useContext(ElementContext);
    const [activeDay, setActiveDay] = useState(0);
    useEffect(() => {
        setElementColors({
            iconColor: 'var(--first-color)',
            titleColor: 'var(--text-first-color)',
            showArrow: true,
            arrowColor: 'var(--text-first-color)',
            arrowLink: '#/list-menu',
            isHeaderBackground: true,
            headerBackground: 'var(--background-color)',
            isHeader: true,
            isFooter: true,
            footerBackground: 'var(--background-color)',
            activeElementIndex: 0,
        });
        },[ElementContext]);


    return(
        <div className={styles.container}>
            <div className={styles.week}>
                {timetable.map((dayData, index) => (
                        <div key={index} 
                             onClick={() => setActiveDay(index)} 
                             className={`${styles['day']} ${activeDay === index ? styles['active'] : ''}`}
                             style={{
                                background: activeDay === index ? 'var(--first-color)' : 'var(--element-first-color)',
                                color: 'var(--text-first-color)',
                            }}>{dayData.day}</div>
                    ))}
            </div>
            <div className={styles['lessons-container']}>
                {timetable[activeDay].lessons.map((lesson, lessonIndex) => (
                    <LessonBody 
                        category={lesson.category}
                        backgroundColor={'var(--element-first-color)'}  
                        circleBackgroundColor={'var(--first-color)'} 
                        arrowColor={'var(--text-first-color)'} 
                        textColor={'var(--text-first-color)'} 
                        lessonName={lesson.name} 
                        lessonTime={lesson.time} 
                        lessonRoom={lesson.room} />
                ))}
            </div>
        </div>
    )

}
export default Timetable;