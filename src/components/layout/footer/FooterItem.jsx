import React, { useContext } from "react";
import styles from './Footer.module.scss'
import { ElementContext } from '../../../providers/ElementProvider';
import {motion} from 'framer-motion';
import ItemAnimate from "./ItemAnimate";

function FooterItem({ icon, link, isActive}) {
    const { theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);

    return (
        <motion.a className={styles['item-body']}
                layout
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.active_element_color;
                }}
                onMouseLeave={(e) => {
                    // e.currentTarget.style.background = isActive ? theme.active_element_color : 'none';
                    e.currentTarget.style.background = 'none';
                }}
                href={link} >
            <div 
                // initial={{background: 'none'}}
                // animate={{background: isActive ? theme.active_element_color : 'none'}}
                className={styles['item']}>
                {icon}
            </div>
            {isActive && <ItemAnimate/>}
        </motion.a>
    );
}


export default FooterItem;