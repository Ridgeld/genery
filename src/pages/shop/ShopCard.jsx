import React, { useContext } from 'react';
import styles from './Shop.module.scss';
import Coin from '../../components/coin/Coin';
import { ElementContext } from '../../providers/ElementProvider.jsx';

function ShopCard({category, id, photo, name, label, labelTextColor, labelColor, isBought, isFree, price, onBuyItem}){
    const {theme, elementColors, setElementColors } = useContext(ElementContext);
    return(
        <div className={styles['card-body']}
            style={{
                background: theme.element_first_color
            }}>
            <div className={styles['card-photo-body']}
                style={{
                    background: theme.background_color
                }}>
                <div className={styles['no-select']}></div>
                <img src={photo} className={styles['card-photo']}/>
            </div>
            <div className={styles['card-info']}>
                <div className={styles['card-name']}
                    style={{
                        color: theme.text_first_color
                    }}>{name}</div>
                <div className={styles['card-label']}
                    style={{
                        background: labelColor,
                        color: labelTextColor
                    }}>{label}</div>
            </div>
            <div className={styles['card-action']}>
                <div className={styles['card-price']}
                    style={{
                        color: theme.text_first_color
                    }}>
                    {isBought ? 'Куплено' : isFree ? 'Бесплатно' : <>{price}<Coin color={theme.first_color}/></>}
                </div>
                <div className={styles['card-arrow']}>
                    <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.20711 10.7071C1.81658 11.0976 1.18342 11.0976 0.792893 10.7071C0.402369 10.3166 0.402369 9.68342 0.792893 9.29289L2.20711 10.7071ZM10.5 4.72575e-08C11.0523 -3.74211e-07 11.5 0.447715 11.5 1L11.5 10C11.5 10.5523 11.0523 11 10.5 11C9.94772 11 9.5 10.5523 9.5 10L9.5 2L1.5 2C0.947715 2 0.5 1.55228 0.5 1C0.5 0.447715 0.947715 -1.63477e-07 1.5 -1.63477e-07L10.5 4.72575e-08ZM0.792893 9.29289L9.79289 0.292893L11.2071 1.70711L2.20711 10.7071L0.792893 9.29289Z" fill={theme.text_first_color}/>
                    </svg>
                </div>
            </div>
            {!isBought && 
                <div className={`${styles['card-buy']} ${styles['hidden']}`}>
                    <button className={styles['buy-button']}
                        style={{
                            background: theme.first_color,
                            color: theme.text_third_color
                        }}
                        onClick={() => onBuyItem(category, id, price)}>
                            {isFree ? <>Бесплатно</> 
                            : <>Купить за 
                                    {<div className={styles['button-price']}>
                                        {price}<Coin color={theme.text_first_color}/>
                                    </div>}
                                </>}
                    </button>
                </div> }
        </div>
    )
}
export default ShopCard