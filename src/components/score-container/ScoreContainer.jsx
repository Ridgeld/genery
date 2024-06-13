import React from 'react';
import styles from './ScoreContainer.module.scss'
import Coin from '../coin/Coin';
function ScoreContainer({name, count, isBalance}){

    return(
        <div className={styles['score-container']}>
            <div className={styles['name-body']}
                style={{
                    background: 'var(--element-first-color)',
                    color: 'var(--text-first-color)'
                }}>{name}</div>
            <div className={styles['count-body']}
                style={{
                    background: 'var(--element-first-color)',
                    color: 'var(text-first-color)'
                }}>{isBalance ? 
                    <div className={styles['balance-body']}
                        style={{
                            color: 'var(--text-first-color)'
                        }}>{count}<Coin color={'var(--first-color)'}/></div> 
                    : {count}}</div>
        </div>
    )
}
export default ScoreContainer