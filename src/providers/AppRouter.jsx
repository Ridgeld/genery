import React, { useContext, useEffect, useState } from "react";
import {routes} from '../router/paths.jsx'
import { HashRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { auth } from "../../firebase.js";
import { useAuth } from "./Authprovired.jsx";
import SignIn from "../components/auth/SignIn/SignIn.jsx";
import Loader from "../components/loader/Loader.jsx";
import '../themes/default.scss';
import { ElementContext } from './ElementProvider.jsx';
import NotFound from "../pages/not-found/NotFount.jsx";

function AppRouter(){
    const { theme, elementColors, setElementColors } = useContext(ElementContext);
    const { authUser } = useAuth();
    const isAuth = false;
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setAuthChecked(true);
        });

        return () => unsubscribe();
    }, []);

    if (!authChecked) {
        return <Loader color={theme.icon_color}/>; // Показываем прелоадер, пока проверка аутентификации не завершена
    }

    return (
        <Router>
            <Routes>
                {routes.map(route => (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={route.auth && !authUser ? <SignIn/> : route.component}
                        exact={route.exact}
                    />
                ))}
                <Route path="*" element={<NotFound />} /> {/* Добавляем маршрут для страницы 404 */}
            </Routes>
        </Router>
    )
}
export default AppRouter




