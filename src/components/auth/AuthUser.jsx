// import { onAuthStateChanged, signOut } from "firebase/auth";
// import React, { useEffect, useState, createContext } from "react";
// import { auth } from "../../../firebase";


// export const AuthContext = createContext({})

// function AuthUser(){
//     const [AuthUserIn, setAuthUserIn] = useState(null)
//     useEffect(() =>{
//         const listen = onAuthStateChanged(auth, (user)=> {
//             user ? setAuthUserIn(user) : setAuthUserIn(null)
//         })
//         return () => {
//             listen()
//         }
//     }, [])

//     function userSignOut(){
//         signOut(auth)
//             .then(() => console.log('success'))
//             .catch((e) => console.log(e))
//     }

//     return(
//         <>
//             {AuthUserIn ?(
//                 <div><p>{`Sign in as ${AuthUserIn.email}`}</p><button onClick={userSignOut}>Выйти</button></div>
//             ) : <p>Вы вышли</p> }
//         </>
//     )
// }
// export default AuthUser
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/Authprovired";
import { signOut, onAuthStateChanged } from "firebase/auth";

function AuthUser() {
    const { authUser, setAuthUser, ga } = useAuth();
    // const navigateTo = useNavigate()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(ga, (user) => {
        setAuthUser(user);

        // if (user) {
        //     navigateTo("/about");
        // }
        });
        return () => unsubscribe();
    }, [ga, setAuthUser]);

    const userSignOut = () => {
        signOut(ga)
        .then(() => console.log('success'))
        .catch((e) => console.log(e));
    };

    return (
        <>
        {authUser ? (
            <div>
            <p>{`Sign in as ${authUser.email}`}</p>
            <button onClick={userSignOut}>Выйти</button>
            </div>
        ) : (
            <p>Вы вышли</p>
        )}
        </>
    );
}

export default AuthUser;
