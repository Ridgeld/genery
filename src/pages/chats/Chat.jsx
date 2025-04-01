import React, { useContext, useEffect, useState } from "react";
import styles from './Chats.module.scss'
import { useNavigate, useParams } from "react-router-dom";
import { arrayUnion, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { db, storage } from "../../../firebase";
import { ElementContext, useTheme } from '../../providers/ElementProvider.jsx';
import ChatHeader from "../../components/chatHeader/ChatHeader.jsx";
import Message from "../../components/messages/Message.jsx";
import MessageInput from "../../components/inputs/messageInput/MessageInput.jsx";
import { useAuth } from "../../providers/Authprovired.jsx";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import ImageViewer from "../../components/modal-windows/image-viewer/ImageViewer.jsx";
import LoadingMessage from "../../components/messages/LoadingMessage.jsx";
import SkeletonLoader from "../../components/loaders/skeleton-loader/Skeleton.jsx";
import ChatInfo from "./ChatInfo.jsx";
import ChatEdit from "./ChatEdit.jsx";
import SlipNotification from "../../components/notifictions/SlipNotification/SlipNotification.jsx";

export default function Chat({}) {
    const {theme, setElementColors } = useContext(ElementContext);

    const { id } = useParams();

    const { authUser } = useAuth()

    const navigateTo = useNavigate()

    const [chat, setChat] = useState([])
    const [messages, setMessages] = useState([])

    const [isNewChat, setIsNewChat] = useState(false)

    const [isUser, setIsUser] = useState(true)


    const [viewData, setViewData] = useState({
        isShow: false,
        images: [],
        index: null

    })  
    const [slipData, setSlipData] = useState({
        isShow: false,
        text: '',
    });
    const [showInfo, setShowInfo] = useState(false);
    const [isEdit, setIsEdit] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowLink: () => navigateTo('/chats'),
            arrowColor: theme.text_first_color,
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: false,
            isFooter: false,
            footerBackground: theme.background_color,
            activeElementIndex: 2,
            background: theme.background_color
        });
        document.body.style.background = theme.background_color
    },[ElementContext]);

    // useEffect(() => {
    //     if (!id) return;
    
    //     const unlisten = onSnapshot(
    //         doc(db, 'chats', id),
    //         (doc) => {
    //             if (doc.exists()) {
    //                 setChat({ id: doc.id, ...doc.data() });
    //             } else {
    //                 setChat(null);
    //             }
    //         }
    //     );
    
    //     return () => {
    //         unlisten();
    //     };
    // }, [id]);
    // useEffect(() => {
    //     if (!id) return;
    
    //     const fetchChat = async () => {
    //       // Подписка на чат
    //       const chatRef = doc(db, "chats", id);
    //       const unsubscribe = onSnapshot(chatRef, (docSnap) => {
    //         if (docSnap.exists()) {
    //           setChat({ id: docSnap.id, ...docSnap.data() });
    //         } else {
    //           // Если чат не найден, ищем пользователя
    //           const userRef = doc(db, "users", id, "info", "preferences");
    //           getDoc(userRef)
    //             .then((userDoc) => {
    //               if (userDoc.exists()) {
    //                 const userData = userDoc.data();
    //                 setIsNewChat(true)
    //                 setChat({
    //                   id: id,
    //                   name: userData.name || name || "Не найден",
    //                   photo: userData.photo || photo || "",
    //                 });
    //               } else {
    //                 // Если пользователя нет, показываем "Не найден"
    //                 setChat({
    //                   id: id,
    //                   name: "Не найден",
    //                   photo: "",
    //                 });
    //               }
    //             })
    //             .catch((error) => {
    //               console.error("Error getting user:", error);
    //               setChat({
    //                 id: id,
    //                 name: "Не найден",
    //                 photo: "",
    //               });
    //             });
    //         }
    //       });
    
    //       // Очистка подписки при выходе
    //       return () => {
    //         unsubscribe();
    //       };
    //     };
    
    //     fetchChat();
    //   }, [id]);

    useEffect(() => {
        if (!id) return;
    
        const fetchChat = async () => {
            const chatRef = doc(db, "chats", id);
            const unsubscribe = onSnapshot(chatRef, (docSnap) => {
                if (docSnap.exists()) {
                    const chatData = docSnap.data();
    
                    if (chatData.isPrivate && chatData.userData) {
                        // Определяем ID текущего пользователя
                        const currentUserId = authUser._id;
    
                        // Определяем ID второго пользователя
                        const [firstUserId, secondUserId] = id.split("_");
                        setIsUser(true);
                        const otherUserId = currentUserId === firstUserId ? secondUserId : firstUserId;
    
                        // Получаем данные второго пользователя
                        const otherUserData = chatData.userData[otherUserId] || {};
    
                        setChat({
                            id: docSnap.id,
                            userId: otherUserId, // Записываем ID второго пользователя
                            name: otherUserData.name || "Не найден",
                            photo: otherUserData.photo || "",
                            ...chatData
                        });
                        
                    } else {
                        setIsUser(false)
                        setChat({ id: docSnap.id, ...chatData });
                    }
                } else {
                    // Если чат не найден, ищем данные второго пользователя
                    const [firstUserId, secondUserId] = id.split("_");
                    const otherUserId = authUser._id === firstUserId ? secondUserId : firstUserId;
                    const userRef = doc(db, "users", otherUserId, "info", "preferences");
    
                    getDoc(userRef)
                        .then((userDoc) => {
                            if (userDoc.exists()) {
                                const userData = userDoc.data();
                                setIsNewChat(true);
                                setChat({
                                    id: id,
                                    userId: otherUserId, // Записываем ID второго пользователя
                                    name: userData.name || "Не найден",
                                    photo: userData.photo || "",
                                });
                            } else {
                                setChat({
                                    id: id,
                                    userId: otherUserId, // Записываем ID второго пользователя
                                    name: "Не найден",
                                    photo: "",
                                });
                            }
                        })
                        .catch((error) => {
                            console.error("Error getting user:", error);
                            setChat({
                                id: id,
                                userId: otherUserId, // Записываем ID второго пользователя
                                name: "Не найден",
                                photo: "",
                            });
                        });
                }
            });
    
            return () => {
                unsubscribe();
            };
        };
    
        fetchChat();
    }, [id]);
    
    
    

    useEffect(() => {
        setIsLoading(true);
        const commentsRef = query(collection(db, "chats", id, "messages"));
        const q = query(commentsRef, orderBy("timestamp", "asc"));
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedMessages = snapshot.docs.map(doc => {
                const data = doc.data();
    
                return {
                    messageId: doc.id,
                    ...data,
                    time: data.time?.time || "", // Берём время из объекта timestamp
                    date: data.time?.date || ""  // Берём дату из объекта timestamp
                };
            });
    
            setMessages(loadedMessages);
            setIsLoading(false);
        });
    
        return () => unsubscribe();
    }, [id]);
    
    
    


    const handleArrowClick = () =>{
        // alert(9)
        navigateTo('/chats')
    }

    // const handleSend = async (text, photo) => {
    //     // Добавляем ник пользователя, на которого отвечаем, в начале текста
    //     // const updatedText = replyTo ? `@${replyTo.userName} ${text}` : text;
        
    //     try {
    //         const newMessageRef = doc(collection(db, "chats", id, "messages"));
    //         const messageId = newMessageRef.id;
        
    //         const message = {
    //             messageId,
    //             text: text,  // Теперь отправляем полный текст с ником
    //             timestamp: {
    //                 date: new Date().toLocaleDateString("ru-RU"),  
    //                 time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) 
    //             },
    //             userId: authUser._id,
    //             userName: authUser.name,
    //             nameColor: '#0060cf',
    //             userPhoto: authUser.avatar,
    //         };
        
    //         await setDoc(newMessageRef, message);
        
        
    //         setMessages(...prevMessage, message);  // Сбрасываем состояние ответа
    
    //     } catch (error) {
    //         console.error("Ошибка при добавлении комментария: ", error);
    //     }
    // };
    const handleSend = async (text, images) => {
        // alert(text)
        try {
            // Получаем текущую временную метку
            const timestamp = new Date().toISOString();
            // Массив для хранения URL загруженных изображений
            let photoUrls = [];
        
            // Загружаем каждый файл изображения в Firebase Storage
            for (const image of images) {
                const storageRef = ref(storage, `chat_photos/${authUser._id}/${timestamp}_${image.name}`);
                await uploadBytes(storageRef, image);
                const photoUrl = await getDownloadURL(storageRef);
                photoUrls.push(photoUrl);
            }
        
            // Очищаем состояние после отправки
            // setText('');
            // setImages([]);
        
            // Сохраняем пост в Firestore
            await saveMessageToFirestore(text, photoUrls);
        
            } catch (error) {
            console.error("Error handling send: ", error);
            }
    }
    // const savePostToFirestore = async (text, photosArray) => {
    //     // try {
    //     //     const timestamp = new Date().toISOString();
    //     //     await addDoc(collection(db, 'posts'), {
    //     //         photos: photosArray,
    //     //         text: text,
    //     //         timestamp: timestamp,
    //     //         userId: authUser._id,
    //     //         userName: authUser.name,
    //     //         userPhoto: authUser.avatar,
    //     //         likesArray: [],
    //     //         commentsArray: [],
    //     //     });
    //     //     console.log("Message saved successfully.");
    //     // } catch (error) {
    //     //     console.error("Error adding document: ", error);
    //     // }
    //     try {
    //         const newMessageRef = doc(collection(db, "chats", id, "messages"));
    //         const messageId = newMessageRef.id;
        
    //         const message = {
    //             messageId,
    //             text: text,  // Теперь отправляем полный текст с ником
    //             timestamp: {
    //                 date: new Date().toLocaleDateString("ru-RU"),  
    //                 time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) 
    //             },
    //             userId: authUser._id,
    //             userName: authUser.name,
    //             nameColor: '#0060cf',
    //             userPhoto: authUser.avatar,
    //             photos: photosArray
    //         };
        
    //             await setDoc(newMessageRef, message);
            
            

        
    //         } catch (error) {
    //             console.error("Ошибка при добавлении комментария: ", error);
    //         }
    // };
    // const saveMessageToFirestore = async (text, photosArray) => {
    //     try {
    //         // if (!id || !authUser?._id) return;
    
    //         // Генерируем chatId, чтобы он был одинаковым у обоих пользователей
    //         const chatId = authUser._id < id ? `${authUser._id}_${id}` : `${id}_${authUser._id}`;
    //         const chatRef = doc(db, "chats", chatId);
            
    //         // Проверяем, существует ли чат
    //         const chatSnap = await getDoc(chatRef);
    
    //         if (isNewChat && !chatSnap.exists()) {
    //             // Получаем данные второго пользователя
    //             const userRef = doc(db, "users", id, "info", "preferences");
    //             const userSnap = await getDoc(userRef);
    //             const userData = userSnap.exists() ? userSnap.data() : null;
    
    //             // Создаем новый чат
    //             const newChat = {
    //                 isPrivate: true,
    //                 users: [authUser._id, id], // ID двух пользователей
    //                 createdAt: new Date().toISOString(),
    //                 userData: {
    //                     [authUser._id]: {
    //                         name: authUser.name,
    //                         photo: authUser.avatar
    //                     },
    //                     [id]: {
    //                         name: userData.name || "Не найден",
    //                         photo: userData.photo || ""
    //                     }
    //                 }
    //             };
    
    //             await setDoc(chatRef, newChat);
    
    //             // Добавляем ID чата обоим пользователям в поле `chats`
    //             const authUserRef = doc(db, "users", authUser._id, "info", "preferences");
    //             const otherUserRef = doc(db, "users", id, "info", "preferences");
    
    //             await updateDoc(authUserRef, {
    //                 chats: [...(await getDoc(authUserRef)).data()?.chats || [], chatId]
    //             });
    
    //             await updateDoc(otherUserRef, {
    //                 chats: [...(await getDoc(otherUserRef)).data()?.chats || [], chatId]
    //             });
    //         }
    
    //         // Добавляем сообщение в чат (новый или существующий)
    //         const newMessageRef = doc(collection(db, "chats", chatId, "messages"));
    //         const messageId = newMessageRef.id;
    
    //         const message = {
    //             messageId,
    //             text: text,
    //             timestamp: {
    //                 date: new Date().toLocaleDateString("ru-RU"),
    //                 time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
    //             },
    //             userId: authUser._id,
    //             userName: authUser.name,
    //             nameColor: "#0060cf",
    //             userPhoto: authUser.avatar,
    //             photos: photosArray
    //         };
    
    //         await setDoc(newMessageRef, message);
    //         navigateTo(`/chat/${chatId}`)
    //     } catch (error) {
    //         console.error("Ошибка при отправке сообщения: ", error);
    //     }
    // };
    const saveMessageToFirestore = async (text, photosArray) => {
        try {
            const [otherUserId, authUserId] = id.split("_");
            // Определяем chatId
            const chatId = isNewChat ? `${authUser._id}_${otherUserId}` : id;
            if (!chatId) throw new Error("Не удалось определить chatId");
    
            const chatRef = doc(db, "chats", chatId);
            const messageRef = doc(collection(db, "chats", chatId, "messages"));
            const messageId = messageRef.id;
    
            const time = {
                date: new Date().toLocaleDateString("ru-RU"),
                time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
            };

            // ТЕСТОВЫЕ ДАННЫЕ
            const timestamp = {
                date: "25.01.2025", // Указываешь нужную дату в формате "дд.мм.гггг"
                time: "14:30" // Указываешь нужное время в формате "чч:мм"
            };
    
            const customDate = Timestamp.fromDate(new Date("1980-05-07T15:54:57Z"));

            const message = {
                messageId,
                text,
                time: time,
                timestamp: serverTimestamp(),
                userId: authUser._id,
                userName: authUser.name,
                nameColor: "#0060cf",
                userPhoto: authUser.avatar,
                photos: photosArray
            };
    
            // Добавляем сообщение в Firestore
            await setDoc(messageRef, message);
    
            // Если это новый чат
            if (isNewChat) {
                // Получаем данные второго пользователя
                const userRef = doc(db, "users", otherUserId, "info", "preferences");
                const userSnap = await getDoc(userRef);
                const userData = userSnap.exists() ? userSnap.data() : null;
    
                await setDoc(chatRef, {
                    isPrivate: true,
                    userData: {
                        [authUser._id]: {
                            name: authUser.name,
                            photo: authUser.avatar
                        },
                        [otherUserId]: {
                            name: userData?.name ?? "Неизвестный",
                            photo: userData?.photo ?? ""
                        }
                    },
                    lastMessage: `${authUser.name}: ${text}`,
                    lastMessageTime: time
                });
    
                // Обновляем список чатов у обоих пользователей
                const userChatsRef = doc(db, "users", authUser._id, "info", "preferences");
                const otherUserChatsRef = doc(db, "users", otherUserId, "info", "preferences");
    
                await updateDoc(userChatsRef, {
                    chats: arrayUnion(chatId)
                });
    
                await updateDoc(otherUserChatsRef, {
                    chats: arrayUnion(chatId)
                });
    
                navigateTo(`/chat/${chatId}`);
            } else {
                // Если чат уже есть, просто обновляем lastMessage
                await updateDoc(chatRef, {
                    lastMessage: `${authUser.name}: ${text}`,
                    lastMessageTime: time
                });
            }
        } catch (error) {
            console.error("Ошибка при отправке сообщения: ", error);
        }
    };
    
      



    const groupedMessages = messages.reduce((acc, message) => {
        if (!acc[message.date]) {
            acc[message.date] = [];
        }
        acc[message.date].push(message);
        return acc;
    }, {});


    const openViewer = (photos, index) =>{
        setViewData({
            isShow: true,
            images: photos,
            index: index
        })
    }

    const hanadleHeaderClick = (id) => {
        isUser ? navigateTo(`/profile/${id}`) :
        setShowInfo(true)
    }

    const handleEditState = () => {
        setIsEdit(false);
        setSlipData({
            isShow: true,
            text: 'Изменения успешно сохранены',
        });
    };


    return (
        <div className={styles['container']}>
    {showInfo ? (
        <ChatInfo
            id={id}
            handleShowInfo={() => setShowInfo(false)}
        />
    ) : isEdit ? (
            <ChatEdit 
                handleEdit={handleEditState} 
                fetchGroupData={fetchGroupData} />
    ) : (
        <>
            <SlipNotification
                isShow={slipData.isShow}
                text={slipData.text}/>
            <ImageViewer
                isShow={viewData.isShow}
                images={viewData.images}
                index={viewData.index}
                onClose={() => setViewData({ isShow: false })}
            />
            <ChatHeader 
                id={chat.userId}
                photo={chat.photo}
                name={chat.name}
                members={chat.members ? chat.members.length : '0'}
                onHeaderClick={hanadleHeaderClick}
                onClick={handleArrowClick}
            />
            {isLoading ? (
                <div className={styles['message-container']}>
                    <div className={styles['data-header']}>
                        <span className={styles['data-body']}
                            style={{
                                background: theme.element_first_color,
                                color: theme.text_first_color
                            }}>
                            <SkeletonLoader 
                                width={'100px'}
                                height={'16px'}
                                shape={'rect'}
                            />
                        </span>
                    </div>
                    <LoadingMessage isAuthUser={false} />
                    <LoadingMessage isAuthUser={true} />
                    <LoadingMessage isAuthUser={false} />
                </div>
            ) : (
                Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div className={styles['message-container']} key={date}>
                        <div className={styles['data-header']}>
                            <span className={styles['data-body']}
                                style={{
                                    background: theme.element_first_color,
                                    color: theme.text_first_color
                                }}>
                                {date}
                            </span>
                        </div>
                        {msgs.map((message) => (
                            <Message
                                key={message.messageId}
                                userId={message.userId}
                                userName={message.userName}
                                nameColor={message.nameColor}
                                userPhoto={message.userPhoto}
                                photos={message.photos}
                                handlePhotoClick={openViewer}
                                text={message.text}
                                time={message.time}
                            />
                        ))}
                    </div>
                ))
            )}
            <div className={styles['input-wrapper']}
                style={{
                    background: theme.background_color
                }}>
                <MessageInput
                    placeholder={'Сообщение'}
                    Addtext={''}
                    onClearText={''}
                    isPanelTop={false}
                    onSend={handleSend}
                    addFiles={true}
                />
            </div>
        </>
    )}
</div>
    );
}