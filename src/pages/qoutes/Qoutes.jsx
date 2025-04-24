import React, { useContext, useEffect, useState } from "react";

import styles from './Qoutes.module.scss'
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';

import quotes from "./qoutes.js";


export default function Qoutes() {
    const {theme, elementColors, setElementColors } = useContext(ElementContext);

    const [activeQuoteIndex, setActiveQuoteIndex] = useState(null);
    const navigateTo = useNavigate()

    useEffect(() => {
        setElementColors({
            iconColor: theme.first_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowLink: () => navigateTo('/menu'),
            arrowColor: theme.text_first_color,
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: true,
            footerBackground: theme.background_color,
            activeElementIndex: 0,
        });
        document.body.style.background = theme.background_color
        },[theme]);

    return (
        <div className={styles['container']}>
            {quotes.map((qoute, index) => (
                <motion.div div className={styles['qoute-body']}
                    layout
                    style={{
                        background: theme.element_first_color
                    }}
                    onClick={() => setActiveQuoteIndex(index === activeQuoteIndex ? null : index)}>
                    <div className={styles['qoute-text']}
                        style={{
                            color: theme.text_first_color
                        }}
                    >{qoute.text}</div>
                    <div className={styles['qoute-author']}
                        style={{
                            color: theme.text_first_color
                        }}
                    
                        >Автор: {qoute.author}</div>
                    {/* {activeQuoteIndex === index &&
                        <div className={styles['qoute-info']}
                        style={{
                            color: theme.text_first_color
                        }}
                        >{qoute.info}</div>} */}
                <AnimatePresence>
                {activeQuoteIndex === index && (
                    <motion.div
                    key="info"
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        color: theme.text_first_color,
                        overflow: 'hidden',
                        marginTop: '12px',
                    }}
                    className={styles['qoute-info']}
                    >
                    {qoute.info}
                    </motion.div>
                )}
                </AnimatePresence>
                    <button className={styles['item-circle']}
                        style={{
                            background: theme.first_color
                        }}
                        onClick={(e) => {
                            e.stopPropagation(); // чтобы не сработал общий onClick
                            setActiveQuoteIndex(index === activeQuoteIndex ? null : index);
                        }}>
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.70711 10.7071C1.31658 11.0976 0.683418 11.0976 0.292893 10.7071C-0.0976311 10.3166 -0.0976311 9.68342 0.292893 9.29289L1.70711 10.7071ZM10 4.72575e-08C10.5523 -3.74211e-07 11 0.447715 11 1L11 10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10L9 2L1 2C0.447715 2 2.8711e-07 1.55228 2.8711e-07 1C2.8711e-07 0.447715 0.447715 -1.63477e-07 1 -1.63477e-07L10 4.72575e-08ZM0.292893 9.29289L9.29289 0.292893L10.7071 1.70711L1.70711 10.7071L0.292893 9.29289Z" fill={theme.text_first_color}/>
                        </svg>
                    </button>
                </motion.div>
            ))}
        </div>
    );
}