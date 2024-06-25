import React, { useContext } from 'react';
import styles from './Downloads.module.scss'
import { ElementContext } from '../../providers/ElementProvider.jsx';
import SkeletonLoader from '../../components/loaders/skeleton-loader/Skeleton.jsx';
function LoadingBody(){
    const {theme, elementColors, setElementColors } = useContext(ElementContext);

    return(
        <div className={styles['download-body']}
            style={{
                border: `2px solid ${theme.element_first_color}`
            }}>
            <div className={styles['download-name-empty']}
                style={{
                    color: theme.text_first_color
                }}>
                <SkeletonLoader 
                    width ={'100%'}
                    height={'18px'}
                    shape={'rect'}/>
            </div>
            <div className={styles['download-button-empty']}>
                <SkeletonLoader 
                        width ={'32px'}
                        height={'32px'}
                        shape={'circle'}/>
            </div>
            {/* <button className={styles['download-button']}
                style={{
                    background: buttonColor
                }}>
                <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 1C9 0.447715 8.55228 2.41411e-08 8 0C7.44772 -2.41411e-08 7 0.447715 7 1L9 1ZM7.29289 14.435C7.68342 14.8256 8.31658 14.8256 8.70711 14.435L15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685C14.6805 6.26633 14.0474 6.26633 13.6569 6.65685L8 12.3137L2.34315 6.65685C1.95262 6.26633 1.31946 6.26633 0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107L7.29289 14.435ZM7 1L7 13.7279L9 13.7279L9 1L7 1Z" fill={arrowColor}/>
                </svg>
            </button> */}
        </div>
    )
}
export default LoadingBody