// import React, { useContext, useEffect, useState } from 'react';
// import styles from './Subscribers.module.scss';
// import { ElementContext } from '../../providers/ElementProvider.jsx';
// import  SearchInput from '../../components/inputs/searchInput/SearchInput.jsx';
// import SearchItem from '../../components/blocks/search-item/SearchItem.jsx';
// import { useAuth } from "../../providers/Authprovired.jsx";
// import {doc, addDoc, collection, onSnapshot, deleteDoc,getDoc, getDocs, orderBy, query  } from "firebase/firestore"; 
// import { db, storage } from '../../../firebase.js';
// import { getDownloadURL, ref } from 'firebase/storage';
// import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
// import SkeletonLoader from '../../components/loaders/skeleton-loader/Skeleton.jsx';

// function Subscribers({}){
//     const { theme, elementColors, setElementColors } = useContext(ElementContext);
//     const navigateTo = useNavigate();
//     const { id } = useParams()
//     const [searchParams] = useSearchParams();
//     const isGroup = searchParams.get('isGroup') === 'true';
//     // const { id } = useParams()

//     useEffect(() => {
//         setElementColors({
//             iconColor: theme.icon_color,
//             titleColor: theme.text_first_color,
//             showArrow: true,
//             arrowLink: isGroup ? () => navigateTo(`/group/${id}`) : () => navigateTo(`/profile/${id}`),
//             arrowColor: theme.text_first_color,
//             isHeaderBackground: false,
//             headerBackground: theme.background_color,
//             isHeader: true,
//             isFooter: true,
//             footerBackground: theme.background_color,
//             activeElementIndex: 1,
//         });
//         document.body.style.background = theme.background_color
//     },[theme]);
    
//     const { authUser } = useAuth();
//     const [groups, setGroups] = useState([]);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [isLoading, setIsLoading] = useState(false)

//     const onClick = (value) =>{
//         alert(value)
//     }

//     const handleItemClick = (id) => {
//       navigateTo(`/group/${id}`); // Переход на страницу группы с ID
//     };
//     const fetchGroups = async () => {
//       const groupsCollection = collection(db, 'groups');
//       const groupDocs = await getDocs(groupsCollection);
//       const groupData = [];
    
//       await Promise.all(groupDocs.docs.map(async (groupDoc) => {
//         const groupId = groupDoc.id;
//         const infoDocRef = doc(db, 'groups', groupId, 'info', 'info');
//         const infoDoc = await getDoc(infoDocRef);
    
//         if (infoDoc.exists()) {
//           const info = infoDoc.data();
//           // let photoUrl = '';
//           // if (info.photo) {
//           //   const photoRef = ref(storage, info.photo);
//           //   photoUrl = await getDownloadURL(photoRef);
//           // }
//           groupData.push({
//             id: groupId,
//             name: info.name,
//             photo: info.photo,
//             membersCount: info.members ? info.members.length : 0
//           });
//         }
//       }));
    
//       // Сортировка по количеству членов в порядке убывания
//       groupData.sort((a, b) => b.membersCount - a.membersCount);
    
//       return groupData;
//     };
    
    
//     useEffect(() => {
//       const fetchData = async () => {
//         try {
//           setIsLoading(true)
//           const fetchedGroups = await fetchGroups();
//           setGroups(fetchedGroups);
//         } catch (error) {
//           console.error('Error fetching groups:', error);
//         } finally {
//           setIsLoading(false);
//         }
//       };
  
//       fetchData();
//     }, []);
//     const handleSearchChange = (e) => {
//       setSearchQuery(e.target.value);
//     };
  
//     const filteredGroups = groups.filter(group =>
//       group.name.toLowerCase().includes(searchQuery.toLowerCase())
//     )
//     return(
//         <div className={styles['container']}>
//             <style>{`
//                 ::-webkit-scrollbar {
//                   width: 10px; /* Ширина ползунка */
//                 }

//                 /* Стилизация ползунка скроллбара */
//                 ::-webkit-scrollbar-thumb {
//                   background: ${theme.first_color}; /* Цвет ползунка */
//                   border-radius: 5px; /* Закругление углов ползунка */
//                   cursor: pointer;
//                 }

