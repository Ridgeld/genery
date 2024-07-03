import React, { useContext } from 'react';
import styles from './ScoreContainer.module.scss'
import Coin from '../coin/Coin';
import { ElementContext } from '../../providers/ElementProvider.jsx';

function ScoreContainer({name, count, isBalance}){
    const {theme, elementColors, setElementColors } = useContext(ElementContext);
    return(
        <div className={styles['score-container']}>
            <div className={styles['name-body']}
                style={{
                    background: theme.element_first_color,
                    color: theme.text_first_color
                }}>{name}</div>
            <div className={styles['count-body']}
                style={{
                    background: theme.element_first_color,
                    color: theme.text_first_color
                }}>{isBalance ? 
                    <div className={styles['balance-body']}
                        style={{
                            color: theme.text_first_color
                        }}>{count}<Coin color={theme.first_color}/>
                    </div> 
                    : count }</div>
        </div>
    )
}
export default ScoreContainer