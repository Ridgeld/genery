import React, { useContext, useEffect } from 'react';
import styles from './ListMenu.module.scss'
import { ElementContext } from '../../providers/ElementProvider.jsx';
import menuItems from './ListMenu.js';
import '../../themes/default.scss'
import ItemBody from './ItemBody.jsx';

function ListMenu(){
    const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);
    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: false,
            arrowColor: theme.text_first_color,
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: true,
            footerBackground: theme.background_color,
            activeElementIndex: 3,
            background: theme.background_color
        });
        document.body.style.background = theme.background_color
        },[theme]);

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
            {menuItems.map((item, index) => (
                <>
                    <div className={styles[`${item.category === 'контакты' ? 'contact-category' : 'category-name'}`]}
                        key={index}
                         style={{
                            color: theme.text_first_color
                         }}>{item.category}</div>
                    <div className={styles['category-container']}>
                        {item.items.map((item, index) => (
                        <ItemBody 
                            key={index}
                            name={item.name}
                            textColor={theme.text_first_color}
                            category={item.category}
                            icon={item.icon}
                            link={item.link}/>
                        ))}
                    </div>
                </>
            ))}
        </div>
    )
}
export default ListMenu