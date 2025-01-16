// import React, { useContext, useEffect, useState } from 'react';
// import styles from './Search.module.scss';
// import { ElementContext } from '../../providers/ElementProvider.jsx';
// import  SearchInput from '../../components/inputs/searchInput/SearchInput.jsx';
// import SearchItem from '../../components/blocks/search-item/SearchItem.jsx';
// import { useAuth } from "../../providers/Authprovired.jsx";
// import {doc, addDoc, collection, onSnapshot, deleteDoc,getDoc, getDocs, orderBy, query  } from "firebase/firestore"; 
// import { db, storage } from '../../../firebase.js';
// import { getDownloadURL, ref } from 'firebase/storage';
// import { useNavigate } from 'react-router-dom';
// import SkeletonLoader from '../../components/loaders/skeleton-loader/Skeleton.jsx';

// function Search(){
//     const { theme, elementColors, setElementColors } = useContext(ElementContext);
//     useEffect(() => {
//         setElementColors({
//             iconColor: theme.icon_color,
//             titleColor: theme.text_first_color,
//             showArrow: false,
//             arrowLink: () => navigateTo('/menu'),
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
//     const navigateTo = useNavigate();

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
//       group.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
//       group.id.toLowerCase().includes(searchQuery.toLowerCase())
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
//               placeholder={'Поиск группы'}/>
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
// export default Search
import React, { useContext, useEffect, useState } from 'react';
import styles from './Search.module.scss';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import SearchInput from '../../components/inputs/searchInput/SearchInput.jsx';
import SearchItem from '../../components/blocks/search-item/SearchItem.jsx';
import { useAuth } from "../../providers/Authprovired.jsx";
import { doc, getDocs, collection, getDoc, collectionGroup } from "firebase/firestore"; 
import { db } from '../../../firebase.js';
import { useNavigate } from 'react-router-dom';
import SkeletonLoader from '../../components/loaders/skeleton-loader/Skeleton.jsx';

function Search() {
    const { theme, setElementColors } = useContext(ElementContext);
    const { authUser } = useAuth();
    const [items, setItems] = useState([]); // Объединенный массив для групп и пользователей
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigateTo = useNavigate();

    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: false,
            arrowLink: () => navigateTo('/home'),
            arrowColor: theme.text_first_color,
            isHeaderBackground: false,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: true,
            footerBackground: theme.background_color,
            activeElementIndex: 1,
        });
        document.body.style.background = theme.background_color;
    }, [theme]);

    const fetchGroups = async () => {
        const groupsCollection = collection(db, 'groups');
        const groupDocs = await getDocs(groupsCollection);
        const groupData = [];

        await Promise.all(groupDocs.docs.map(async (groupDoc) => {
            const groupId = groupDoc.id;
            const infoDocRef = doc(db, 'groups', groupId, 'info', 'info');
            const infoDoc = await getDoc(infoDocRef);

            if (infoDoc.exists()) {
                const info = infoDoc.data();
                groupData.push({
                    id: groupId,
                    name: info.name,
                    photo: info.photo,
                    membersCount: info.members ? info.members.length : 0,
                    isGroup: true // Помечаем, что это группа
                });
            }
        }));

        groupData.sort((a, b) => b.membersCount - a.membersCount);
        return groupData;
    };


// const fetchUsers = async () => {
//   const usersCollection = collection(db, 'users');
//   const userDocs = await getDocs(usersCollection);
//   const userData = [];

//   await Promise.all(userDocs.docs.map(async (userDoc) => {
//       const userId = userDoc.id; // ID текущего пользователя
//       const preferencesDocRef = doc(db, 'users', userId, 'info', 'preferences'); // Ссылка на документ "preferences"
//       const preferencesDoc = await getDoc(preferencesDocRef);

//       if (preferencesDoc.exists()) {
//           const preferences = preferencesDoc.data();
//           userData.push({
//               id: userId,
//               name: preferences.name || 'Без имени',
//               photo: preferences.photo || '',
//               followersCount: preferences.followers ? preferences.followers.length : 0,
//               isUser: true // Помечаем, что это пользователь
//           });
//       }
//   }));

//   userData.sort((a, b) => b.followersCount - a.followersCount); // Сортируем по количеству подписчиков
//   return userData;
// };

// const getUsers = async() =>{
//   // Query a reference to a subcollection
//   console.log(authUser._id)
//   const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
//   const userSnapshot = await getDoc(userDocRef);
  
//   if (userSnapshot.exists()) {
//       console.log('User data:', userSnapshot.data());
//   } else {
//       console.error('User not found');
//   }
// }
// getUsers()
const fetchUsers = async () => {
    try {
        const preferencesCollection = collectionGroup(db, 'info'); // Запрос по всем подколлекциям 'info'
        const querySnapshot = await getDocs(preferencesCollection);
        const userData = []

        if (!querySnapshot.empty) {
            const users = querySnapshot.docs
                .filter((doc) => doc.id === 'preferences' && doc.ref.path.includes('users/')) // Фильтруем документы, id которых равно 'preferences' и они находятся в подкатегории 'users/'
                .map((doc) => (
                    userData.push({
                        id: doc.data().uid, // id будет 'preferences'
                        name: doc.data().name, // Имя пользователя
                        photo: doc.data().photo, // Фото пользователя
                        membersCount: doc.data().followers ? doc.data().followers.length : 0,
                        isGroup: false
                    })
                ));
            console.log('Users:', userData);
            userData.sort((a, b) => b.membersCount - a.membersCount);
            return userData;
        } else {
            console.error('No users found');
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
};

// fetchUsers();

// fetchUsers()


 

  

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const fetchedGroups = await fetchGroups();
                // const fetchedUsers = await fetchUsers();
                // Объединяем группы и пользователей в один массив
                setItems([...fetchedGroups]);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleItemClick = (id, isGroup) => {
        if (isGroup) {
            navigateTo(`/group/${id}`); // Переход на страницу группы
        } else {
            navigateTo(`/profile/${id}`); // Переход на страницу пользователя
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
                  cursor: pointer;
                }
                ::-webkit-scrollbar-track {
                  background-color: rgba(0, 0, 0, 0.3);
                }
            `}</style>
            <div className={styles['search-input-container']}
                style={{
                    background: theme.background_color
                }}>
                <SearchInput
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={'Поиск группы или пользователя'}
                />
            </div>
            <div className={styles['search-container']}>
                {isLoading ? (
                    Array.from({ length: 2 }).map((_, index) => (
                        <div key={index} className={styles['empty-body']} style={{
                            borderTop: `1px solid ${theme.element_first_color}`,
                        }}>
                            <div className={styles['empty-photo']}>
                                <SkeletonLoader height={'30px'} width={'30px'} shape={'circle'} />
                            </div>
                            <div className={styles['empty-info']}>
                                <div className={styles['empty-name']} style={{
                                    color: theme.text_first_color
                                }}>
                                    <SkeletonLoader height={'10px'} width={'100px'} shape={'rect'} />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    filteredItems.map((item, index) => (
                        <SearchItem
                            key={index}
                            id={item.id}
                            name={item.name}
                            photo={item.photo}
                            onClick={() => handleItemClick(item.id, item.isGroup)} // Передаем isGroup для различия
                        />
                    ))
                )}
            </div>
            <button className={styles['add']}
                style={{
                    background: theme.first_color
                }}
                onClick={() => navigateTo('/create-group')}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 9H9M17 9L9 9M9 9V1M9 9L9 17" stroke={theme.text_first_color} strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </button>
        </div>
    );
}

export default Search;
