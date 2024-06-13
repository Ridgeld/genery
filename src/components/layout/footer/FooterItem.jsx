import React from "react";
import styles from './Footer.module.scss'

function FooterItem({ icon, link, isActive}) {
    return (
        <a href={link} className={`${styles.item} ${isActive ? styles.active : ''}`}>
            {icon}
        </a>
    );
}

export default FooterItem;