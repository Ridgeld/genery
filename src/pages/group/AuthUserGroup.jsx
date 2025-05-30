// import React, { useContext, useEffect, useState } from 'react';
// import styles from './Group.module.scss';
// import { ElementContext } from '../../providers/ElementProvider.jsx';
// import { useAuth } from "../../providers/Authprovired.jsx";
// import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification.jsx';
// import { signOut } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';
// import { db } from '../../../firebase.js';
// import EditGroup from './EditGroup.jsx';
// import { useNavigate } from 'react-router-dom';
// import Coin from '../../components/coin/Coin.jsx';
// import ImageViewer from '../../components/modal-windows/image-viewer/ImageViewer.jsx';

// function AuthUserGroup({id}){
//     const {theme, elementColors, setElementColors } = useContext(ElementContext);
//     const { authUser, ga } = useAuth();
//     const [userData, setUserData] = useState({
//         name: authUser.name,
//         biography: authUser.biography,
//         photo: authUser.avatar
//     });
//     const navigateTo = useNavigate()
//     const [isEdit, setIsEdit] = useState(false)
//     const [slipData, setSlipData] = useState({
//         isShow: false,
//         text: ''
//     });
//     const [viewData, setViewData] = useState({
//         isShow: false,
//         images: [],
//         index: null

//     })  
//     // const { id } = useParams();

//     useEffect(() => {
//         setElementColors({
//             iconColor: theme.text_first_color,
//             titleColor: theme.text_first_color,
//             showArrow: true,
//             arrowLink: '#/list-menu',
//             arrowColor: theme.text_first_color,
//             isHeaderBackground: false,
//             headerBackground: theme.background_color,
//             isHeader: true,
//             isFooter: true,
//             footerBackground: theme.background_color,
//             activeElementIndex: 4,
//         });
//         document.body.style.background = theme.background_color
//         },[theme]);

//     const fetchUserPreferences = async () => {
//         if (authUser && authUser._id) {
//             const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
//             const docSnap = await getDoc(userDocRef);

//             if (docSnap.exists()) {
//                 const userData = docSnap.data();
//                 console.log(userData);
//                 setUserData({
//                     name: userData.name,
//                     biography: userData.biography,
//                     photo: userData.photo,
//                     cover: userData.cover,
//                     balance: userData.balance,
//                 });
//             } else {
//                 console.log("No such document!");
//             }
//         } else {
//             console.error('authUser or authUser._id is undefined');
//         }
//     };
//     useEffect(() => {
//         fetchUserPreferences();
//     }, [])
    
//     const copyId = () => {
//         // setShow(true);
//         navigator.clipboard.writeText(authUser._id)
//         .then(() => {
//             setSlipData({
//                 isShow: true,
//                 text: 'id скопирован в буфер обмена'
//             })
//             // Здесь вы можете выполнить дополнительные действия после успешного копирования
//         })
//         .catch((error) => {
//             setSlipData({
//                 isShow: true,
//                 text: `Не удалось скопировать id ${error}`
//             })
//             // Обработка ошибок при копировании
//         });
//     }

//     useEffect(() => {
//         if (slipData.isShow) {
//           const timer = setTimeout(() => {
//             setSlipData({
//                 isShow: false
//             });
//           }, 1500);
    
//           return () => clearTimeout(timer);
//         }
//       }, [slipData.isShow]);

//     const handleEditState = () => {
//         setIsEdit(false);
//         setSlipData({
//             isShow: true,
//             text: 'изменения успешно сохранены'
//         })
//     }
//     const handlePhotoClick = (photos) => {
//         setViewData({
//             isShow: true,
//             images: photos,
//             index: 0
//         })
//       }; 
//     return(
//         <div className={styles.container}>
//             <ImageViewer
//                 isShow={viewData.isShow}
//                 images={viewData.images}
//                 index={viewData.index}
//                 onClose={()=> setViewData({isShow: false})}/>
//             {isEdit ? 
//                 <EditGroup
//                     handleEdit={handleEditState}
//                     fetchUserPreferences={fetchUserPreferences}/>
//             : 
//                 <div className={styles['profile-container']}>  
//                     <SlipNotification
//                         isShow={slipData.isShow}
//                         text={slipData.text}/>
//                     <div className={styles['cover-container']}>
//                         <div className={styles['cover']}
//                             style={{
//                                 background: userData.cover
//                             }}>
//                             <div className={styles['cover-pattern']}>
//                                 {/* <img src='/genery/'/> */}
//                             </div>
//                         </div>
//                     </div>
//                     <div className={styles['user-photo']}
//                         style={{
//                             borderColor: theme.background_color
//                         }}>
//                         <img src={userData.photo}
//                             onClick={() => handlePhotoClick(userData.photo)}/>
//                     </div>
//                     <div className={styles['user-actions']}
//                         style={{
//                             background: theme.element_first_color
//                         }}>
//                         <div className={styles['user-info']}>
//                             <div className={styles['user-name']}
//                                 style={{
//                                 color: theme.text_first_color
//                             }}>{userData.name}</div>
//                             <button className={styles['circle-button']}
//                                 style={{
//                                     color: theme.text_first_color,
//                                     background: theme.first_color
//                                 }}
//                                 onClick={copyId}>#</button>
                            
