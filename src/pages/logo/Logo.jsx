import React, { useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import styles from "./Logo.module.scss"
import { useEffect } from "react";
import Loader from "../../components/loader/Loader";
import { useAuth } from "../../providers/Authprovired";
import '../../themes/default.scss';
import { ElementContext } from '../../providers/ElementProvider.jsx';

function Logo(){
    const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);
    const { authUser } = useAuth();
    let path;
    const navigateTo = useNavigate()

    useEffect(() => {

        authUser ? path = '/menu' : path = '/about'

        const timeout = setTimeout(() => {
          navigateTo(path);
        }, 3000);
    
        return () => clearTimeout(timeout);
    }, [navigateTo]);

    return (
        <div className={styles.container}>
                <Loader color={theme.icon_color}></Loader>
        </div>
    )
}
export default Logo
