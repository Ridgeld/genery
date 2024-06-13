import React, { useContext } from "react";
import styles from './Header.module.scss'
import { ElementContext } from "../../../providers/ElementProvider";

function Header(props) {
    const { elementColors } = useContext(ElementContext);
    // console.log(elementColors.iconColor);
    if(!elementColors.isHeader) return null
    return(
        <div className={styles.header} 
        style={{background: elementColors.isHeaderBackground ? elementColors.headerBackground : 'transparent'}}>
            <div className = {styles.logo_container}>
            <div className = {styles.icon}>
                <svg width="50" height="73" viewBox="0 0 50 73" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M39.7767 0.312248C40.2216 0.571102 40.5658 0.973727 40.7532 1.45435C40.9407 1.93497 40.9601 2.46517 40.8085 2.95835L32.6225 29.6566H47.7265C48.1703 29.6564 48.6045 29.7867 48.9755 30.0314C49.3464 30.2761 49.6379 30.6244 49.8138 31.0334C49.9898 31.4425 50.0425 31.8942 49.9656 32.333C49.8887 32.7718 49.6854 33.1784 49.3809 33.5025L13.0186 72.2816C12.6668 72.6571 12.1986 72.902 11.6904 72.9762C11.1821 73.0505 10.6638 72.9497 10.2199 72.6905C9.77606 72.4312 9.43275 72.0286 9.24599 71.5484C9.05922 71.0682 9.04001 70.5387 9.19148 70.0461L17.3776 43.3433H2.27355C1.82968 43.3435 1.39547 43.2132 1.02453 42.9685C0.653591 42.7238 0.362153 42.3755 0.186196 41.9665C0.0102386 41.5574 -0.0425346 41.1056 0.0343904 40.6668C0.111315 40.2281 0.31457 39.8215 0.619066 39.4973L36.9814 0.718287C37.3328 0.343267 37.8003 0.0985916 38.3078 0.0240443C38.8153 -0.0505029 39.333 0.0494621 39.7767 0.307685V0.312248Z" fill={elementColors.iconColor}/>
                </svg>
            </div>
            <div className={styles.title} 
                    style={{color: elementColors.titleColor}}>GENERY</div>
            </div>
            <a href={elementColors.arrowLink} className={elementColors.showArrow ? styles.show : styles.hide}>
                <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 9C21.5523 9 22 8.55228 22 8C22 7.44772 21.5523 7 21 7L21 9ZM0.292893 7.2929C-0.0976311 7.68342 -0.097631 8.31658 0.292893 8.70711L6.65685 15.0711C7.04738 15.4616 7.68054 15.4616 8.07107 15.0711C8.46159 14.6805 8.46159 14.0474 8.07107 13.6569L2.41421 8L8.07107 2.34315C8.46159 1.95262 8.46159 1.31946 8.07107 0.928933C7.68054 0.538409 7.04738 0.538409 6.65685 0.928933L0.292893 7.2929ZM21 7L1 7L1 9L21 9L21 7Z" fill={elementColors.titleColor}/>
                </svg>
            </a>
        </div>
    )
}
export default Header