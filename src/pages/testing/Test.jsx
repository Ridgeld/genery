import React, { act, useContext, useEffect, useRef, useState } from 'react';
import styles from './Test.module.scss';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import MessageInput from '../../components/inputs/messageInput/MessageInput.jsx';
import ImageViewer from '../../components/modal-windows/image-viewer/ImageViewer.jsx';
import { motion } from 'framer-motion';
import ReactDOMServer from 'react-dom/server';
import parser from 'html-react-parser';
import PromoMenu from '../../components/modal-windows/promo-menu/PromoMenu.jsx';
import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification.jsx';
import { useAuth } from "../../providers/Authprovired.jsx";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase.js';

function Test() {
    const { authUser } = useAuth();
    const [text, setText] = useState(null)
    const [imagesUrl, setImagesUrl] = useState([])
    const { theme, setElementColors } = useContext(ElementContext);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const inputBodyRef = useRef(null);
    const [viewData, setViewData] = useState({
        isShow: false,
        images: [],
        index: null

    });
    const [balance, setBalance] =  useState();
    const [prevPromoData ,setPrevPromoData] = useState()
    const [slipData, setSlipData] = useState({
        isShow: false,
        text: '',
    })
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
    
    const [show, setShow] = useState(false)
    const contentEditableRef = useRef(null);
    const savedSelection = useRef(null);

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
        document.body.style.background = theme.background_color;
    }, [theme, setElementColors]);

    useEffect(() => {
        const fetchUserPreferences = async () => {
            if (authUser && authUser._id) {
                const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    // console.log(userData);
                    setBalance(userData.balance);
                    setPrevPromoData(userData.promoLastActivated ? new Date(userData.promoLastActivated) : null)
                } else {
                    console.log("No such document!");
                }
            } else {
                console.error('authUser or authUser._id is undefined');
            }
        }

        fetchUserPreferences();
    }, []);

    const updateUserData = async (newBalance, money) => {
        if (authUser && authUser._id) {
            const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
            const userDocSnap = await getDoc(userDocRef);
    
            const currentDate = new Date();
            
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const prevPromoData = userData.promoLastActivated ? new Date(userData.promoLastActivated) : null;
    
                if (prevPromoData && (currentDate - prevPromoData) < 24 * 60 * 60 * 1000) {
                    setSlipData({
                        isShow: true,
                        text: 'Промокод можно активировать только раз в сутки'
                    });
                    return;
                }
            }
    
            try {
                await updateDoc(userDocRef, {
                    balance: newBalance,
                    promoLastActivated: currentDate.toISOString()
                });
                setSlipData({
                    isShow: true,
                    text: `Промод активирован. Ваш баланс пополнен на ${money}`
                });
                console.log(`Balance updated to ${newBalance}`);
            } catch (error) {
                console.error('Error updating balance:', error);
            }
        } else {
            console.error('authUser or authUser._id is undefined');
        }
    };

    const handleClickMenu = (action, money) =>{
        // alert(action);
        switch(action){
            case 'not found':
                return [
                    setSlipData({
                        isShow: true,
                        text: 'Промокод не найден'
                    }),
                    setShow(false),
                ]
            case 'time exist':
                return [
                    setSlipData({
                        isShow: true,
                        text: 'Действие промокода закончилось'
                    }),
                    setShow(false)
                ]
            case 'found':
                return [
                    updateUserData(balance + money, money),
                ]
        }
    }
  return (
    <div className={styles.container}>
    <SlipNotification
        isShow={slipData.isShow}
        text={slipData.text}/>
    <ImageViewer
        isShow={viewData.isShow}
        images={viewData.images}
        index={viewData.index}
        onClose={()=> setViewData({isShow: false})}/>
    <PromoMenu 
        isShow={show}
        setShow={setShow}
        onClick={handleClickMenu}/>
    <button onClick={() => setShow(true)}>Показать</button>
    </div>
  );
}

export default Test;
