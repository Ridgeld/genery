import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './CreateGroup.module.scss';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { useAuth } from "../../providers/Authprovired.jsx";
import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification.jsx';
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '../../../firebase.js';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import colorCircles from '../../themes/ColorCircles.js';
import { createCanvas } from 'canvas';

function CreateGroup({}) {
    const { theme, elementColors, setElementColors } = useContext(ElementContext);
    const { authUser } = useAuth();
    const { id } = useParams(); // Получаем id группы из параметров маршрута
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [photo, setPhoto] = useState(null);
    const [cover, setCover] = useState('#0040F9');
    const [userColors, setUserColors] = useState([]);
    const [slipData, setSlipData] = useState({
        isShow: false,
        text: ''
    });
    const [groupData, setGroupData] = useState([]);
    const navigateTo = useNavigate();
    const colors = [theme.first_color, theme.second_color, theme.third_color];
    // useEffect(() => {
    //     const fetchGroupData = async () => {
    //       if (id) {
    //         try {
    //           const groupDocRef = doc(db, 'groups', id, 'info', 'info');
    //           const docSnap = await getDoc(groupDocRef);
    
    //           if (docSnap.exists()) {
    //             const groupData = docSnap.data();
    //             setCover(groupData.cover)
    //             setName(groupData.name)
    //             setDescription(groupData.description);
    //             // setPhoto(groupData.photo);

    //             setGroupData(groupData);
    //             console.log(groupData)
    //           } else {
    //             console.log("No such document!");
    //             // setGroupData({
    //             //   isGroup: false,
    //             //   name: 'Группа не найдена',
    //             //   photo: '1',
    //             //   membersCount: 0,
    //             //   owner: null,
    //             // });
    //           }
    //         } catch (error) {
    //           console.error('Error fetching group data:', error);
    //         }
    //       } else {
    //         console.error('ID группы не указан');
    //       }
    //     };
    
    //     fetchGroupData();
    // }, [id]);

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

    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowLink: () => navigateTo('/search'),
            arrowColor: theme.text_first_color,
            isHeaderBackground: false,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: true,
            footerBackground: theme.background_color,
            activeElementIndex: 4,
        });
        document.body.style.background = theme.background_color
        }, [theme]);

    const copyId = () => {
        navigator.clipboard.writeText(groupId)
        .then(() => {
            setSlipData({
                isShow: true,
                text: 'id скопирован в буфер обмена'
            });
        })
        .catch((error) => {
            setSlipData({
                isShow: true,
                text: `Не удалось скопировать id ${error}`
            });
        });
    };

    useEffect(() => {
        if (slipData.isShow) {
          const timer = setTimeout(() => {
            setSlipData({
                isShow: false
            });
          }, 1500);
    
          return () => clearTimeout(timer);
        }
      }, [slipData.isShow]);

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setPhoto(e.target.files[0]);
            console.log(e.target.files[0]);
        }
    };

    const handleCoverChange = (color) =>{
        setCover(color);
    };

    // const handleGroupCreate = async () => {
    //     let photoUrl = null;
    //     const timestamp = new Date().toISOString();
    //     if (photo) {
    //         const storageRef = ref(storage, `groups_photo/${id}/${timestamp}_${photo.name}`);
    //         await uploadBytes(storageRef, photo);
    //         photoUrl = await getDownloadURL(storageRef);
    //     }
    //     if (id) {
    //         const groupDocRef = doc(db, 'groups', id, 'info', 'info');
    //         try {
    //             await setDoc(groupDocRef, 
    //                 { 
    //                     name: name, 
    //                     description: description, 
    //                     photo: photo ? photoUrl : groupData.photo,
    //                     cover: cover 
    //                 }, 
    //                 { merge: true });
    //             // await fetchGroupData();
    //             handleEdit();
    //         } catch (error) {
    //             console.error("Error updating document: ", error);
    //         }
    //     }
    //     // if (id) {
    //     //     try {
    //     //       const groupDocRef = doc(db, 'groups', id, 'info', 'info');
    //     //       const docSnap = await getDoc(groupDocRef);
    
    //     //       if (docSnap.exists()) {
    //     //         const groupData = docSnap.data();
    //     //         setGroupData(groupData);
    //     //         console.log(groupData)
    //     //       } else {
    //     //         console.log("No such document!");
    //     //         setGroupData({
    //     //           isGroup: false,
    //     //           name: 'Группа не найдена',
    //     //           photo: '1',
    //     //           membersCount: 0,
    //     //           owner: null,
    //     //         });
    //     //       }
    //     //     } catch (error) {
    //     //       console.error('Error fetching group data:', error);
    //     //     }
    //     //   } else {
    //     //     console.error('ID группы не указан');
    //     // }
    // };

// const handleGroupCreate = async () => { // Используем useNavigate для редиректа
//     let photoUrl = null;
//     const timestamp = new Date().toISOString();

//     if (photo) {
//         const storageRef = ref(storage, `groups_photo/${timestamp}_${photo.name}`);
//         await uploadBytes(storageRef, photo);
//         photoUrl = await getDownloadURL(storageRef);
//     }

//     try {
//         const groupCollectionRef = collection(db, 'groups');
//         const groupDocRef = await addDoc(groupCollectionRef, {}); // Создаем документ с рандомным ID
//         const groupId = groupDocRef.id;

//         const groupInfoDocRef = doc(db, 'groups', groupId, 'info', 'info');
//         await setDoc(groupInfoDocRef, 
//             { 
//                 name: name, 
//                 description: description, 
//                 photo: photo ? photoUrl : null,
//                 cover: cover,
//                 owner: authUser._id, // Сохраняем ID пользователя, который создал группу
//                 members: [authUser._id] // Изначально пустой массив подписчиков
//             }, 
//             { merge: true }
//         );

