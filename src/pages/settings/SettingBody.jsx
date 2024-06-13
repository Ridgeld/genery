import React, { useState } from 'react';
import styles from './Settings.module.scss'
import { updateProfile } from "firebase/auth";
import { setDoc, doc, collection, onSnapshot, deleteDoc, getDocs, orderBy, query  } from "firebase/firestore"; 
import { auth, db, storage} from '../../../firebase.js';
function SettingBody({itemName, itemIcon, authUserCensor, onCensorChange}){
    console.log(authUserCensor);

    const handleClick = async () => {
        if (itemName === 'Цензура') {
            const newCensorValue = !authUserCensor;
            onCensorChange(newCensorValue);
            console.log(newCensorValue);
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

    return(
        <div className={styles['item-body']}
            style={{
                background: 'var(--element-first-color)'
            }}>
            <div className={styles['item-info']}>
                <div className={styles['item-icon']} dangerouslySetInnerHTML={{ __html: itemIcon }}></div>
                <div className={styles['item-name']}>{itemName}</div>
            </div>
            <div
                className={styles['check-box']}
                // className={`${styles['check-box']} ${censor && itemName === 'Цензура' ? styles['check-box-active'] : ''}`}
                style={{
                    background: authUserCensor && itemName === 'Цензура' ? 'var(--first-color)' : 'var(--element-second-color)',
                    // justifyContent: censor && itemName === 'Цензура' ? 'flex-start' : 'flex-end',
                }}
                onClick={handleClick}>
                <div className={styles['check-box-circle']}
                style={{
                    background:'var(--text-first-color)',
                    marginLeft: authUserCensor && itemName === 'Цензура' ? '29px' : '0',
                }}></div>
            </div>
        </div>
    )
}
export default SettingBody