//                 /* Стилизация фона скроллбара */
//                 ::-webkit-scrollbar-track {
//                   background-color: rgba($color: #000000, $alpha: 0.3); /* Цвет фона */
//                 }
//             `}</style>
//             <SearchInput 
//               value={searchQuery}
//               onChange={handleSearchChange}
//               placeholder={'Подписчики'}/>
//             <div className={styles['search-container']}>
//             {/* {filteredGroups.map((item, index) => (
//                   <div key={group.id} className="group-item">
//                     <img src={group.photo} alt={`${group.name} photo`} />
//                     <h3>{group.name}</h3>
//                     <p>Members: {group.membersCount}</p>
//                     <p>ID: {group.id}</p> {/* Добавляем отображение ID */}
//                   {/* </div>
//                   <SearchItem
//                     key={index} 
//                     id={item.id}
//                     name={item.name}
//                     photo={item.photo}
//                     onClick={handleItemClick}/>
//                 ))} */} 
//               {isLoading ?  
//                       (
//                         Array.from({ length: 2 }).map((_, index) => (
//                           <div className={styles['empty-body']}
//                               style={{
//                                   borderTop: `1px solid ${theme.element_first_color}`,
//                               }}>
//                               <div className={styles['empty-photo']}>
//                                   <SkeletonLoader height={'30px'} width={'30px'} shape={'circle'}/>
//                               </div>
//                               <div className={styles['empty-info']}>
//                                   <div className={styles['empty-name']}
//                                       style={{
//                                           color: theme.text_first_color
//                                       }}>
//                                       <SkeletonLoader height={'10px'} width={'100px'} shape={'rect'}/>
//                                       </div>
//                               </div>
//                             </div>
//                         ))
//                       ) : (
//                       filteredGroups.map((item, index) => (
//                         <SearchItem
//                           key={index} 
//                           id={item.id}
//                           name={item.name}
//                           photo={item.photo}
//                           onClick={handleItemClick}/>
//                       )))

//               }
//             </div>
//             <button className={styles['add']}
//               style={{
//                 background: theme.first_color
//               }}
//               onClick={() => navigateTo('/create-group')}>
//                 <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M1 9H9M17 9L9 9M9 9V1M9 9L9 17" stroke={theme.text_first_color} stroke-width="2" stroke-linecap="round"/>
//                 </svg>
//             </button>
//         </div>
//     )
// }
// export default Subscribers
import React, { useContext, useEffect, useState } from 'react';
import styles from './Subscribers.module.scss';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import SkeletonLoader from '../../components/loaders/skeleton-loader/Skeleton.jsx';
import { db } from '../../../firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../providers/Authprovired.jsx';
import SearchInput from '../../components/inputs/searchInput/SearchInput.jsx';
import UserItem from '../../components/blocks/userItem/UserItem.jsx';
import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification.jsx';

