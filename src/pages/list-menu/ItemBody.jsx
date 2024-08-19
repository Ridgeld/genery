import React, { useContext, useEffect, useState } from 'react';
import styles from './ListMenu.module.scss';
import '../../themes/default.scss';
import { useNavigate } from 'react-router-dom';
import parse from "html-react-parser";
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { useAuth } from "../../providers/Authprovired.jsx";


function ItemBody({name, textColor, icon, link, category}){
    const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);
    const [iconColor, setIconColor] = useState(theme.text_first_color);
    const [circleColor, setCircleColor] = useState(theme.first_color);
    const [arrowColor, setArrowColor] = useState(theme.text_first_color);
    const navigate = useNavigate();
    const { authUser } = useAuth();

    const navigateTo = (url) => {
        if(url.includes('https:')){
            window.location.href = url;
        } else {
            if(url === '/timetable'){
                navigate(`/timetable/${authUser.mainGroup}`);
                return
            }
            if(url === '/downloads'){
                navigate(`/download/${authUser.mainGroup}`)
                return
            }
            navigate(url)
        }
    };

    const categoryColors = {
        first: { circle: theme.first_color, icon: theme.text_first_color },
        second: { circle: theme.second_color, icon: theme.text_second_color },
        third: { circle: theme.third_color, icon: theme.text_first_color },
        contact: { circle: theme.element_first_color, icon: theme.text_first_color }
        
    };
    useEffect(() => {
        if (category in categoryColors) {
            setCircleColor(categoryColors[category].circle);
            setArrowColor(categoryColors[category].icon);
        } else {
            setCircleColor(theme.first_color);
            setArrowColor(theme.second_color);
        }
    }, [category]);

    const iconWithThemeColor = icon.replace(/{theme.text_first_color}/g, theme.text_first_color);
    return(
        <div className={styles['item-body']}
             style={{
                border: `2px solid ${theme.element_first_color}`
             }}
             onClick={() => navigateTo(link)}>
            <div className={styles['item-info']}>
                <div className={styles['item-icon']}>
                    {parse(iconWithThemeColor)}
                </div>
                    {/* {dangerouslySetInnerHTML={{ __html: icon }}} */}
                <div className={styles['item-name']}
                     style={{
                        color: textColor
                     }}>
                    {name}
                </div>
            </div>
            <div className={styles['item-circle']}
            style={{
                background: circleColor
            }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.70711 10.7071C1.31658 11.0976 0.683418 11.0976 0.292893 10.7071C-0.0976311 10.3166 -0.0976311 9.68342 0.292893 9.29289L1.70711 10.7071ZM10 4.72575e-08C10.5523 -3.74211e-07 11 0.447715 11 1L11 10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10L9 2L1 2C0.447715 2 2.8711e-07 1.55228 2.8711e-07 1C2.8711e-07 0.447715 0.447715 -1.63477e-07 1 -1.63477e-07L10 4.72575e-08ZM0.292893 9.29289L9.29289 0.292893L10.7071 1.70711L1.70711 10.7071L0.292893 9.29289Z" fill={arrowColor}/>
            </svg>
            </div>
        </div>
    )
}
export default ItemBody