import React, { useContext } from "react";
import styles from './BannerBlock.module.scss'

import { ElementContext } from '../../../providers/ElementProvider';

import banners from "./Banners";
import { useNavigate } from "react-router-dom";

export default function BannerBlock() {
    const { theme, elementColors, setElementColors } = useContext(ElementContext); 

    const navigateTo = useNavigate()

    return (
        <div className={styles['body']}>
            {/* <div className={styles['stroke-fill']}
                style={{
                    background: `linear-gradient(135deg,${theme.gradient_first_color} 0%,${theme.gradient_second_color} 100%)`
                }}>
                <div className={styles['stories-body']}
                    style={{
                        background: theme.background_color
                    }}
                    onClick={() => navigateTo('')}>
                    <img src={'1.png'} className={styles['stories-img']}/>
                </div>
            </div> */}
            {banners.map((banner) => (
                <div className={styles['stroke-fill']}
                    style={{
                        background: `linear-gradient(135deg,${theme.gradient_first_color} 0%,${theme.gradient_second_color} 100%)`
                    }}>
                    <div className={styles['stories-body']}
                        style={{
                            background: theme.background_color
                        }}
                        onClick={() => navigateTo(banner.link)}>
                        <img src={banner.img} className={styles['stories-img']}/>
                    </div>
                </div>
            ))}
        </div>
    );
}