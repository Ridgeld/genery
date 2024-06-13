import React, { useContext } from "react";
import Header from "./header/Header";
import Footer from "./footer/defaultFooter.jsx";
import styles from "./Layout.module.scss"
import { ElementProvider } from "../../providers/ElementProvider.jsx";

function Layout({children}) {

    return(
        <ElementProvider>
            <Header/>
            <div className={styles.wrapper}>
                <div className={styles.content}>
                    {children}
                </div>
            </div>
            <Footer/>
        </ElementProvider>
    )
}
export default Layout