//         // Перенаправляем пользователя на страницу созданной группы
//         navigate(`/group/${groupId}`);
//     } catch (error) {
//         console.error("Error creating document: ", error);
//     }
// };
const handleGroupCreate = async () => { 
    let photoUrl = null;
    const timestamp = new Date().toISOString();

    if (name.length <= 3) {
        setSlipData({
            isShow: true,
            text: 'Название должно быть больше 3-х символов'
        });
        // alert(9)
        return;
    }

    if (photo) {
        const storageRef = ref(storage, `groups_photo/${timestamp}_${photo.name}`);
        await uploadBytes(storageRef, photo);
        photoUrl = await getDownloadURL(storageRef);
    } else {
        // Создаем PNG изображение 500x500 пикселей
        const canvas = createCanvas(500, 500);
        const ctx = canvas.getContext('2d');
        const color = colors[Math.floor(Math.random() * colors.length)]; // Выбираем случайный цвет
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Добавляем первую букву названия в центр изображения
        ctx.fillStyle = 'white';
        ctx.font = 'bold 250px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name[0].toUpperCase(), canvas.width / 2, canvas.height / 2);

        // Преобразуем изображение в Blob и загружаем в Firebase Storage
        const imageBlob = await new Promise(resolve => canvas.toBlob(resolve));
        const defaultPhotoRef = ref(storage, `groups_photo/${timestamp}_${name}_default.png`);
        await uploadBytes(defaultPhotoRef, imageBlob);
        photoUrl = await getDownloadURL(defaultPhotoRef);
    }

    try {
        const groupCollectionRef = collection(db, 'groups');
        const groupDocRef = await addDoc(groupCollectionRef, {}); // Создаем документ с рандомным ID
        const groupId = groupDocRef.id;

        const groupInfoDocRef = doc(db, 'groups', groupId, 'info', 'info');
        await setDoc(groupInfoDocRef, 
            { 
                name: name, 
                description: description, 
                photo: photoUrl,
                cover: cover,
                owner: authUser._id, // Сохраняем ID пользователя, который создал группу
                members: [authUser._id] // Изначально пустой массив подписчиков
            }, 
            { merge: true }
        );

        // Перенаправляем пользователя на страницу созданной группы
        navigateTo(`/group/${groupId}`);
    } catch (error) {
        console.error("Error creating document: ", error);
    }
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
    return(
        <div className={styles['container']}>

            <div className={styles['profile-container']}>
                <SlipNotification
                    isShow={slipData.isShow}
                    text={slipData.text}/>
                <div className={styles['cover-container']}>
                    <div className={styles['cover']}
                        style={{
                            background: cover
                        }}>
                        <div className={styles['cover-pattern']}>
                        </div>
                    </div>
                </div>
                <div className={styles['group-photo']}
                    style={{
                        borderColor: theme.background_color,
                        background: theme.background_color
                    }}>
                    <button className={styles['change-photo-button']}
                        onClick={() => document.getElementById('photo-input').click()}>
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M32.3158 4V9.05263M32.3158 14.1053V9.05263M32.3158 9.05263H37.3684M32.3158 9.05263H27.2632M22.2105 9.05263H12.1053L8.73684 12.4211H4C2.89543 12.4211 2 13.3165 2 14.4211V34C2 35.1046 2.89543 36 4 36H30.3158C31.4204 36 32.3158 35.1046 32.3158 34V19.1579" stroke="white" stroke-width="3"/>
                            <circle cx="17.1577" cy="24.2105" r="6.73684" stroke="white" stroke-width="3"/>
                        </svg>
                    </button>
                    <img src={photo ? URL.createObjectURL(photo) : groupData.photo}/>
                    <input
                        type="file"
                        id="photo-input"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />
                </div>
                <div className={styles['colors-container']} style={{ background: theme.element_first_color }}>
                    {filteredColors.map((circle) => (
                        <>
                        {circle.colors.map((color, index) => (
                            <div
                            key={index}
                            className={styles['color-circle']}
                            style={{ background: color }}
                            onClick={() => handleCoverChange(color)}
                            >
                            {cover === color && (
                                <div className={styles['active-circle']} style={{ borderColor: isLightColor(color) ? "#0A0B10" : '#fff' }}></div>
                            )}
                            </div>
                        ))}
                        </>
                    ))}
                </div>
                <div className={styles['group-actions']}
                    style={{
                        background: theme.element_first_color
                    }}>
                    <div className={styles['input-data-container']}>
                        <div className={styles['label']}
                            style={{
                                color: theme.first_color
                            }}>Название</div>
                        <input type='text' value={name} className={styles['input-data']}
                            style={{
                                color: theme.text_first_color,
                                caretColor: theme.first_color
                            }}
                            onChange={(e) => setName(e.target.value)}/>
                    </div>
                    <div className={styles['input-data-container']}>
                        <div className={styles['label']}
                            style={{
                                color: theme.first_color
                            }}>Описание</div>
                        <input type='text' value={description} className={styles['input-data']}
                            style={{
                                color: theme.text_first_color,
                                caretColor: theme.first_color
                            }}
                            onChange={(e) => setDescription(e.target.value)}/>
                    </div>
                    <div className={styles['button-container']}>
                        <button className={styles['quit-button']}
                            style={{
                                color: theme.text_third_color,
                                background: theme.first_color
                            }}
                            onClick={handleGroupCreate}>Создать</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateGroup;
