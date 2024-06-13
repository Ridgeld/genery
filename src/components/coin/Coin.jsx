import React from 'react';
import styles from './Coin.module.scss'

function Coin({color}){
    return(
        <div className={styles['coin-outer']}
            style={{
                background: color
            }}>
            <div className={styles['coin-inner']}></div>
        </div>
    )
}
export default Coin