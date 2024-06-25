import React, { useContext, useEffect, useState } from 'react';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import styles from './Shop.module.scss'
import items from './Shop.js';
import Cover from './Cover.jsx';
import ShopCard from './ShopCard.jsx';
import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification.jsx';
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { useAuth } from "../../providers/Authprovired.jsx";
import ScoreContainer from '../../components/score-container/ScoreContainer.jsx';

function Shop(){
    const {theme, elementColors, setElementColors } = useContext(ElementContext);
    const [slipData, setSlipData] = useState({
        isShow: false,
        text: ''
    });
    const [userThemes, setUserThemes] = useState([]);
    const [userColors, setUserColors] = useState([]);
    const [userEmojies, setUserEmojies] = useState([]);

    const [text, setText] = useState('');
    const [balance, setBalance] = useState(0);
    const { authUser } = useAuth();
    
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
        const fetchUserPreferences = async () => {
            if (authUser && authUser._id) {
                const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    // console.log(userData);
                    setBalance(userData.balance);
                    setUserThemes(userData.boughtThemes);
                    setUserColors(userData.boughtColors);
                    setUserEmojies(userData.boughtEmojies);
                } else {
                    console.log("No such document!");
                }
            } else {
                console.error('authUser or authUser._id is undefined');
            }
        }

        fetchUserPreferences();
    }, [balance, userThemes, userColors, userEmojies])

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
        },[ElementContext]);

    const updateUserBalance = async (newBalance) => {
        if (authUser && authUser._id) {
            try {
                const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
                await updateDoc(userDocRef, {
                    balance: newBalance
                });
                console.log(`Balance updated to ${newBalance}`);
            } catch (error) {
                console.error('Error updating balance:', error);
            }
        } else {
            console.error('authUser or authUser._id is undefined');
        }
    };

    // const buyItem = async (category, id, price) => {
    //     const dataRef = doc(db, 'users', authUser._id, 'info', 'preferences');

    //     if(balance < price) {
    //         setSlipData({
    //             isShow: true,
    //             text: `У вас недостаточно средств для покупки`
    //         })
    //         return
    //     }

    //     if(category === 'colors'){
    //         setBalance(balance - price);

    //         await updateDoc(dataRef, {
    //             boughtColors: arrayUnion(id)
    //         });
    //         updateUserBalance(balance - price)

    //         setSlipData({
    //             isShow: true,
    //             text: `вы приобрели баннер: ${id}`
    //         })
    //     }

    //     if(category === 'emojies'){
    //         setBalance(balance - price);

    //         await updateDoc(dataRef, {
    //             boughtEmojies: arrayUnion(id)
    //         });
    //         updateUserBalance(balance - price)
            
    //         setSlipData({
    //             isShow: true,
    //             text: `вы приобрели пак эмодзи: ${id}`
    //         })
    //     }

    //     if(category === 'themes'){
    //         setBalance(balance - price);

    //         await updateDoc(dataRef, {
    //             boughtThemes: arrayUnion(id)
    //         });
    //         updateUserBalance(balance - price)
            
    //         setSlipData({
    //             isShow: true,
    //             text: `вы приобрели тему: ${id}`
    //         })
    //     }
    //     if(category === 'all'){
    //         setBalance(balance - price);
    //         await updateDoc(dataRef, {
    //             boughtThemes: arrayUnion(id)
    //         });

    //         updateUserBalance(balance - price)

    //         setSlipData({
    //             isShow: true,
    //             text: `вы приобрели коллекцию: ${id}`
    //         })
    //     }
    // }


    const buyItem = async (category, id, price) => {
        const dataRef = doc(db, 'users', authUser._id, 'info', 'preferences');

        if (balance < price) {
            setSlipData({
                isShow: true,
                text: `У вас недостаточно средств для покупки`
            });
            return;
        }

        setBalance(balance - price);
        updateUserBalance(balance - price);

        let updateFields = {};
        let slipText = '';

        switch (category) {
            case 'colors':
                updateFields = { boughtColors: arrayUnion(id) };
                slipText = `вы приобрели баннер: ${id}`;
                break;
            case 'emojies':
                updateFields = { boughtEmojies: arrayUnion(id) };
                slipText = `вы приобрели пак эмодзи: ${id}`;
                break;
            case 'themes':
                updateFields = { boughtThemes: arrayUnion(id) };
                slipText = `вы приобрели тему: ${id}`;
                break;
            case 'all':
                updateFields = {
                    boughtColors: arrayUnion(id),
                    boughtEmojies: arrayUnion(id),
                    boughtThemes: arrayUnion(id)
                };
                slipText = `вы приобрели коллекцию: ${id}`;
                break;
            default:
                return;
        }

        await updateDoc(dataRef, updateFields);

        setSlipData({
            isShow: true,
            text: slipText
        });
    };
    const isItemBought =(category, itemId) => {
        switch (category) {
            case 'colors':
                return userColors.includes(itemId);
            case 'theme':
                return userThemes.includes(itemId);
            case 'emojies':
                return userEmojies.includes(itemId);
            case 'all' :
                return  (
                    userColors.includes(itemId) &&
                    userThemes.includes(itemId) &&
                    userEmojies.includes(itemId)
                );
            default:
                return false;
        }
    }
    // const handleBuyItem = async(id) => {
    //     if (authUser && authUser._id) {
    //         const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
    //         try {
    //             await setDoc(userDocRef, { id }, { merge: true });
    //         } catch (error) {
    //             console.error("Error updating document: ", error);
    //         }
    //     }
    // }
    return(
        <div className={styles.container}>
            <style>{`
                ::-webkit-scrollbar {
                  width: 10px; /* Ширина ползунка */
                }

                /* Стилизация ползунка скроллбара */
                ::-webkit-scrollbar-thumb {
                  background: ${theme.first_color}; /* Цвет ползунка */
                  border-radius: 5px; /* Закругление углов ползунка */
                  cursor: pointer;
                }

                /* Стилизация фона скроллбара */
                ::-webkit-scrollbar-track {
                  background-color: rgba($color: #000000, $alpha: 0.3); /* Цвет фона */
                }
            `}</style>
            <SlipNotification
                isShow={slipData.isShow}
                text={slipData.text}/>
            <div className={styles['balance-container']}>
                <ScoreContainer 
                    name={'Баланс'}
                    isBalance={true}
                    count={balance}/>
            </div>
            {items.map((elements) => (
                <div className={styles['category-container']}>
                    <Cover 
                        img={elements.img}
                        textImg={elements.textImg}/>
                    <div className={styles['items-container']}>
                        {elements.items.map((items) => (
                            <ShopCard
                                key={items.id}
                                category={items.category}
                                id={items.id}
                                photo={items.img}
                                name={items.name}
                                label={items.label}
                                labelTextColor={items.labelTextColor}
                                labelColor={items.labelColor}
                                isBought={isItemBought(items.category, items.id)}
                                isFree={items.isFree}
                                price={items.price}
                                onBuyItem={buyItem}/>
                        ))}
                    </div>
                </div>

            ))}
        </div>
    )
}
export default Shop