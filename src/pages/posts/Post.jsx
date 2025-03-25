import React, { useContext, useEffect, useState } from 'react';
import styles from './Post.module.scss'
import { useAuth } from "../../providers/Authprovired.jsx";
import { doc, updateDoc, arrayUnion, arrayRemove  } from "firebase/firestore"; 
import { db } from '../../../firebase.js';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { motion } from 'framer-motion';
import parser from 'html-react-parser';
import DropMenu from '../../components/modal-windows/drop-menu/DropMenu.jsx';
import { useNavigate } from 'react-router-dom';
import Comment from '../../components/comment/Comment.jsx';


function Post({postId, userPhoto, groupOwnerId, userId, userName, postData, postText, postPhotos, likesArray, commentCount, photoClick, postAction, commentsArray}){
    const navigateTo = useNavigate();
    const [like, setLike] = useState(false);
    const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);
    const { authUser } = useAuth();
    // console.log(postPhotos);
    const [DropIsShow, setDropIsShow] = useState(false)

    useEffect(() => {
        // Проверка, лайкнул ли текущий пользователь этот пост
        if (authUser && likesArray.includes(authUser._id)) {
            setLike(true);
        }
    }, [authUser._id]);

    const handleLike = async () => {
        const postRef = doc(db, 'posts', postId);

        if (like) {
            // Убрать лайк
            await updateDoc(postRef, {
                likesArray: arrayRemove(authUser._id)
            });
            setLike(false);
        } else {
            // Добавить лайк
            await updateDoc(postRef, {
                likesArray: arrayUnion(authUser._id)
            });
            setLike(true);
        }
    };

    const DropMenuClick =(id) =>{
        postAction(id, postId)
        setDropIsShow(false)
    }
    const handlePhotoClick = (photos, index) => {
        photoClick(photos, index)
        // setViewData({
        //     isShow: true,
        //     images: photos,
        //     index: index
        // })
        // setSelectedPhotoIndex(index);
        // setSelectedMessagePhotos(photos);
      }; 
    //   const processText = (text) => {
    //     const regex = /(^|\s)(#[a-zA-Zа-яА-Я0-9_]+)/g;
    //     const parts = text.split(regex);
    //     return parts.map((part, index) => {
    //         if (part.startsWith('#')) {
    //             return <div key={index} className={styles.hashtags}>{part}</div>;
    //         } else if (part.startsWith(' ') && part.trim().startsWith('#')) {
    //             return <div key={index} className={styles.hashtags}>{part.trim()}</div>;
    //         }
    //         return part;
    //     });
    // };

    // const parsedText = processText(postText);
    const wrapHashtags = (text) => {
        if (typeof text === 'string') {
            // Заменяем хештеги и обрабатываем невидимые символы
            return text
                .replace(/(#[\wа-яА-Я_]+)/g, (match) => `<div class="${styles.hashtags}">${match}</div>`)
                .split(/(<div class=".*?">.*?<\/div>)/g)
                .map((part, index) => {
                    // Возвращаем элемент если это див с хештегом
                    if (part.startsWith('<div')) {
                        return parser(part);
                    }
                    return part;
                });
        }
        return text;
    };
    
    const processNode = (node) => {
        if (typeof node === 'string') {
            return wrapHashtags(node);
        }
    
        if (React.isValidElement(node)) {
            const newChildren = React.Children.map(node.props.children, processNode);
            return React.cloneElement(node, { children: newChildren });
        }
    
        return node;
    };
    const processContent = (html) => {
        const parsed = parser(html);
        return processNode(parsed);
    };
    const showUserProfile = (id) =>{

        if(groupOwnerId){
            // alert('Группу')
            navigateTo(`/group/${id}`)
        } else{
            // alert('Личный пост')
            navigateTo(`/profile/${id}`)
        }
    }


    const handleCommentsClick = () => {
        navigateTo(`/post/${postId}`);
    };

    return(
        <div className={styles['post-body']}
        style={{
            // background: theme.element_first_color,
            '--hashtag-color': theme.icon_color,
        }}>
        <DropMenu 
            isShow={DropIsShow}
            onClick={DropMenuClick}/>

        <div className={styles['post-info']}>
            <div className={styles['post-author']} 
                onClick={() => showUserProfile(userId)}>
                <div className={styles['author-photo']}>
                    <img src={userPhoto} className={styles['user-avatar']}/>
                    {/* <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.09957 0.61495C7.17783 0.664199 7.23839 0.740802 7.27136 0.832244C7.30433 0.923687 7.30776 1.02456 7.28108 1.11839L5.84094 6.19797H8.49813C8.57621 6.19793 8.6526 6.22272 8.71786 6.26927C8.78312 6.31582 8.83439 6.3821 8.86535 6.45992C8.8963 6.53774 8.90559 6.6237 8.89205 6.70718C8.87852 6.79067 8.84276 6.86802 8.78919 6.92969L2.39212 14.3077C2.33022 14.3792 2.24786 14.4258 2.15844 14.4399C2.06903 14.454 1.97785 14.4349 1.89976 14.3855C1.82167 14.3362 1.76127 14.2596 1.72841 14.1683C1.69556 14.0769 1.69218 13.9761 1.71883 13.8824L3.15897 8.80198H0.501783C0.423695 8.80202 0.347307 8.77723 0.282049 8.73068C0.21679 8.68412 0.165519 8.61785 0.134563 8.54003C0.103608 8.46221 0.0943237 8.37625 0.107857 8.29277C0.12139 8.20928 0.157148 8.13193 0.210716 8.07025L6.60779 0.692202C6.66961 0.620852 6.75185 0.5743 6.84114 0.560117C6.93042 0.545933 7.0215 0.564953 7.09957 0.614082V0.61495Z" fill="var(--first-color)"/>
                    </svg> */}
                </div>
                <div className={styles['author-name']}
                    style={{
                        color: theme.text_first_color
                    }}>
                        {userName}
                </div>
            </div>
            {userId === authUser._id || groupOwnerId === authUser._id && 
                <div className={styles['post-delete']}
                    onClick={() => setDropIsShow(!DropIsShow)}>
                    <div className={styles['post-more']}>
                        <svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="2.5" cy="2.5" r="2.5" fill={theme.text_first_color}/>
                        </svg>
                        <svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="2.5" cy="2.5" r="2.5" fill={theme.text_first_color}/>
                        </svg>
                        <svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="2.5" cy="2.5" r="2.5" fill={theme.text_first_color}/>
                        </svg>
                    </div>
                </div>
            }
        </div>
        <div className={styles['post-data']}>
            {/* {postPhotos &&             
                <div className={styles['post-photo']}>
                    <img src={postPhotos} loading='lazy'/>
                </div> } */}
                {postPhotos && 
                    <div className={styles['images-body']}>
                        <div className={styles[`images-wrapper_${postPhotos.length}`]}>
                            {postPhotos.map((image, index)=> (
                                <motion.div className={styles[`image_${index}`]}
                                whileTap={{scale: 1.5}}>
                                    <img src={image}
                                    onClick={() => handlePhotoClick(postPhotos, index)}/> 
                                </motion.div>
                            ))}
                        </div>
                    </div> }
            {postText && 
                <div className={styles['post-text']}
                    style={{
                        color: theme.text_first_color
                    }}>
                        {/* {parser(postText)} */}
                        {/* {postText} */}
                        {/* {parsedText} */}
                        {processContent(postText)}
                </div>}
        </div>
        <div className={styles['post-actions']}>
             <div className={styles['post-date']}
                style={{
                    color: theme.text_first_color
                }}>{postData}</div>
            <div className={styles['post-buttons']}>
                <div className={styles['like-count']}
                    style={{
                        color: theme.text_first_color
                    }}>{likesArray.length}</div>
                <div className={styles['action-like']}
                    style={{
                        background: theme.third_color
                    }}
                    onClick={handleLike}>
                    <motion.svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 36 32"
                            fill="none"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileTap={{scale: 3, opacity: 0.5 }}
                        >
                        {like ? (
                            <motion.path
                                key="heart-filled"
                                d="M32.175 17.0824L18.0158 31L3.85639 17.0824C2.92246 16.1805 2.18681 15.0964 1.69577 13.8984C1.20474 12.7004 0.968955 11.4145 1.00327 10.1216C1.03758 8.82878 1.34126 7.55698 1.89515 6.3863C2.44906 5.21564 3.24119 4.17148 4.22167 3.31958C5.20216 2.46766 6.34977 1.82646 7.59221 1.43635C8.83465 1.04624 10.145 0.915671 11.4408 1.05285C12.7367 1.19004 13.9898 1.59201 15.1213 2.23346C16.2529 2.87491 17.2384 3.74194 18.0158 4.77994C18.7964 3.74948 19.783 2.89001 20.9139 2.25538C22.0446 1.62074 23.2952 1.22458 24.5873 1.09168C25.8796 0.958777 27.1854 1.09201 28.4233 1.48303C29.6612 1.87405 30.8045 2.51445 31.7815 3.36414C32.7585 4.21383 33.5483 5.25452 34.1015 6.42108C34.6546 7.58763 34.9592 8.85495 34.9962 10.1437C35.0331 11.4325 34.8015 12.7149 34.3162 13.9108C33.8307 15.1066 33.1018 16.1903 32.175 17.0936"
                                fill={theme.text_first_color}
                            />
                        ) : (
                            <motion.path
                                key="heart-outline"
                                d="M32.175 17.0824L18.0158 31L3.85639 17.0824C2.92246 16.1805 2.18681 15.0964 1.69577 13.8984C1.20474 12.7004 0.968955 11.4145 1.00327 10.1216C1.03758 8.82878 1.34126 7.55698 1.89515 6.3863C2.44906 5.21564 3.24119 4.17148 4.22167 3.31958C5.20216 2.46766 6.34977 1.82646 7.59221 1.43635C8.83465 1.04624 10.145 0.915671 11.4408 1.05285C12.7367 1.19004 13.9898 1.59201 15.1213 2.23346C16.2529 2.87491 17.2384 3.74194 18.0158 4.77994C18.7964 3.74948 19.783 2.89001 20.9139 2.25538C22.0446 1.62074 23.2952 1.22458 24.5873 1.09168C25.8796 0.958777 27.1854 1.09201 28.4233 1.48303C29.6612 1.87405 30.8045 2.51445 31.7815 3.36414C32.7585 4.21383 33.5483 5.25452 34.1015 6.42108C34.6546 7.58763 34.9592 8.85495 34.9962 10.1437C35.0331 11.4325 34.8015 12.7149 34.3162 13.9108C33.8307 15.1066 33.1018 16.1903 32.175 17.0936"
                                stroke={theme.text_first_color}
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}
                    </motion.svg>
                </div>
                <div className={styles['like-count']}
                    style={{
                        color: theme.text_first_color
                    }}>{commentCount}</div>
                <div className={styles['action-comment']}
                    style={{
                        background: theme.second_color
                    }}
                    onClick={handleCommentsClick}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 19C11.78 19 13.5201 18.4722 15.0001 17.4832C16.4802 16.4943 17.6337 15.0887 18.3149 13.4442C18.9961 11.7996 19.1743 9.99002 18.8271 8.24419C18.4798 6.49836 17.6226 4.89471 16.364 3.63604C15.1053 2.37737 13.5016 1.5202 11.7558 1.17294C10.01 0.82567 8.20038 1.0039 6.55585 1.68509C4.91131 2.36628 3.50571 3.51983 2.51677 4.99987C1.52784 6.47991 1 8.21997 1 10C1 11.488 1.36 12.891 2 14.127L1 19L5.873 18C7.109 18.64 8.513 19 10 19Z" stroke={theme.background_color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div className={styles['action-send']}
                    style={{
                        background: theme.first_color
                    }}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.70711 10.7071C1.31658 11.0976 0.683418 11.0976 0.292893 10.7071C-0.0976311 10.3166 -0.0976311 9.68342 0.292893 9.29289L1.70711 10.7071ZM10 4.72575e-08C10.5523 -3.74211e-07 11 0.447715 11 1L11 10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10L9 2L1 2C0.447715 2 2.8711e-07 1.55228 2.8711e-07 1C2.8711e-07 0.447715 0.447715 -1.63477e-07 1 -1.63477e-07L10 4.72575e-08ZM0.292893 9.29289L9.29289 0.292893L10.7071 1.70711L1.70711 10.7071L0.292893 9.29289Z" fill={theme.text_first_color}/>
                    </svg>
                </div>
            </div>
        </div>
        <div className={styles['comments-container-preview']}>
                {/* {commentsArray && commentsArray.length != 0 && 
                <Comment 
                    userId={commentsArray.userId}
                    isPreview={true}
                    userPhoto={commentsArray.userPhoto}
                    userName={commentsArray.userName}
                    text={commentsArray.text}
                    showUserProfile={showUserProfile} /> } */}
            {commentsArray && 
                 <div className={styles['comment']}
                    style={{
                        background: theme.element_first_color
                    }}>
                    <div className={styles['author-info']}>
                        <div className={styles['author-photo']}>
                            <img className={styles['avatar']}
                                src={commentsArray.userPhoto}/>
                        </div>
                        <div className={styles['author-name']}
                            style={{
                                color: theme.text_first_color
                            }}>{commentsArray.userName}</div>
                    </div>
                    <div className={styles['comment-text']}
                        style={{
                            color: theme.text_first_color
                        }}>{commentsArray.text}</div>
                    
                    <div className={styles['comment-actions']}>
                        <div className={styles['answer-button']}
                            style={{
                                color: theme.element_second_color
                            }}
                            onClick={() => navigateTo(`/post/${postId}`)}>Ответить</div>
                    </div>
                </div>
            }
        </div>
    </div>
    )
}
export default Post