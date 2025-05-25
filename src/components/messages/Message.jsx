import React, { useContext } from "react";
import styles from './Message.module.scss'
import { useAuth } from "../../providers/Authprovired";
import { ElementContext, useTheme } from '../../providers/ElementProvider.jsx';
import ChatHeader from "../../components/chatHeader/ChatHeader.jsx";
import parsedText from "../../functions/parsed-text/parsedText.jsx";
import { motion } from 'framer-motion';
import parser from 'html-react-parser';


export default function Message({userId, userName, nameColor, userPhoto,photos,handlePhotoClick, text, time}) {

    const {theme, setElementColors } = useContext(ElementContext);

    const { authUser } = useAuth()
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


    const AuthUserMessage = [
        <div className={styles['wrapper']}
            style={{
                justifyContent: 'flex-end'
            }}>
            <div className={styles['body']}
                style={{
                    background: userId === authUser._id ? theme.first_color : theme.element_first_color,
                    borderRadius: userId === authUser._id ? '10px 10px 0 10px' : '10px 10px 10px 0',
                }}>
                {/* <div className={styles['user-name']}
                    style={{
                        color: theme.text_first_color
                    }}>
                    {userName}
                </div> */}
                {photos && 
                    <div className={styles['images-body']}
                        style={{
                            borderRadius: '8px'
                        }}>
                        <div className={styles[`images-wrapper_${photos.length}`]}>
                            {photos.map((image, index)=> (
                                <motion.div className={styles[`image_${index}`]}
                                    whileTap={{scale: 1.5}}>
                                        <img src={image}
                                        onClick={() => handlePhotoClick(photos, index)}/> 
                                </motion.div>
                            ))}
                        </div>
                    </div> }
                {text && 
                    <div className={styles['text']}
                        style={{
                            color: theme.text_third_color
                        }}>
                        {/* {text} */}
                        {parsedText(text)}
                    </div>
                }
                <div className={styles['time']}
                    style={{
                        color: theme.text_third_color,
                        marginLeft: 'auto'
                    }}>
                    {time}
                </div>
            </div>
            {/* <div className={styles['user-photo']}>
                <img src={userPhoto}/>
            </div> */}
        </div>
    ]
    const OtherUserMessage = [
        <div className={styles['wrapper']}
            style={{
            
            }}>
            <div className={styles['user-photo']}>
                <img src={userPhoto}/>
            </div>
            <div className={styles['body']}
                style={{
                    background: userId === authUser._id ? theme.first_color : theme.element_first_color,
                    borderRadius: userId === authUser._id ? '10px 10px 0 10px' : '10px 10px 10px 0',
                }}>
                <div className={styles['user-name']}
                    style={{
                        color: nameColor
                    }}>
                    {userName}
                </div>
                {photos && 
                    <div className={styles['images-body']}>
                        <div className={styles[`images-wrapper_${photos.length}`]}>
                            {photos.map((image, index)=> (
                                <motion.div className={styles[`image_${index}`]}
                                    whileTap={{scale: 1.5}}>
                                        <img src={image}
                                        onClick={() => handlePhotoClick(photos, index)}/> 
                                </motion.div>
                            ))}
                        </div>
                    </div> }
                <div className={styles['text']}
                    style={{
                        color: theme.text_first_color
                    }}>
                    {parsedText(text)}
                </div>
                <div className={styles['time']}
                    style={{
                        color: theme.text_first_color,
                        marginLeft: userId === authUser._id ? '9' : 'auto'
                    }}>
                    {time}
                </div>
            </div>
        </div>
    ]

    

    return (
        // <div className={styles['wrapper']}
        //     style={{
               
        //     }}>
        //     <div className={styles['user-photo']}>
        //         <img src={userPhoto}/>
        //     </div>
        //     <div className={styles['body']}
        //         style={{
        //             background: userId === authUser._id ? theme.first_color : theme.element_first_color,
        //             borderRadius: userId === authUser._id ? '10px 10px 0 10px' : '10px 10px 10px 0',
        //         }}>
        //         <div className={styles['user-name']}
        //             style={{
        //                 color: nameColor
        //             }}>
        //             {userName}
        //         </div>
        //         <div className={styles['text']}
        //             style={{
        //                 color: theme.text_first_color
        //             }}>
        //             {text}
        //         </div>
        //         <div className={styles['time']}
        //             style={{
        //                 color: theme.element_second_color,
        //                 marginLeft: userId === authUser._id ? '9' : 'auto'
        //             }}>
        //             {time}
        //         </div>
        //     </div>
        // </div>
            userId === authUser._id ? AuthUserMessage : OtherUserMessage

    );
}