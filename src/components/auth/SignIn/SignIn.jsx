import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";
import { auth } from "../../../../firebase";
import '../../../themes/default.scss';
import Input from "../../inputs/Input.jsx";
import AuthUser from "../AuthUser.jsx";
import { useAuth } from "../../../providers/Authprovired";
import { useNavigate } from "react-router-dom";
import { ElementContext } from "../../../providers/ElementProvider.jsx";
function SignIn(){
    const { authUser, setAuthUser, ga } = useAuth();
    const { setElementColors } = useContext(ElementContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); 

    const navigateTo = useNavigate()

    const handleInputChange = (event) => {
        const value = event.target.value;
        setInputValue(value);
        // Дополнительные действия при изменении значения ввода
        console.log(value);
    };
    useEffect(() => {
        setElementColors({
            iconColor: 'var(--first-color)',
            titleColor: 'var(--text-first-color)',
            showArrow: false,
            arrowColor: '#0000FF',
            isBackground: false,
            backgroundColor: '#FFFF00',
            isHeader: true,
        });
    },[ElementContext]);
    document.body.style.backgroundColor = 'var(--background-color)';

    function login(e){
        e.preventDefault()

        const res = signInWithEmailAndPassword(ga, email, password)
            .then(() => {
                const user = userCredential.user;
                console.log(user);
                setEmail('');
                setPassword('');
            })
            .then(() => {
                alert("9");
                console.log('Profile updated successfully');
            })
            .catch((error) => console.log(error));
    }
    useEffect(() => {
        if(authUser) navigateTo("/menu");

    }, [authUser])

    return(
        <>
        <form>
            <h2>Логин</h2>
            {/* <input 
                type="email"
                placeholder="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
            /> */}
            <Input 
                type="email" 
                placeholder="Введите email" 
                // onInputChange={handleInputChange} 
                onInputChange={(e) => setEmail(e.target.value)}
                backgroundColor="var(--element-first-color)"
                textColor="var(--text-first-color)"
                placeholderColor="var(--casino-first-color)"/>
            <Input 
                type="password" 
                placeholder="Введите пароль" 
                onInputChange={(e) => setPassword(e.target.value)} 
                backgroundColor="var(--element-first-color)"
                textColor="var(--text-first-color)"
                placeholderColor="var(--casino-first-color)"/>
            {/* <input 
                type="password" 
                placeholder="пароль"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
            />
            <input 
                type="password" 
                placeholder="повторите пароль"
                value={copyPassword} 
                onChange={(e) => setCopyPassword(e.target.value)}
            /> */}
            <button onClick={login} >Начать</button>
        </form>
        <AuthUser></AuthUser>
        </>
    )
}
export default SignIn