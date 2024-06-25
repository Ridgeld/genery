import React, { useContext, useEffect, useState } from 'react';
import styles from './Settings.module.scss';
import settings from './Settings.js';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import '../../themes/default.scss';
import SettingBody from './SettingBody.jsx';
import { useAuth } from "../../providers/Authprovired.jsx";
import themes from './Themes.js';
import ThemeBody from './ThemeBody.jsx';

import { collection, doc, getDoc, onSnapshot, query, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification.jsx';

function Settings(){
    const { theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);
    const storedCensor = localStorage.getItem('censor') === 'true';
    const [censor, setCensor] = useState(storedCensor);

    console.log(`Состояние из хранилища ${storedCensor}`)

    const { authUser } = useAuth();

    const [userThemes, setUserThemes] = useState([]);
    const [slipData, setSlipData] = useState({
        isShow: false,
        text: ''
    });

    useEffect(() => {
        if (slipData.isShow) {
          const timer = setTimeout(() => {
            setSlipData({
                isShow: false
            });
          }, 1000);
    
          return () => clearTimeout(timer);
        }
      }, [slipData]);

    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowColor: theme.text_first_color,
            arrowLink: '#/list-menu',
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: true,
            footerBackground: theme.background_color,
            activeElementIndex: 3,
        });
        document.body.style.background = theme.background_color
        },[theme]);

    useEffect(() => {
        const fetchUserPreferences = async () => {
            if (authUser && authUser._id) {
                const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    // console.log(userData);
                    
                    // setActiveTheme(userData.themeName || 'default');
                    // setCensor(userData.censorState);
                    setUserThemes(userData.boughtThemes);
                } else {
                    console.log("No such document!");
                }
            } else {
                console.error('authUser or authUser._id is undefined');
            }
        };

        fetchUserPreferences();
    }, [authUser])

        // useEffect(() =>{
        //     if(userThemes){
        //         const filteredThemes = userThemes.map((themeId) => themes[themeId]);
        //     }
        // }, [userThemes])

        const filteredThemes = userThemes
        ? userThemes.filter(themeId => themes[themeId]).map(themeId => themes[themeId]) 
        : [];

        
        const handleThemeChange = async (themeName) => {
            setThemeById(themeName);
            setSlipData({
                isShow: true,
                text: `Выбрана тема: ${themeName}`
            })
            // if (authUser && authUser._id) {
            //     const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
            //     try {
            //         await setDoc(userDocRef, { themeName }, { merge: true });
            //         setActiveTheme(themeName); // Update local state to reflect the new theme
            //     } catch (error) {
            //         console.error("Error updating document: ", error);
            //     }
            // }
        };

    const handleCensorChange = (censorState) => {
        // if (authUser && authUser._id) {
        //     const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
        //     try {
        //         await setDoc(userDocRef, { censorState }, { merge: true });
                setCensor(censorState); 
        //     } catch (error) {
                localStorage.setItem('censor', censorState);
                // localStorage.setItem('censor', censorState);
        //         console.error("Error updating document: ", error);
        //     }
        }

    // useEffect(() => {
    //     console.log(`Перезаписанное значение ${censor}`)
    // }, [censor]);


    return(
        <div className={styles.container}>
            <SlipNotification
                text={slipData.text}
                isShow={slipData.isShow}/>
            {settings.map((elements) => (
                <div className={styles['category-container']}
                    style={{
                        color: theme.text_first_color
                    }}>
                    <div className={styles['category-name']}>{elements.category}</div>
                    {elements.items.map((item) => (
                        <SettingBody
                            itemIcon={item.icon}
                            itemName={item.name}
                            authUserCensor = {censor}
                            onCensorChange={handleCensorChange}
                        />
                    ))}
                </div>
            ))}
            <div className={styles['category-container']}
                style={{
                    color: theme.text_first_color
                }}>
                <div className={styles['category-name']}
                style={{
                    color: theme.text_first_color
                }}>тема</div>
                <div className={styles['themes-body']}
                    style={{
                        background: theme.element_first_color
                    }}>
                    <div className={styles['themes-name']}
                        style={{
                            color: theme.text_first_color
                        }}>Доступные темы:</div>
                    <div className={styles['themes-container']}>
                        {filteredThemes.map((item) => (
                            <ThemeBody
                                img={item.img}
                                name={item.name}
                                activeTheme={theme.name}
                                // authUser={authUser}
                                onThemeChange={handleThemeChange}
                            />

                        ))}
                    </div>
                </div>
            </div>
            <div className={styles['category-container']}>
                <div className={styles['category-name']}
                    style={{
                        color: theme.text_first_color
                    }}>информация</div>
                <div className={styles['block-body']}
                    style={{
                        background: theme.element_first_color
                    }}>
                    <div className={styles['block-title']}
                    style={{
                        color: theme.text_first_color
                    }}>Rigeld INC</div>
                    <div className={styles['block-text']}
                    style={{
                        color: theme.text_first_color
                    }}>Genery 5.1.0</div>
                    <div className={styles['block-arrow']}>
                        <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.20711 10.7071C1.81658 11.0976 1.18342 11.0976 0.792893 10.7071C0.402369 10.3166 0.402369 9.68342 0.792893 9.29289L2.20711 10.7071ZM10.5 4.72575e-08C11.0523 -3.74211e-07 11.5 0.447715 11.5 1L11.5 10C11.5 10.5523 11.0523 11 10.5 11C9.94772 11 9.5 10.5523 9.5 10L9.5 2L1.5 2C0.947715 2 0.5 1.55228 0.5 1C0.5 0.447715 0.947715 -1.63477e-07 1.5 -1.63477e-07L10.5 4.72575e-08ZM0.792893 9.29289L9.79289 0.292893L11.2071 1.70711L2.20711 10.7071L0.792893 9.29289Z" fill={theme.text_first_color}/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>

    )
}
export default Settings