function Subscribers() {
    const { theme, elementColors, setElementColors } = useContext(ElementContext);
    const navigateTo = useNavigate();
    const [searchParams] = useSearchParams();
    // const id = searchParams.get('id');
    const { id } = useParams();
    const { authUser } = useAuth();
    const isGroup = searchParams.get('isGroup') === 'true';

    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [canDelete, setCanDelete] = useState(false);

    const [slipData, setSlipData] = useState({
        isShow: false,
        text: ''
    });

    // Функция для получения данных
    const fetchData = async () => {
        try {
            setIsLoading(true);
            if (!id) {
                console.error('ID не найден в параметрах запроса');
                return;
            }

            // Ссылка на документ с информацией
            const infoDocRef = doc(
                db,
                isGroup ? 'groups' : 'users',
                id,
                'info',
                isGroup ? 'info' : 'preferences'
            );
            const infoDocSnapshot = await getDoc(infoDocRef);

            if (infoDocSnapshot.exists()) {
                const data = infoDocSnapshot.data();
                const ids = isGroup ? data.members : data.followers || [];
                const ownerId = isGroup ? data.owner : data.uid
                if(ownerId === authUser._id) {
                    setCanDelete(true);
                }
                // Загрузка информации для каждого пользователя
                const userData = await Promise.all(
                    ids.map(async (userId) => {
                        const userInfoRef = doc(db, 'users', userId, 'info', 'preferences');
                        const userInfoSnapshot = await getDoc(userInfoRef);

                        if (userInfoSnapshot.exists()) {
                            const info = userInfoSnapshot.data();
                            return {
                                uid: userId,
                                name: info.name || 'Без имени',
                                photo: info.photo || '',
                            };
                        }
                        return null;
                    })
                );

                setUsers(userData.filter(Boolean)); // Исключаем null-значения
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowLink: isGroup ? () => navigateTo(`/group/${id}`) : () => navigateTo(`/profile/${id}`),
            arrowColor: theme.text_first_color,
            isHeaderBackground: false,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: true,
            footerBackground: theme.background_color,
            activeElementIndex: 4,
        });
        document.body.style.background = theme.background_color;
    }, [theme, id, isGroup, navigateTo]);

    useEffect(() => {
        fetchData();
    }, [id, isGroup]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const removeUserFromSubscribers = async (userId, userName) => {
        try {
            // Если мы в группе
            if (isGroup) {
                const groupDocRef = doc(db, 'groups', id, 'info', 'info');
                const groupDocSnap = await getDoc(groupDocRef);
    
                if (groupDocSnap.exists()) {
                    const groupData = groupDocSnap.data();
                    const updatedMembers = groupData.members.filter(memberId => memberId !== userId);
                    
                    await setDoc(groupDocRef, { members: updatedMembers }, { merge: true });
                    setSlipData({
                        isShow: true,
                        text: `Вы удалили ${userName} из подписчиков `
                    })
                    fetchData();
                    console.log(`Пользователь ${userId} удалён из группы`);
                }
            } else {
                // Если мы находимся в профиле пользователя
                const userDocRef = doc(db, 'users', id, 'info', 'preferences');
                const userDocSnap = await getDoc(userDocRef);
    
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const updatedFollowers = userData.subscribers.filter(followerId => followerId !== userId);
                    
                    await setDoc(userDocRef, { followers: updatedFollowers }, { merge: true });
                    setSlipData({
                        isShow: true,
                        text: `Вы удалили ${userName} из подписчиков `
                    })
                    fetchData();
                    console.log(`Пользователь ${userId} удалён из подписчиков`);
                }
            }
        } catch (error) {
            console.error('Ошибка при удалении пользователя:', error);
        }
    };
    

    return (
        <div className={styles['container']}>
            <style>{`
                ::-webkit-scrollbar {
                    width: 10px;
                }
                ::-webkit-scrollbar-thumb {
                    background: ${theme.first_color};
                    border-radius: 5px;
                }
                ::-webkit-scrollbar-track {
                    background-color: rgba(0, 0, 0, 0.3);
                }
            `}</style>
            <SlipNotification
                isShow={slipData.isShow}
                text={slipData.text}/>
            <SearchInput
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={'Подписчики'}
            />
            <div className={styles['search-container']}>
                {isLoading
                    ? Array.from({ length: 2 }).map((_, index) => (
                          <div
                              key={index}
                              className={styles['empty-body']}
                              style={{ borderTop: `1px solid ${theme.element_first_color}` }}
                          >
                              <div className={styles['empty-photo']}>
                                  <SkeletonLoader height={'30px'} width={'30px'} shape={'circle'} />
                              </div>
                              <div className={styles['empty-info']}>
                                  <div
                                      className={styles['empty-name']}
                                      style={{ color: theme.text_first_color }}
                                  >
                                      <SkeletonLoader height={'10px'} width={'100px'} shape={'rect'} />
                                  </div>
                              </div>
                          </div>
                      ))
                    : filteredUsers.map((user, index) => (
                          <UserItem
                              key={index}
                              id={user.uid}
                              name={user.name}
                              photo={user.photo}
                              canDelete={canDelete}
                              removeUser={removeUserFromSubscribers}
                              onClick={() => navigateTo(`/profile/${user.uid}`)}
                          />
                      ))}
            </div>
        </div>
    );
}

export default Subscribers;
