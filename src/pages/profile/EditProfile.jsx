import React, { useContext, useEffect, useState } from 'react';
import styles from './Profile.module.scss';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { useAuth } from "../../providers/Authprovired.jsx";
import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification.jsx';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '../../../firebase.js';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import colorCircles from '../../themes/ColorCircles.js';

function EditProfile({fetchUserPreferences, handleEdit}){
    const {theme, elementColors, setElementColors } = useContext(ElementContext);
    const { authUser } = useAuth();
    const [name, setName] = useState(authUser.name);
    const [biography, setBiography] = useState(authUser.biography)
    const [isActive, setIsActive] = useState(true);
    const [photo, setPhoto] = useState(null);
    const [cover, setCover] = useState(authUser.cover);
    const [userColors, setUserColors] = useState([]);
    const [slipData, setSlipData] = useState({
        isShow: false,
        text: ''
    });

    useEffect(() => {
        const fetchUserPreferences = async () => {
            if (authUser && authUser._id) {
                const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    console.log(userData);
                    setName(userData.name)
                    setBiography(userData.biography);
                    setCover(userData.cover)
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
    // const filteredColors =[]

    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowLink: () => handleEdit(),
            arrowColor: theme.text_first_color,
            isHeaderBackground: false,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: true,
            footerBackground: theme.background_color,
            activeElementIndex: 4,
        });
        document.body.style.background = theme.background_color
        },[theme]);

    const copyId = () => {
        // setShow(true);
        navigator.clipboard.writeText(authUser._id)
        .then(() => {
            setSlipData({
                isShow: true,
                text: 'id скопирован в буфер обмена'
            })
            // Здесь вы можете выполнить дополнительные действия после успешного копирования
        })
        .catch((error) => {
            setSlipData({
                isShow: true,
                text: `Не удалось скопировать id ${error}`
            })
            // Обработка ошибок при копировании
        });
    }

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
            console.log(e.target.files[0])
        }
    };

    const handleCoverChange = (color) =>{
        setCover(color)
        // alert(color)
    }

    const handleDataChange = async () => {
        let photoUrl = null;
        const timestamp = new Date().toISOString();
        if (photo) {
            const storageRef = ref(storage, `users_photo/${authUser._id}/${timestamp}_${photo.name}`);
            await uploadBytes(storageRef, photo);
            // console.log(storageRef);
            photoUrl = await getDownloadURL(storageRef);
        }
        if (authUser && authUser._id) {
            const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
            try {
                await setDoc(userDocRef, 
                    {name: name, 
                    biography: biography, 
                    photo: photo ? photoUrl :  authUser.avatar,
                    cover: cover}, 
                    { merge: true });
                await fetchUserPreferences();
                handleEdit();
            } catch (error) {
                console.error("Error updating document: ", error);
            }
        }
    };
    // const handleNameChange = (e) =>{
    //     setUserInfo({
    //         name: e.target.value
    //     })
    // }
    // const handleBiographyChange = (e) =>{
    //     setUserInfo({
    //         biography: e.target.value
    //     })
    // }
    // useEffect(() => {
    //     console.log(userInfo);
    //     alert(userData.name)
    // }, [userInfo])
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
                    {/* <img src='/genery/'/> */}
                </div>
                </div>
            </div>
            <div className={styles['user-photo']}
                style={{
                    borderColor: theme.background_color,
                    background: theme.background_color,
                }}>
                <button className={styles['change-photo-button']}
                    onClick={() => document.getElementById('photo-input').click()}>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M32.3158 4V9.05263M32.3158 14.1053V9.05263M32.3158 9.05263H37.3684M32.3158 9.05263H27.2632M22.2105 9.05263H12.1053L8.73684 12.4211H4C2.89543 12.4211 2 13.3165 2 14.4211V34C2 35.1046 2.89543 36 4 36H30.3158C31.4204 36 32.3158 35.1046 32.3158 34V19.1579" stroke="white" stroke-width="3"/>
                        <circle cx="17.1577" cy="24.2105" r="6.73684" stroke="white" stroke-width="3"/>
                    </svg>
                </button>
                <img src={photo ? URL.createObjectURL(photo) : authUser.avatar}/>
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
                            <div className={styles['active-circle']} style={{ borderColor: isLightColor(color) ? "#000" : '#fff' }}></div>
                        )}
                        </div>
                    ))}
                    </>
                ))}

                {/* {filteredColors.map((circle)=> { */}
                    {/* {circle.colors.map((color) => (
                        <div className={styles['color-circle']}
                            style={{
                                background: color
                            }}
                            onClick={() => handleCoverChange(circle.color)}>
                            {cover === color&& <div className={styles['active-circle']}
                                style={{
                                    borderColor: 'var(--text-first-color)'
                                }}></div>}
                        </div>
                    ))} 
                //*/}
                    {/*<div className={styles['color-circle']}
                    //     style={{
                    //         background: circle.color
                    //     }}
                    //     onClick={() => handleCoverChange(circle.color)}>
                    //     {cover === circle.color && <div className={styles['active-circle']}
                    //         style={{
                    //             borderColor: 'var(--text-first-color)'
                    //         }}></div>}
                    // </div>
                )} */}
            </div>
            <div className={styles['user-actions']}
                style={{
                    background: theme.element_first_color
                }}>
                <div className={styles['input-data-container']}>
                    <div className={styles['label']}
                        style={{
                            color: theme.first_color
                        }}>Имя</div>
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
                        }}>О себе</div>
                    <input type='text' value={biography} className={styles['input-data']}
                        style={{
                            color: theme.text_first_color,
                            caretColor: theme.first_color
                        }}
                        onChange={(e) => setBiography(e.target.value)}/>
                </div>
                {/* <div className={styles['user-info']}>
                    <div className={styles['user-name']}
                        style={{
                            color: 'var(--text-first-color)'
                        }}>{authUser.name}</div>
                    
                </div> */}
                <div className={styles['button-container']}>
                    <button className={styles['quit-button']}
                        style={{
                            background: theme.first_color,
                            color: theme.text_first_color
                        }}
                        onClick={handleDataChange}>Сохранить</button>
                </div>
            </div>
        </div>
    )
}
export default EditProfile