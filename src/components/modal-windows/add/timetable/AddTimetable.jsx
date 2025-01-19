import React, { useContext, useEffect, useState } from 'react';
import styles from './AddTimetable.module.scss';
import { ElementContext } from '../../../../providers/ElementProvider';
import {motion} from 'framer-motion'
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '../../../../../firebase';
import { useAuth } from "../../../../providers/Authprovired";
import colorCircles from '../../../../themes/ColorCircles';
import { getDownloadURL, getMetadata, ref, uploadBytesResumable } from 'firebase/storage';

function AddTimetable({activeDay, id, isShow, close}){
    const {theme, elementColors, setElementColors } = useContext(ElementContext);

    const [userColors, setUserColors] = useState([]);
    const { authUser } = useAuth();
    const [color, setColor] = useState(theme.first_color);
    const [name, setName] = useState('');
    const [file, setFile] = useState(); 
    const [timeStart, setTimeStart] = useState('');
    const [timeEnd, setTimeEnd] = useState('');
    const [room, setRoom] = useState('');
    const [timetable, setTimetable] = useState([])
    // const [isProgressShow, setIsProgressShow] = useState(false);
    // const [uploadProgress, setUploadProgress] = useState(0);
    const [errorName, setNameError] = useState({
        isShow: false,
        text: ''
    })
    const [errorFile, setErrorFile] = useState({
        isShow: false,
        text: ''
    })

    const variants = {
        open: { opacity: 1, visibility: 'visible' },
        closed: { opacity: 0, visibility: 'hidden' },
        show: { opacity: 1, transform: 'translate(0, 0)'},
        hidden: { opacity: 0, transform: 'translate(0, 100%)' },
    }
    useEffect(() => {
        const fetchUserPreferences = async () => {
            if (authUser && authUser._id) {
                const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    // console.log(userData);
                    // setName(userData.name)
                    // setBiography(userData.biography);
                    // setCover(userData.cover)
                    setUserColors(prevColors => [...prevColors, ...userData.boughtColors]);
                    // setUserColors(userData.boughtColors);
                    // console.log(userColors)
                } else {
                    console.log("No such document!");
                }
            } else {
                console.error('authUser or authUser._id is undefined');
            }
        };

        fetchUserPreferences();
    }, [authUser])

    const filteredColors = userColors ? 
        colorCircles.filter(circle => userColors.includes(circle.name))
    : []
    // const fetchGroupData = async () => {
    //     if (id) {
    //         try {
    //             const downloadDocRef = doc(db, 'groups', id, 'info', 'downloads');
    //             const docSnap = await getDoc(downloadDocRef);
    
    //             if (docSnap.exists()) {
    //                 const downloadData = docSnap.data();
    //                 setFiles(downloadData.files || []);
    //                 console.log(downloadData.files);
    //             } else {
    //                 console.log("No such document!");
    //                 setFiles([]);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching group data:', error);
    //             setFiles([]);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     } else {
    //         console.error('ID группы не указан');
    //         setFiles([]);
    //         setIsLoading(false);
    //     }
    // };
    

    const handleFileUpload = async () => {
        // Проверка длины названия
        if (name.length < 3) {
            setNameError({
                isShow: true,
                text: 'Название должно быть более 3 символов'
            });
            return;
        } else {
            setNameError({
                isShow: false,
                text: ''
            });
        }
    
        // Проверка наличия файла
        if (!file) {
            setErrorFile({
                isShow: true,
                text: 'Прикрепите файл'
            });
            return;
        } else {
            setErrorFile({
                isShow: false,
                text: ''
            });
        }
    
        setIsProgressShow(true);
    
        try {
            const storageRef = ref(storage, `groups_files/${id}/${file.name}`);
    
            // Проверка, существует ли уже файл
            try {
                await getMetadata(storageRef);
                // Если файл существует, выбрасывается ошибка, мы ловим её и показываем сообщение об ошибке
                setErrorFile({
                    isShow: true,
                    text: 'Файл с таким именем уже существует'
                });
                setIsProgressShow(false);
                return;
            } catch (error) {
                if (error.code === 'storage/object-not-found') {
                    // Файл не найден, можно продолжать загрузку
                    console.log('File does not exist, proceeding with upload.');
                } else {
                    // Если произошла другая ошибка, выводим её
                    console.error('Error checking file existence:', error);
                    setErrorFile({
                        isShow: true,
                        text: 'Ошибка при проверке наличия файла'
                    });
                    setIsProgressShow(false);
                    return;
                }
            }
    
            // Запуск загрузки файла
            const uploadTask = uploadBytesResumable(storageRef, file);
    
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error('Error uploading file:', error);
                    setErrorFile({
                        isShow: true,
                        text: 'Ошибка при загрузке файла'
                    });
                    setIsProgressShow(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    const newFile = {
                        color: color, // цвет можно определить где-то в вашей логике
                        link: downloadURL,
                        name: name
                    };
    
                    const downloadDocRef = doc(db, 'groups', id, 'info', 'downloads');
                    const docSnap = await getDoc(downloadDocRef);
    
                    let updatedFiles = [];
                    if (docSnap.exists()) {
                        const downloadData = docSnap.data();
                        updatedFiles = downloadData.files || [];
                    }
    
                    updatedFiles.push(newFile);
    
                    await setDoc(downloadDocRef, { files: updatedFiles }, { merge: true });
    
                    // setFiles(updatedFiles);
                    setIsProgressShow(false);
                    setName('');
                    setFile(null);
                    setColor(theme.first_color);
                    close();
                }
            );
        } catch (error) {
            console.error('Error uploading file:', error);
            setErrorFile({
                isShow: true,
                text: 'Ошибка при загрузке файла'
            });
            setIsProgressShow(false);
        } finally {
            setName('');
            setFile(null);
            setColor(theme.first_color);
        }
    };
    const handleAddLesson = async () => {
        // Проверка длины названия
        if (name.length < 3) {
            setNameError({
                isShow: true,
                text: 'Название должно быть более 3 символов'
            });
            return;
        } else {
            setNameError({
                isShow: false,
                text: ''
            });
        }
    
        try {
            const timetableDocRef = doc(db, 'groups', id, 'info', 'timetable');
            const docSnap = await getDoc(timetableDocRef);
    
            if (docSnap.exists()) {
                const timetableData = docSnap.data();
                const updatedTimetable = timetableData.timetable || [];
    
                const newLesson = {
                    name: name,
                    timeStart: timeStart, // Время начала урока
                    timeEnd: timeEnd, // Время окончания урока
                    room: room, // Комната
                    color: color // Цвет урока
                };
    
                // Добавление нового урока в конкретный день
                if (updatedTimetable[activeDay]) {
                    updatedTimetable[activeDay].lessons.push(newLesson);
                } else {
                    updatedTimetable[activeDay] = { day: '', lessons: [newLesson] };
                }
    
                await setDoc(timetableDocRef, { timetable: updatedTimetable }, { merge: true });
    
                // Обновление состояния timetable
                setTimetable(updatedTimetable);
    
                setName('');
                setTimeStart('');
                setTimeEnd('');
                setRoom('');
                setColor(theme.first_color);
                close();
            } else {
                console.log("No such document!");
                setTimetable([]);
            }
        } catch (error) {
            console.error('Error adding lesson:', error);
        } finally {
            setName('');
            setTimeStart('');
            setTimeEnd('');
            setRoom('');
            setColor(theme.first_color);
        }
    };
    
    

    // const handleAddFile = () =>{
    //     alert(name)
    // }

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleBorderClick = () => {
        document.getElementById('fileInput').click();
    };
    const handleFileRemove = () => {
        setFile(null);
    };
    const handleClose = () =>{
        setName('');
        setFile(null);
        setColor(theme.first_color);
        close();
    }
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
    return(
        <motion.div className={styles['area']}
            animate={isShow ? "open" : "closed"}
            variants={variants}
            transition={{
                duration: 0.1
            }}>
            <motion.section className={styles['body']}
                style={{
                    background: theme.element_first_color
                }}
                animate={isShow ? "show" : "hidden"}
                variants={variants}
                transition={{
                    duration: 0.5
                }}>
                <header className={styles['header']}>
                    <div className={styles['title']}
                        style={{
                            color: theme.text_third_color
                        }}>
                        Добавление урока
                    </div>
                    <button className={styles['close']}
                        style={{
                            background: theme.element_second_color
                        }}
                        onClick={handleClose}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.01281 0.987419L5.00023 5M0.987648 9.01258L5.00023 5M5.00023 5L9.01281 9.01258M5.00023 5L0.987648 0.987419" stroke={theme.text_first_color} stroke-linecap="round"/>
                        </svg>
                    </button>
                </header>
                <line className={styles['line']}
                    style={{background: theme.element_second_color}}/>
                {/* <div className={styles['add-area']}>
                    {file ? (
                        <div className={styles['file-body']}
                            style={{
                                border: `1px solid ${theme.element_second_color}`,
                            }}>
                            <div className={styles['file-wrapper']}>
                                <button
                                    className={styles['remove-button']}
                                    style={{
                                        background: theme.element_second_color,
                                        color: theme.text_first_color,
                                        border: 'none',
                                        borderRadius: '3px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={handleFileRemove}
                                >
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9.01281 0.987419L5.00023 5M0.987648 9.01258L5.00023 5M5.00023 5L9.01281 9.01258M5.00023 5L0.987648 0.987419" stroke={theme.text_first_color} stroke-linecap="round"/>
                                    </svg>
                                </button>
                                <div className={styles['file-info']}
                                    style={{
                                        color: theme.text_first_color
                                    }}>
                                    <div>{file.name}</div>
                                    <div>{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                                </div>
                            </div>
                            {isProgressShow && (
                                <div className={styles['progress-bar']}
                                    style={{
                                        background: theme.element_second_color
                                    }}>
                                    <div className={styles['progress']}
                                        style={{
                                            background: theme.first_color,
                                            width: `${uploadProgress}%`
                                        }}/>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={styles['border']}
                            style={{
                                border: `1px solid ${theme.element_second_color}`
                            }}
                            onClick={handleBorderClick}
                        >
                            <div className={styles['circle']}
                                style={{
                                    background: theme.element_second_color
                                }}>
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 1.5L9 9M9 16.5L9 9M9 9L16.5 9M9 9L1.5 9" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div className={styles['text']}
                                style={{
                                    color: theme.text_third_color
                                }}>
                                Загрузите файл размером до 300мб
                            </div>
                        </div>
                    )}
                    <input
                        id="fileInput"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </div>
                {errorFile.isShow && 
                    <div className={styles['error-container']}
                        style={{
                            color: theme.text_first_color
                        }}>
                        {errorFile.text}
                    </div>} */}
                <div className={styles['input-container']}>
                    <input className={styles['input-body']}
                        placeholder='Название'
                        style={{
                            background: theme.element_second_color,
                            color: theme.text_first_color,
                            caretColor: theme.first_color,
                            '--placeholder-color': theme.text_third_color
                        }}
                        value={name}
                        onInput={(e) => setName(e.target.value)}/>
                </div>
                {errorName.isShow && 
                    <div className={styles['error-container']}
                        style={{
                            color: theme.text_first_color
                        }}>
                        {errorName.text}
                    </div>}
                <div className={styles['time-container']}>
                    <div className={styles['title']}
                        style={{
                            color: theme.text_first_color
                        }}>Введите время</div>
                    <div className={styles['input-wrapper']}>
                    <input className={styles['input-body']}
                        placeholder='Начало'
                        style={{
                            background: theme.element_second_color,
                            color: theme.text_first_color,
                            caretColor: theme.first_color,
                            '--placeholder-color': theme.text_third_color
                        }}
                        value={timeStart}
                        onInput={(e) => setTimeStart(e.target.value)}/>
                    <line className={styles['line']}
                        style={{background: theme.element_second_color}}/>
                    <input className={styles['input-body']}
                        placeholder='Конец'
                        style={{
                            background: theme.element_second_color,
                            color: theme.text_first_color,
                            caretColor: theme.first_color,
                            '--placeholder-color': theme.text_third_color
                        }}
                        value={timeEnd}
                        onInput={(e) => setTimeEnd(e.target.value)}/>
                    </div>
                </div>
                <div className={styles['input-container']}>
                    <input className={styles['input-body']}
                        placeholder='Кабинет'
                        style={{
                            background: theme.element_second_color,
                            color: theme.text_first_color,
                            caretColor: theme.first_color,
                            '--placeholder-color': theme.text_third_color
                        }}
                        value={room}
                        onInput={(e) => setRoom(e.target.value)}/>
                </div>
                <div className={styles['color-container']}>
                    <div className={styles['title']} style={{ color: theme.text_first_color}}>Выберите цвет</div>
                    <div className={styles['circles-container']}>
                    {filteredColors.map((circle) => (
                        <>
                        {circle.colors.map((colorCircle, index) => (
                            <div
                            key={index}
                            className={styles['color-circle']}
                            style={{ background: colorCircle }}
                            onClick={() => setColor(colorCircle)}
                            >
                            {color === colorCircle && (
                                <div className={styles['active-circle']} style={{ borderColor: isLightColor(colorCircle) ? "#0A0B10" : '#fff' }}></div>
                            )}
                            </div>
                        ))}
                        </>
                    ))}
                    </div>
                </div>
                <div className={styles['button-container']}>
                    <button className={styles['main-button']}
                        style={{
                            background: theme.first_color,
                            color: theme.text_first_color
                        }}
                        onClick={handleAddLesson}>
                        Добавить
                    </button>
                </div>
            </motion.section>
        </motion.div>
    )
}
export default AddTimetable