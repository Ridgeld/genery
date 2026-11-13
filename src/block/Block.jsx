import React from 'react';
import styles from "./Block.module.scss";
import { useNavigate } from 'react-router-dom';
import { getBlockIcon } from './blockIcons.jsx';

function isLightColor(color) {
    if (!color) return false;

    let c = color;
    if (typeof c === 'string' && c.includes('gradient')) {
        const hexMatch = c.match(/#[a-fA-F0-9]{3,8}/);
        if (hexMatch) {
            c = hexMatch[0];
        } else {
            const rgbMatch = c.match(/rgba?\([^)]+\)/);
            if (rgbMatch) c = rgbMatch[0];
        }
    }

    let r = 0, g = 0, b = 0;

    if (typeof c === 'string' && c.startsWith("#")) {
        if (c.length === 4) {
            r = parseInt(c[1] + c[1], 16);
            g = parseInt(c[2] + c[2], 16);
            b = parseInt(c[3] + c[3], 16);
        } else if (c.length >= 7) {
            r = parseInt(c.slice(1, 3), 16);
            g = parseInt(c.slice(3, 5), 16);
            b = parseInt(c.slice(5, 7), 16);
        }
    } else if (typeof c === 'string' && c.startsWith("rgb")) {
        const values = c.substring(c.indexOf('(') + 1, c.lastIndexOf(')')).split(',').map(Number);
        if (values.length >= 3) {
            r = values[0];
            g = values[1];
            b = values[2];
        }
    }

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150;
}

function Block({
    backgroundColor,
    isBorder,
    borderColor,
    textColor,
    name,
    description,
    linkTo,
    arrowBackgroundColor,
    arrowColor,
    bgIcon
}) {
    const navigateTo = useNavigate();

    const handleClick = () => {
        if (linkTo) navigateTo(linkTo);
    };

    const light = isLightColor(backgroundColor);
    const contentColor = textColor || (light ? '#000000' : '#ffffff');
    const resolvedBgIcon = bgIcon !== undefined ? bgIcon : getBlockIcon(linkTo, name);

    return (
        <div 
            className={styles.block} 
            style={{
                background: backgroundColor,
                border: isBorder ? `2px solid ${borderColor}` : 'none'
            }}
            onClick={handleClick}
        >
            {resolvedBgIcon && (
                <div 
                    className={styles.bgIcon}
                    style={{ color: contentColor }}
                >
                    {resolvedBgIcon}
                </div>
            )}

            <div className={styles.info}>
                <div className={styles.title} style={{ color: contentColor }}>
                    {name}
                </div>
                <div className={styles.text} style={{ color: contentColor }}>
                    {description}
                </div>
            </div>

            <div className={styles['arrow-container']}>
                <div 
                    className={styles['circle-arrow']}
                    style={{ background: arrowBackgroundColor }}
                >
                    <svg width="20" height="20" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.70711 10.7071C1.31658 11.0976 0.683418 11.0976 0.292893 10.7071C-0.0976311 10.3166 -0.0976311 9.68342 0.292893 9.29289L1.70711 10.7071ZM10 -9.62973e-08C10.5523 -9.62973e-08 11 0.447715 11 1V10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10V2H1C0.447716 2 2.84554e-07 1.55228 2.84554e-07 1C2.84554e-07 0.447715 0.447716 -9.62973e-08 1 -9.62973e-08H10ZM0.292893 9.29289L9.29289 0.292893L10.7071 1.70711L1.70711 10.7071L0.292893 9.29289Z" fill={arrowColor || contentColor}/>
                    </svg>
                </div>
            </div>
        </div>
    );
}

export default Block;
