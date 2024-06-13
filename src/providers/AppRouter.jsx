import React, { useEffect, useState } from "react";
import {routes} from '../router/paths.jsx'
import { HashRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { auth } from "../../firebase.js";
import { useAuth } from "./Authprovired.jsx";
import SignIn from "../components/auth/SignIn/SignIn.jsx";
import Loader from "../components/loader/Loader.jsx";
import '../themes/default.scss';

function AppRouter(){
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
        return <Loader color='var(--icon-color)'/>; // Показываем прелоадер, пока проверка аутентификации не завершена
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
            </Routes>
        </Router>
    )
}
export default AppRouter




