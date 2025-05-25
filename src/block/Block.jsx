import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from "./Block.module.scss";
import { useNavigate } from 'react-router-dom';
// import themeColors from '../themes/default.scss';


function Block({backgroundColor, isBorder, borderColor, 
                textColor, name, description, linkTo, 
                arrowBackgroundColor, arrowColor }) {
    const navigateTo = useNavigate();

    const handleClick = () => {
        navigateTo(linkTo)
    }

    function isLightColor(color) {
        if (!color) return false; // Проверка на null или undefined

        let r, g, b;

        if (color.startsWith("#")) {
            if (color.length === 4) { // Обработка коротких hex кодов (#RGB)
                r = parseInt(color[1] + color[1], 16);
                g = parseInt(color[2] + color[2], 16);
                b = parseInt(color[3] + color[3], 16);
            } else if (color.length === 7) { // Обработка полных hex кодов (#RRGGBB)
                r = parseInt(color.slice(1, 3), 16);
                g = parseInt(color.slice(3, 5), 16);
                b = parseInt(color.slice(5, 7), 16);
            } else {
                return false; // Некорректный формат hex
            }
        } else if (color.startsWith("rgb")) {
            const values = color.substring(color.indexOf('(') + 1, color.lastIndexOf(')')).split(',').map(Number);
            if (values.length === 3) {
                r = values[0];
                g = values[1];
                b = values[2];
            } else {
                return false; // Некорректный формат rgb
            }
        } else {
          // Попробуем преобразовать именованный цвет с помощью CSS
          const tempDiv = document.createElement('div');
          tempDiv.style.color = color;
          document.body.appendChild(tempDiv);
          const computedColor = window.getComputedStyle(tempDiv).color;
          document.body.removeChild(tempDiv);

          if (computedColor.startsWith("rgb")) {
            const values = computedColor.substring(computedColor.indexOf('(') + 1, computedColor.lastIndexOf(')')).split(',').map(Number);
            if (values.length === 3) {
                r = values[0];
                g = values[1];
                b = values[2];
            } else {
                return false; // Некорректный формат rgb
            }
          } else {
            return false; // Неподдерживаемый формат цвета
          }
        }

        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        console.log(`Светлость: ${brightness}`)
        return brightness > 150;
    }


    return(
        <div className={styles.block} 
             style={{
                background: backgroundColor,
                transition: '0.5s ease',
                border: isBorder ? `2px solid ${borderColor}` : 'none'
                }}
             onClick={handleClick}>
            <div className={styles.info}>
                <div className={styles.title} 
                     style={{color: textColor}}>{name}</div>
                <div className={styles.text} 
                     style={{color: textColor}}> {description} </div>
            </div>
            <div className={styles['arrow-container']}>
                <div className={styles['circle-arrow']}
                    style={{
                        background: arrowBackgroundColor
                    }}>
                    <svg width="20" height="20" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.70711 10.7071C1.31658 11.0976 0.683418 11.0976 0.292893 10.7071C-0.0976311 10.3166 -0.0976311 9.68342 0.292893 9.29289L1.70711 10.7071ZM10 -9.62973e-08C10.5523 -9.62973e-08 11 0.447715 11 1V10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10V2H1C0.447716 2 2.84554e-07 1.55228 2.84554e-07 1C2.84554e-07 0.447715 0.447716 -9.62973e-08 1 -9.62973e-08H10ZM0.292893 9.29289L9.29289 0.292893L10.7071 1.70711L1.70711 10.7071L0.292893 9.29289Z" fill={arrowBackgroundColor ? isLightColor(arrowBackgroundColor) ? "#000" : '#fff' : arrowColor}/>
                    </svg>
                </div>
            </div>
        </div>
    )
}
export default Block

// Block.prototypes = {
//     name: PropTypes.string,
//     text: PropTypes.string,
//     textColor: PropTypes.string,
//     backgroundColor: PropTypes.string,
//     arrowColor: PropTypes.string,
//     arrowBackgroundColor: PropTypes.string,
//     isCircleArrow: PropTypes.bool,
// }
