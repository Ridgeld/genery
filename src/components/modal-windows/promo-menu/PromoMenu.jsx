import React, { useContext, useEffect, useRef, useState } from 'react';
import styles from './PromoMenu.module.scss'
import { ElementContext } from '../../../providers/ElementProvider';
import { motion, useMotionValue } from 'framer-motion';
import { useAuth } from "../../../providers/Authprovired.jsx";
import { db } from '../../../../firebase';
import SlipNotification from '../../notifictions/SlipNotification/SlipNotification';
import { doc, getDoc } from 'firebase/firestore';


// ТЕСТИРОВАНИЕ СЕМАНТИКИ И ТЭГОВ
function PromoMenu({isShow, setShow, onClick}){
    const { theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);
    const { authUser } = useAuth();
    const [promoValues, setPromoValues] = useState(Array(6).fill(''));
    const [promo, setPromo] = useState([]);
    const [isDraging, setIsDraging] = useState(false);
    const [disable, setDisable] = useState(true);

    const [promoName, setPromoName] = useState();
    const [promoMoney, setPromoMoney] = useState();

    const containerRef = useRef()
    const inputRefs = useRef([]);

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

    const dragY = useMotionValue(0)

    const variants = {
        hidden: {opacity: 0, visibility: 'hidden'},
        show: {opacity: 1, visibility: 'visible' },
        close: {marginTop: '100%'},
        open: {marginTop: '30%'},
    }
    const inputChange = (e, index) => {
        const value = e.target.value;
        const newPromoValues = [...promoValues];
        newPromoValues[index] = value;
        setPromoValues(newPromoValues);
    
        if (value.length === 1 && index < inputRefs.current.length - 1) {
          inputRefs.current[index + 1].focus();
        } else if (value.length === 0 && index > 0) {
          inputRefs.current[index - 1].focus();
        }
    
        const filledValues = newPromoValues.filter(val => val !== '');
        setDisable(filledValues.length < 6);
    };

    const parsePromoDate = (dateString, timeString) => {
        const [day, month, year] = dateString.split('.').map(Number);
        const [hours, minutes] = timeString.split(':').map(Number);
    
        return new Date(year, month - 1, day, hours, minutes);
    };

    const handleButtonClick = async () => {
        setPromoValues(Array(6).fill(''));
        setDisable(true);
        const promoCode = promoValues.join('').toUpperCase();
        const docRef = doc(db, 'promocodes', promoCode);
        const docSnap = await getDoc(docRef);
    
        if (docSnap.exists()) {
          const promoData = docSnap.data();
          const promoExpiryDate = parsePromoDate(promoData.time.data, promoData.time.time);// Преобразование времени из базы данных
          const currentDate = new Date();
            
          if (promoExpiryDate > currentDate) {
            onClick('found', promoData.money)
            // alert(`Промокод действителен. Сумма: ${promoData.money}`);
            // setSlipData({
            //     isShow: true,
            //     text: `Промокод действителен. Ваш баланс пополнен на ${promoData.money}`
            // })
            setShow(false);
          } else {
                onClick('time exist', 0)
            // alert(`Промокод истёк. текущая дата:  ${currentDate} дата промокода: ${promoData.time}  `);
            // setSlipData({
            //     isShow: true,
            //     text: `Промокод истёк`
            // })
          }
        } else {
            onClick('not found', 0)
        //   alert('Промокод не найден.');
        //   setSlipData({
        //     isShow: true,
        //     text: `Промокод не найден`
        // })
        }
    };
    const onDragStart = () => {
        setIsDraging(true);

    }

    const onDragEnd = () => {
        setIsDraging(false);
        const currentY = dragY.get();
        console.log("dragY:", currentY);
        if (containerRef.current) {
            if (currentY < -70) {
              containerRef.current.style.marginTop = '2%';
              // Добавьте свою логику здесь
            } else if (currentY > 10 && currentY < 50) {
              containerRef.current.style.marginTop = '3%';
            } else if (currentY > 70) {
              setShow(false);
            }
          }
    
        dragY.set(0);
      };
    return(
        <motion.div className={styles['overlay']}
            variants={variants}
            initial={'hidden'}
            animate={isShow ? 'show' : 'hidden'}>
            <SlipNotification
                isShow={slipData.isShow}
                text={slipData.text}/>
            <motion.section className={styles['menu-wrapper']}
                style={{
                    y: dragY,
                    background: theme.element_first_color
                }}
                ref={containerRef}
                variants={variants}
                initial={'close'}
                animate={isShow ? 'open' : 'close'}
                drag ='y'
                dragConstraints={{
                    top: -300, 
                    bottom: 0,
                }}
                transition={{
                    type: "spring",
                    damping: 40,
                    stiffness: 400
                }}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}>
                <div className={styles['line']}
                    style={{
                        background: theme.element_second_color,
                    }}></div>
                <div className={styles['content-wrapper']}>
                    <h3 className={styles['menu-title']}
                        style={{
                            color: theme.text_first_color
                        }}>Промокод</h3>
                    <div className={styles['content']}>
                        {promoValues.map((val, index) => (
                            <input
                            key={index}
                            type="text"
                            className={styles['input-promo']}
                            style={{
                                color: theme.text_first_color,
                                background: theme.element_second_color,
                                '--focusColor': theme.gradient_first_color,
                            }}
                            maxLength={1}
                            value={val}
                            onChange={(e) => inputChange(e, index)}
                            ref={el => inputRefs.current[index] = el}
                            />
                        ))}
                    </div>
                    <button className={styles['main-button']}
                        style={{
                            background: disable ? theme.element_second_color : theme.first_color,
                            color: theme.text_first_color,
                            // '--disableColor': theme.element_second_color
                        }}
                        disabled={disable}
                        onClick={handleButtonClick}>
                        Активировать</button>
                </div>
            </motion.section>
        </motion.div>
    )
}
export default PromoMenu