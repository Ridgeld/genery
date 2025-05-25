import React, { useContext, useEffect, useState } from 'react';
import styles from './Settings.module.scss';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { ElementContext } from '../../providers/ElementProvider.jsx';

function ThemeBody({name, img, activeTheme , onThemeChange }){
    const { theme, elementColors, setElementColors } = useContext(ElementContext);

    const handleClick = () => {
        onThemeChange(name);
        // console.log(name)
    };
    return(
        <div className={styles['theme-body']}
        style={{
            border: activeTheme === name ? `2px solid ${theme.gradient_first_color}` : 'none'
        }}
        onClick={handleClick}>
            <img src={img} alt={name}/>
            {/* Add a checkmark or some indication if needed */}
            {activeTheme === name && (
                <div className={styles['theme-active']}
                style={{
                    background: theme.first_color
                }}>
                    <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.14645 4.64645C0.951184 4.84171 0.951184 5.15829 1.14645 5.35355C1.34171 5.54882 1.65829 5.54882 1.85355 5.35355L1.14645 4.64645ZM6 1C6 0.723858 5.77614 0.5 5.5 0.5L1 0.5C0.723858 0.5 0.5 0.723858 0.5 1C0.5 1.27614 0.723858 1.5 1 1.5L5 1.5L5 5.5C5 5.77614 5.22386 6 5.5 6C5.77614 6 6 5.77614 6 5.5L6 1ZM1.85355 5.35355L5.85355 1.35355L5.14645 0.646447L1.14645 4.64645L1.85355 5.35355Z" fill={theme.text_third_color}/>
                    </svg>
                </div>
            )}
        </div>
    )
}
export default ThemeBody