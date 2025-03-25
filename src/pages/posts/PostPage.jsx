import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Post.module.scss'
import { ElementContext } from '../../providers/ElementProvider.jsx';
import Post from './Post.jsx';
import { useAuth } from "../../providers/Authprovired.jsx";
import { doc, getDoc, updateDoc, arrayUnion, collection, query, orderBy, onSnapshot, serverTimestamp, addDoc, setDoc, increment  } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import MessageInput from '../../components/inputs/messageInput/MessageInput.jsx';
import ImageViewer from '../../components/modal-windows/image-viewer/ImageViewer.jsx';
import LoadingPost from './LoadingPost.jsx';
import AlertNotification from '../../components/notifictions/AlertNotification/AlertNotification.jsx';
import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification.jsx';
import Comment from '../../components/comment/Comment.jsx';

const PostPage = () => {
    const { id } = useParams();
    const navigateTo = useNavigate();
    const inputBodyRef = useRef(null);
    const { theme, elementColors, setElementColors } = useContext(ElementContext);
    const { authUser } = useAuth();
    
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState(null)
    const [loading, setLoading] = useState(true);
    const [viewData, setViewData] = useState({
        isShow: false,
        images: [],
        index: null
    });
    const [slipProp, setSlipProp] = useState({
        isShow: false,
        text: ''
    });
    const [alertProp, setAlertProp] = useState({
        isShow: false,
        title: 'Заголовок',
        text: 'текст',
        firstButtonName: 'выйти',
        secondButtonName: 'играть',
    });

    useEffect(() => {
        if (slipProp.isShow) {
          const timer = setTimeout(() => {
            setSlipProp({ isShow: false });
          }, 1000);
    
          return () => clearTimeout(timer);
        }
    }, [slipProp]);

    useEffect(() => {
        if (post) {
            document.title = `${post.title} - "Этот крутой пост создан в Genery!"`;
            // document.querySelector('meta[name="description"]').setAttribute('content', post.description || 'Описание поста');
            document.querySelector('meta[name="author"]').setAttribute('content', post.userName || 'Автор неизвестен');
            document.querySelector('meta[property="og:title"]').setAttribute('content', post.text);
            // document.querySelector('meta[property="og:description"]').setAttribute('content', post.description || 'Описание поста');
            document.querySelector('meta[property="og:image"]').setAttribute('content', post.postPhotos[0] || 'default-image-url');
            document.querySelector('meta[property="og:url"]').setAttribute('content', `https://ridgeld.github.io/genery/#/posts/${id}`);
            document.querySelector('meta[name="twitter:title"]').setAttribute('content', post.title);
            // document.querySelector('meta[name="twitter:description"]').setAttribute('content', post.description || 'Описание поста');
            document.querySelector('meta[name="twitter:image"]').setAttribute('content', post.postPhotos[0] || 'default-image-url');
            // document.querySelector('meta[name="twitter:card"]').setAttribute('content', 'summary_large_image');
        }
    }, [id]);

    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowColor: theme.text_first_color,
            arrowLink: () => navigateTo('/posts'),
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: true,
            footerBackground: theme.background_color,
            activeElementIndex: 3,
        });
        document.body.style.background = theme.background_color;
    }, [theme, setElementColors, navigateTo]);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const postRef = doc(db, 'posts', id);
                const postSnap = await getDoc(postRef);
                
                if (postSnap.exists()) {
                    const postData = postSnap.data();
                    const postDate = new Date(postData.timestamp);
                    const dateString = postDate.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' });
                    
                    setPost({
                        id: postSnap.id,
                        userId: postData.userId,
                        groupOwnerId: postData.groupOwnerId,
                        userName: postData.userName,
                        userPhoto: postData.userPhoto,
                        postText: postData.text,
                        postPhotos: postData.photos,
                        postData: dateString,
                        likesArray: postData.likesArray,
                        // commentsArray: postData.commentsArray,
                        // commentsArray: (postData.commentsArray || []).sort((a, b) => b.replies.length - a.replies.length),
                    });
                }
            } catch (error) {
                console.error('Ошибка при загрузке поста:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    useEffect(() => {
        const commentsRef = collection(db, "posts", id, "comments");
        const q = query(commentsRef, orderBy("timestamp", "asc"));
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedComments = snapshot.docs.map(doc => ({
                commentId: doc.id,
                ...doc.data()
            }));
            setComments(loadedComments);
        });
    
        return () => unsubscribe();
    }, [id]);

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

    // const handleSend = async (text, images) => {
    //         // alert(text)
    //         try {
    //             // Получаем текущую временную метку
    //             const timestamp = new Date().toISOString();
    //             // Массив для хранения URL загруженных изображений
    //             let photoUrls = [];
            
    //             // Загружаем каждый файл изображения в Firebase Storage
    //             for (const image of images) {
    //               const storageRef = ref(storage, `post_photos/${authUser._id}/${timestamp}_${image.name}`);
    //               await uploadBytes(storageRef, image);
    //               const photoUrl = await getDownloadURL(storageRef);
    //               photoUrls.push(photoUrl);
    //             }
            
    //             // Очищаем состояние после отправки
    //             // setText('');
    //             // setImages([]);
            
    //             // Сохраняем пост в Firestore
    //             await savePostToFirestore(text, photoUrls);
            
    //           } catch (error) {
    //             console.error("Error handling send: ", error);
    //           }
    //     }
    //     const savePostToFirestore = async (text, photosArray) => {
    //         try {
    //             const timestamp = new Date().toISOString();
    //             await addDoc(collection(db, 'posts'), {
    //                 photos: photosArray,
    //                 text: text,
    //                 timestamp: timestamp,
    //                 userId: authUser._id,
    //                 userName: authUser.name,
    //                 userPhoto: authUser.avatar,
    //                 likesArray: [],
    //                 commentsArray: [],
    //             });
    //             console.log("Message saved successfully.");
    //         } catch (error) {
    //             console.error("Error adding document: ", error);
    //         }
    //     };

    const [replyTo, setReplyTo] = useState(null);

    // const handleSend = async (text) => {
    //     try {
    //         if (!text.trim()) return; // Проверка на пустой текст
    
    //         const comment = {
    //             text,
    //             timestamp: Date.now(), // Используем новый timestamp
    //             userId: authUser._id,
    //             userName: authUser.name,
    //             userPhoto: authUser.avatar,
    //             replies: [],
    //         };
    
    //         let updatedComments = [...(post.commentsArray || [])];
    
    //         if (replyTo) {
    //             updatedComments = updatedComments.map((c) => {
    //                 if (c.userName === replyTo.userName && c.timestamp === replyTo.timestamp) {
    //                     return { 
    //                         ...c, 
    //                         replies: [...c.replies, { ...comment, replyTo: replyTo.userName }]
    //                     };
    //                 }
    //                 return c;
    //             });
    //             setReplyTo(null); // Сбросить `replyTo` после ответа
    //         } else {
    //             updatedComments.push(comment);
    //         }
    
    //         const postRef = doc(db, 'posts', id);
    //         await updateDoc(postRef, { commentsArray: updatedComments });
    
    //         setPost((prev) => ({
    //             ...prev,
    //             commentsArray: updatedComments
    //         }));
    
    //     } catch (error) {
    //         console.error("Ошибка при добавлении комментария: ", error);
    //     }
    // }; 


    // const handleSend = async (text) => {
    //     try {
    //         const commentData = {
    //             text,
    //             timestamp: serverTimestamp(),
    //             userId: authUser._id,
    //             userName: authUser.name,
    //             userPhoto: authUser.avatar,
    //             replyTo: replyTo ? replyTo.commentId : null, // Меняем undefined на null
    //         };
    
    //         const commentsRef = collection(db, "posts", id, "comments");
    //         await addDoc(commentsRef, commentData);
    
    //         setReplyTo(null); // Сбросить состояние ответа
    //     } catch (error) {
    //         console.error("Ошибка при добавлении комментария: ", error);
    //     }
    // };  

    const handleSend = async (text) => {
        const cleanedText = replyTo ? text.replace(`@${replyTo.userName} `, '') : text;
    
        try {
            const newCommentRef = doc(collection(db, "posts", id, "comments")); // Создаём ссылку на будущий документ
            const commentId = newCommentRef.id; // Получаем уникальный ID
    
            const comment = {
                commentId,  // Добавляем ID в объект комментария
                text: cleanedText,
                timestamp: Date.now(),
                userId: authUser._id,
                userName: authUser.name,
                userPhoto: authUser.avatar,
                replyTo: replyTo ? replyTo.commentId : null, // Если это ответ — сохраняем ID родителя
                isReply: !!replyTo,
            };
    
            await setDoc(newCommentRef, comment); // Добавляем комментарий в Firestore
    
            // Если это ответ на комментарий, увеличиваем `replyCount` у родителя
            if (replyTo) {
                const parentCommentRef = doc(db, "posts", id, "comments", replyTo.commentId);
                await updateDoc(parentCommentRef, {
                    replyCount: increment(1) // Увеличиваем счётчик ответов
                });
            }
    
            setReplyTo(null); // Сбрасываем состояние ответа
            setMessageInput('');
    
        } catch (error) {
            console.error("Ошибка при добавлении комментария: ", error);
        }
    };
    

    const [messageInput, setMessageInput] = useState('');

    const showUserProfile = (id) =>{
        navigateTo(`/profile/${id}`)
    }
    const handleReply = (comment) => {
        console.log("Ответ на комментарий:", comment); // Дебаг
        setReplyTo(comment);
        setMessageInput(`@${comment.userName} `);
    };

    if (loading) return <LoadingPost/>;
    if (!post) return <p>Пост не найден.</p>;

    const parentComments = comments.filter(comment => !comment.replyTo);
    const getReplies = (parentId) => comments.filter(comment => comment.replyTo === parentId);


    const handleClearAddText = () => {
        setMessageInput('')
    };



    return (
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
                secondButtonOnClick={alertProp.secondButtonOnClick}
            />
            <SlipNotification
                isShow={slipProp.isShow}
                text={slipProp.text}
            />
            {/* <div className={styles['fixed-post']}
                style={{
                    background: theme.background_color
                }}> */}
                {/* {loading ? <LoadingPost/> :          */}
                <Post 
                    key={post.id}
                    postId={post.id}
                    userId={post.userId}
                    groupOwnerId={post.groupOwnerId}
                    userName={post.userName}
                    userPhoto={post.userPhoto}
                    postData={post.postData}
                    postText={post.postText}
                    postPhotos={post.postPhotos}
                    likesArray={post.likesArray}
                    // commentsArray={[]}
                    photoClick={openViewer}
                    postAction={handleActionPost}
                />
                {/* } */}
            {/* </div> */}
            <div className={styles['comments-container']}>
                {comments && 
                comments.filter(comment => !comment.isReply) 
                .map((comment) => (
                    <Comment 
                        key={comment.commentId} 
                        userId={comment.userId}
                        userPhoto={comment.userPhoto}
                        userName={comment.userName}
                        text={comment.text}
                        showUserProfile={showUserProfile} 
                        onReply={handleReply}
                        replies={getReplies(comment.commentId)}
                        timestamp={comment.timestamp}
                        commentId={comment.commentId}
                        
                        />
                ))}
                <div className={styles['fixed-input']}
                    style={{
                        background: theme.background_color
                    }}>
                    <MessageInput 
                        placeholder={'Оставьте комментарий'}
                        Addtext={`<div style="color: ${theme.first_color};">${messageInput}</div>`}
                        onClearText={handleClearAddText}
                        isPanelTop={false}
                        onSend={handleSend}
                        addFiles={false}/>
                </div>
            </div>
        </div>
    );
};

export default PostPage;
