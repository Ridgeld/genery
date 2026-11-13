import React, { useContext, useEffect, useState } from 'react';
import styles from './Timetable.module.scss';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { useAuth } from '../../providers/Authprovired.jsx';
import { useNavigate } from 'react-router-dom';
import RemoveBody from './RemoveBody.jsx';
import AlertNotification from '../../components/notifictions/AlertNotification/AlertNotification.jsx';
import AddTimetable from '../../components/modal-windows/add/timetable/AddTimetable.jsx';
import InitialTimetable from './InitialTimetable.js';

function isLightColor(color) {
    if (!color) return false;
    let c = color;
    if (typeof c === 'string' && c.startsWith('#')) {
        let r = 0, g = 0, b = 0;
        if (c.length === 4) {
            r = parseInt(c[1] + c[1], 16);
            g = parseInt(c[2] + c[2], 16);
            b = parseInt(c[3] + c[3], 16);
        } else if (c.length >= 7) {
            r = parseInt(c.slice(1, 3), 16);
            g = parseInt(c.slice(3, 5), 16);
            b = parseInt(c.slice(5, 7), 16);
        }
        return (r * 299 + g * 587 + b * 114) / 1000 > 150;
    }
    return false;
}

function EditTimetable({ id, handleEdit }) {
    const { theme, setElementColors } = useContext(ElementContext);
    const [timetable, setTimetable] = useState([]);
    const [activeDay, setActiveDay] = useState(0);
    const [isShow, setIsShow] = useState(false);
    const [editLesson, setEditLesson] = useState(null);
    const [alertProp, setAlertProp] = useState({
        isShow: false,
        title: 'Заголовок',
        text: 'текст',
        firstButtonName: 'Отмена',
        secondButtonName: 'Удалить'
    });

    const [ownerId, setOwnerId] = useState();
    const { authUser } = useAuth();
    const navigateTo = useNavigate();

    useEffect(() => {
        const fetchGroupOwner = async () => {    
            try {
                const groupDocRef = doc(db, 'groups', id, 'info', 'info');
                const groupDoc = await getDoc(groupDocRef);
                if (groupDoc.exists()) {
                    setOwnerId(groupDoc.data().owner);
                }
            } catch (error) {
                console.error('Error fetching group data:', error);
            }
        };

        if (id) fetchGroupOwner();
    }, [id]);

    const fetchGroupData = async () => {
        if (id) {
            try {
                const timetableDocRef = doc(db, 'groups', id, 'info', 'timetable');
                const docSnap = await getDoc(timetableDocRef);

                if (docSnap.exists()) {
                    const timetableData = docSnap.data();
                    setTimetable(timetableData.timetable || []);
                } else {
                    await setDoc(timetableDocRef, { timetable: InitialTimetable });
                    setTimetable(InitialTimetable);
                }
            } catch (error) {
                console.error('Error fetching timetable data:', error);
                setTimetable([]);
            }
        }
    };

    useEffect(() => {
        fetchGroupData();
    }, [id]);

    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowColor: theme.text_first_color,
            arrowLink: () => handleEdit(),
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: true,
            footerBackground: theme.background_color,
            activeElementIndex: 2,
            background: theme.background_color
        });
        document.body.style.background = theme.background_color;
    }, [theme, setElementColors, handleEdit]);

    const removeLesson = async (dayIndex, lessonIndex) => {
        const updatedTimetable = [...timetable];
        if (updatedTimetable[dayIndex] && updatedTimetable[dayIndex].lessons) {
            updatedTimetable[dayIndex].lessons.splice(lessonIndex, 1);
            setTimetable(updatedTimetable);

            const timetableDocRef = doc(db, 'groups', id, 'info', 'timetable');
            await setDoc(timetableDocRef, { timetable: updatedTimetable }, { merge: true });
        }
    };

    const handleOpenAdd = () => {
        setEditLesson(null);
        setIsShow(true);
    };

    const handleOpenEdit = (lesson, lessonIndex) => {
        setEditLesson({
            ...lesson,
            lessonIndex
        });
        setIsShow(true);
    };

    const handleClose = async () => {
        setIsShow(false);
        setEditLesson(null);
    };

    const handleSaveSuccess = (updatedTimetable) => {
        setTimetable(updatedTimetable);
    };

    const getDateForDay = (dayIndex) => {
        const currentDate = new Date();
        const currentDay = currentDate.getDay(); // 0 (Sun) - 6 (Sat)
        const normalizedDay = currentDay === 0 ? 6 : currentDay - 1;
        const diff = dayIndex - normalizedDay;
        const targetDate = new Date(currentDate);
        targetDate.setDate(currentDate.getDate() + diff);
        return targetDate.toLocaleDateString('ru-RU', { day: 'numeric' });
    };

    return (
        <>
            <AlertNotification
                title={alertProp.title}
                text={alertProp.text}
                isShow={alertProp.isShow}
                firstButtonName={alertProp.firstButtonName}
                secondButtonName={alertProp.secondButtonName}
                firstButtonOnClick={alertProp.firstButtonOnClick}
                secondButtonOnClick={alertProp.secondButtonOnClick}
            />

            {/* Modal for adding and editing lesson with Google-style ClockTimePicker */}
            <AddTimetable
                activeDay={activeDay}
                id={id}
                isShow={isShow}
                close={handleClose}
                editLesson={editLesson}
                onSaveSuccess={handleSaveSuccess}
            />

            {/* Days of week selector */}
            <div className={styles.week}>
                {timetable && timetable.length > 0 && timetable.map((dayData, index) => (
                    <div
                        key={index}
                        onClick={() => setActiveDay(index)}
                        className={`${styles['day']} ${activeDay === index ? styles['active'] : ''}`}
                        style={{
                            background: activeDay === index ? theme.first_color : theme.element_first_color,
                            color: activeDay === index ? theme.text_third_color : theme.text_first_color,
                        }}
                    >
                        {dayData.day}
                        <div className={styles['day-date']}>{getDateForDay(index)}</div>
                    </div>
                ))}
            </div>

            {/* Lessons list with edit and remove actions */}
            <div className={styles['lessons-container']}>
                {timetable && timetable.length > 0 && timetable[activeDay] && (
                    <>
                        {timetable[activeDay].lessons?.map((lesson, lessonIndex) => (
                            <RemoveBody
                                key={lessonIndex}
                                color={lesson.color}
                                backgroundColor={theme.element_first_color}
                                circleBackgroundColor={theme.first_color}
                                arrowColor={isLightColor(lesson.color) ? "#0A0B10" : '#fff'}
                                textColor={theme.text_first_color}
                                lessonName={lesson.name}
                                lessonTimeStart={lesson.timeStart}
                                lessonTimeEnd={lesson.timeEnd}
                                lessonRoom={lesson.room}
                                onRemove={() => removeLesson(activeDay, lessonIndex)}
                                onEdit={() => handleOpenEdit(lesson, lessonIndex)}
                            />
                        ))}

                        {/* Add lesson button */}
                        <div
                            className={styles['add-body']}
                            style={{
                                border: `1px solid ${theme.element_first_color}`,
                                background: theme.background_color,
                                cursor: 'pointer'
                            }}
                            onClick={handleOpenAdd}
                        >
                            <div
                                className={styles['circle']}
                                style={{ background: theme.element_first_color }}
                            >
                                <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.5 1L8.5 8.5M8.5 16L8.5 8.5M8.5 8.5L16 8.5M8.5 8.5L1 8.5" stroke={theme.text_first_color} strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>
                    </>
                )}

                <button
                    className={styles['button']}
                    style={{
                        background: theme.first_color,
                        color: theme.text_third_color || '#fff'
                    }}
                    onClick={handleEdit}
                >
                    Готово
                </button>
            </div>
        </>
    );
}

export default EditTimetable;
