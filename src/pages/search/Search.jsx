import React, { useContext, useEffect, useState } from 'react';
import styles from './Search.module.scss';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import  SearchInput from '../../components/inputs/searchInput/SearchInput.jsx';
import SearchItem from '../../components/blocks/search-item/SearchItem.jsx';
import { useAuth } from "../../providers/Authprovired.jsx";
import {doc, addDoc, collection, onSnapshot, deleteDoc,getDoc, getDocs, orderBy, query  } from "firebase/firestore"; 
import { db, storage } from '../../../firebase.js';
import { getDownloadURL, ref } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import SkeletonLoader from '../../components/loaders/skeleton-loader/Skeleton.jsx';

function Search(){
    const { theme, elementColors, setElementColors } = useContext(ElementContext);
    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: false,
            arrowLink: '#/list-menu',
            arrowColor: theme.text_first_color,
            isHeaderBackground: false,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: true,
            footerBackground: theme.background_color,
            activeElementIndex: 1,
        });
        document.body.style.background = theme.background_color
    },[theme]);
    
    const { authUser } = useAuth();
    const [groups, setGroups] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false)
    const navigateTo = useNavigate();

    const onClick = (value) =>{
        alert(value)
    }
    const handleItemClick = (id) => {
      navigateTo(`/group/${id}`); // Переход на страницу группы с ID
    };
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
          // let photoUrl = '';
          // if (info.photo) {
          //   const photoRef = ref(storage, info.photo);
          //   photoUrl = await getDownloadURL(photoRef);
          // }
          groupData.push({
            id: groupId,
            name: info.name,
            photo: info.photo,
            membersCount: info.members ? info.members.length : 0
          });
        }
      }));
    
      // Сортировка по количеству членов в порядке убывания
      groupData.sort((a, b) => b.membersCount - a.membersCount);
    
      return groupData;
    };
    
    
    useEffect(() => {
      const fetchData = async () => {
        try {
          setIsLoading(true)
          const fetchedGroups = await fetchGroups();
          setGroups(fetchedGroups);
        } catch (error) {
          console.error('Error fetching groups:', error);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchData();
    }, []);
    const handleSearchChange = (e) => {
      setSearchQuery(e.target.value);
    };
  
    const filteredGroups = groups.filter(group =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return(
        <div className={styles['container']}>
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
            <SearchInput 
              value={searchQuery}
              onChange={handleSearchChange}/>
            <div className={styles['search-container']}>
            {/* {filteredGroups.map((item, index) => (
                  <div key={group.id} className="group-item">
                    <img src={group.photo} alt={`${group.name} photo`} />
                    <h3>{group.name}</h3>
                    <p>Members: {group.membersCount}</p>
                    <p>ID: {group.id}</p> {/* Добавляем отображение ID */}
                  {/* </div>
                  <SearchItem
                    key={index} 
                    id={item.id}
                    name={item.name}
                    photo={item.photo}
                    onClick={handleItemClick}/>
                ))} */} 
              {isLoading ?  
                      (
                        Array.from({ length: 2 }).map((_, index) => (
                          <div className={styles['empty-body']}
                              style={{
                                  borderTop: `1px solid ${theme.element_first_color}`,
                              }}>
                              <div className={styles['empty-photo']}>
                                  <SkeletonLoader height={'30px'} width={'30px'} shape={'circle'}/>
                              </div>
                              <div className={styles['empty-info']}>
                                  <div className={styles['empty-name']}
                                      style={{
                                          color: theme.text_first_color
                                      }}>
                                      <SkeletonLoader height={'10px'} width={'100px'} shape={'rect'}/>
                                      </div>
                              </div>
                            </div>
                        ))
                      ) : (
                      filteredGroups.map((item, index) => (
                        <SearchItem
                          key={index} 
                          id={item.id}
                          name={item.name}
                          photo={item.photo}
                          onClick={handleItemClick}/>
                      )))

              }
            </div>
            <button className={styles['add']}
              style={{
                background: theme.first_color
              }}
              onClick={() => navigateTo('/create-group')}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 9H9M17 9L9 9M9 9V1M9 9L9 17" stroke={theme.text_first_color} stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        </div>
    )
}
export default Search