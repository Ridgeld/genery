import React from 'react';
import styles from './Timetable.module.scss';
import '../../themes/default.scss';

function RemoveBody({
    color,
    backgroundColor,
    textColor,
    arrowColor,
    lessonName,
    lessonTimeStart,
    lessonTimeEnd,
    lessonRoom,
    onRemove,
    onEdit
}) {
    return (
        <div
            className={styles['lesson-body']}
            style={{
                background: backgroundColor,
                cursor: 'pointer'
            }}
            onClick={() => {
                if (onEdit) onEdit();
            }}
        >
            {/* Delete button (X) */}
            <div
                className={styles['lesson-circle']}
                style={{ background: color, cursor: 'pointer' }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (onRemove) onRemove();
                }}
                title="Удалить урок"
            >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M11.8031 1.1967L6.49984 6.5M1.19654 11.8033L6.49984 6.5M6.49984 6.5L11.8031 11.8033M6.49984 6.5L1.19654 1.1967"
                        stroke={arrowColor || '#ffffff'}
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            {/* Lesson details (click to edit) */}
            <div className={styles['lesson-info']}>
                <div className={styles['lesson-name']} style={{ color: textColor }}>
                    {lessonName}
                </div>
                <div className={styles['lesson-time']} style={{ color: textColor, opacity: 0.8 }}>
                    {`${lessonTimeStart} - ${lessonTimeEnd}`}
                </div>
            </div>

            {/* Room */}
            <div className={styles['lesson-room']} style={{ color: textColor }}>
                {lessonRoom}
            </div>

            {/* Edit pencil icon */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    opacity: 0.7,
                    marginLeft: 6
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (onEdit) onEdit();
                }}
                title="Редактировать урок"
            >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={textColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            </div>
        </div>
    );
}

export default RemoveBody;
