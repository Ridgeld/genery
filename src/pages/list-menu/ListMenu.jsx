import React, { useContext, useEffect } from 'react';
import styles from './ListMenu.module.scss'
import { ElementContext } from '../../providers/ElementProvider.jsx';
import menuItems from './ListMenu.js';
import '../../themes/default.scss'
import ItemBody from './ItemBody.jsx';

function ListMenu(){
    const { elementColors, setElementColors } = useContext(ElementContext);
    useEffect(() => {
        setElementColors({
            iconColor: 'var(--first-color)',
            titleColor: 'var(--text-first-color)',
            showArrow: false,
            arrowColor: 'var(--text-first-color)',
            isHeaderBackground: true,
            headerBackground: 'var(--background-color)',
            isHeader: true,
            isFooter: true,
            footerBackground: 'var(--background-color)',
            activeElementIndex: 3,
        });
        },[ElementContext]);

    return(
        <div className={styles.container}>
            {menuItems.map((item, index) => (
                <>
                    <div className={styles[`${item.category === 'контакты' ? 'contact-category' : 'category-name'}`]}
                        key={index}
                         style={{
                            color: 'var(--text-first-color)'
                         }}>{item.category}</div>
                    <div className={styles['category-container']}>
                        {item.items.map((item, index) => (
                        <ItemBody 
                            key={index}
                            name={item.name}
                            textColor={'var(--text-first-color)'}
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