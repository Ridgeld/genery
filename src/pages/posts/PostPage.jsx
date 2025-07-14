import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Post.module.scss'
import { ElementContext } from '../../providers/ElementProvider.jsx';
import Post from './Post.jsx';
import { useAuth } from "../../providers/Authprovired.jsx";
import { doc, getDoc, updateDoc, arrayUnion, collection, query, orderBy, onSnapshot, serverTimestamp, addDoc, setDoc, increment, deleteDoc, getDocs, where  } from 'firebase/firestore';
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
        index: null,
        postId: ''
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

    const [showReplies, setShowReplies] = useState(false);

    useEffect(() => {
        if (slipProp.isShow) {
          const timer = setTimeout(() => {
            setSlipProp({ isShow: false });
          }, 1000);
    
          return () => clearTimeout(timer);
        }
    }, [slipProp]);

    // useEffect(() => {
    //     if (post) {
    //         document.title = `${post.title} - "Этот крутой пост создан в Genery!"`;
    //         // document.querySelector('meta[name="description"]').setAttribute('content', post.description || 'Описание поста');
    //         document.querySelector('meta[name="author"]').setAttribute('content', post.userName || 'Автор неизвестен');
    //         document.querySelector('meta[property="og:title"]').setAttribute('content', post.text);
    //         // document.querySelector('meta[property="og:description"]').setAttribute('content', post.description || 'Описание поста');
    //         document.querySelector('meta[property="og:image"]').setAttribute('content', post.postPhotos[0] || 'default-image-url');
    //         document.querySelector('meta[property="og:url"]').setAttribute('content', `https://ridgeld.github.io/genery/#/posts/${id}`);
    //         document.querySelector('meta[name="twitter:title"]').setAttribute('content', post.title);
    //         // document.querySelector('meta[name="twitter:description"]').setAttribute('content', post.description || 'Описание поста');
    //         document.querySelector('meta[name="twitter:image"]').setAttribute('content', post.postPhotos[0] || 'default-image-url');
    //         // document.querySelector('meta[name="twitter:card"]').setAttribute('content', 'summary_large_image');
    //     }
    // }, [id]);

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
                ...doc.data(),
            }));
            setComments(loadedComments);
        });
    
        return () => unsubscribe();
    }, [id]);

    const openViewer = (photos, index, postId) =>{
        console.log(postId)
        setViewData({
            isShow: true,
            images: photos,
            index: index,
            postId: postId
        })
    }
    const closeAlert = () =>{
        setAlertProp({
            isShow: false,
        })
    }
    const deletePost = async (postId) =>{
        // alert(postId)
        setAlertProp({
            isShow: false,
        })
        try {
            await deleteDoc(doc(db, 'posts', postId));
        } catch (error) {
            console.error('Error deleting post: ', error);
        } finally{
            setSlipProp({
                isShow: true,
                text: 'Пост удален'
            })
        }
        
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
    // const deleteComment = async (commentId) =>{
    //     // alert(postId)
    //     setAlertProp({
    //         isShow: false,
    //     })
    //     try {
    //         await deleteDoc(doc(db, 'posts', id, 'comments', commentId));
    //     } catch (error) {
    //         console.error('Error deleting post: ', error);
    //     } finally{
    //         setSlipProp({
    //             isShow: true,
    //             text: 'Комментарий удален'
    //         })
    //     }
        
    // }
    const deleteComment = async (commentId) => {
        setAlertProp({
            isShow: false,
        });
        try {
            // Удаляем основной комментарий
    
            // Получаем все ответы, привязанные к основному комментарию
            const repliesSnapshot = await getDocs(query(
                collection(db, 'posts', id, 'comments'),
                where('replyTo', '==', commentId)  // предполагается, что у каждого ответа есть поле replyTo, которое указывает на commentId
            ));
    
            // Удаляем все ответы
            repliesSnapshot.forEach(async (replyDoc) => {
                await deleteDoc(doc(db, 'posts', id, 'comments', replyDoc.id));
            });

            await deleteDoc(doc(db, 'posts', id, 'comments', commentId));
    
        } catch (error) {
            console.error('Error deleting comment: ', error);
        } finally {
            setSlipProp({
                isShow: true,
                text: 'Комментарий и ответы удалены',
            });
        }
    };
    

    const handleActionComment = (id, commentId) =>{
        switch(id){
            case 'delete':
                return setAlertProp({
                    isShow: true,
                    title: 'Удаление поста',
                    text: `Вы действительно хотите удалить комментарий?`,
                    firstButtonName: 'Отмена',
                    secondButtonName: 'Удалить',
                    firstButtonOnClick: closeAlert,
                    secondButtonOnClick: () => deleteComment(commentId),
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
    
    const handleSend = async (text) => {
        // Добавляем ник пользователя, на которого отвечаем, в начале текста
        // const updatedText = replyTo ? `@${replyTo.userName} ${text}` : text;
        
        try {
            const newCommentRef = doc(collection(db, "posts", id, "comments"));
            const commentId = newCommentRef.id;
        
            const comment = {
                commentId,
                text: text,  // Теперь отправляем полный текст с ником
                timestamp: Date.now(),
                userId: authUser._id,
                userName: authUser.name,
                userPhoto: authUser.avatar,
                replyTo: replyTo ? replyTo.commentId : null,
                isReply: !!replyTo,
            };
        
            await setDoc(newCommentRef, comment);
        
            if (replyTo) {
                const parentCommentRef = doc(db, "posts", id, "comments", replyTo.commentId);
                await updateDoc(parentCommentRef, {
                    replyCount: increment(1)
                });
            }
        
            setReplyTo(null);  // Сбрасываем состояние ответа
            setMessageInput('');  // Очищаем input
    
        } catch (error) {
            console.error("Ошибка при добавлении комментария: ", error);
        }
    };
    
    

    const [messageInput, setMessageInput] = useState(null);

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

    const hexToRgb = (hex) => {
        // Убираем решётку в начале HEX-кода
        hex = hex.replace('#', '');
        
        // Конвертируем HEX в RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `rgba(${r}, ${g}, ${b}, 0.2)`; // Добавляем прозрачность
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
            <AnimatePresence>
                <ImageViewer
                    isShow={viewData.isShow}
                    images={viewData.images}
                    index={viewData.index}
                    postId={viewData.postId}
                    onClose={() => setViewData({ isShow: false })}
                />
            </AnimatePresence>
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
                    commentCount={comments.length}
                    photoClick={openViewer}
                    postAction={handleActionPost}
                />
                {/* } */}
            {/* </div> */}
            <div className={styles['comments-container']}>
                {/* {comments && 
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
                            commentAction={handleActionComment}
                            />
                    ))} */}
                    {comments && 
                        comments.filter(comment => !comment.isReply)
                        .map((comment) => {
                            // Состояние для управления видимостью ответов
                            
                            return (
                            <>
                                <Comment 
                                userId={comment.userId}
                                userPhoto={comment.userPhoto}
                                userName={comment.userName}
                                text={comment.text}
                                showUserProfile={showUserProfile}
                                onReply={handleReply}
                                timestamp={comment.timestamp}
                                commentId={comment.commentId}
                                commentAction={handleActionComment}
                                />
                                
                                {/* Кнопка для отображения/скрытия ответов */}
                                {getReplies(comment.commentId).length > 0 && (
                                <button onClick={() => setShowReplies(!showReplies)}
                                    className={styles['show-answers']}
                                        style={{
                                            color: theme.first_color,
                                            background: hexToRgb(theme.first_color)
                                        }}>
                                     {showReplies ? 'Скрыть ответы' : `Показать ответы (${getReplies(comment.commentId).length})`}
                                </button>
                                )}

                                {/* Рендерим ответы, если showReplies равно true */}
                                {showReplies && getReplies(comment.commentId).length > 0 && (
                                <div className={styles['replies-container']}>
                                    {getReplies(comment.commentId).map(reply => (
                                    <Comment 
                                        key={reply.commentId}
                                        userId={reply.userId}
                                        userPhoto={reply.userPhoto}
                                        userName={reply.userName}
                                        text={reply.text}
                                        showUserProfile={showUserProfile}
                                        timestamp={reply.timestamp}
                                        commentId={reply.commentId}
                                        commentAction={handleActionComment}
                                        isReply={true}
                                    />
                                    ))}
                                </div>
                                )}
                            </>
                            );
                        })
                        }

                <div className={styles['fixed-input']}
                    style={{
                        background: theme.background_color
                    }}>
                    <MessageInput 
                        placeholder={'Оставьте комментарий'}
                        Addtext={messageInput && `<div style="color: ${theme.first_color};">${messageInput}</div>`}
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
