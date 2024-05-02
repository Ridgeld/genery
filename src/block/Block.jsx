import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from "./Block.module.scss";
import { useNavigate } from 'react-router-dom';
// import themeColors from '../themes/default.scss';


function Block(data) {
    const [isHovered, setIsHovered] = useState(false);
    const navigateTo = useNavigate();

    const handleClick = () => {
        navigateTo(data.linkTo)
    }


    return(
        <div className={styles.block} 
             style={{
                backgroundColor: data.backgroundColor,
                opacity: isHovered ? 0.7 : 1,
                transition: '0.5s ease',
                }} 
             onMouseEnter={() => setIsHovered(true)}
             onMouseLeave={() => setIsHovered(false)}
             onClick={{handleClick}}>
            <div className={styles.info}>
                <div className={styles.title} 
                     style={{color: data.textColor}}>{data.name}</div>
                <div className={styles.text} 
                     style={{color: data.textColor}}> {data.description} </div>
            </div>
            <div className={data.isCircleArrow ? styles.circle_arrow : styles.default_arrow}  
                style={data.isCircleArrow 
                    ? {backgroundColor: data.arrowBackgroundColor} 
                    : {backgroundColor: 'transparent'}}>
                <svg width="20" height="20" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.70711 10.7071C1.31658 11.0976 0.683418 11.0976 0.292893 10.7071C-0.0976311 10.3166 -0.0976311 9.68342 0.292893 9.29289L1.70711 10.7071ZM10 -9.62973e-08C10.5523 -9.62973e-08 11 0.447715 11 1V10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10V2H1C0.447716 2 2.84554e-07 1.55228 2.84554e-07 1C2.84554e-07 0.447715 0.447716 -9.62973e-08 1 -9.62973e-08H10ZM0.292893 9.29289L9.29289 0.292893L10.7071 1.70711L1.70711 10.7071L0.292893 9.29289Z" fill={data.arrowColor}/>
                </svg>
            </div>
        </div>
    )
}
export default Block

Block.prototypes = {
    name: PropTypes.string,
    text: PropTypes.string,
    textColor: PropTypes.string,
    backgroundColor: PropTypes.string,
    arrowColor: PropTypes.string,
    arrowBackgroundColor: PropTypes.string,
    isCircleArrow: PropTypes.bool,
}
