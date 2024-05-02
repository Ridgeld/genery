import React, { useState } from "react";
import styles from './Input.module.scss'
function Input(props){
    const [showPassword, setShowPassword] = useState(false);

        
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const showIcon = [
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 10.4C13.9874 10.4 13.0162 10.7793 12.3001 11.4544C11.5841 12.1295 11.1818 13.0452 11.1818 14C11.1818 14.9548 11.5841 15.8705 12.3001 16.5456C13.0162 17.2207 13.9874 17.6 15 17.6C16.0126 17.6 16.9838 17.2207 17.6999 16.5456C18.4159 15.8705 18.8182 14.9548 18.8182 14C18.8182 13.0452 18.4159 12.1295 17.6999 11.4544C16.9838 10.7793 16.0126 10.4 15 10.4ZM15 20C13.3123 20 11.6936 19.3679 10.5002 18.2426C9.30682 17.1174 8.63636 15.5913 8.63636 14C8.63636 12.4087 9.30682 10.8826 10.5002 9.75736C11.6936 8.63214 13.3123 8 15 8C16.6877 8 18.3064 8.63214 19.4998 9.75736C20.6932 10.8826 21.3636 12.4087 21.3636 14C21.3636 15.5913 20.6932 17.1174 19.4998 18.2426C18.3064 19.3679 16.6877 20 15 20ZM15 5C8.63636 5 3.20182 8.732 1 14C3.20182 19.268 8.63636 23 15 23C21.3636 23 26.7982 19.268 29 14C26.7982 8.732 21.3636 5 15 5Z" fill="white"/>
        </svg>


    ]
    const hideIcon = [
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.7836 10.2632L18.8182 14.0884V13.8947C18.8182 12.9316 18.4159 12.0079 17.6999 11.3268C16.9838 10.6458 16.0126 10.2632 15 10.2632H14.7836ZM9.31091 11.2316L11.2836 13.1079C11.22 13.3621 11.1818 13.6163 11.1818 13.8947C11.1818 14.8579 11.5841 15.7816 12.3001 16.4627C13.0162 17.1437 13.9874 17.5263 15 17.5263C15.28 17.5263 15.56 17.49 15.8273 17.4295L17.8 19.3058C16.9473 19.7053 16.0055 19.9474 15 19.9474C13.3123 19.9474 11.6936 19.3097 10.5002 18.1746C9.30682 17.0395 8.63636 15.5 8.63636 13.8947C8.63636 12.9384 8.89091 12.0426 9.31091 11.2316ZM2.27273 4.53737L5.17455 7.29737L5.74727 7.84211C3.64727 9.41579 1.99273 11.4737 1 13.8947C3.20182 19.2089 8.63636 22.9737 15 22.9737C16.9727 22.9737 18.8564 22.6105 20.5745 21.9568L21.1218 22.4653L24.8382 26L26.4545 24.4626L3.88909 3M15 7.84211C16.6877 7.84211 18.3064 8.47979 19.4998 9.61488C20.6932 10.75 21.3636 12.2895 21.3636 13.8947C21.3636 14.6695 21.1982 15.42 20.9055 16.0979L24.6345 19.6447C26.5436 18.1316 28.0709 16.1463 29 13.8947C26.7982 8.58053 21.3636 4.81579 15 4.81579C13.2182 4.81579 11.5127 5.11842 9.90909 5.66316L12.6709 8.26579C13.3964 7.99947 14.1727 7.84211 15 7.84211Z" fill="white"/>
        </svg>

    ]

    let input = [
        <div className={styles['input-container']} >
            <input 
                className={styles['input-inside']}
                type={props.type} 
                placeholder={props.placeholder} 
                onChange={props.onInputChange} 
                style={{
                    backgroundColor: props.backgroundColor,
                    color: props.textColor,
                }}
            />
        </div>
    ];
    if (props.type === "password"){
        input = [
            <div className={styles['input-container']} >
                <input 
                    className={styles['input-inside']}
                    type={showPassword ? "text" : "password"} 
                    placeholder={props.placeholder} 
                    onChange={props.onInputChange} 
                    style={{
                        backgroundColor: props.backgroundColor,
                        color: props.textColor,
                    }}
                />
                <button 
                    key={''}
                    className={styles['show-button']}
                    onClick={toggleShowPassword}>
                        {showPassword ? hideIcon : showIcon}
                </button>
            </div>
        ]
    }
    return(
        input
    )
}
export default Input