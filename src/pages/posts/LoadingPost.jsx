import React, { useContext } from 'react';
import styles from './Post.module.scss';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import SkeletonLoader from '../../components/loaders/skeleton-loader/Skeleton.jsx';
function LoadingPost(){
    const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);

    return(
        <div className={styles['post-body-empty']}
            style={{
                background: theme.element_first_color
            }}>
            <div className={styles['post-info']}>
                <div className={styles['post-author']}>
                    <div className={styles['author-photo-empty']}>
                        <SkeletonLoader 
                            width ={'100%'}
                            height={'100%'}
                            shape={'circle'}/>
                        {/* <img src={userPhoto} className={styles['user-avatar']}/> */}
                    </div>
                    <div className={styles['author-name']}
                        style={{
                            color: theme.text_first_color
                        }}>
                        <SkeletonLoader 
                            width ={'50%'}
                            height={'15px'}
                            shape={'rect'}/>
                    </div>
                </div>
                <div className={styles['post-date']}
                    style={{
                        color: theme.text_first_color
                    }}>
                        <SkeletonLoader 
                            width ={'30%'}
                            height={'15px'}
                            shape={'rect'}/>
                    </div>
            </div>
            <div className={styles['post-data']}>
                <div className={styles['post-text-empty']}>
                    <SkeletonLoader 
                        width ={'100%'}
                        height={'15px'}
                        shape={'rect'}/>
                    <SkeletonLoader 
                        width ={'90%'}
                        height={'15px'}
                        shape={'rect'}/>
                </div>
            </div>
            {/* <div className={styles['post-actions']}>
                <div className={styles['action-like']}
                    style={{
                        background: theme.third_color
                    }}>
                </div>
                <div className={styles['action-send']}
                    style={{
                        background: theme.first_color
                    }}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.70711 10.7071C1.31658 11.0976 0.683418 11.0976 0.292893 10.7071C-0.0976311 10.3166 -0.0976311 9.68342 0.292893 9.29289L1.70711 10.7071ZM10 4.72575e-08C10.5523 -3.74211e-07 11 0.447715 11 1L11 10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10L9 2L1 2C0.447715 2 2.8711e-07 1.55228 2.8711e-07 1C2.8711e-07 0.447715 0.447715 -1.63477e-07 1 -1.63477e-07L10 4.72575e-08ZM0.292893 9.29289L9.29289 0.292893L10.7071 1.70711L1.70711 10.7071L0.292893 9.29289Z" fill={theme.text_first_color}/>
                    </svg>
                </div>
            </div> */}
        </div>
    )
}
export default LoadingPost