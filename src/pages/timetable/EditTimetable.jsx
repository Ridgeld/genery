import React, { useContext, useEffect, useState } from 'react';
import styles from './Timetable.module.scss'
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { ref, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../../firebase.js';
// import DownloadBody from './DownloadBody.jsx';
import LessonBody from './LessonBody.jsx';
// import LoadingBody from './LoadingBody.jsx';
import { useAuth } from '../../providers/Authprovired.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AddFile from '../../components/modal-windows/add/file/AddFile.jsx';
import RemoveBody from './RemoveBody.jsx';
import AlertNotification from '../../components/notifictions/AlertNotification/AlertNotification.jsx';
import AddTimetable from '../../components/modal-windows/add/timetable/AddTimetable.jsx';
import InitialTimetable from './InitialTimetable.js';

function EditTimetable({id, handleEdit}){
    const {theme, elementColors, setElementColors } = useContext(ElementContext);
    const [timetable, setTimetable] = useState([]);
    const [activeDay, setActiveDay] = useState(0);
    const [isLoading, setIsLoading] = useState();
    const [ isShow, setIsShow] = useState();
    const [alertProp, setAlertProp] = useState({
        isShow: false,
        title: 'Заголовок',
        text: 'текст',
        firstButtonName: 'выйти',
        secondButtonName: 'играть',

    });


    // const { id } = useParams()
    const [ownerId, setOwnerId] = useState()
    const { authUser } = useAuth()
    const navigateTo = useNavigate()

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
                    console.log("No such document! Creating a new one with initial data.");
                    await setDoc(timetableDocRef, { timetable: InitialTimetable });
                    setTimetable(InitialTimetable);
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
            arrowLink: () => handleEdit(),
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



        // useEffect(() => {
        //     const fetchFiles = async () => {
        //       const folderRef = ref(storage, 'files'); // Укажите вашу папку
        //       const fileList = await listAll(folderRef);
        //       const files = await Promise.all(fileList.items.map(async itemRef => {
        //         const url = await getDownloadURL(itemRef);
        //         return { name: itemRef.name, url };
        //       }));
        //       setFiles(files);
        //     };
        
        //     fetchFiles();
        //   }, []); 
        // useEffect(() => {
        //     const fetchFiles = async () => {
        //         try {
        //             setIsLoading(true); // Устанавливаем isLoading в true перед началом загрузки
    
        //             const folderRef = ref(storage, 'files'); // Укажите вашу папку
        //             const fileList = await listAll(folderRef);
        //             const files = await Promise.all(fileList.items.map(async itemRef => {
        //                 const url = await getDownloadURL(itemRef);
        //                 return { name: itemRef.name, url };
        //             }));
                    
        //             setFiles(files);
        //         } catch (error) {
        //             console.error('Error fetching files:', error);
        //         } finally {
        //             setIsLoading(false); 
        //         }
        //     };
    
        //     fetchFiles();
        // }, []);
        // const addFile = (file) =>{

        // }

        
        
        
// Функция для отображения уведомления
    const deleteFile = (file) => {
        setAlertProp({
            isShow: true,
            title: 'Удаление файла',
            text: `Вы действительно хотите удалить урок ${file.name}?`,
            firstButtonName: 'Отмена',
            firstButtonOnClick: () => setAlertProp({ isShow: false }),
            secondButtonName: 'Удалить',
            secondButtonOnClick: () => handleDelete(file)
        });
    };

// Функция для удаления файла
// const handleDelete = async (file) => {
//     if (!file || !file.link) {
//         console.error('Invalid file or file URL:', file);
//         return;
//     }

//     setAlertProp({ isShow: false }); // Закрываем уведомление

//     try {
//         // URL файла
//         const fileUrl = file.link;
//         console.log('File URL:', fileUrl);

//         // Извлечение пути файла из URL
//         const baseURL = 'https://firebasestorage.googleapis.com/v0/b/genery-c83e3.appspot.com/o/';
//         let filePath = fileUrl.replace(baseURL, ''); // Удаляем базовый URL
//         filePath = decodeURIComponent(filePath); // Декодируем URL

//         // Удаление параметров запроса из пути
//         const [pathWithoutParams] = filePath.split('?');
//         console.log('File Path:', pathWithoutParams);

//         // Удаление файла из Firebase Storage
//         const storageRef = ref(storage, pathWithoutParams);
//         await deleteObject(storageRef);
//         console.log('File deleted from Firebase Storage');

//         // Удаление ссылки на файл из Firestore
//         const downloadDocRef = doc(db, 'groups', id, 'info', 'downloads');
//         const docSnap = await getDoc(downloadDocRef);

//         if (docSnap.exists()) {
//             const downloadData = docSnap.data();
//             const updatedFiles = (downloadData.files || []).filter(f => f.link !== fileUrl);
//             await setDoc(downloadDocRef, { files: updatedFiles }, { merge: true });
//             setFiles(updatedFiles); // Обновляем состояние файлов
//             console.log('File deleted from Firestore');
//         } else {
//             console.log('No such document in Firestore!');
//         }
//     } catch (error) {
//         console.error('Error deleting file:', error);
//     }
// };





        const removeLesson = (dayIndex, lessonIndex) => {
            const updatedTimetable = [...timetable];
            updatedTimetable[dayIndex].lessons.splice(lessonIndex, 1);
            setTimetable(updatedTimetable);
            
            // Обновляем документ в Firestore
            const timetableDocRef = doc(db, 'groups', id, 'info', 'timetable');
            setDoc(timetableDocRef, { timetable: updatedTimetable }, { merge: true });
        };



        const handleClose = async () => {
            await fetchGroupData();
            setIsShow(false);
        };
        function isLightColor(color) {
            if (!color) return false; // Проверка на null или undefined
    
            let r, g, b;
    
            if (color.startsWith("#")) {
                if (color.length === 4) { // Обработка коротких hex кодов (#RGB)
                    r = parseInt(color[1] + color[1], 16);
                    g = parseInt(color[2] + color[2], 16);
                    b = parseInt(color[3] + color[3], 16);
                } else if (color.length === 7) { // Обработка полных hex кодов (#RRGGBB)
                    r = parseInt(color.slice(1, 3), 16);
                    g = parseInt(color.slice(3, 5), 16);
                    b = parseInt(color.slice(5, 7), 16);
                } else {
                    return false; // Некорректный формат hex
                }
            } else if (color.startsWith("rgb")) {
                const values = color.substring(color.indexOf('(') + 1, color.lastIndexOf(')')).split(',').map(Number);
                if (values.length === 3) {
                    r = values[0];
                    g = values[1];
                    b = values[2];
                } else {
                    return false; // Некорректный формат rgb
                }
            } else {
              // Попробуем преобразовать именованный цвет с помощью CSS
              const tempDiv = document.createElement('div');
              tempDiv.style.color = color;
              document.body.appendChild(tempDiv);
              const computedColor = window.getComputedStyle(tempDiv).color;
              document.body.removeChild(tempDiv);
    
              if (computedColor.startsWith("rgb")) {
                const values = computedColor.substring(computedColor.indexOf('(') + 1, computedColor.lastIndexOf(')')).split(',').map(Number);
                if (values.length === 3) {
                    r = values[0];
                    g = values[1];
                    b = values[2];
                } else {
                    return false; // Некорректный формат rgb
                }
              } else {
                return false; // Неподдерживаемый формат цвета
              }
            }
    
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            return brightness > 180;
        }
        const getDateForDay = (dayIndex) => {
            const currentDate = new Date();
            const currentDay = currentDate.getDay(); // 0 (воскресенье) - 6 (суббота)
            const normalizedDay = currentDay === 0 ? 6 : currentDay - 1; // Преобразуем, чтобы неделя начиналась с понедельника
            const diff = dayIndex - normalizedDay;
            const targetDate = new Date(currentDate);
            targetDate.setDate(currentDate.getDate() + diff);
            return targetDate.toLocaleDateString('ru-RU', { day: 'numeric' }); // Отображаем только число
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
                secondButtonOnClick={alertProp.secondButtonOnClick}/>
            <AddTimetable activeDay={activeDay} id={id} isShow={isShow} close={handleClose}/>
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
                <div className={styles['lessons-container']}>
                {timetable && timetable.length > 0 && timetable[activeDay] && (
                <>
                    {timetable[activeDay].lessons.map((lesson, lessonIndex) => (
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
                        />
                    ))}
                    <div className={styles['add-body']}
                        style={{
                            border: `1px solid ${theme.element_first_color}`,
                            background: theme.background_color
                        }}
                        onClick={() => setIsShow(true)}>
                        <div className={styles['circle']}
                            style={{
                                background: theme.element_first_color
                            }}>
                            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.5 1L8.5 8.5M8.5 16L8.5 8.5M8.5 8.5L16 8.5M8.5 8.5L1 8.5" stroke={theme.text_first_color} strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </>
            )}
            <button className={styles['button']}
                style={{
                    background: theme.first_color,
                    color: theme.text_third_color
                }}
                onClick={handleEdit}>
                Сохранить
            </button>
        </div>
        </>
        );
}
export default EditTimetable