import React, { useContext, useEffect, useState } from "react";
import styles from './ResetPassword.module.scss'
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../providers/Authprovired";
import Input from "../../inputs/Input";
import { ElementContext } from "../../../providers/ElementProvider.jsx";
import { sendPasswordResetEmail } from "firebase/auth";


export default function ResetPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const { authUser, ga } = useAuth();
    const navigateTo = useNavigate()
    const {theme, setElementColors } = useContext(ElementContext);

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



    const handleResetPassword = async (e) => {
        e.preventDefault();
        // const auth = getAuth();

        try {
            await sendPasswordResetEmail(ga, email);
            setMessage("Письмо для сброса пароля отправлено! Проверьте почту.");
        } catch (error) {
            setMessage("Ошибка: " + error.message);
        }
    };

    return (
        <div className={styles['container']}>
            <form className={styles['auth-form']} 
                onSubmit={handleResetPassword}>
                <div className={styles['greeting']}>
                    <h2 className={styles['greeting-title']}
                        style={{
                            color: theme.text_first_color
                        }}>Введите свой email</h2>
                    <h3 className={styles['greeting-text']}
                        style={{
                            color: theme.text_first_color
                        }}>И мы отправим вас в ссылку</h3>
                </div>
                <div className={styles['input-container']}>
                    <div className={styles['error']}
                    style={{
                        color: theme.gradient_first_color
                    }}>{message}</div>
                    <Input 
                        type="email" 
                        placeholder="Введите email" 
                        // onInputChange={handleInputChange} 
                        onInputChange={(e) => setEmail(e.target.value)}
                        backgroundColor={theme.element_first_color}
                        textColor={theme.text_first_color}
                        placeholderColor={theme.text_second_color}/>
                </div>
                
                <div className={styles['button-container']}>
                    <button type="submit" className={styles['continue-button']}
                    style={{
                        background: theme.first_color
                    }}>
                        Отправить письмо
                        <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.79289 8.77817C1.40237 9.16869 1.40237 9.80186 1.79289 10.1924C2.18342 10.5829 2.81658 10.5829 3.20711 10.1924L1.79289 8.77817ZM11.9853 0.999994C11.9853 0.447709 11.5376 -6.22126e-06 10.9853 -5.7998e-06L1.98528 -6.01053e-06C1.433 -6.01053e-06 0.985281 0.447709 0.985281 0.999994C0.985281 1.55228 1.433 1.99999 1.98528 1.99999L9.98528 1.99999L9.98528 9.99999C9.98528 10.5523 10.433 11 10.9853 11C11.5376 11 11.9853 10.5523 11.9853 9.99999L11.9853 0.999994ZM3.20711 10.1924L11.6924 1.7071L10.2782 0.292887L1.79289 8.77817L3.20711 10.1924Z" fill="white"/>
                        </svg>
                    </button>
                    <button className={styles['create-account']}
                        style={{
                            color: theme.text_first_color
                        }}
                        onClick={() => navigateTo('/sign-in')}>
                            Войти</button>
                </div>
            </form>
        </div>
    );
}

// const ResetPassword = () => {

//     const handleResetPassword = async (e) => {
//         e.preventDefault();
//         const auth = getAuth();

//         try {
//             await sendPasswordResetEmail(auth, email);
//             setMessage("Письмо для сброса пароля отправлено! Проверьте почту.");
//         } catch (error) {
//             setMessage("Ошибка: " + error.message);
//         }
//     };

//     return (
//         <div style={{ maxWidth: 400, margin: "auto", textAlign: "center" }}>
//             <h2>Сброс пароля</h2>
//             <form onSubmit={handleResetPassword}>
//                 <input
//                     type="email"
//                     placeholder="Введите вашу почту"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                     style={{ width: "100%", padding: 10, marginBottom: 10 }}
//                 />
//                 <button type="submit" style={{ padding: 10, width: "100%" }}>
//                     Отправить письмо
//                 </button>
//             </form>
//             {message && <p>{message}</p>}
//             <button onClick={() => router.push("/login")}>Вернуться назад</button>
//         </div>
//     );
// };

