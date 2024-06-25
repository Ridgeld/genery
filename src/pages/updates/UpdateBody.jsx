import React, { useContext } from 'react';
import styles from './Updates.module.scss'
import { ElementContext } from '../../providers/ElementProvider.jsx';

function UpdateBody({data, update, corrections}){
    const {theme, elementColors, setElementColors } = useContext(ElementContext);

    const updateLines = update ? update.split('\n') : [];
    const correctionLines = corrections ? corrections.split('\n') : [];

    return(
        <div className={styles['update-body']}
            style={{
                background: theme.element_first_color
            }}>
            <div className={styles['update-data']}
                style={{
                    color: theme.text_first_color
                }}>
                {data}
            </div>
            {update &&
                <div className={styles['text-container']}>
                    <div className={styles['title']}
                        style={{
                            color: theme.text_first_color
                        }}>Новые функции:</div>
                    <div className={styles['text']}
                        style={{
                            color: theme.text_first_color 
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
                            color: theme.text_first_color
                        }}>Исправления:</div>
                    <div className={styles['text']}
                        style={{
                            color: theme.text_first_color 
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