import React, { useContext, useEffect, useRef, useState } from 'react';
import styles from './Post.module.scss'
import { ElementContext } from '../../providers/ElementProvider.jsx';
import '../../themes/default.scss';
import Post from './Post.jsx';
import { useAuth } from "../../providers/Authprovired.jsx";

import { addDoc, collection, onSnapshot, deleteDoc, getDocs, orderBy, query  } from "firebase/firestore"; 
import { db, storage } from '../../../firebase.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function PostContainer(){
    const [posts, setPosts] = useState([]);
    const [textPost, setTextPost] = useState('');
    const [image, setImage] = useState(null);
    const inputBodyRef = useRef(null);
    const { elementColors, setElementColors } = useContext(ElementContext);
    const { authUser } = useAuth();
    useEffect(() => {
        setElementColors({
            iconColor: 'var(--first-color)',
            titleColor: 'var(--text-first-color)',
            showArrow: true,
            arrowColor: 'var(--text-first-color)',
            arrowLink: '#/menu',
            isHeaderBackground: true,
            headerBackground: 'var(--background-color)',
            isHeader: true,
            isFooter: true,
            footerBackground: 'var(--background-color)',
            activeElementIndex: 2,
        });
        },[ElementContext]);

        useEffect(() => {
            const unlisten = onSnapshot(
                query(collection(db, 'posts'), orderBy('timestamp', 'desc')),
                snapshot => {
                    const postsArray = [];
    
                    snapshot.forEach((doc) => {
                        const postData = doc.data();
                        const postDate = new Date(postData.timestamp);
                        const postUsersLike = postData.LikeArray;
                        // Преобразование даты в формат "дд месяц"
                        const dateString = postDate.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' });
    
                        // Добавление нового сообщения в массив
                        postsArray.push({
                            id: doc.id,  // добавляем уникальный идентификатор документа
                            userName: postData.userName,
                            userPhoto: postData.userPhoto,
                            postText: postData.text,
                            postPhoto: postData.photo,
                            postData: dateString,
                            likesArray: postUsersLike,
                        });
                    });
    
                    setPosts(postsArray);
                }
            );
    
            return () => {
                unlisten();
            };
        }, []);
    const handlePostChange = (event) =>{
        setTextPost(event.target.value);
        event.target.style.height = '25px'; // Сброс высоты
        event.target.style.height = `${event.target.scrollHeight}px`;
        if (inputBodyRef.current) {
            inputBodyRef.current.style.height = `${event.target.scrollHeight}px`;
            if(inputBodyRef.current.style.height >= '40px'){
                inputBodyRef.current.style.borderRadius = '20px';
            }
        }
    }
    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };
    const handleKeyPress = (event) =>{
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSend();
            setTextPost('');
        }
    }
    const handleSend = async () => {
        if (textPost.trim() !== '' || image) {
            try {
                console.log(image)
                const timestamp = new Date().toISOString();
                let photoUrl = '';
                if (image) {
                    const storageRef = ref(storage, `post_photos/${authUser._id}/${timestamp}_${image.name}`);
                    await uploadBytes(storageRef, image);
                    // console.log(storageRef);
                    photoUrl = await getDownloadURL(storageRef);
                    console.log(photoUrl);
                }

                setTextPost('');
                setImage(null);
                await savePostToFirestore(textPost, photoUrl);
    
            } catch (error) {
                console.error("Error handling send: ", error);
            }  finally {
                // setIsLoading(false);
            }
        }
    }
    const savePostToFirestore = async (text, photo) => {
        try {
            const timestamp = new Date().toISOString();
            await addDoc(collection(db, 'posts'), {
                photo: photo,
                text: text,
                timestamp: timestamp,
                userName: authUser.name,
                userPhoto: authUser.avatar,
                LikeArray: [],
            });
            console.log("Message saved successfully.");
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };
    return(
        <div className={styles.container}>
            <div className={styles['message-action']}>
                <div className={styles['add-file']}
                    style={{
                        background: 'var(--element-first-color)',
                    }}
                    onClick={() => document.getElementById('file-input').click()}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 9H9M17 9L9 9M9 9V1M9 9L9 17" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <input
                        type="file"
                        id="file-input"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />
                </div>
                    <div className={styles['input-body']}
                        style={{
                            background: 'var(--element-first-color)'
                        }}
                        >
                        { image &&     
                        <div className={styles['image-preview']}>
                            <div className={styles['remove-image']}
                                onClick={() => setImage(null)}>
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 9H9M17 9L9 9M9 9V1M9 9L9 17" stroke="white" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                            </div>
                            {image && <img src={URL.createObjectURL(image)} alt="Preview" />}
                        </div>}
                        <div className={styles['input-component']}
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
                                    onChange={handlePostChange}
                                    onKeyPress={handleKeyPress}
                                    value={textPost}
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
                </div>
                {/* <button onClick={deleteAllMessages}>Удалить все сообщения</button> */}
            {posts.map((post) => (
                <Post 
                    key={post.id}
                    postId={post.id}
                    userName={post.userName}
                    userPhoto={post.userPhoto}
                    postData={post.postData}
                    postText={post.postText}
                    postPhoto={post.postPhoto}
                    likesArray={post.likesArray}
                />
            ))}

        </div>
    )
}
export default PostContainer