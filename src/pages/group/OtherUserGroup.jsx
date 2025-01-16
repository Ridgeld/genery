// import React, { useContext, useEffect, useState } from 'react';
// import styles from './Group.module.scss';
// import { ElementContext } from '../../providers/ElementProvider.jsx';
// import { useAuth } from "../../providers/Authprovired.jsx";
// import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification.jsx';
// import { doc, getDoc } from 'firebase/firestore';
// import { db } from '../../../firebase.js';

// function OtherUserGroup({id}){
//     const { theme, elementColors, setElementColors } = useContext(ElementContext);
//     // const { authUser } = useAuth();
//     const [groupData, setGrouprData] = useState({
        
//     })
//     const [slipData, setSlipData] = useState({
//         isShow: false,
//         text: ''
//     });
//     useEffect(() => {
//         setElementColors({
//             iconColor: theme.icon_color,
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

//     useEffect(() => {
//         const fetchUserPreferences = async () => {
//             if (id) {
//                 const userDocRef = doc(db, 'users', id, 'info', 'preferences');
//                 const docSnap = await getDoc(userDocRef);

//                 if (docSnap.exists()) {
//                     const userData = docSnap.data();
//                     console.log(userData);
//                     setUserData({
//                         isUser: true,
//                         name: userData.name,
//                         biography: userData.biography,
//                         photo: userData.photo
//                     })
//                 } else {
//                     console.log("No such document!");
//                     setUserData({
//                         isUser: false,
//                         name: 'Пользователь не найден',
//                         biography: ''
//                     })
//                 }
//             } else {
//                 console.error('authUser or authUser._id is undefined');
//             }
//         };

//         fetchUserPreferences();
//     }, [id])
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

//     return(
//         <div className={styles.container}>
//             <SlipNotification
//                 isShow={slipData.isShow}
//                 text={slipData.text}/>
//             <div className={styles['cover-container']}>
//                 <div className={styles['cover']}
//                     style={{
//                         background: 'var(--first-color)'
//                     }}>
//                     <div className={styles['cover-pattern']}>
//                     {/* <img src='/genery/'/> */}
//                     </div>
//                 </div>
//             </div>
//             <div className={styles['user-photo']}
//                 style={{
//                     borderColor: theme.background_color
//                 }}>
//                 <img src='/genery/public/1.png'/>
//             </div> 
//             {userData.isUser ?
//                     <div className={styles['user-actions']}
//                         style={{
//                             background: theme.element_first_color
//                         }}>
//                         <div className={styles['user-info']}>
//                             <div className={styles['user-name']}
//                                 style={{
//                                     color: theme.text_first_color
//                                 }}>{userData.name}</div>
//                             {/* <button className={styles['circle-button']}
//                                 style={{
//                                     color: 'var(--text-first-color)',
//                                     background: 'var(--first-color)'
//                                 }}
//                                 onClick={copyId}>#</button> */}
                            
//                         </div>
//                         <div className={styles['user-biography']}
//                             style={{
//                                 color: theme.text_first_color
//                             }}>{userData.biography}</div>
//                         <div className={styles['button-container']}>
//                             <button className={styles['quit-button']}
//                                 style={{
//                                     background: theme.first_color,
//                                     color: theme.text_first_color
//                                 }}>Подписаться</button>
//                         </div>
//                     </div> 
//                 :
//                     <div className={styles['user-actions']}
//                         style={{
//                             background: theme.element_first_color
//                         }}>
//                         <div className={styles['user-info']}>
//                             <div className={styles['user-name']}
//                                 style={{
//                                     color: theme.text_first_color
//                                 }}>{userData.name}</div>                        
//                         </div>
//                     </div>}
//         </div>
//     )
// }
// export default OtherUserGroup
import React, { useContext, useEffect, useState } from 'react';
import styles from './Group.module.scss';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { useAuth } from "../../providers/Authprovired.jsx";
import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification.jsx';
import { collection, doc, getDoc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { useNavigate } from 'react-router-dom';
import LoadingPost from '../posts/LoadingPost.jsx';
import Post from '../posts/Post.jsx';
import ImageViewer from '../../components/modal-windows/image-viewer/ImageViewer.jsx';

function OtherUserGroup({ id }) {
  const { theme, setElementColors } = useContext(ElementContext);
  const { authUser } = useAuth();
  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    photo: '',
    cover: '',
    balance: 0,
    members: [], // Добавлено
    });
  const [slipData, setSlipData] = useState({
    isShow: false,
    text: ''
  });
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewData, setViewData] = useState({
    isShow: false,
    images: [],
    index: null,
});

  const navigateTo = useNavigate()
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
  useEffect(() =>{
    fetchGroupData();
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
      <SlipNotification isShow={slipData.isShow} text={slipData.text} />
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
      <div className={styles['group-photo']}
        style={{
          borderColor: theme.background_color
        }}>
        <img src={groupData.photo || '/genery/public/1.png'} alt={`${groupData.name} photo`} />
      </div>
      <div className={styles['group-actions']}
        style={{
          background: theme.element_first_color
        }}>
        <div className={styles['group-info']}>
          <div className={styles['group-name']}
            style={{
              color: theme.text_first_color
            }}>{groupData.name}</div>
        </div>
        <div className={styles['group-biography']}
          style={{
            color: theme.text_first_color
          }}>{groupData.description}</div>
        <div className={styles['button-container']}>
          <button className={styles['quit-button']}
            style={{
              background: groupData.members.includes(authUser._id) ? theme.element_second_color : theme.first_color,
              color: theme.text_first_color
            }}
            onClick={followUser}>
            {groupData.members && groupData.members.includes(authUser._id) ? 'Отписаться' : 'Подписаться'}
          </button>
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
                        fill={theme.text_first_color}
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
                        fill={theme.text_first_color}
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
                        fill={theme.text_first_color}
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
  );
}

export default OtherUserGroup;
