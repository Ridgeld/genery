import React from 'react';
import styles from './Updates.module.scss'

function UpdateBody({data, update, corrections}){

    const updateLines = update ? update.split('\n') : [];
    const correctionLines = corrections ? corrections.split('\n') : [];

    return(
        <div className={styles['update-body']}
            style={{
                background: 'var(--element-first-color)'
            }}>
            <div className={styles['update-data']}
                style={{
                    color: 'var(--text-first-color)'
                }}>
                {data}
            </div>
            {update &&
                <div className={styles['text-container']}>
                    <div className={styles['title']}
                        style={{
                            color: 'var(--text-first-color)'
                        }}>Новые функции:</div>
                    <div className={styles['text']}
                        style={{
                            color: 'var(--text-first-color)' 
                        }}>
                        {updateLines.map((line, index) => (
                            <React.Fragment key={index}>
                                {line}
                                <br/>
                            </React.Fragment>
                        ))}
                    </div>
                </div>}
                {corrections &&
                <div className={styles['text-container']}>
                    <div className={styles['title']}
                        style={{
                            color: 'var(--text-first-color)'
                        }}>Исправления:</div>
                    <div className={styles['text']}
                        style={{
                            color: 'var(--text-first-color)' 
                        }}>
                        {correctionLines.map((line, index) => (
                            <React.Fragment key={index}>
                                {line}
                                <br/>
                            </React.Fragment>
                        ))}
                    </div>
                </div>}
        </div>
    )
}
export default UpdateBody