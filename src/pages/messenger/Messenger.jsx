import React, { useContext, useEffect, useRef, useState } from "react";
import '../../themes/default.scss';
import styles from './Messenger.module.scss'
import MessageContainer from "./MessageContainer.jsx";
import LoadingMessage from './LoadingMessage.jsx'
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { useAuth } from "../../providers/Authprovired.jsx";
import { addDoc, collection, onSnapshot, deleteDoc, getDocs, orderBy, query  } from "firebase/firestore"; 
import { db } from '../../../firebase.js';
import { run } from "./AI.jsx";
import EmojiPanel from "./EmojiPanel.jsx";

function Messenger(){
    const { elementColors, setElementColors } = useContext(ElementContext);
    const [message, setMessage] = useState('');
    const [messageData, setMessageData] = useState({});
    const [isLoading, setIsLoading] = useState()
    const { authUser } = useAuth();
    const inputBodyRef = useRef(null);
    const messageContainerRef = useRef(null)
    const [showEmoji, setShowEmoji] = useState(false);
    const isMessageDataEmpty = Object.keys(messageData).length === 0;
    
    const handleMessageChange = (event) => {
        setMessage(event.target.value);
        event.target.style.height = '25px'; // Сброс высоты
        event.target.style.height = `${event.target.scrollHeight}px`;
        if (inputBodyRef.current) {
            inputBodyRef.current.style.height = `${event.target.scrollHeight}px`;
            if(inputBodyRef.current.style.height >= '40px'){
                inputBodyRef.current.style.borderRadius = '20px';
            }
        }
    };

    const handleEmojiSelect = (emoji) => {
        setMessage(message + emoji); // Добавляем выбранный эмодзи к текущему значению input
    };
    // const handleSend = () => {
    //     if (message.trim() !== '') {
    //         setMessages([...messages, message]);
    //         setMessage('');
    //     }
    // };
    // ОТОБРАЖЕНИЕ СООБЩЕНИЙ
    useEffect(() => {
        const unlisten = onSnapshot(
            query(collection(db, 'users', authUser._id, 'messages'), orderBy('timestamp', 'asc')),
            snapshot => {
                // Создание объекта для хранения сообщений, сгруппированных по дате
                const messagesByDate = {};
    
                snapshot.forEach((doc) => {
                    const messageData = doc.data();
                    const messageDate = new Date(messageData.timestamp);
                    const isUser = messageData.isUser;
    
                    // Преобразование даты в формат "дд.мм.гггг"
                    const dateString = messageDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
                    // Если для данной даты еще нет массива сообщений, создаем новый массив
                    if (!messagesByDate[dateString]) {
                        messagesByDate[dateString] = [];
                    }
    
                    const messageWithUser = { ...messageData, isUser: isUser, userName: authUser.name };
    
                    // Добавляем сообщение в соответствующий массив
                    messagesByDate[dateString].push(messageWithUser);
                });
    
                setMessageData(messagesByDate);
            }
        );
    
        return () => {
            unlisten();
        };
    }, []);

    // useEffect(() => {
    //     const fetchMessages = async () => {
    //         const querySnapshot = await getDocs(collection(db, "users", authUser._id, 'messages'));
    //         const messageData = querySnapshot.docs.map(doc => doc.data());
    //         messageData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    //         setMessages(messageData);
    //     };

    //     fetchMessages();
    // }, []);
    const saveMessageToFirestore = async (text, isUser) => {
        try {
            const timestamp = new Date().toISOString();
            await addDoc(collection(db, "users", authUser._id, 'messages'), {
                text: text,
                timestamp: timestamp,
                isUser: isUser,
                userName: authUser.name
            });
            console.log("Message saved successfully.");
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    // const handleSend = async () => {
    //     if (message.trim() !== '') {
    //         try {
                // const [text, isUser] = await run(message);
    //             console.log(text);
    //             // Подставление даты: '2024-01-05T12:00:00'
    //             const timestamp = new Date().toISOString(); // Получаем текущее время
    //             const docRef = await addDoc(collection(db, "users", authUser._id, 'messages'), {
    //                 text: message,
    //                 timestamp: timestamp,
    //                 isUser: true,
    //                 userName: authUser.name
    //             });
    //             console.log("Document written with ID: ", docRef.id);
    //             setMessage('');
    //         } catch (error) {
    //             console.error("Error adding document: ", error);
    //         }
    //     }
    // };
    const handleSend = async () => {
        setShowEmoji(false)
        if (message.trim() !== '') {
            try {
                // Получаем результаты от функции run()
                // const { userInput, generatedText } = await run(message);
                // Сохраняем сообщение пользователя и сгенерированный текст в Firestore
                setMessage('');
                await saveMessageToFirestore(message, true);
                setIsLoading(true);
                const [text, isUser] = await run(message);
                await saveMessageToFirestore(text, isUser);
                setIsLoading(false);
    
            } catch (error) {
                console.error("Error handling send: ", error);
            }  finally {
                setIsLoading(false); // После выполнения запроса, устанавливаем isLoading в false
            }
        }
    };
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSend();
            setMessage('');
            messageContainerRef.current.scrollTo(100000);
        }
    };

    // УДАЛЕНИЕ СООБЩЕНИЙ /clear
    const deleteAllMessages = async () => {
        try {
            // Получение ссылки на коллекцию сообщений текущего пользователя
            const messagesRef = collection(db, 'users', authUser._id, 'messages');
            
            // Получение всех документов в коллекции
            const querySnapshot = await getDocs(messagesRef);
            
            // Удаление каждого документа
            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
                console.log("Сообщение успешно удалено!");
            });
    
            console.log("Все сообщения успешно удалены!");
        } catch (error) {
            console.error("Ошибка при удалении сообщений: ", error);
        }
    };
    // const handleSend = async () => {
    //     setMessages([...messages, message]);
    //     if (message.trim() !== '') {
    //         try {
    //             setMessages([...messages, {isUser: true, text: message, timestamp: serverTimestamp()}]);
    //             setMessage('');
    //             // Сохраняем сообщение в Firestore при нажатии на кнопку "send"
    //             const docRef = await addDoc(collection(db, "users", authUser._id, 'messages'), {
    //                 isUser: true,
    //                 text: message,
    //                 timestamp: serverTimestamp()
    //             });
    //             console.log("Document written with ID: ", docRef.id); // Очищаем поле ввода после отправки сообщения
    //         } catch (error) {
    //             console.error("Error adding document: ", error);
    //         }
    //     }
    // };


    useEffect(() => {
        setElementColors({
            iconColor: 'var(--first-color)',
            titleColor: 'var(--text-first-color)',
            showArrow: true,
            arrowLink: '#/menu',
            arrowColor: 'var(--text-first-color)',
            isHeaderBackground: true,
            headerBackground: 'var(--background-color)',
            isHeader: true,
            isFooter: false,
            footerBackground: 'var(--background-color)',
            activeElementIndex: 1,
        });
        },[ElementContext]);


    return(
        <>
        <div className={styles['background-cover']}
                style={{
                    background: 'var(--background-color)'
                }}>
        </div>
        <div className={styles['input-container']}>
            {showEmoji ? 
                <EmojiPanel 
                    onEmojiSelect={handleEmojiSelect}
                    setInputValue={setMessage}
                    backgroundColor={'var(--element-first-color)'}
                    textColor={'var(--text-first-color)'}
                    /> 
            : <></>}
            <div className={styles['message-action']}>
                <div className={styles['add-file']}
                    style={{
                        background: 'var(--element-first-color)',
                    }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 9H9M17 9L9 9M9 9V1M9 9L9 17" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </div>
                    <div className={styles['input-body']}
                        style={{
                            background: 'var(--element-first-color)'
                        }}
                        ref={inputBodyRef}>
                        <button className={styles['smile-button']} onClick={() => setShowEmoji(!showEmoji)}>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 21C16.5228 21 21 16.5228 21 11C21 5.47715 16.5228 1 11 1C5.47715 1 1 5.47715 1 11C1 16.5228 5.47715 21 11 21Z" stroke="white" stroke-width="1.5"/>
                            <path d="M8 15C8.85 15.63 9.885 16 11 16C12.115 16 13.15 15.63 14 15" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M15 9.5C15 10.328 14.552 11 14 11C13.448 11 13 10.328 13 9.5C13 8.672 13.448 8 14 8C14.552 8 15 8.672 15 9.5Z" fill="white"/>
                            <path d="M8 11C8.55228 11 9 10.3284 9 9.5C9 8.67157 8.55228 8 8 8C7.44772 8 7 8.67157 7 9.5C7 10.3284 7.44772 11 8 11Z" fill="white"/>
                        </svg>
                        </button>
                        <textarea className={styles['input-message']} 
                                placeholder="Сообщение" 
                                onChange={handleMessageChange}
                                onKeyPress={handleKeyPress}
                                value={message}
                                style={{
                                    color:'var(--text-first-color)',
                                    caretColor: 'var(--first-color)',
                                }}></textarea>
                        <button className={styles['send-button']}
                                style={{
                                    background: ('var(--first-color)')
                                }}
                                onClick={handleSend}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.20711 11.2071C1.81658 11.5976 1.18342 11.5976 0.792893 11.2071C0.402369 10.8166 0.402369 10.1834 0.792893 9.79289L2.20711 11.2071ZM10.5 0.5C11.0523 0.5 11.5 0.947715 11.5 1.5L11.5 10.5C11.5 11.0523 11.0523 11.5 10.5 11.5C9.94772 11.5 9.5 11.0523 9.5 10.5L9.5 2.5L1.5 2.5C0.947715 2.5 0.5 2.05228 0.5 1.5C0.5 0.947715 0.947715 0.5 1.5 0.5L10.5 0.5ZM0.792893 9.79289L9.79289 0.792893L11.2071 2.20711L2.20711 11.2071L0.792893 9.79289Z" fill="var(--text-first-color)"/>
                            </svg>
                        </button>        
                    </div>
                </div>
                {/* <button onClick={deleteAllMessages}>Удалить все сообщения</button> */}
            </div>
        <div className={styles.container}>
            <div className={styles['messages-container']}
                    ref={messageContainerRef}>
                    {isMessageDataEmpty ? (
                        <div className={styles['greeting']}>
                            <div className={styles['greeting-title']}
                                style={{
                                    background: 'linear-gradient(90deg, var(--first-color) 0%, var(--second-color) 50%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>Привет, {authUser.name}!</div>
                            <div className={styles['greeting-text']}
                                style={{
                                    color: 'var(--text-third-color)'
                                }}>Чем я могу помочь?</div>
                        </div>
                    ) : (
                        Object.keys(messageData).map(date => (
                            <MessageContainer 
                                key={date} 
                                date={date} 
                                messages={messageData[date]}
                                textColor={'var(--text-first-color)'}
                                backgroundColor={'var(--element-first-color)'} 
                            />
                        ))
                    )}
                    {isLoading ? 
                        <LoadingMessage
                            key={'loading'}
                            textColor={'var(--text-first-color)'}/>
                        : <></>}
            </div>
        </div>
        </>

    )
}
export default Messenger