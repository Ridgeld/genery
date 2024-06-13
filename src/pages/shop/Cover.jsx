import React from 'react';
import styles from './Shop.module.scss'

function Cover({img, textImg}){
    return(
        <div className={styles['image-cover']}>
            <div className={styles['no-select']}></div>
            <img src={img} className={styles['back-image']}/>
            <img src={textImg} className={styles['text-image']}/>
        </div>
    )
}
export default Cover