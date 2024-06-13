import React, { useEffect, useState } from 'react';
import styles from './Post.module.scss'
import { useAuth } from "../../providers/Authprovired.jsx";
import { doc, updateDoc, arrayUnion, arrayRemove  } from "firebase/firestore"; 
import { db } from '../../../firebase.js';

function Post({postId, userPhoto, userName, postData, postText, postPhoto, likesArray}){
    const [like, setLike] = useState(false);
    const { authUser } = useAuth();
    console.log(likesArray);
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

    return(
        <div className={styles['post-body']}
        style={{
            background: 'var(--element-first-color)'
        }}>
        <div className={styles['post-info']}>
            <div className={styles['post-author']}>
                <div className={styles['author-photo']}>
                    <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.09957 0.61495C7.17783 0.664199 7.23839 0.740802 7.27136 0.832244C7.30433 0.923687 7.30776 1.02456 7.28108 1.11839L5.84094 6.19797H8.49813C8.57621 6.19793 8.6526 6.22272 8.71786 6.26927C8.78312 6.31582 8.83439 6.3821 8.86535 6.45992C8.8963 6.53774 8.90559 6.6237 8.89205 6.70718C8.87852 6.79067 8.84276 6.86802 8.78919 6.92969L2.39212 14.3077C2.33022 14.3792 2.24786 14.4258 2.15844 14.4399C2.06903 14.454 1.97785 14.4349 1.89976 14.3855C1.82167 14.3362 1.76127 14.2596 1.72841 14.1683C1.69556 14.0769 1.69218 13.9761 1.71883 13.8824L3.15897 8.80198H0.501783C0.423695 8.80202 0.347307 8.77723 0.282049 8.73068C0.21679 8.68412 0.165519 8.61785 0.134563 8.54003C0.103608 8.46221 0.0943237 8.37625 0.107857 8.29277C0.12139 8.20928 0.157148 8.13193 0.210716 8.07025L6.60779 0.692202C6.66961 0.620852 6.75185 0.5743 6.84114 0.560117C6.93042 0.545933 7.0215 0.564953 7.09957 0.614082V0.61495Z" fill="var(--first-color)"/>
                    </svg>
                </div>
                <div className={styles['author-name']}
                    style={{
                        color: 'var(--text-first-color)'
                    }}>
                    {userName}
                </div>
            </div>
            <div className={styles['post-date']}
                style={{
                    color: 'var(--text-first-color)'
                }}>{postData}</div>
        </div>
        <div className={styles['post-data']}>
            {postPhoto ?             
                <div className={styles['post-photo']}>
                    <img src={postPhoto} loading='lazy'/>
                </div> 
            : <></>}
            {postText ? 
                <div className={styles['post-text']}
                    style={{
                        color: 'var(--text-first-color)'
                    }}>
                        {postText}
                </div>
            :<></>}
        </div>
        <div className={styles['post-actions']}>
            <div className={styles['action-like']}
                style={{
                    background: 'var(--third-color)'
                }}
                onClick={handleLike}>
                {like ? 
                    <svg width="34" height="30" viewBox="0 0 34 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M31.175 16.0824L17.0158 30L2.85639 16.0824C1.92246 15.1805 1.18681 14.0964 0.695768 12.8984C0.204736 11.7004 -0.031045 10.4145 0.00327431 9.12164C0.0375778 7.82878 0.341258 6.55698 0.895154 5.3863C1.44906 4.21564 2.24119 3.17148 3.22167 2.31958C4.20216 1.46766 5.34977 0.826465 6.59221 0.436352C7.83465 0.0462397 9.14502 -0.084329 10.4408 0.0528522C11.7367 0.19004 12.9898 0.592015 14.1213 1.23346C15.2529 1.87491 16.2384 2.74194 17.0158 3.77994C17.7964 2.74948 18.783 1.89001 19.9139 1.25538C21.0446 0.62074 22.2952 0.224577 23.5873 0.0916773C24.8796 -0.0412227 26.1854 0.0920147 27.4233 0.483027C28.6612 0.874052 29.8045 1.51445 30.7815 2.36414C31.7585 3.21383 32.5483 4.25452 33.1015 5.42108C33.6546 6.58763 33.9592 7.85495 33.9962 9.1437C34.0331 10.4325 33.8015 11.7149 33.3162 12.9108C32.8307 14.1066 32.1018 15.1903 31.175 16.0936" fill="white"/>
                    </svg>  
                    :
                    <svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M32.175 17.0824L18.0158 31L3.85639 17.0824C2.92246 16.1805 2.18681 15.0964 1.69577 13.8984C1.20474 12.7004 0.968955 11.4145 1.00327 10.1216C1.03758 8.82878 1.34126 7.55698 1.89515 6.3863C2.44906 5.21564 3.24119 4.17148 4.22167 3.31958C5.20216 2.46766 6.34977 1.82646 7.59221 1.43635C8.83465 1.04624 10.145 0.915671 11.4408 1.05285C12.7367 1.19004 13.9898 1.59201 15.1213 2.23346C16.2529 2.87491 17.2384 3.74194 18.0158 4.77994C18.7964 3.74948 19.783 2.89001 20.9139 2.25538C22.0446 1.62074 23.2952 1.22458 24.5873 1.09168C25.8796 0.958777 27.1854 1.09201 28.4233 1.48303C29.6612 1.87405 30.8045 2.51445 31.7815 3.36414C32.7585 4.21383 33.5483 5.25452 34.1015 6.42108C34.6546 7.58763 34.9592 8.85495 34.9962 10.1437C35.0331 11.4325 34.8015 12.7149 34.3162 13.9108C33.8307 15.1066 33.1018 16.1903 32.175 17.0936" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                }
            </div>
            <div className={styles['action-send']}
                style={{
                    background: 'var(--first-color)'
                }}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.70711 10.7071C1.31658 11.0976 0.683418 11.0976 0.292893 10.7071C-0.0976311 10.3166 -0.0976311 9.68342 0.292893 9.29289L1.70711 10.7071ZM10 4.72575e-08C10.5523 -3.74211e-07 11 0.447715 11 1L11 10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10L9 2L1 2C0.447715 2 2.8711e-07 1.55228 2.8711e-07 1C2.8711e-07 0.447715 0.447715 -1.63477e-07 1 -1.63477e-07L10 4.72575e-08ZM0.292893 9.29289L9.29289 0.292893L10.7071 1.70711L1.70711 10.7071L0.292893 9.29289Z" fill="white"/>
                </svg>
            </div>
        </div>
    </div>
    )
}
export default Post