import React, { useContext, useEffect, useState } from 'react';
import styles from './Timetable.module.scss'
// import timetable from './Timetable';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import '../../themes/default.scss'
import LessonBody from './LessonBody.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { useAuth } from '../../providers/Authprovired.jsx';
import EditTimetable from './EditTimetable.jsx';
function Timetable(){
    const { theme, elementColors, setElementColors } = useContext(ElementContext);
    const { id } = useParams();
    const [activeDay, setActiveDay] = useState(0);
    const [timetable, setTimetable] = useState([]);
    const [ownerId, setOwnerId] = useState()
    const { authUser } = useAuth()
    const navigateTo = useNavigate();
    const [ isEdit, setIsEdit ] = useState(false)

    useEffect(() => {
        const fetchGroupData = async () => {    
          try {
            const groupDocRef = doc(db, 'groups', id, 'info', 'info');
            const groupDoc = await getDoc(groupDocRef);
    
            if (groupDoc.exists()) {
              const groupData = groupDoc.data();
              setOwnerId(groupData.owner);
            } else {
              console.error('Group not found');
            }
          } catch (error) {
            console.error('Error fetching group data:', error);
          } finally {
            // setLoading(false);
          }
        };
    
        fetchGroupData();
      }, [id]);

    const fetchGroupData = async () => {
        if (id) {
            try {
                const timetableDocRef = doc(db, 'groups', id, 'info', 'timetable');
                const docSnap = await getDoc(timetableDocRef);

                if (docSnap.exists()) {
                    const timetableData = docSnap.data();
                    setTimetable(timetableData.timetable);
                    console.log(timetableData.timetable);
                } else {
                    console.log("No such document!");
                    setTimetable([]);
                }
            } catch (error) {
                console.error('Error fetching group data:', error);
                setTimetable([]);
            }
        } else {
            console.error('ID группы не указан');
            setTimetable([]);
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
            arrowLink: '#/group-list',
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: true,
            footerBackground: theme.background_color,
            activeElementIndex: 2,
            background: theme.background_color
        });
        document.body.style.background = theme.background_color
        },[ElementContext]);

        const handleEditTimetable = () =>{
            setIsEdit(true)
            // navigateTo(`/edit-timetable/${id}`); 
        }
        const handleEdit = async() =>{
            setIsEdit(false)
            await fetchGroupData()
        }
        return (
            <div className={styles.container}>
                {isEdit ? (
                    <EditTimetable id={id} handleEdit={handleEdit}/>
                ) : (
                <>
                <div className={styles.week}>
                    {timetable && timetable.length > 0 && timetable.map((dayData, index) => (
                        <div
                            key={index}
                            onClick={() => setActiveDay(index)}
                            className={`${styles['day']} ${activeDay === index ? styles['active'] : ''}`}
                            style={{
                                background: activeDay === index ? theme.first_color : theme.element_first_color,
                                color: theme.text_first_color,
                            }}
                        >
                            {dayData.day}
                        </div>
                    ))}
                </div>
                <div className={styles['lessons-container']}>
                    {timetable && timetable.length > 0 && timetable[activeDay] ? (
                        timetable[activeDay].lessons.map((lesson, lessonIndex) => (
                            <LessonBody
                                key={lessonIndex}
                                color={lesson.color}
                                backgroundColor={theme.element_first_color}
                                circleBackgroundColor={theme.first_color}
                                arrowColor={theme.text_first_color}
                                textColor={theme.text_first_color}
                                lessonName={lesson.name}
                                lessonTimeStart={lesson.timeStart}
                                lessonTimeEnd={lesson.timeEnd}
                                lessonRoom={lesson.room}
                            />
                        ))
                    ) : (
                        <div className={styles['info-body']} style={{ color: theme.text_first_color }}>
                            Тут пока пусто ...
                        </div>
                    )}
                </div>
                {ownerId && ownerId === authUser._id &&
                    <button className={styles['edit']}
                        style={{
                            background: theme.first_color
                        }}
                        onClick={handleEditTimetable}>
                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 13.6571V16.5278C0 16.7923 0.20775 17 0.472158 17H3.34288C3.46564 17 3.5884 16.9528 3.67339 16.8584L13.9853 6.55586L10.4441 3.01468L0.141648 13.3172C0.0472159 13.4116 0 13.5249 0 13.6571ZM16.7238 3.81735C16.8114 3.72998 16.8808 3.62621 16.9282 3.51198C16.9756 3.39774 17 3.27528 17 3.1516C17 3.02793 16.9756 2.90547 16.9282 2.79123C16.8808 2.67699 16.8114 2.57322 16.7238 2.48586L14.5141 0.27616C14.4268 0.188618 14.323 0.119166 14.2088 0.0717788C14.0945 0.0243917 13.9721 0 13.8484 0C13.7247 0 13.6023 0.0243917 13.488 0.0717788C13.3738 0.119166 13.27 0.188618 13.1827 0.27616L11.4546 2.00426L14.9957 5.54544L16.7238 3.81735Z" fill={theme.text_first_color}/>
                        </svg>
                    </button>}
                </>)}
            </div>
        );
        

}
export default Timetable;