//                         </div>
//                         <div className={styles['user-biography']}
//                             style={{
//                                 color: theme.text_first_color
//                             }}>{userData.biography}</div>
//                         <div className={styles['button-container']}>
//                             <button className={styles['quit-button']}
//                                 style={{
//                                     background: theme.element_second_color,
//                                     color: theme.text_first_color
//                                 }}
//                                 onClick={() => signOut(ga)}>Выйти</button>
//                             <button className={styles['circle-button']}
//                                 style={{
//                                     color: theme.text_first_color,
//                                     background: theme.first_color
//                                 }}
//                                 onClick={() => setIsEdit(true)}>
//                                     <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                         <path d="M14.7563 3.36828C15.0812 3.04333 15.0812 2.50174 14.7563 2.19345L12.8066 0.243716C12.4983 -0.0812387 11.9567 -0.0812387 11.6317 0.243716L10.0986 1.7685L13.2232 4.89307M0 11.8754V15H3.12457L12.34 5.77628L9.21539 2.65171L0 11.8754Z" fill={theme.text_first_color}/>
//                                     </svg>
//                             </button>
//                         </div>
//                     </div>
//                     <div className={styles['item-body']}
//                         style={{
//                             border: `2px solid ${theme.element_first_color}`
//                         }}>
//                         <div className={styles['item-info']}>
//                             <div className={styles['item-name']}
//                                 style={{
//                                     color: theme.text_first_color
//                                 }}>
//                                 Баланс:  {userData.balance} <Coin color={theme.first_color}/>
//                             </div>
//                         </div>
//                         <div className={styles['item-circle']}
//                             style={{
//                                 background: theme.first_color
//                             }}>
//                             <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                 <path d="M1.70711 10.7071C1.31658 11.0976 0.683418 11.0976 0.292893 10.7071C-0.0976311 10.3166 -0.0976311 9.68342 0.292893 9.29289L1.70711 10.7071ZM10 4.72575e-08C10.5523 -3.74211e-07 11 0.447715 11 1L11 10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10L9 2L1 2C0.447715 2 2.8711e-07 1.55228 2.8711e-07 1C2.8711e-07 0.447715 0.447715 -1.63477e-07 1 -1.63477e-07L10 4.72575e-08ZM0.292893 9.29289L9.29289 0.292893L10.7071 1.70711L1.70711 10.7071L0.292893 9.29289Z" fill={theme.text_first_color}/>
//                             </svg>
//                         </div>
//                     </div>
//                     <div className={styles['item-body']}
//                         style={{
//                             border: `2px solid ${theme.element_first_color}`
//                         }}
//                         onClick={() => navigateTo('/settings')}>
//                         <div className={styles['item-info']}>
//                             <div className={styles['item-icon']}>
//                                 <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                     <path fill-rule="evenodd" clip-rule="evenodd" d="M16.0001 1C16.7522 1 17.4936 1.05571 18.2158 1.16286L19.3043 4.46066C20.2579 4.7328 21.1643 5.12065 22.0043 5.60921L25.1328 4.10067C26.2406 4.95137 27.2263 5.95421 28.0578 7.07705L26.4935 10.1777C26.9671 11.0263 27.3399 11.9391 27.5949 12.8991L30.8734 14.0412C31.0541 15.4276 31.0418 16.8324 30.837 18.2154L27.5392 19.304C27.2689 20.2478 26.8831 21.1547 26.3906 22.004L27.8992 25.1325C27.0473 26.2406 26.0456 27.225 24.9228 28.0574L21.8221 26.4932C20.9644 26.9722 20.0502 27.3422 19.1008 27.5946L17.9586 30.8731C16.5722 31.0537 15.1675 31.0415 13.7844 30.8367L12.6959 27.5389C11.752 27.2686 10.8452 26.8828 9.9959 26.3903L6.86738 27.8989C5.75923 27.047 4.77484 26.0453 3.94243 24.9225L5.50669 21.8218C5.02886 20.9635 4.65892 20.0495 4.40528 19.1004L1.12676 17.9562C0.946317 16.5704 0.958576 15.1664 1.16318 13.7841L4.46099 12.6955C4.73313 11.742 5.12098 10.8356 5.60954 9.99557L4.10099 6.86705C4.95285 5.75891 5.95455 4.77451 7.07738 3.9421L10.178 5.50636C11.0358 5.02737 11.95 4.65737 12.8994 4.40495L14.0437 1.12643C14.6924 1.04203 15.3459 0.999799 16.0001 1Z" stroke={theme.text_first_color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
//                                     <path d="M16.0002 22.4282C19.5506 22.4282 22.4287 19.5501 22.4287 15.9998C22.4287 12.4494 19.5506 9.57129 16.0002 9.57129C12.4499 9.57129 9.57178 12.4494 9.57178 15.9998C9.57178 19.5501 12.4499 22.4282 16.0002 22.4282Z" stroke={theme.text_first_color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
//                                 </svg>
//                             </div>
//                             <div className={styles['item-name']}
//                                 style={{
//                                     color: theme.text_first_color
//                                 }}>
//                                 Настройки
//                             </div>
//                         </div>
//                         <div className={styles['item-circle']}
//                             style={{
//                                 background: theme.second_color
//                             }}>
//                             <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                 <path d="M1.70711 10.7071C1.31658 11.0976 0.683418 11.0976 0.292893 10.7071C-0.0976311 10.3166 -0.0976311 9.68342 0.292893 9.29289L1.70711 10.7071ZM10 4.72575e-08C10.5523 -3.74211e-07 11 0.447715 11 1L11 10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10L9 2L1 2C0.447715 2 2.8711e-07 1.55228 2.8711e-07 1C2.8711e-07 0.447715 0.447715 -1.63477e-07 1 -1.63477e-07L10 4.72575e-08ZM0.292893 9.29289L9.29289 0.292893L10.7071 1.70711L1.70711 10.7071L0.292893 9.29289Z" fill={theme.background_color}/>
//                             </svg>
//                         </div>
//                     </div>
//                 </div> }
//         </div>
//     )
// }
// export default AuthUserGroup
import React, { useContext, useEffect, useState } from 'react';
import styles from './Group.module.scss';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { useAuth } from '../../providers/Authprovired.jsx';
import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification.jsx';
import { signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { db, storage } from '../../../firebase.js';
import EditGroup from './EditGroup.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import Coin from '../../components/coin/Coin.jsx';
import ImageViewer from '../../components/modal-windows/image-viewer/ImageViewer.jsx';
import MessageInput from '../../components/inputs/messageInput/MessageInput.jsx';
import Post from '../posts/Post.jsx';
import LoadingPost from '../posts/LoadingPost.jsx';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import AlertNotification from '../../components/notifictions/AlertNotification/AlertNotification.jsx';

function AuthUserGroup() {
    const { theme, setElementColors } = useContext(ElementContext);
    const { authUser, ga } = useAuth();
    const [groupData, setGroupData] = useState({});
    const navigateTo = useNavigate();
    const { id } = useParams();
    const [isEdit, setIsEdit] = useState(false);
    const [slipData, setSlipData] = useState({
        isShow: false,
        text: '',
    });
    const [alertProp, setAlertProp] = useState({
        isShow: false,
        title: 'Заголовок',
        text: 'текст',
        firstButtonName: 'выйти',
        secondButtonName: 'играть',

    });
    const [viewData, setViewData] = useState({
        isShow: false,
        images: [],
        index: null,
    });
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSubscribers, setShowSubscribers] = useState(false)


    const [isGroupCreated, setIsGroupCreated] = useState(false)

    useEffect(() => {
        setElementColors({
            iconColor: theme.text_first_color,
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
        document.body.style.background = theme.background_color;
    }, [theme]);

    const fetchGroupData = async () => {
        if (id) {
          try { 
            const groupDocRef = doc(db, 'groups', id, 'info', 'info');
            const docSnap = await getDoc(groupDocRef);
  
            if (docSnap.exists()) {
              const groupData = docSnap.data();
              setGroupData(groupData);
              console.log(groupData)
            } else {
              console.log("No such document!");
              setGroupData({
                isGroup: false,
                name: 'Группа не найдена',
                photo: '1',
                membersCount: 0,
                owner: null,
              });
            }
          } catch (error) {
            console.error('Error fetching group data:', error);
          }
        } else {
          console.error('ID группы не указан');
        }
      };

    useEffect(() => {
        fetchGroupData();
    }, [id]);

    useEffect(() => {
        if (!authUser?._id) return;
    
        const chatRef = doc(db, "chats", id);
        const unsubscribe = onSnapshot(chatRef, (docSnap) => {
            setIsGroupCreated(docSnap.exists());
        });
    
        return () => {
            unsubscribe();
        };
    }, [authUser, id]);
    

    const copyId = () => {
        navigator.clipboard.writeText(id)
            .then(() => {
                setSlipData({
                    isShow: true,
                    text: 'ID группы скопирован в буфер обмена',
                });
                console.log(groupData)
            })
            .catch((error) => {
                setSlipData({
                    isShow: true,
                    text: `Не удалось скопировать ID: ${error}`,
                });
            });
    };

    useEffect(() => {
        if (slipData.isShow) {
            const timer = setTimeout(() => {
                setSlipData({ isShow: false });
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [slipData.isShow]);

    const handleEditState = () => {
        setIsEdit(false);
        setSlipData({
            isShow: true,
            text: 'Изменения успешно сохранены',
        });
    };

    const handlePhotoClick = (photos) => {
        setViewData({
            isShow: true,
            images: photos,
            index: 0,
        });
    };

    const followUser = async () => {
        if (authUser._id) {
            const groupDocRef = doc(db, 'groups', id, 'info', 'info');
            const userGroupDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
    
            try {
                const userDocSnap = await getDoc(userGroupDocRef);
                const docSnap = await getDoc(groupDocRef);
                if (docSnap.exists()) {
                    let updatedMembers;
                    const members = docSnap.data().members || [];
    
                    if (members.includes(authUser._id)) {
                        // Удаляем пользователя из массива
                        updatedMembers = members.filter(member => member !== authUser._id);
                        if(userDocSnap.exists()){
                            await setDoc(userGroupDocRef, 
                                {mainGroup: null}, 
                                { merge: true });
                        }
                    } else {
                        // Добавляем пользователя в массив
                        updatedMembers = [...members, authUser._id];
                        if(userDocSnap.exists()){
                            await setDoc(userGroupDocRef, 
                                {mainGroup: id}, 
                                { merge: true });
                        }
                    }
    
                    await setDoc(groupDocRef, 
                        { 
                            members: updatedMembers 
                        }, 
                        { merge: true });
    
                    await fetchGroupData();
                } else {
                    console.error('No such document!');
                }
            } catch (error) {
                console.error("Error updating document: ", error);
            }
        }
    };

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
    }, [id]); // Добавляем зависимость от id
    
    const handleSend = async (text, images) => {
        // alert(text)
        try {
            // Получаем текущую временную метку
            const timestamp = new Date().toISOString();
            // Массив для хранения URL загруженных изображений
            let photoUrls = [];
        
            // Загружаем каждый файл изображения в Firebase Storage
            for (const image of images) {
              const storageRef = ref(storage, `groups_photo/${id}/${timestamp}_${image.name}`);
              await uploadBytes(storageRef, image);
              const photoUrl = await getDownloadURL(storageRef);
              photoUrls.push(photoUrl);
            }
        
            // Очищаем состояние после отправки
            // setText('');
            // setImages([]);
        
            // Сохраняем пост в Firestore
            await savePostToFirestore(text, photoUrls);
        
          } catch (error) {
            console.error("Error handling send: ", error);
          }
    }
    const savePostToFirestore = async (text, photosArray) => {
        try {
            const timestamp = new Date().toISOString();
            await addDoc(collection(db, 'posts'), {
                photos: photosArray,
                text: text,
                timestamp: timestamp,
                userId: id,
                groupOwnerId: groupData.owner,
                userName: groupData.name,
                userPhoto: groupData.photo,
                likesArray: [],
            });
            console.log("Message saved successfully.");
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };
    const openViewer = (photos, index) =>{
        setViewData({
            isShow: true,
            images: photos,
            index: index
        })
    }
    const closeAlert = () =>{
        setAlertProp({
            isShow: false,
        })
    }
    const deletePost = async (postId) =>{
        // alert(postId)
        setAlertProp({
            isShow: false,
        })
        try {
            await deleteDoc(doc(db, 'posts', postId));
        } catch (error) {
            console.error('Error deleting post: ', error);
        } finally{
            setSlipData({
                isShow: true,
                text: 'Пост удален'
            })
        }
        
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
    return (
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
            <AlertNotification
                title={alertProp.title}
                text={alertProp.text}
                isShow={alertProp.isShow}
                firstButtonName={alertProp.firstButtonName}
                secondButtonName={alertProp.secondButtonName}
                firstButtonOnClick={alertProp.firstButtonOnClick}
                secondButtonOnClick={alertProp.secondButtonOnClick}/>
            <SlipNotification
                isShow={slipData.isShow}
                text={slipData.text}/>
            {isEdit ? (
                <EditGroup handleEdit={handleEditState} fetchGroupData={fetchGroupData} id={groupData.userId} />
            ) : (
                <div className={styles['profile-container']}>
                    <div className={styles['cover-container']}>
                        <div
                            className={styles['cover']}
                            style={{ background: groupData.cover}}
                        >
                            <div className={styles['cover-pattern']}>
                                {/* <img src='/genery/'/> */}
                            </div>
                        </div>
                    </div>
                    <div
                        className={styles['group-photo']}
                        style={{ borderColor: theme.background_color }}
                    >
                        <img
                            src={groupData.photo}
                            onClick={() => handlePhotoClick(groupData.photo)}
                        />
                    </div>
                    <div
                        className={styles['group-actions']}
                        style={{ background: theme.element_first_color }}
                    >
                        <div className={styles['group-info']}>
                            <div
                                className={styles['group-name']}
                                style={{ color: theme.text_first_color }}
                            >
                                {groupData.name}
                            </div>
                            <button
                                className={styles['circle-button']}
                                style={{
                                    color: theme.text_third_color,
                                    background: theme.first_color,
                                }}
                                onClick={copyId}
                            >
                                #
                            </button>
                        </div>
                        <div
                            className={styles['group-description']}
                            style={{ color: theme.text_first_color }}
                        >
                            {groupData.description}
                        </div>
                        <div className={styles['button-container']}>
                            <button className={styles['quit-button']}
                                style={{
                                background: groupData.members && groupData.members.includes(authUser._id) ? theme.element_second_color : theme.first_color,
                                color: groupData.members && groupData.members.includes(authUser._id) ? theme.text_first_color : theme.text_third_color,
                                }}
                                onClick={followUser}>
                                {groupData.members && groupData.members.includes(authUser._id) ? 'Отписаться' : 'Подписаться'}
                            </button>
                            <button
                                className={styles['circle-button']}
                                style={{
                                    color: theme.text_first_color,
                                    background: theme.first_color,
                                }}
                                onClick={() => setIsEdit(true)}
                            >
                                <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 15 15"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M14.7563 3.36828C15.0812 3.04333 15.0812 2.50174 14.7563 2.19345L12.8066 0.243716C12.4983 -0.0812387 11.9567 -0.0812387 11.6317 0.243716L10.0986 1.7685L13.2232 4.89307M0 11.8754V15H3.12457L12.34 5.77628L9.21539 2.65171L0 11.8754Z"
                                        fill={theme.text_third_color}
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div
                        className={styles['item-body']}
                        style={{ 
                            // border: `2px solid ${theme.element_first_color}` ,
                            background: theme.first_color
                        }}
                        onClick={
                                isGroupCreated ? () => navigateTo(`/chat/${id}`)
                                : () => navigateTo(`/create-chat/${id}`)
                        }
                    >
                        <div className={styles['item-info']}>
                            <div
                                className={styles['item-name']}
                                style={{ color: theme.text_third_color }}
                            >
                                {isGroupCreated ? 'Открыть чат' : 'Создать чат'}
                            </div>
                        </div>
                        <div
                            className={styles['item-circle']}

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
                    <div
                        className={styles['item-body']}
                        style={{ border: `2px solid ${theme.element_first_color}` }}
                        onClick={() => navigateTo(`/subscribers/${id}?isGroup=true`)}
                    >
                        <div className={styles['item-info']}>
                            <div
                                className={styles['item-name']}
                                style={{ color: theme.text_first_color }}
                            >
                                Подписчики: {groupData.members ? groupData.members.length : 0}
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
                    <div
                        className={styles['item-body']}
                        style={{ border: `2px solid ${theme.element_first_color}` }}
                        onClick={() => navigateTo(`/timetable/${id}`)}
                    >
                        <div className={styles['item-info']}>
                            <div
                                className={styles['item-name']}
                                style={{ color: theme.text_first_color }}
                            >
                                Посмотреть расписание
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
                    <div
                        className={styles['item-body']}
                        style={{ border: `2px solid ${theme.element_first_color}` }}
                        onClick={() => navigateTo(`/download/${id}`)}
                    >
                        <div className={styles['item-info']}>
                            <div
                                className={styles['item-name']}
                                style={{ color: theme.text_first_color }}
                            >
                                Посмотреть файлы
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
                    <MessageInput
                        placeholder={'Что нового?'}
                        isPanelTop={false}
                        onSend={handleSend}
                        addFiles={true}/>
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
                </div> )}
        </div>
    );
}

export default AuthUserGroup;
