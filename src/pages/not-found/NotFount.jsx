import React, { useContext, useEffect } from 'react';
import styles from './NotFound.module.scss'
import { ElementContext } from '../../providers/ElementProvider.jsx';


function NotFound(){
    const {theme, elementColors, setElementColors } = useContext(ElementContext);

    useEffect(() => {
        setElementColors({
            iconColor: theme.text_first_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowColor: theme.text_first_color,
            arrowLink: '#/menu',
            isHeaderBackground: false,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: false,
            footerBackground: theme.background_color,
            activeElementIndex: 3,
        });
        document.body.style.background= theme.background_color
        },[ElementContext]);
    return(
        <div className={styles.container}>
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
            <div className={styles['content-wrapper']}
                style={{
                    background: theme.first_color
                }}>
                <div className={styles['img-wrapper']}>
                    <div className={styles['image-no-select']}></div>
                    <img src='4.png'/>
                </div>
                <h3 className={styles['heading']}
                    style={{color: theme.text_first_color}}>
                Страница не найдена</h3>
            </div>
            {/* {updates.map((update) => (
                <UpdateBody
                    data={update.data}
                    update={update.update}
                    corrections={update.corrections}/>
            ))} */}
        </div>
    )
}
export default NotFound