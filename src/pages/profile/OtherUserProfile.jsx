import React, { useContext, useEffect, useState } from 'react';
import styles from './Profile.module.scss';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { useAuth } from "../../providers/Authprovired.jsx";
import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification.jsx';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase.js';

function OtherUserProfile({id}){
    const { theme, elementColors, setElementColors } = useContext(ElementContext);
    // const { authUser } = useAuth();
    const [userData, setUserData] = useState({
        isShow: true,
    })
    const [slipData, setSlipData] = useState({
        isShow: false,
        text: ''
    });
    // const { id } = useParams();
    useEffect(() => {

    }, [id])
    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowLink: '#/list-menu',
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

    // const copyId = () => {
    //     // setShow(true);
    //     navigator.clipboard.writeText(authUser._id)
    //     .then(() => {
    //         setSlipData({
    //             isShow: true,
    //             text: 'id скопирован в буфер обмена'
    //         })
    //     })
    //     .catch((error) => {
    //         setSlipData({
    //             isShow: true,
    //             text: `Не удалось скопировать id ${error}`
    //         })
    //         // Обработка ошибок при копировании
    //     });
    // }
    useEffect(() => {
        const fetchUserPreferences = async () => {
            if (id) {
                const userDocRef = doc(db, 'users', id, 'info', 'preferences');
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    console.log(userData);
                    setUserData({
                        isUser: true,
                        name: userData.name,
                        biography: userData.biography,
                        photo: userData.photo
                    })
                } else {
                    console.log("No such document!");
                    setUserData({
                        isUser: false,
                        name: 'Пользователь не найден',
                        biography: ''
                    })
                }
            } else {
                console.error('authUser or authUser._id is undefined');
            }
        };

        fetchUserPreferences();
    }, [id])
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

    return(
        <div className={styles.container}>
            <SlipNotification
                isShow={slipData.isShow}
                text={slipData.text}/>
            <div className={styles['cover-container']}>
                <div className={styles['cover']}
                    style={{
                        background: 'var(--first-color)'
                    }}>
                    <div className={styles['cover-pattern']}>
                    {/* <img src='/genery/'/> */}
                    </div>
                </div>
            </div>
            <div className={styles['user-photo']}
                style={{
                    borderColor: theme.background_color
                }}>
                <img src='/genery/public/1.png'/>
            </div> 
            {userData.isUser ?
                    <div className={styles['user-actions']}
                        style={{
                            background: theme.element_first_color
                        }}>
                        <div className={styles['user-info']}>
                            <div className={styles['user-name']}
                                style={{
                                    color: theme.text_first_color
                                }}>{userData.name}</div>
                            {/* <button className={styles['circle-button']}
                                style={{
                                    color: 'var(--text-first-color)',
                                    background: 'var(--first-color)'
                                }}
                                onClick={copyId}>#</button> */}
                            
                        </div>
                        <div className={styles['user-biography']}
                            style={{
                                color: theme.text_first_color
                            }}>{userData.biography}</div>
                        <div className={styles['button-container']}>
                            <button className={styles['quit-button']}
                                style={{
                                    background: theme.first_color,
                                    color: theme.text_first_color
                                }}>Подписаться</button>
                        </div>
                    </div> 
                :
                    <div className={styles['user-actions']}
                        style={{
                            background: theme.element_first_color
                        }}>
                        <div className={styles['user-info']}>
                            <div className={styles['user-name']}
                                style={{
                                    color: theme.text_first_color
                                }}>{userData.name}</div>                        
                        </div>
                    </div>}
        </div>
    )
}
export default OtherUserProfile