import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";
import { auth } from "../../../../firebase";
import '../../../themes/default.scss';
import Input from "../../inputs/Input.jsx";
import AuthUser from "../AuthUser.jsx";
import { useAuth } from "../../../providers/Authprovired";
import { useNavigate } from "react-router-dom";
import { ElementContext } from "../../../providers/ElementProvider.jsx";
import styles from './SignIn.module.scss'
function SignIn(){
    const { authUser, ga } = useAuth();
    const {theme, setElementColors } = useContext(ElementContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); 

    const navigateTo = useNavigate();

    const errorMessages = {
        'auth/invalid-login-credentials': 'Неверный email или пароль',
        // Добавьте другие коды ошибок и их сообщения по необходимости
    };
    // const handleInputChange = (event) => {
    //     const value = event.target.value;
    //     setInputValue(value);
    //     // Дополнительные действия при изменении значения ввода
    //     console.log(value);
    // };
    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: false,
            arrowColor: theme.text_first_color,
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: false,
            footerBackground: theme.background_color,
            activeElementIndex: 3,
            background: theme.background_color
        });
        document.body.style.background = theme.background_color
        },[theme]);

    function login(e){
        e.preventDefault()
        if (!email && !password) {
            setError('введите email и пароль');
        } else if (!email) {
            setError('введите email');
        } else if (!password) {
            setError('введите пароль');
        }

        const res = signInWithEmailAndPassword(ga, email, password)
            .then(() => {
                const user = userCredential.user;
                console.log(user);
                setEmail('');
                setPassword('');
            })
            .then(() => {
                console.log('Profile updated successfully');
            })
            .catch((error) => {
                const errorMessage = errorMessages[error.code] || 'Произошла ошибка'; // Используйте сообщение из маппинга или дефолтное сообщение
                setError(errorMessage);
            });
    }
    useEffect(() => {
        if(authUser) navigateTo("/menu");

    }, [authUser])

    return(
        <div className={styles.container}>
            <form className={styles['auth-form']}>
                <div className={styles['greeting']}>
                    <h2 className={styles['greeting-title']}
                        style={{
                            color: theme.text_first_color
                        }}>Представьтесь</h2>
                    <h3 className={styles['greeting-text']}
                        style={{
                            color: theme.text_first_color
                        }}>Работа не волк, подождет, а мы нет</h3>
                </div>
                <div className={styles['input-container']}>
                    <div className={styles['error']}
                    style={{
                        color: theme.gradient_first_color
                    }}>{error}</div>
                    <Input 
                        type="email" 
                        placeholder="Введите email" 
                        // onInputChange={handleInputChange} 
                        onInputChange={(e) => setEmail(e.target.value)}
                        backgroundColor={theme.element_first_color}
                        textColor={theme.text_first_color}
                        placeholderColor={theme.text_second_color}/>
                    <Input 
                        type="password" 
                        placeholder="Введите пароль" 
                        onInputChange={(e) => setPassword(e.target.value)} 
                        backgroundColor={theme.element_first_color}
                        textColor={theme.text_first_color}
                        placeholderColor={theme.text_second_color}/>
                    <button className={styles['forgot-password']}
                        style={{
                            color: theme.text_first_color
                        }}
                        onClick={() => navigateTo('/resetpassword')}
                        >Забыли пароль?</button>
                </div>
                
                <div className={styles['button-container']}>
                    <button onClick={login} className={styles['continue-button']}
                    style={{
                        background: theme.first_color
                    }}>
                        Войти
                        <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.79289 8.77817C1.40237 9.16869 1.40237 9.80186 1.79289 10.1924C2.18342 10.5829 2.81658 10.5829 3.20711 10.1924L1.79289 8.77817ZM11.9853 0.999994C11.9853 0.447709 11.5376 -6.22126e-06 10.9853 -5.7998e-06L1.98528 -6.01053e-06C1.433 -6.01053e-06 0.985281 0.447709 0.985281 0.999994C0.985281 1.55228 1.433 1.99999 1.98528 1.99999L9.98528 1.99999L9.98528 9.99999C9.98528 10.5523 10.433 11 10.9853 11C11.5376 11 11.9853 10.5523 11.9853 9.99999L11.9853 0.999994ZM3.20711 10.1924L11.6924 1.7071L10.2782 0.292887L1.79289 8.77817L3.20711 10.1924Z" fill="white"/>
                        </svg>
                    </button>
                    <button className={styles['create-account']}
                        style={{
                            color: theme.text_first_color
                        }}
                        onClick={() => navigateTo('/sign-up')}>
                            Нет аккаунта? Регистрация</button>
                </div>
            </form>
            {/* <AuthUser/> */}
        </div>
    )
}
export default SignIn