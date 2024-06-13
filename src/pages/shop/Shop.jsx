import React, { useContext, useEffect, useState } from 'react';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import styles from './Shop.module.scss'
import items from './Shop.js';
import Cover from './Cover.jsx';
import ShopCard from './ShopCard.jsx';
import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification.jsx';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { useAuth } from "../../providers/Authprovired.jsx";

function Shop(){
    const { elementColors, setElementColors } = useContext(ElementContext);
    const [show, setShow] = useState(false);
    const [text, setText] = useState('');
    const [balance, setBalance] = useState(0);
    const { authUser } = useAuth();
    
    useEffect(() => {
        if (show) {
          const timer = setTimeout(() => {
            setShow(false);
          }, 1000);
    
          return () => clearTimeout(timer);
        }
      }, [show]);
    
    useEffect(() => {
        const fetchUserPreferences = async () => {
            if (authUser && authUser._id) {
                const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    console.log(userData);
                    setBalance(userData.balance);
                } else {
                    console.log("No such document!");
                }
            } else {
                console.error('authUser or authUser._id is undefined');
            }
        }

        fetchUserPreferences();
    }, [authUser])

    useEffect(() => {
        setElementColors({
            iconColor: 'var(--first-color)',
            titleColor: 'var(--text-first-color)',
            showArrow: true,
            arrowLink: '#/menu',
            arrowColor: 'var(--text-first-color)',
            isHeaderBackground: true,
            headerBackground: 'var(--background-color)',
            isHeader: true,
            isFooter: true,
            footerBackground: 'var(--background-color)',
            activeElementIndex: 3,
        });
        },[ElementContext]);
    
    const buyItem = (id) => {
        setShow(true);
        setText(`вы приобрели тему: ${id}`);
    }

    const handleBuyItem = async(id) => {
        if (authUser && authUser._id) {
            const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
            try {
                await setDoc(userDocRef, { id }, { merge: true });
            } catch (error) {
                console.error("Error updating document: ", error);
            }
        }
    }
    return(
        <div className={styles.container}>
            <SlipNotification
                text={text}
                isShow={show}/>
            {items.map((elements) => (
                <div className={styles['category-container']}>
                    <Cover 
                        img={elements.img}
                        textImg={elements.textImg}/>
                    <div className={styles['items-container']}>
                        {elements.items.map((items) => (
                            <ShopCard
                                id={items.id}
                                photo={items.img}
                                name={items.name}
                                label={items.label}
                                labelTextColor={items.labelTextColor}
                                labelColor={items.labelColor}
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