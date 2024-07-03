import React, { useContext } from 'react';
import styles from './ProgressBar.module.scss'
import { ElementContext } from '../../../providers/ElementProvider';

function ProgressBar({color, progress}){
    const {theme, elementColors, setElementColors } = useContext(ElementContext);
    return(
        <section className={styles['progress-body']}
            style={{
                background: theme.element_first_color
            }}>
            <div className={styles['progress-line']}
                style={{
                    background: color,
                    width: progress
                }}/>
        </section>
    )
}
export default ProgressBar