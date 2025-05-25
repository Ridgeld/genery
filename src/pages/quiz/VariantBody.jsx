import React, { useContext, useEffect, useState } from 'react';
import styles from './Quiz.module.scss'
import { ElementContext, useTheme } from '../../providers/ElementProvider.jsx';
import { transform } from 'framer-motion';

function VariantBody({name, state, onClick}){
    const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);

    const variants = {
        correct : {
                    isBackground: true,
                    color: theme.first_color, 
                    svg: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.13574 8.5C0.583457 8.5 0.135742 8.05228 0.135742 7.5C0.135742 6.94772 0.583457 6.5 1.13574 6.5V8.5ZM14.5708 6.79289C14.9613 7.18342 14.9613 7.81658 14.5708 8.20711L8.20681 14.5711C7.81629 14.9616 7.18312 14.9616 6.7926 14.5711C6.40207 14.1805 6.40207 13.5474 6.7926 13.1569L12.4495 7.5L6.7926 1.84315C6.40207 1.45262 6.40207 0.819456 6.7926 0.428932C7.18312 0.0384079 7.81629 0.0384079 8.20681 0.428932L14.5708 6.79289ZM1.13574 6.5L13.8637 6.5V8.5H1.13574V6.5Z" fill={theme.text_third_color}/>
                        </svg>,
                    transform: 'rotate(-45deg)',
                    isBorder: false,
        },
        incorrect : {
                    isBackground: true,
                    color: theme.third_color,
                    svg: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.13574 8.5C0.583457 8.5 0.135742 8.05228 0.135742 7.5C0.135742 6.94772 0.583457 6.5 1.13574 6.5V8.5ZM14.5708 6.79289C14.9613 7.18342 14.9613 7.81658 14.5708 8.20711L8.20681 14.5711C7.81629 14.9616 7.18312 14.9616 6.7926 14.5711C6.40207 14.1805 6.40207 13.5474 6.7926 13.1569L12.4495 7.5L6.7926 1.84315C6.40207 1.45262 6.40207 0.819456 6.7926 0.428932C7.18312 0.0384079 7.81629 0.0384079 8.20681 0.428932L14.5708 6.79289ZM1.13574 6.5L13.8637 6.5V8.5H1.13574V6.5Z" fill={theme.text_first_color}/>
                        </svg>,
                    transform: 'rotate(45deg)',
                    isBorder: false,
        },
        base: { 
                isBackground: false,
                color: theme.element_first_color,
                svg: '',
                transform: 'none',
                isBorder: true,
        },
    }
    const variant = variants[state] || variants.base;

    // const handleItemClick = (name, index) =>{

    // }
    return(
        <section 
            variants={variants}
            className={styles['variant-body']}
            style={{
                border: `2px solid ${variant.color}`
            }}
            onClick={onClick}>
            <h4 className={styles['variant-name']}
                style={{
                    color: theme.text_first_color
                }}>{name}</h4>
            <div className={styles['variant-circle']}
                style={{
                    background: variant.isBackground ? variant.color : 'none',
                    border: variant.isBorder ? `2px solid ${theme.element_first_color}` : 'none',
                    transform: variant.transform
                    }}>
                {variant.svg}
            </div>
        </section>
    )
}
export default VariantBody