import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './Chats.module.scss';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { useAuth } from "../../providers/Authprovired.jsx";
import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification.jsx';
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../../firebase.js';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import colorCircles from '../../themes/ColorCircles.js';
import UserItem from '../../components/blocks/userItem/UserItem.jsx';

function ChatEdit({ fetchGroupData, handleEdit}) {
    const { theme, elementColors, setElementColors } = useContext(ElementContext);
    const { authUser } = useAuth();
    const { id } = useParams(); // Получаем id группы из параметров маршрута
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [photo, setPhoto] = useState(null);
    const [cover, setCover] = useState('');
    const [userColors, setUserColors] = useState([]);
    const [slipData, setSlipData] = useState({
        isShow: false,
        text: ''
    });
    const [groupData, setGroupData] = useState([])

    const [members, setMembers] = useState([])
    const [selectedMembers, setSelectedMembers] = useState([]);

    useEffect(() => {
        const fetchGroupData = async () => {
          if (id) {
            try {
              const groupDocRef = doc(db, 'chats', id);
              const docSnap = await getDoc(groupDocRef);
    
              if (docSnap.exists()) {
                const groupData = docSnap.data();
                setCover(groupData.cover)
                setName(groupData.name)
                setDescription(groupData.description);
                // setPhoto(groupData.photo);

                setGroupData(groupData);
                console.log(groupData)
              } else {
                console.log("No such document!");
                // setGroupData({
                //   isGroup: false,
                //   name: 'Группа не найдена',
                //   photo: '1',
                //   membersCount: 0,
                //   owner: null,
                // });
              }
            } catch (error) {
              console.error('Error fetching group data:', error);
            }
          } else {
            console.error('ID группы не указан');
          }
        };
    
        fetchGroupData();
    }, [id]);

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
            arrowLink: () => handleEdit(),
            arrowColor: theme.text_first_color,
            isHeaderBackground: false,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: false,
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

    const handleDataChange = async () => {
        let photoUrl = null;
        const timestamp = new Date().toISOString();
        if (photo) {
            const storageRef = ref(storage, `chats_photo/${id}/${timestamp}_${photo.name}`);
            await uploadBytes(storageRef, photo);
            photoUrl = await getDownloadURL(storageRef);
        }
        if (id) {
            const groupDocRef = doc(db, 'chats', id);
            try {
                await setDoc(groupDocRef, 
                    { 
                        name: name, 
                        description: description, 
                        photo: photo ? photoUrl : groupData.photo,
                        cover: cover,
                        members: selectedMembers
                    }, 
                    { merge: true });
                        const allMembers = [...selectedMembers, authUser._id];
                    
                        const updateUserChats = allMembers.map(async (userId) => {
                            const userPrefRef = doc(db, 'users', userId, 'info', 'preferences');
                            await updateDoc(userPrefRef, {
                                chats: arrayUnion(id)
                            });
                        });
                    
                        await Promise.all(updateUserChats); // Дожидаемся всех обновлений
                await fetchGroupData();
                handleEdit();
            } catch (error) {
                console.error("Error updating document: ", error);
            }
        }
    };
    useEffect(() => {
        if (!id) return;
    
        const fetchGroupMembers = async () => {
            try {
                const groupInfoRef = doc(db, "groups", id, "info", "info");
                const groupInfoSnap = await getDoc(groupInfoRef);
    
                if (!groupInfoSnap.exists()) {
                    setMembers([]);
                    return;
                }
    
                const groupData = groupInfoSnap.data();
                const userIds = groupData.members || []; // Массив ID пользователей
    
                if (userIds.length === 0) {
                    setMembers([]);
                    return;
                }
    
                // Получаем данные пользователей по их ID
                const userRefs = userIds.map(userId => doc(db, "users", userId, "info", "preferences"));
                const userSnapshots = await Promise.all(userRefs.map(getDoc));
    
                const members = userSnapshots
                    .filter(userSnap => userSnap.exists())
                    .map(userSnap => {
                        const userData = userSnap.data();
                        return {
                            id: userData.uid,
                            name: userData.name || "Неизвестный",
                            photo: userData.photo || ""
                        };
                    });
    
                setMembers(members);
                console.log(members)
            } catch (error) {
                console.error("Ошибка при получении участников группы:", error);
                setMembers([]);
            }
        };
    
        fetchGroupMembers();
    }, [id]);

    const handleSelect = (id) => {
        setSelectedMembers((prev) =>
            prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
        );
    };

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
                            <div className={styles['active-circle']} style={{ borderColor: theme.text_first_color }}></div>
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
                            color: theme.text_first_color
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
                            color: theme.text_first_color
                        }}>Описание</div>
                    <input type='text' value={description} className={styles['input-data']}
                        style={{
                            color: theme.text_first_color,
                            caretColor: theme.first_color
                        }}
                        onChange={(e) => setDescription(e.target.value)}/>
                </div>
            </div>
            <div className={styles['group-actions']}
                    style={{
                        background: theme.element_first_color
                    }}>
                    <div className={styles['input-data-container']}>
                        <div className={styles['label']}
                            style={{
                                color: theme.text_first_color
                            }}>Добавить участников</div>
                            {/* <div className={styles['members-container']}>
                                {members.map((member) => {
                                    const isSelected = selectedMembers.includes(member.id);
                                    return (
                                        <UserItem
                                            key={member.id}
                                            id={member.id}
                                            name={member.name}
                                            photo={member.photo}
                                            isSelect={isSelected}
                                            onClick={() => handleSelect(member.id)}
                                        />
                                    );
                                })}
                            </div> */}
                            <div className={styles['members-container']}>
                                {members.map((member) => {
                                    const isSelected = selectedMembers.includes(member.id) || groupData.members?.includes(member.id);
                                    return (
                                        <UserItem
                                            key={member.id}
                                            id={member.id}
                                            name={member.name}
                                            photo={member.photo}
                                            isSelect={isSelected}
                                            onClick={() => handleSelect(member.id)}
                                        />
                                    );
                                })}
                            </div>
                    </div>
                    <div className={styles['button-container']}>
                        <button className={styles['quit-button']}
                            style={{
                                color: theme.text_first_color,
                                background: theme.first_color
                            }}
                            onClick={handleDataChange}>Сохранить</button>
                    </div>
                </div>
        </div>
    )
}

export default ChatEdit;
