import React, { useContext, useState } from "react";
import styles from './ShowInfo.module.scss'
import { ElementContext } from '../../../providers/ElementProvider';
import { AnimatePresence, FlatTree, motion, useMotionValue } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

function ShowInfo({isShow, header, sticker, info, onCloseWindow, room}){
    const { theme, setElementColors } = useContext(ElementContext);
    return(
        <>
        <AnimatePresence>
            {isShow && (
                <motion.div className={styles['bg']}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}>
                    <motion.div className={styles['window-body']}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            background: theme.element_first_color
                        }}>
                        <div className={styles['header']}>
                            <div className={styles['header-title']}
                                style={{
                                    color: theme.text_first_color
                                }}>{header}</div>
                            <button className={styles['header-button']}
                                onClick={onCloseWindow}>
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 9H9M17 9L9 9M9 9V1M9 9L9 17" stroke={theme.text_first_color} stroke-width="2" stroke-linecap="round"/>
                                </svg>
                            </button>
                        </div>
                        <div className={styles['content']}>
                            <QRCodeSVG 
                                value={`http://sgp.kstu.kg/kstu/${room}`} // Сама ссылка или текст
                                size={350}               // Размер в пикселях
                                bgColor={'#fff'}      // Цвет фона (белый)
                                fgColor={'#000'}      // Цвет самих квадратиков (можно задать фирменный цвет)
                                level={"M"}              // Уровень коррекции ошибок: L, M, Q, H. 
                                                        // Для логотипа ОБЯЗАТЕЛЬНО ставить "H" (High), чтобы часть кода могла перекрыться без потери читаемости
                                marginSize={2}           // Отступ по краям (в "модулях" QR-кода)
                                imageSettings={{
                                    src: `./stickers/${sticker}`,      // Путь к вашей картинке/иконке (из папки public)
                                    height: 100,            // Высота логотипа
                                    width: 100,             // Ширина логотипа
                                    excavate: true,        // Сделать "вырез" (белый квадрат) под логотипом, чтобы он не сливался с кодом
                                }}
                                />
                        </div>
                        <div className={styles['info']}
                            style={{
                                color: theme.text_first_color
                            }}>
                            {info}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        </>
    )
}
export default ShowInfo