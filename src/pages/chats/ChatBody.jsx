import React, { useContext } from "react";
import styles from './Chats.module.scss'
import { ElementContext } from '../../providers/ElementProvider';
import parsedText from "../../functions/parsed-text/parsedText.jsx";



export default function ChatBody({id, name, photo, lastMessage, onClick}) {
    const { theme, setElementColors } = useContext(ElementContext);




    return (
        <div className={styles['chat-body']}
            style={{
                // borderBottom: `1px solid ${theme.element_first_color}`,
            }}
            onClick={() => onClick(id)}>
            {/* {name} */}
            <div className={styles['chat-photo']}>
                <img src={photo} alt="ава"/>
            </div>
            <div className={styles['chat-info']}>
                <div className={styles['chat-name']}
                    style={{
                        color: theme.text_first_color
                    }}>
                    {name}
                </div>
                <div className={styles['chat-last-message']}
                    style={{
                        color: theme.text_second_color
                    }}>
                    {parsedText(lastMessage)}
                </div>
            </div>
        </div>
    );
}