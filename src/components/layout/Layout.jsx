import React, { useContext, useEffect, useState } from "react";
import Header from "./header/Header";
import Footer from "./footer/defaultFooter.jsx";
import styles from "./Layout.module.scss"
import { ElementContext, ElementProvider } from '../../providers/ElementProvider.jsx';

function Layout({children}) {
    const { theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);
    const [color, setColor] = useState(theme.background_color);

    useEffect(() =>{
        setColor(elementColors.background);
    }, [elementColors]);

    return(
        <>
        {/* <ElementProvider> */}
            <Header/>
            <div className={styles.wrapper}>
                <div className={styles.content}>
                    {children}
                </div>
            </div>
            <Footer/>
        {/* </ElementProvider> */}
        </>
    )
}
export default Layout