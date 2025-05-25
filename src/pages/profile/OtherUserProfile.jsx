import React, { useContext, useEffect, useState } from 'react';
import styles from './Profile.module.scss';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { useAuth } from "../../providers/Authprovired.jsx";
import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification.jsx';
import { collection, doc, getDoc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import LoadingPost from '../posts/LoadingPost.jsx';
import Post from '../posts/Post.jsx';
import ImageViewer from '../../components/modal-windows/image-viewer/ImageViewer.jsx';
import { useNavigate } from 'react-router-dom';

function OtherUserProfile({id}){
    
    const { authUser } = useAuth();
    const { theme, elementColors, setElementColors } = useContext(ElementContext);
    // const { authUser } = useAuth();
    const [userData, setUserData] = useState({
        isShow: true,
    })
    const [slipData, setSlipData] = useState({
        isShow: false,
        text: ''
    });
    const navigateTo = useNavigate()
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [viewData, setViewData] = useState({
        isShow: false,
        images: [],
        index: null,
    });
    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowLink: () => navigateTo('/posts'),
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

    useEffect(() => {
        fetchUserPreferences();
    }, [id])

    const fetchUserPreferences = async () => {
        if (id) {
            const userDocRef = doc(db, 'users', id, 'info', 'preferences');
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                console.log(userData);
                setUserData({
                    id: userData.uid,
                    isUser: true,
                    name: userData.name,
                    biography: userData.biography,
                    photo: userData.photo,
                    cover: userData.cover,
                    followers: userData.followers || [],
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
    useEffect(() => {
        const unlisten = onSnapshot(
            query(collection(db, 'posts'), orderBy('timestamp', 'desc')),
            snapshot => {
                const postsArray = [];
    
                snapshot.forEach((doc) => {
                    const postData = doc.data();
    
                    // Фильтрация по userId
                    if (postData.userId === id) {
                        const postDate = new Date(postData.timestamp);
                        const postUsersLike = postData.likesArray;
                        // Преобразование даты в формат "дд месяц"
                        const dateString = postDate.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' });
    
                        // Добавление нового сообщения в массив
                        postsArray.push({
                            id: doc.id,  // добавляем уникальный идентификатор документа
                            userId: postData.userId,
                            userName: postData.userName,
                            groupOwnerId: postData.groupOwnerId,
                            userPhoto: postData.userPhoto,
                            postText: postData.text,
                            postPhoto: postData.photos,
                            postData: dateString,
                            likesArray: postUsersLike,
                        });
                    }
                });
    
                setPosts(postsArray);
                setIsLoading(false);
            }
        );
    
        return () => {
            unlisten();
        };
    }, [id]);
    const openViewer = (photos, index) =>{
        setViewData({
            isShow: true,
            images: photos,
            index: index
        })
    }
    const handleActionPost = (id, postId) =>{
        switch(id){
            case 'delete':
                return setAlertProp({
                    isShow: true,
                    title: 'Удаление поста',
                    text: `Вы действительно хотите удалить пост?`,
                    firstButtonName: 'Отмена',
                    secondButtonName: 'Удалить',
                    firstButtonOnClick: closeAlert,
                    secondButtonOnClick: () => deletePost(postId),
                })
            default:
                return setAlertProp({
                    isShow: true,
                    title: 'Заголовок',
                    text: `текст`,
                    firstButtonName: 'Кнопка',
                    secondButtonName: 'Кнопка',
                    firstButtonOnClick: null,
                    secondButtonOnClick: null,
                })
        }
    }
    const handlePhotoClick = (photos) => {
        setViewData({
            isShow: true,
            images: photos,
            index: 0
        })
      }; 
      const followUser = async () => {
        if (authUser._id) {
            const groupDocRef = doc(db, 'users', id, 'info', 'preferences');
            const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
    
            try {
                const groupDocSnap = await getDoc(groupDocRef);
                const userDocSnap = await getDoc(userDocRef);
    
                if (groupDocSnap.exists() && userDocSnap.exists()) {
                    const groupData = groupDocSnap.data();
                    const userData = userDocSnap.data();
    
                    // Получаем массив подписчиков группы и подписок пользователя
                    const followers = groupData.followers || [];
                    const subscribes = userData.subscribes || [];
    
                    let updatedFollowers;
                    let updatedSubscribes;
    
                    if (followers.includes(authUser._id)) {
                        // Удаление пользователя из подписчиков группы
                        updatedFollowers = followers.filter(follower => follower !== authUser._id);
    
                        // Удаление группы из подписок пользователя
                        updatedSubscribes = subscribes.filter(subscribe => subscribe !== id);
                    } else {
                        // Добавление пользователя в подписчики группы
                        updatedFollowers = [...followers, authUser._id];
    
                        // Добавление группы в подписки пользователя
                        updatedSubscribes = [...subscribes, id];
                    }
    
                    // Обновляем данные группы
                    await setDoc(groupDocRef, { followers: updatedFollowers }, { merge: true });
    
                    // Обновляем данные пользователя
                    await setDoc(userDocRef, { subscribes: updatedSubscribes }, { merge: true });
                    await fetchUserPreferences();
    
                    console.log('Subscription updated successfully');
                } else {
                    console.error('Group or user document does not exist');
                }
            } catch (error) {
                console.error('Error updating subscription:', error);
            }
        } else {
            console.error('User is not authenticated');
        }
    };
    

    const copyId = () => {
        // setShow(true);
        navigator.clipboard.writeText(userData.id)
        .then(() => {
            setSlipData({
                isShow: true,
                text: 'id скопирован в буфер обмена'
            })
        })
        .catch((error) => {
            setSlipData({
                isShow: true,
                text: `Не удалось скопировать id ${error}`
            })
            // Обработка ошибок при копировании
        });
    }

    return(
        <div className={styles.container}>
            <style>{`
                ::-webkit-scrollbar {
                  width: 10px; /* Ширина ползунка */
                }

                /* Стилизация ползунка скроллбара */
                ::-webkit-scrollbar-thumb {
                  background: ${theme.first_color}; /* Цвет ползунка */
                  border-radius: 5px; /* Закругление углов ползунка */
                  cursor: pointer;
                }

                /* Стилизация фона скроллбара */
                ::-webkit-scrollbar-track {
                  background-color: rgba($color: #000000, $alpha: 0.3); /* Цвет фона */
                }
            `}</style>
            <ImageViewer
                isShow={viewData.isShow}
                images={viewData.images}
                index={viewData.index}
                onClose={() => setViewData({ isShow: false })}
                />
            <SlipNotification
                isShow={slipData.isShow}
                text={slipData.text}/>
            <div className={styles['cover-container']}>
                <div className={styles['cover']}
                    style={{
                        background: userData.cover
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
                <img src={userData.photo} 
                onClick={() => handlePhotoClick(userData.photo)}/>
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
                            <button className={styles['circle-button']}
                                style={{
                                    color: theme.text_third_color,
                                    background: theme.first_color
                                }}
                                onClick={copyId}>#</button>
                            
                        </div>
                        <div className={styles['user-biography']}
                            style={{
                                color: theme.text_first_color
                            }}>{userData.biography}</div>
                        <div className={styles['button-container']}>
                            <button className={styles['quit-button']}
                                style={{
                                background: userData.followers.includes(authUser._id) ? theme.element_second_color : theme.first_color,
                                color: theme.text_third_color
                                }}
                                onClick={followUser}>
                                {userData.followers && userData.followers.includes(authUser._id) ? 'Отписаться' : 'Подписаться'}
                            </button>
                                <button className={styles['quit-button']}
                                    style={{
                                    background: theme.element_second_color,
                                    color: theme.text_first_color
                                    }}
                                    onClick={() => navigateTo(`/chat/${id}_${authUser._id}`)}>
                                    {'Сообщение'}
                                </button>
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
                    <div
                        className={styles['item-body']}
                        style={{ border: `2px solid ${theme.element_first_color}` }}
                        onClick={() => navigateTo(`/subscribers/${id}?isGroup=false`)}
                    >
                        <div className={styles['item-info']}>
                            <div
                                className={styles['item-name']}
                                style={{ color: theme.text_first_color }}
                            >
                                Подписчики: {userData.followers ? userData.followers.length : 0}
                            </div>
                        </div>
                        <div
                            className={styles['item-circle']}
                            style={{ background: theme.first_color }}
                        >
                            <svg
                                width="11"
                                height="11"
                                viewBox="0 0 11 11"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M1.70711 10.7071C1.31658 11.0976 0.683418 11.0976 0.292893 10.7071C-0.0976311 10.3166 -0.0976311 9.68342 0.292893 9.29289L1.70711 10.7071ZM10 4.72575e-08C10.5523 -3.74211e-07 11 0.447715 11 1L11 10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10L9 2L1 2C0.447715 2 2.8711e-07 1.55228 2.8711e-07 1C2.8711e-07 0.447715 0.447715 -1.63477e-07 1 -1.63477e-07L10 4.72575e-08ZM0.292893 9.29289L9.29289 0.292893L10.7071 1.70711L1.70711 10.7071L0.292893 9.29289Z"
                                    fill={theme.text_third_color}
                                />
                            </svg>
                        </div>
                    </div>
                    <div className={styles['posts-container']}>
                {isLoading ? 
                    <>
                    <LoadingPost/>
                    <LoadingPost/>
                    <LoadingPost/>
                    <LoadingPost/>
                    </>
                    :
                    posts.map((post) => (
                        <Post
                            key={post.id}
                            postId={post.id}
                            groupOwnerId={post.groupOwnerId}
                            userId = {post.userId}
                            userName={post.userName}
                            userPhoto={post.userPhoto}
                            postData={post.postData}
                            postText={post.postText}
                            postPhotos={post.postPhoto}
                            likesArray={post.likesArray}
                            photoClick={openViewer}
                            postAction={handleActionPost}
                        />
                    ))
                }   
            </div>
        </div>
    )
}
export default OtherUserProfile