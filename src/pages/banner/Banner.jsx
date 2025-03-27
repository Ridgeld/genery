import React, { useContext, useEffect } from "react";
import DownloadBanner from "../../components/banners/DownloadBanner/DownloadBanner.jsx";
import styles from './Banner.module.scss'
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { useNavigate } from "react-router-dom";

export default function Banner() {
    const { theme, elementColors, setElementColors } = useContext(ElementContext);
    const navigateTo = useNavigate();

    useEffect(() => {
        setElementColors({
            iconColor: theme.text_first_color,
            titleColor: theme.text_first_color,
            showArrow: false,
            arrowColor: theme.text_first_color,
            arrowLink: () => navigateTo('/posts'),
            isHeaderBackground: false,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: false,
            footerBackground: theme.background_color,
            activeElementIndex: 3,
        });
        document.body.style.background = theme.background_color;
    }, [theme, setElementColors, navigateTo]);

  return (

    <div className={styles['container']}>
        <DownloadBanner/>
    </div>

  );
}