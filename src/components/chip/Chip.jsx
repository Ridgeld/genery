import React from 'react';
import styles from './Chip.module.scss'

function Chip({price}){
    return(
        <div className={styles['chip-body']}>
            <div className={styles['chip-inner']}>
                {price}
            </div>
        </div>
    )
}
export default Chip