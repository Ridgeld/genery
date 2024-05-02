import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { auth } from "../../../../firebase";
import '../../../themes/default.scss';
import { useAuth } from "../../../providers/Authprovired";
import Input from "../../inputs/Input.jsx";
import { useNavigate } from "react-router-dom";
function SignUp(){
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [name, setName] = useState()
    const [error, setError] = useState(); 
    const { authUser, setAuthUser, ga } = useAuth();
    const navigateTo = useNavigate()

    const handleInputChange = (event) => {
        const value = event.target.value;
        setInputValue(value);
        // Дополнительные действия при изменении значения ввода
        console.log(value);
    };
    
    document.body.style.backgroundColor = 'var(--background-color)';

    function register(e){
        e.preventDefault();
        const res = createUserWithEmailAndPassword(ga, email, password)
            .then(() => {
                const user = userCredential.user;
                console.log(user);
                setEmail('');
                setPassword('');
                setName('');
                return updateProfile(user, {
                    displayName: name
                });
            })
            .then(() => {
                console.log('Profile updated successfully');
            })
            .catch((error) => console.log(error));
    }

    useEffect(() => {
        if(authUser) navigateTo("/about");

    }, [authUser])
    return(
        <>
        <form onSubmit={register}>
            <h2>Создать аккаунт</h2>
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
            <Input 
                type="text" 
                placeholder="Введите желаемое имя" 
                onInputChange={(e) => setName(e.target.value)} 
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
            <button>Начать</button>
        </form>
        </>
    )
}
export default SignUp