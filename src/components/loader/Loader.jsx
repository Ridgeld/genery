import React, { useContext, useEffect } from "react";
import styles from './Loader.module.scss'
import { ElementContext } from '../../providers/ElementProvider.jsx';
function Loader({color}){
    const { theme, elementColors, setElementColors } = useContext(ElementContext);

    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowColor: theme.text_first_color,
            arrowLink: '#/menu',
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: false,
            isFooter: false,
            footerBackground: theme.background_color,
            activeElementIndex: 2,
        });
        document.body.style.background = theme.background_color
        },[theme]);
    return(
    <div className={styles.container}>
        <div className={styles.loader}>
            <svg width="50" height="73" viewBox="0 0 50 73" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M39.7767 0.312248C40.2216 0.571102 40.5658 0.973727 40.7532 1.45435C40.9407 1.93497 40.9601 2.46517 40.8085 2.95835L32.6225 29.6566H47.7265C48.1703 29.6564 48.6045 29.7867 48.9755 30.0314C49.3464 30.2761 49.6379 30.6244 49.8138 31.0334C49.9898 31.4425 50.0425 31.8942 49.9656 32.333C49.8887 32.7718 49.6854 33.1784 49.3809 33.5025L13.0186 72.2816C12.6668 72.6571 12.1986 72.902 11.6904 72.9762C11.1821 73.0505 10.6638 72.9497 10.2199 72.6905C9.77606 72.4312 9.43275 72.0286 9.24599 71.5484C9.05922 71.0682 9.04001 70.5387 9.19148 70.0461L17.3776 43.3433H2.27355C1.82968 43.3435 1.39547 43.2132 1.02453 42.9685C0.653591 42.7238 0.362153 42.3755 0.186196 41.9665C0.0102386 41.5574 -0.0425346 41.1056 0.0343904 40.6668C0.111315 40.2281 0.31457 39.8215 0.619066 39.4973L36.9814 0.718287C37.3328 0.343267 37.8003 0.0985916 38.3078 0.0240443C38.8153 -0.0505029 39.333 0.0494621 39.7767 0.307685V0.312248Z" fill={color}/>
            </svg>
        </div>
    </div>
    )
}
export default Loader