import React, { useContext, useState } from 'react';
import styles from './Settings.module.scss'
import { updateProfile } from "firebase/auth";
import { setDoc, doc, collection, onSnapshot, deleteDoc, getDocs, orderBy, query  } from "firebase/firestore"; 
import { auth, db, storage} from '../../../firebase.js';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import parse from "html-react-parser";

function SettingBody({itemName, itemIcon, authUserCensor, onCensorChange}){
    console.log(`Пришло значение: ${authUserCensor}`);
    const { theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);

    const handleClick = () => {
        if (itemName === 'Цензура') {
            const newCensorValue = !authUserCensor;
            console.log(`Изменено при клике на: ${newCensorValue}`);
            onCensorChange(newCensorValue);
            // await saveDataToFirestore(newCensorValue, 'default');
        }
    };
    // const saveDataToFirestore = async (censor, theme) => {
    //     try {
    //         const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
    //         await setDoc(userDocRef, {
    //             censorState: censor
    //         }, { merge: true });
    //         console.log("Data saved successfully.");
    //     } catch (error) {
    //         console.error("Error saving document: ", error);
    //     }
    // };
    const iconWithThemeColor = itemIcon.replace(/{theme.text_first_color}/g, theme.text_first_color);
    return(
        <div className={styles['item-body']}
            style={{
                background: theme.element_first_color
            }}>
            <div className={styles['item-info']}>
                <div className={styles['item-icon']}>
                    {parse(iconWithThemeColor)}
                </div>
                <div className={styles['item-name']}
                    style={{
                        color: theme.text_first_color
                    }}>{itemName}</div>
            </div>
            <div
                className={styles['check-box']}
                // className={`${styles['check-box']} ${censor && itemName === 'Цензура' ? styles['check-box-active'] : ''}`}
                style={{
                    background: authUserCensor && itemName === 'Цензура' ? theme.first_color : theme.element_second_color,
                    // justifyContent: censor && itemName === 'Цензура' ? 'flex-start' : 'flex-end',
                }}
                onClick={handleClick}>
                <div className={styles['check-box-circle']}
                style={{
                    background: authUserCensor && itemName === 'Цензура' ? theme.text_third_color : theme.text_first_color,
                    marginLeft: authUserCensor && itemName === 'Цензура' ? '29px' : '0',
                }}></div>
            </div>
        </div>
    )
}
export default SettingBody