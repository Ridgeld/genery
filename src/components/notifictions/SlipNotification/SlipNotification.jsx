import React from 'react';
import styles from './SlipNotification.module.scss';


function SlipNotification({text, isShow}){
    return(
        <div className={`${styles['notif-area']} ${styles['animated']} ${isShow ? styles['show'] : ''}`}>
            <div className={styles['notif-body']}
                style={{
                    background: 'var(--element-first-color)',
                    color: 'var(--text-first-color)'
                }}>
                {text}
            </div>
        </div>
    )
}
export default SlipNotification