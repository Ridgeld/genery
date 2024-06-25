import React, { useContext } from 'react';
import styles from './SlipNotification.module.scss';
import { ElementContext } from '../../../providers/ElementProvider';
import {motion, transform} from 'framer-motion'

function SlipNotification({text, isShow}){
    const {theme, elementColors, setElementColors } = useContext(ElementContext);

    const variants = {
        open: { opacity: 1, visibility: 'visible'},
        closed: { opacity: 0, visibility: 'hidden' },
        show: { opacity: 1, transform: 'translate(0, 600%)'},
        hidden: { opacity: 0, transform: 'translate(0, 700%)' },
    }
    return(
        // <motion.div className={`${styles['notif-area']} ${styles['animated']} ${isShow ? styles['show'] : ''}`}
        <motion.div className={styles['notif-area']}
            animate={isShow ? "open" : "closed"}
            variants={variants}
            transition={{
                duration: 0.3
            }}>
            <motion.div className={styles['notif-body']}
                animate={isShow ? "show" : "hidden"}
                variants={variants}
                initial={'hidden'}
                transition={{
                    duration: 0.4
                }}
                style={{
                    background: theme.element_first_color,
                    color: theme.text_first_color
                }}>
                {text}
            </motion.div>
        </motion.div>
    )
}
export default SlipNotification