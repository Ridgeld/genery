import React, { useContext } from 'react';
import styles from './DropMenu.module.scss';
import {motion} from 'framer-motion';
import { ElementContext } from '../../../providers/ElementProvider';
import items from './DropMenu';
import parse from "html-react-parser";


function DropMenu({isShow, onClick}){
    const { theme, setElementColors } = useContext(ElementContext);

    const handleItemClick = (id) => {
        onClick(id)
    };

    const variants = {
        open: { opacity: 1, scale: 1 },
        closed: { opacity: 0, scale: 0 },
    }

    return(
        <motion.div className={styles['body']}
            animate={isShow ? "open" : "closed"}
            variants={variants}
            transition={{
                duration: 0.1
            }}
            style={{
                background: theme.element_second_color,
                boxShadow: `0 5px 10px 5px ${theme.shadow_color}`,
            }}>
            {items.map((item, index) => {
                const iconWithThemeColor = item.icon.replace(/{theme.text_first_color}/g, theme.text_first_color);
                return(
                    <div className={styles['item-body']}
                        key={index}
                        onClick={() => handleItemClick(item.id)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = theme.active_element_color;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                        }}>
                        <div className={styles['item-info']}>
                            <div className={styles['item-icon']}>
                                {parse(iconWithThemeColor)}
                            </div>
                            <div className={styles['item-name']}
                                style={{
                                    color: theme.text_first_color
                                }}>
                                {item.name}
                            </div>
                        </div>
                    </div>
                )   
            })}
        </motion.div>
    )
}
export default DropMenu