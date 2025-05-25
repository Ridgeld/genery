import React, { useContext, useEffect, useState } from 'react';
import styles from './Chats.module.scss';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { useAuth } from "../../providers/Authprovired.jsx";
import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification.jsx';
import { collection, doc, getDoc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { useNavigate } from 'react-router-dom';
import LoadingPost from '../posts/LoadingPost.jsx';
import Post from '../posts/Post.jsx';
import ImageViewer from '../../components/modal-windows/image-viewer/ImageViewer.jsx';
import UserItem from '../../components/blocks/userItem/UserItem.jsx';
import ChatEdit from './ChatEdit.jsx';

function ChatInfo({ id, handleShowInfo }) {
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
    const [isEdit, setIsEdit] = useState(false)

    const [members, setMembers] = useState([])

  const navigateTo = useNavigate()
  useEffect(() => {
    setElementColors({
      iconColor: theme.text_first_color,
      titleColor: theme.text_first_color,
      showArrow: true,
      arrowLink: () => handleShowInfo(),
      arrowColor: theme.text_first_color,
      isHeaderBackground: false,
      headerBackground: theme.background_color,
      isHeader: true,
      isFooter: false,
      footerBackground: theme.background_color,
      activeElementIndex: 4,
    });
    document.body.style.background = theme.background_color;
  }, [theme, isEdit]);

  const fetchGroupData = async () => {
    if (!id) {
      console.error('ID группы не указан');
      return;
    }
  
    try {
      const chatDocRef = doc(db, 'chats', id);
      const docSnap = await getDoc(chatDocRef);
  
      if (!docSnap.exists()) {
        console.log("No such document!");
        setGroupData({
          isGroup: false,
          name: 'Группа не найдена',
          photo: '1',
          membersCount: 0,
          owner: null,
        });
        return;
      }
  
      const groupData = docSnap.data();
      setGroupData(groupData);
  
      // Получаем список участников группы
      const memberIds = groupData.members || [];
      if (memberIds.length === 0) {
        setMembers([]);
        return;
      }
  
      // Загружаем данные всех участников
      const memberRefs = memberIds.map((userId) => doc(db, 'users', userId, 'info', 'preferences'));
      const memberSnapshots = await Promise.all(memberRefs.map(getDoc));
  
      const membersData = memberSnapshots
        .filter((snap) => snap.exists())
        .map((snap) => ({ id: snap.id, ...snap.data() }));
  
      setMembers(membersData);
    } catch (error) {
      console.error('Error fetching group data:', error);
    }
  };
  
  useEffect(() => {
    fetchGroupData();
  }, [id]);
  

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

    const handleEditState = () => {
        setIsEdit(false);
        setSlipData({
            isShow: true,
            text: 'Изменения успешно сохранены',
        });
    };

    return isEdit ? (
        <ChatEdit 
            handleEdit={handleEditState}
            fetchGroupData={fetchGroupData}/>
    ) : (
        <div className={styles['info-container']}>
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
            <ImageViewer
                isShow={viewData.isShow}
                images={viewData.images}
                index={viewData.index}
                onClose={() => setViewData({ isShow: false })}
            />
            <SlipNotification isShow={slipData.isShow} text={slipData.text} />
            <button className={styles['add']} 
                style={{
                    background: theme.first_color
                }}
                onClick={() => setIsEdit(true)}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M14.7563 3.36828C15.0812 3.04333 15.0812 2.50174 14.7563 2.19345L12.8066 0.243716C12.4983 -0.0812387 11.9567 -0.0812387 11.6317 0.243716L10.0986 1.7685L13.2232 4.89307M0 11.8754V15H3.12457L12.34 5.77628L9.21539 2.65171L0 11.8754Z"
                            fill={theme.text_first_color}/>
                    </svg>
            </button>
            <div className={styles['cover-container']}>
                <div className={styles['cover']} style={{ background: groupData.cover }}>
                    <div className={styles['cover-pattern']} />
                </div>
            </div>
            <div className={styles['group-photo']} 
                style={{ borderColor: theme.background_color }}
                onClick={() => setViewData({ isShow: true, images: groupData.photo, index: 0 })}>
                <img src={groupData.photo || '/genery/public/1.png'} alt={`${groupData.name} photo`} />
            </div>
            <div className={styles['group-actions']} style={{ background: theme.element_first_color }}>
                <div className={styles['group-info']}>
                    <div className={styles['group-name']} style={{ color: theme.text_first_color }}>
                        {groupData.name}
                    </div>
                </div>
                <div className={styles['group-biography']} style={{ color: theme.text_second_color}}>
                    {groupData.description}
                </div>
            </div>
            <div className={styles['group-actions']} style={{ background: theme.element_first_color }}>
                <div className={styles['group-info']}>
                    <div className={styles['group-name']} style={{ color: theme.text_first_color }}>
                        Участники
                    </div>
                </div>
                <div className={styles['members-container']}>
                    {members.map((member) => (
                        <UserItem
                            key={member.id}
                            id={member.id}
                            name={member.name}
                            photo={member.photo}
                            onClick={() => navigateTo(`/profile/${member.uid}`)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
    
}

export default ChatInfo;
