import React, { useContext } from 'react';
import styles from './Footer.module.scss'
import {motion} from 'framer-motion'
import { ElementContext } from '../../../providers/ElementProvider';

function ItemAnimate(){
    const { theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);

    return(
        <motion.div className={styles['item-bg']}
            layoutId='activeItem'
            style={{
                background: theme.active_element_color
            }}>

        </motion.div>
    )
}
export default ItemAnimate