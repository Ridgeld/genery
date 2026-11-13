import React, { useContext, useEffect, useState } from 'react';
import styles from './AddTimetable.module.scss';
import { ElementContext } from '../../../../providers/ElementProvider';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../../../firebase';
import { useAuth } from "../../../../providers/Authprovired";
import colorCircles from '../../../../themes/ColorCircles';
import ClockTimePicker from './ClockTimePicker.jsx';

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

function AddTimetable({ activeDay, id, isShow, close, editLesson, onSaveSuccess }) {
    const { theme } = useContext(ElementContext);
    const { authUser } = useAuth();

    const [userColors, setUserColors] = useState([]);
    const [color, setColor] = useState(theme.first_color);
    const [name, setName] = useState('');
    const [timeStart, setTimeStart] = useState('08:30');
    const [timeEnd, setTimeEnd] = useState('10:00');
    const [room, setRoom] = useState('');
    const [errorName, setErrorName] = useState({ isShow: false, text: '' });
    const [isSaving, setIsSaving] = useState(false);

    const isEditMode = Boolean(editLesson);

    const variants = {
        open: { opacity: 1, visibility: 'visible' },
        closed: { opacity: 0, visibility: 'hidden' },
        show: { opacity: 1, transform: 'translate(0, 0)' },
        hidden: { opacity: 0, transform: 'translate(0, 100%)' }
    };

    // Prepopulate form when editing or resetting
    useEffect(() => {
        if (editLesson) {
            setName(editLesson.name || '');
            setTimeStart(editLesson.timeStart || '08:30');
            setTimeEnd(editLesson.timeEnd || '10:00');
            setRoom(editLesson.room || '');
            setColor(editLesson.color || theme.first_color);
        } else {
            setName('');
            setTimeStart('08:30');
            setTimeEnd('10:00');
            setRoom('');
            setColor(theme.first_color);
        }
        setErrorName({ isShow: false, text: '' });
    }, [editLesson, isShow, theme.first_color]);

    // Fetch user purchased colors
    useEffect(() => {
        const fetchUserPreferences = async () => {
            if (authUser && authUser._id) {
                try {
                    const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
                    const docSnap = await getDoc(userDocRef);
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setUserColors(userData.boughtColors || []);
                    }
                } catch (e) {
                    console.error('Error fetching user preferences:', e);
                }
            }
        };

        fetchUserPreferences();
    }, [authUser]);

    // Fallback default colors if user has none bought yet
    const defaultColorOptions = [
        theme.first_color,
        '#0040F9',
        '#FF4365',
        '#C3F82B',
        '#FF9F1C',
        '#2EC4B6',
        '#E71D36',
        '#7209B7'
    ];

    const filteredColors = userColors && userColors.length > 0
        ? colorCircles.filter(circle => userColors.includes(circle.name))
        : [];

    const handleClose = () => {
        setErrorName({ isShow: false, text: '' });
        close();
    };

    const handleSaveLesson = async () => {
        if (!name || name.trim().length < 2) {
            setErrorName({
                isShow: true,
                text: 'Название должно содержать минимум 2 символа'
            });
            return;
        }

        setIsSaving(true);
        setErrorName({ isShow: false, text: '' });

        try {
            const timetableDocRef = doc(db, 'groups', id, 'info', 'timetable');
            const docSnap = await getDoc(timetableDocRef);

            if (docSnap.exists()) {
                const timetableData = docSnap.data();
                const updatedTimetable = [...(timetableData.timetable || [])];

                const lessonPayload = {
                    name: name.trim(),
                    timeStart: timeStart || '08:30',
                    timeEnd: timeEnd || '10:00',
                    room: room.trim() || '',
                    color: color || theme.first_color
                };

                if (!updatedTimetable[activeDay]) {
                    updatedTimetable[activeDay] = { day: '', lessons: [] };
                }
                if (!updatedTimetable[activeDay].lessons) {
                    updatedTimetable[activeDay].lessons = [];
                }

                if (isEditMode && editLesson.lessonIndex !== undefined) {
                    // Update existing lesson
                    updatedTimetable[activeDay].lessons[editLesson.lessonIndex] = lessonPayload;
                } else {
                    // Add new lesson
                    updatedTimetable[activeDay].lessons.push(lessonPayload);
                }

                await setDoc(timetableDocRef, { timetable: updatedTimetable }, { merge: true });

                if (onSaveSuccess) {
                    onSaveSuccess(updatedTimetable);
                }
                handleClose();
            } else {
                console.error('Timetable document does not exist in Firestore');
            }
        } catch (error) {
            console.error('Error saving lesson:', error);
            setErrorName({
                isShow: true,
                text: 'Ошибка при сохранении урока'
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            className={styles.area}
            animate={isShow ? "open" : "closed"}
            variants={variants}
            transition={{ duration: 0.15 }}
        >
            <motion.section
                className={styles.body}
                style={{ background: theme.element_first_color }}
                animate={isShow ? "show" : "hidden"}
                variants={variants}
                transition={{ duration: 0.3 }}
            >
                <header className={styles.header}>
                    <div className={styles.title} style={{ color: theme.text_first_color }}>
                        {isEditMode ? 'Редактирование урока' : 'Добавление урока'}
                    </div>
                    <button
                        type="button"
                        className={styles.close}
                        style={{ background: theme.element_second_color }}
                        onClick={handleClose}
                    >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.01281 0.987419L5.00023 5M0.987648 9.01258L5.00023 5M5.00023 5L9.01281 9.01258M5.00023 5L0.987648 0.987419" stroke={theme.text_first_color} strokeLinecap="round" />
                        </svg>
                    </button>
                </header>

                <div className={styles.line} style={{ background: theme.element_second_color }} />

                {/* Название урока */}
                <div className={styles['input-container']}>
                    <input
                        className={styles['input-body']}
                        placeholder="Название предмета"
                        style={{
                            background: theme.element_second_color,
                            color: theme.text_first_color,
                            caretColor: theme.first_color,
                            '--placeholder-color': theme.text_third_color
                        }}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {errorName.isShow && (
                    <div className={styles['error-container']}>
                        {errorName.text}
                    </div>
                )}

                {/* Выбор времени: Google-style Clock Dial */}
                <div className={styles['time-container']}>
                    <div className={styles['section-label']} style={{ color: theme.text_first_color }}>
                        Время занятия
                    </div>
                    <ClockTimePicker
                        timeStart={timeStart}
                        setTimeStart={setTimeStart}
                        timeEnd={timeEnd}
                        setTimeEnd={setTimeEnd}
                        theme={theme}
                    />
                </div>

                {/* Аудитория / кабинет */}
                <div className={styles['input-container']}>
                    <input
                        className={styles['input-body']}
                        placeholder="Кабинет / Аудитория (например, 1/340)"
                        style={{
                            background: theme.element_second_color,
                            color: theme.text_first_color,
                            caretColor: theme.first_color,
                            '--placeholder-color': theme.text_third_color
                        }}
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                    />
                </div>

                {/* Выбор цвета урока */}
                <div className={styles['color-container']}>
                    <div className={styles['section-label']} style={{ color: theme.text_first_color }}>
                        Цвет карточки
                    </div>
                    <div className={styles['circles-container']}>
                        {filteredColors.length > 0 ? (
                            filteredColors.map((circle) => (
                                <React.Fragment key={circle.name}>
                                    {circle.colors.map((colorCircle, index) => (
                                        <div
                                            key={index}
                                            className={styles['color-circle']}
                                            style={{ background: colorCircle }}
                                            onClick={() => setColor(colorCircle)}
                                        >
                                            {color === colorCircle && (
                                                <div
                                                    className={styles['active-circle']}
                                                    style={{ borderColor: isLightColor(colorCircle) ? "#0A0B10" : '#fff' }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))
                        ) : (
                            defaultColorOptions.map((c, idx) => (
                                <div
                                    key={idx}
                                    className={styles['color-circle']}
                                    style={{ background: c }}
                                    onClick={() => setColor(c)}
                                >
                                    {color === c && (
                                        <div
                                            className={styles['active-circle']}
                                            style={{ borderColor: isLightColor(c) ? "#0A0B10" : '#fff' }}
                                        />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Кнопка отправки */}
                <div className={styles['button-container']}>
                    <button
                        type="button"
                        className={styles['main-button']}
                        disabled={isSaving}
                        style={{
                            background: theme.first_color,
                            color: theme.text_third_color || '#fff'
                        }}
                        onClick={handleSaveLesson}
                    >
                        {isSaving ? 'Сохранение...' : (isEditMode ? 'Сохранить изменения' : 'Добавить урок')}
                    </button>
                </div>
            </motion.section>
        </motion.div>
    );
}

export default AddTimetable;
