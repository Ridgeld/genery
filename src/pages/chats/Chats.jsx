import React, { useContext, useEffect, useState } from "react";
import styles from './Chats.module.scss'
import { ElementContext, useTheme } from '../../providers/ElementProvider.jsx';
import { useAuth } from "../../providers/Authprovired";
import { collection, doc, getDoc, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../../firebase.js";
import ChatBody from "./ChatBody.jsx";
import { useNavigate } from "react-router-dom";


export default function Chats() {
    const { authUser } = useAuth();
    const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);

    const [chats, setChats] = useState([])

    const navigateTo = useNavigate()



    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: false,
            arrowColor: theme.text_first_color,
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: true,
            footerBackground: theme.background_color,
            activeElementIndex: 2,
            background: theme.background_color
        });
        document.body.style.background = theme.background_color
    },[ElementContext]);


    // useEffect(() => {
    //     const unlisten = onSnapshot(
    //         query(collection(db, 'user', authUser._id, 'info', 'preferences')),
    //         snapshot => {
    //             const chats = [];
    
    //             snapshot.forEach((doc) => {
    //                 const chatData = doc.data();
    //                 chats.push({ id: doc.id, ...chatData });
    //             });
    
    //             setChats(chats);
    //         }
    //     );
    
    //     return () => {
    //         unlisten();
    //     };
    // }, []);
    useEffect(() => {
        if (!authUser?._id) return;
      
        const prefDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
        const unsubscribe = onSnapshot(prefDocRef, async (docSnap) => {
          if (!docSnap.exists()) {
            setChats([]);
            return;
          }
      
          const data = docSnap.data();
          const chatIds = data.chats || [];
      
          if (chatIds.length === 0) {
            setChats([]);
            return;
          }
      
          // Получаем данные чатов по их ID
          const chatRefs = chatIds.map((chatId) => doc(db, 'chats', chatId));
          const chatSnapshots = await Promise.all(chatRefs.map(getDoc));
      
          const chats = chatSnapshots
            .filter(chatSnap => chatSnap.exists())
            .map((chatSnap) => {
              const chatData = chatSnap.data();
              let chatName = "Неизвестный чат";
              let chatPhoto = "";
      
              // Если чат приватный, получаем данные собеседника из userData
              if (chatData.isPrivate && chatData.userData) {
                const otherUserId = Object.keys(chatData.userData).find(uid => uid !== authUser._id);
      
                if (otherUserId) {
                  const otherUserData = chatData.userData[otherUserId];
                  chatName = otherUserData?.name || "Неизвестный";
                  chatPhoto = otherUserData?.photo || "";
                }
              } else {
                // Для групповых чатов или если данных нет, берем стандартные поля
                chatName = chatData.name || chatName;
                chatPhoto = chatData.photo || chatPhoto;
              }
      
              return {
                id: chatSnap.id,
                name: chatName,
                photo: chatPhoto,
                ...chatData
              };
            });
      
          setChats(chats);
        });
      
        return () => {
          unsubscribe();
        };
      }, [authUser]);
      
      
      

    const handleChatClick = (id) => {
        navigateTo(`/chat/${id}`)
    }

    return (
        <div className={styles['container']}>
            {chats.map((chat) => (
                console.log(chat.name),
                <div className={styles['chat-body']}>
                    {chat.name}
                </div>,
                <ChatBody 
                    id={chat.id}
                    name={chat.name}
                    photo={chat.photo}
                    lastMessage={chat.lastMessage}
                    onClick={handleChatClick}/>
            ))}
        </div>
    );
}