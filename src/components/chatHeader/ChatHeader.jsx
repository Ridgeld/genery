import React, { useContext } from "react";
import styles from './ChatHeader.module.scss'
import { ElementContext } from '../../providers/ElementProvider';




export default function ChatHeader({id, photo, name, members, onClick, onHeaderClick}) {
    const { theme, setElementColors, elementColors } = useContext(ElementContext);


    return (
        <header className={styles['body']}
            style={{
                background: theme.element_first_color
            }}
            onClick={() => onHeaderClick(id, true)}>
            <div className={styles['photo']}>
                <img src={photo}/>
            </div>
            <div className={styles['info']}>
                <h4 className={styles['name']}
                    style={{
                        color: theme.text_first_color
                    }}>{name}</h4>
                <h6 className={styles['members']}
                    style={{
                        color: theme.element_second_color
                    }}>{`${members} участника`}</h6>
            </div>
            <button className={styles['arrow']}
                onClick={onClick}>
                <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 9C21.5523 9 22 8.55228 22 8C22 7.44772 21.5523 7 21 7L21 9ZM0.292893 7.2929C-0.0976311 7.68342 -0.097631 8.31658 0.292893 8.70711L6.65685 15.0711C7.04738 15.4616 7.68054 15.4616 8.07107 15.0711C8.46159 14.6805 8.46159 14.0474 8.07107 13.6569L2.41421 8L8.07107 2.34315C8.46159 1.95262 8.46159 1.31946 8.07107 0.928933C7.68054 0.538409 7.04738 0.538409 6.65685 0.928933L0.292893 7.2929ZM21 7L1 7L1 9L21 9L21 7Z" fill={elementColors.titleColor}/>
                </svg>
            </button>
        </header>
    );
}