import React from 'react'
import styles from './AlertNotification.module.scss'

function AlertNotification({title, text, isShow, firstButtonName, secondButtonName, firstButtonOnClick, secondButtonOnClick}){
    return(
        <div className={`${styles['notif-area']} ${styles['animated']} ${isShow ? styles['show'] : ''}`}>
            <div className={styles['notif-body']}
                style={{
                    background: 'var(--element-first-color)'
                }}>
                <div className={styles['notif-info']}>
                    <div className={styles['notif-title']}
                        style={{
                            color: 'var(--text-first-color)'
                        }}>
                        {title}
                    </div>
                    <div className={styles['notif-text']}
                        style={{
                            color: 'var(--text-first-color)'
                        }}>
                        {text}
                    </div>
                </div>
                <div className={styles['button-container']}>
                    <button className={styles['first-button']}
                        style={{
                            background: 'var(--element-second-color)',
                            color: 'var(--text-first-color)'
                        }}
                        onClick={firstButtonOnClick}>
                        {/* <div className={styles['second-arrow']}>
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.29289 10.7071C9.68342 11.0976 10.3166 11.0976 10.7071 10.7071C11.0976 10.3166 11.0976 9.68342 10.7071 9.29289L9.29289 10.7071ZM1 4.72575e-08C0.447715 -3.74211e-07 -3.74211e-07 0.447715 4.72575e-08 1L-1.63477e-07 10C-1.63477e-07 10.5523 0.447715 11 1 11C1.55228 11 2 10.5523 2 10L2 2L10 2C10.5523 2 11 1.55228 11 1C11 0.447715 10.5523 -1.63477e-07 10 -1.63477e-07L1 4.72575e-08ZM10.7071 9.29289L1.70711 0.292893L0.292893 1.70711L9.29289 10.7071L10.7071 9.29289Z" fill="white"/>
                            </svg>
                        </div> */}
                        {firstButtonName}
                    </button>
                    <button className={styles['second-button']}
                        style={{
                            background: 'var(--first-color)',
                            color: 'var(--text-first-color)'
                        }}
                        onClick={secondButtonOnClick}>
                        {secondButtonName}
                        {/* <div className={styles['second-arrow']}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.29289 9.53553C0.902369 9.92606 0.902369 10.5592 1.29289 10.9497C1.68342 11.3403 2.31658 11.3403 2.70711 10.9497L1.29289 9.53553ZM11.4853 1.75736C11.4853 1.20508 11.0376 0.75736 10.4853 0.75736L1.48528 0.75736C0.932997 0.75736 0.485281 1.20508 0.485281 1.75736C0.485281 2.30965 0.932997 2.75736 1.48528 2.75736L9.48528 2.75736L9.48528 10.7574C9.48528 11.3096 9.933 11.7574 10.4853 11.7574C11.0376 11.7574 11.4853 11.3096 11.4853 10.7574L11.4853 1.75736ZM2.70711 10.9497L11.1924 2.46447L9.77817 1.05025L1.29289 9.53553L2.70711 10.9497Z" fill={'var(--text-first-color)'}/>
                            </svg>
                        </div> */}
                    </button>
                </div>
            </div>
        </div>
    )
}
export default AlertNotification