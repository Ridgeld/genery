import React, { useContext } from "react";
import SkeletonLoader from "../loaders/skeleton-loader/Skeleton";
import { ElementContext } from '../../providers/ElementProvider.jsx';

import styles from './Message.module.scss'


export default function LoadingMessage({isAuthUser}) {
    const { theme, elementColors, setElementColors } = useContext(ElementContext);


    const AuthUserLoading = [
        <div className={styles['wrapper']}
            style={{
                justifyContent: 'flex-end'
            }}>
            <div className={styles['body']}
                style={{
                    background: isAuthUser ? theme.first_color : theme.element_first_color,
                    borderRadius: isAuthUser ? '10px 10px 0 10px' : '10px 10px 10px 0',
                }}>
                <div className={styles['text-empty']}
                    style={{
                        color: theme.text_first_color
                    }}>
                    {/* {text} */}
                    <SkeletonLoader 
                        width ={'100px'}
                        height={'16px'}
                        shape={'rect'}/>
                    <SkeletonLoader 
                        width ={'70px'}
                        height={'16px'}
                        shape={'rect'}/>
                </div>
                <div className={styles['time']}
                    style={{
                        color: theme.text_first_color,
                        marginLeft: 'auto'
                    }}>
                    <SkeletonLoader 
                        width ={'100%'}
                        height={'100%'}
                        shape={'rect'}/>
                </div>
            </div>
        </div>

    ]
    const OtherUserLoading = [
        <div className={styles['wrapper']}
            style={{
                justifyContent: 'flex-start'
            }}>
            <div className={styles['body']}
                style={{
                    background: theme.element_first_color,
                    borderRadius: '10px 10px 10px 0',
                }}>
                <div className={styles['text-empty']}
                    style={{
                        color: theme.text_first_color
                    }}>
                    <SkeletonLoader 
                        width ={'100px'}
                        height={'16px'}
                        shape={'rect'}/>
                    <SkeletonLoader 
                        width ={'60px'}
                        height={'16px'}
                        shape={'rect'}/>
                </div>
                <div className={styles['time']}
                    style={{
                        color: theme.text_first_color,
                        marginLeft: 'auto'
                    }}>
                </div>
            </div>
        </div>
    ]
    return (
        isAuthUser ? AuthUserLoading : OtherUserLoading
    );
}