import React, { useContext } from 'react';
import styles from './Quiz.module.scss';
import { ElementContext, useTheme } from '../../providers/ElementProvider.jsx';


function Block({ blockColor, name, textColor, arrowBackground, labelColor, labelTextColor, labelName, onClick }){
    const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);

    return(
        <div className={styles['block']}
            style={{
                background: blockColor
            }}
            onClick={onClick}>
            <section className={styles['block-info']}>
                <h5 className={styles['block-name']}
                    style={{
                        color: textColor
                    }}>{name}</h5>
                <div className={styles['block-label']}
                    style={{
                        background: labelColor,
                        color: labelTextColor
                    }}>
                    {labelName}
                </div>
            </section>
            <div className={styles['block-arrow']}
                style={{
                    background: arrowBackground
                }}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.70711 10.7071C1.31658 11.0976 0.683418 11.0976 0.292893 10.7071C-0.0976311 10.3166 -0.0976311 9.68342 0.292893 9.29289L1.70711 10.7071ZM10 -9.62973e-08C10.5523 -9.62973e-08 11 0.447715 11 1V10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10V2H1C0.447716 2 2.84554e-07 1.55228 2.84554e-07 1C2.84554e-07 0.447715 0.447716 -9.62973e-08 1 -9.62973e-08H10ZM0.292893 9.29289L9.29289 0.292893L10.7071 1.70711L1.70711 10.7071L0.292893 9.29289Z" fill={textColor}/>
                </svg>
            </div>
        </div>
    )
}
export default Block