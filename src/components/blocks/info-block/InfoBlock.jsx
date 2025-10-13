import React, { useContext } from 'react';
import styles from './InfoBlock.module.scss'
import { ElementContext } from '../../../providers/ElementProvider';

function InfoBlock({name, text, circleColor, onClick}){
    const { theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);

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
        return brightness > 150;
    }

    return(
        <div className={styles['block-body']}
            style={{
                background: theme.element_first_color
            }}
            onClick={onClick}>
            <div className={styles['block-name']}
                style={{
                    color: theme.text_first_color
                }}>
                {name}
            </div>
            <div className={styles['block-text']}
                style={{
                    color: theme.text_first_color
                }}>
                {text} 
            </div>
            <div className={styles['block-arrow']}>
                <div className={styles['circle-arrow']}
                    style={{
                        background: circleColor
                    }}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.70711 10.7071C1.31658 11.0976 0.683418 11.0976 0.292893 10.7071C-0.0976311 10.3166 -0.0976311 9.68342 0.292893 9.29289L1.70711 10.7071ZM10 4.72575e-08C10.5523 -3.74211e-07 11 0.447715 11 1L11 10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10L9 2L1 2C0.447715 2 2.8711e-07 1.55228 2.8711e-07 1C2.8711e-07 0.447715 0.447715 -1.63477e-07 1 -1.63477e-07L10 4.72575e-08ZM0.292893 9.29289L9.29289 0.292893L10.7071 1.70711L1.70711 10.7071L0.292893 9.29289Z" fill={isLightColor(theme.element_first_color) ? '#000' : '#fff'}/>
                    </svg>
                </div>
            </div>
        </div>
    )
}
export default InfoBlock