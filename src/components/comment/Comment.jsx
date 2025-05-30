import React, { useContext, useEffect, useState } from "react"
import styles from './Comment.module.scss'
import { ElementContext } from "../../providers/ElementProvider";
import parser from 'html-react-parser';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../providers/Authprovired";
import DropMenu from '../../components/modal-windows/drop-menu/DropMenu.jsx';

function Comment({isReply, userId, userPhoto, userName, text, showUserProfile, onReply, replies, timestamp, commentId, commentAction}){
    const [DropIsShow, setDropIsShow] = useState(false)
    const { authUser } = useAuth();
    const { theme, elementColors, setElementColors } = useContext(ElementContext);
    const [showReplies, setShowReplies] = useState(false);
    const navigateTo = useNavigate();


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

    const hexToRgb = (hex) => {
        // Убираем решётку в начале HEX-кода
        hex = hex.replace('#', '');
        
        // Конвертируем HEX в RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `rgba(${r}, ${g}, ${b}, 0.2)`; // Добавляем прозрачность
    };



    
    const DropMenuClick =(id) =>{
        commentAction(id, commentId)
        setDropIsShow(false)
    }

    return(
        <div className={styles['comment-wrapper']}>
            <div className={styles['comment-body']}
                style={{
                    // background: theme.element_first_color,
                    // borderRadius : isPreview ? '0 0 20px 20px' : '20px'
                }}>
                <DropMenu 
                    isShow={DropIsShow}
                    onClick={DropMenuClick}/>
                <div className={styles['comment-info']}>
                    <div className={styles['author-info']}
                        onClick={() => showUserProfile(userId)}>
                        <div className={styles['author-photo']}>
                        <img className={styles['avatar']}
                            src={userPhoto}/>
                    </div>
                    <div className={styles['author-name']}
                        style={{
                            color: theme.text_first_color
                        }}>{userName}</div>
                    </div>
                    {(userId === authUser._id) && (
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
                    )}
                </div>
                <div className={styles['comment-text']}
                    style={{
                        color: theme.text_first_color
                    }}>{processContent(text)}</div>
                <div className={styles['comment-actions']}>
                    {!isReply && 
                        <button className={styles['answer-button']}
                            style={{
                                color: theme.text_second_color
                            }}
                            onClick={() => onReply({ userName, commentId })}>Ответить</button> }
                </div>
                {/* {replies && replies.length > 0 && (
                    <button onClick={() => setShowReplies(!showReplies)}
                        className={styles['show-answers']}
                            style={{
                                color: theme.first_color,
                                background: hexToRgb(theme.first_color)
                            }}>
                        {showReplies ? "Скрыть ответы" : `Показать ответы (${replies.length})`}
                    </button>
                )} */}
            </div>
            {/* {showReplies && (
                    <div className={styles['replies']}>
                        {replies.map((reply, index) => (
                             <div key={index} className={styles['comment-body']}>
                                 <div className={styles['author-info']}
                                    onClick={() => showUserProfile(reply.userId)}>
                                    <div className={styles['author-photo']}>
                                        <img className={styles['avatar']}
                                            src={reply.userPhoto}/>
                                    </div>
                                    <div className={styles['author-name']}
                                        style={{
                                            color: theme.text_first_color
                                        }}>{reply.userName}</div>
                                </div>
                                <div className={styles['comment-text']}
                                    style={{
                                        color: theme.text_first_color
                                    }}>
                                    <div className={styles['link-to-answer']}
                                        style={{
                                            color: theme.first_color
                                        }}
                                        onClick={() => navigateTo(`/profile/${reply.userId}`)}>
                                    </div>
                                    {processContent(reply.text)}
                                </div>
                            </div>
                        ))}
                        </div>)} */}
                {/* {showReplies && (
                    <div className={styles['replies']}>
                        {replies.map((reply, index) => (
                            <div key={reply.commentId || index} className={styles['comment-body']}>
                                <DropMenu 
                                    isShow={DropIsShow}
                                    onClick={DropMenuClick} />
                                <div className={styles['comment-info']}>
                                    <div className={styles['author-info']} onClick={() => showUserProfile(reply.userId)}>
                                        <div className={styles['author-photo']}>
                                            <img className={styles['avatar']} src={reply.userPhoto} alt="User Avatar" />
                                        </div>
                                        <div className={styles['author-name']} style={{ color: theme.text_first_color }}>
                                            {reply.userName}
                                        </div>
                                    </div>
                                    {reply.userId === authUser._id && (
                                        <div className={styles['post-delete']} onClick={() => setDropIsShow(!DropIsShow)}>
                                            <div className={styles['post-more']}>
                                                <svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <circle cx="2.5" cy="2.5" r="2.5" fill={theme.text_first_color} />
                                                </svg>
                                                <svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <circle cx="2.5" cy="2.5" r="2.5" fill={theme.text_first_color} />
                                                </svg>
                                                <svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <circle cx="2.5" cy="2.5" r="2.5" fill={theme.text_first_color} />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className={styles['comment-text']} style={{ color: theme.text_first_color }}>
                                    <div className={styles['link-to-answer']}
                                        style={{
                                            color: theme.first_color
                                        }}
                                        onClick={() => navigateTo(`/profile/${reply.userId}`)}>
                                    </div>
                                    {processContent(reply.text)}
                                </div>
                            </div>
                        ))}
                    </div> 
                )}  */}
        </div>
    )

}
export default Comment