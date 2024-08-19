import React, { useContext, useEffect } from 'react';
import styles from './Updates.module.scss'
import { ElementContext } from '../../providers/ElementProvider.jsx';
import updates from './Updates.js';
import UpdateBody from './UpdateBody.jsx';

function Updates(){
    const {theme, elementColors, setElementColors } = useContext(ElementContext);

    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowColor: theme.text_first_color,
            arrowLink: '#/menu',
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: true,
            footerBackground: theme.background_color,
            activeElementIndex: 4,
        });
        document.body.style.background = theme.background_color
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
            {updates.map((update) => (
                <UpdateBody
                    data={update.data}
                    update={update.update}
                    corrections={update.corrections}/>
                // <div>
                //     <div>{update.data}</div>
                //     {update.update && <div>{update.update}</div>}
                //     {update.corrections && <div>{update.corrections}</div>}
                // </div>
                
            ))}
        </div>
    )
}
export default Updates