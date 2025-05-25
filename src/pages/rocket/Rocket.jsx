import React, { useContext, useEffect, useRef, useState } from 'react';
import styles from './Rocket.module.scss';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import ScoreContainer from '../../components/score-container/ScoreContainer.jsx'
import { motion , AnimatePresence} from 'framer-motion';
import Coin from '../../components/coin/Coin.jsx';
import { db } from '../../../firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from "../../providers/Authprovired.jsx";
import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification.jsx';
import { useNavigate } from 'react-router-dom';


function Rocket(){
    const { theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);
    const { authUser } = useAuth();
    const [balance, setBalance] = useState();
    const [isFly, setIsFly] = useState(false);
    const [koeff, setKoeff] = useState(0);
    const [bet, setBet] = useState(100);
    const [buttonName, setButtonName] = useState('Ставка')
    const [actionTitle, setActionTitle] = useState('Успей забрать')
    const [startPlay, setStartPlay] = useState(false);
    const [disableButton, setDisableButton] = useState(false);
    const [startAddKoeff, setStartAddKoeff] = useState(false)
    const [slipData, setSlipData] = useState({
        isShow: false,
        text: ''
    });
    const [variants, setVariants] = useState({});
    const navigateTo = useNavigate()

    useEffect(() => {
        const updateVariants = () => {
          if (window.innerWidth > 700) {
            setVariants({
              stop: { right: -100, top: 30 },
              fly: { right: -600, top: -60},
            });
          } else {
            setVariants({
              stop: { right: -20, top: 120 },
              fly: { right: -150, top: 60 },
            });
          }
        };
    
        updateVariants();
    
        window.addEventListener('resize', updateVariants);
    
        return () => {
          window.removeEventListener('resize', updateVariants);
        };
      }, []);

    const canvasRef = useRef();

    const hexToRgba = (hex, opacity) => {
        // Удалить символ #, если он присутствует
        hex = hex.replace('#', '');
    
        // Разделить hex на компоненты R, G, B
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
    
        // Вернуть в формате rgba
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
    
        // Очистить холст
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // Начать путь
        ctx.beginPath();
        ctx.moveTo(0, canvas.height); // Начальная точка
    
        // Нарисовать вогнутую линию
        ctx.quadraticCurveTo(250, canvas.height / 2, canvas.width, 0);
        ctx.lineTo(canvas.width, canvas.height); // Добавляем линию от конечной точки до верхнего левого угла
        ctx.closePath();

        // Настройки заливки
        // ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'; 

        // Залить путь
        const fillColor = hexToRgba(theme.gradient_first_color, 0.5);

        // Настройки заливки
        ctx.fillStyle = fillColor; // Используем преобразованный цвет
    
        // Залить путь
        ctx.fill();
        // Настройки линии
        ctx.strokeStyle = theme.gradient_first_color;
        ctx.lineWidth = 2;
    
        // Нарисовать линию
        ctx.stroke();
      }, []);

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
                } else {
                    console.log("No such document!");
                }
            } else {
                console.error('authUser or authUser._id is undefined');
            }
        }

        fetchUserPreferences();
    }, [])

    useEffect(() => {
        if(!startPlay){
            setBet(100);
            setStartAddKoeff(false);
            setDisableButton(false);
            setButtonName('Ставка');
            setActionTitle(isFly ? 'Улетел' : 'Успей забрать');
            return
        }
        if (startPlay) {
            setKoeff(0);
            setButtonName('Забрать');
            setActionTitle('Успей забрать');
            setDisableButton(true);
            setStartAddKoeff(true);
            setIsFly(false);
            const randomTime = 2000 + Math.random() * 18000; // Время в миллисекундах от 2000 до 5000
            const timer = setTimeout(() => {
              setIsFly(true);
              setStartPlay(false);
              setStartAddKoeff(false);
            }, randomTime);
      
            // Очистка таймера при размонтировании компонента или изменении isFly
            return () => clearTimeout(timer);
          }
    }, [startPlay])

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
    // useEffect(() =>{
    //     updateUserBalance(balance)
    // }, [balance])

    // useEffect(() =>{
    //     if(bet > balance){
    //         setSlipData({
    //             isShow: true,
    //             text: 'У вас недостаточно средств для ставки'
    //         })
    //     }
    // }, [bet])
    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowColor: theme.text_first_color,
            arrowLink: () => navigateTo('/game-menu'),
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
        if (!startAddKoeff) return;

        const intervalId = setInterval(() => {
            setKoeff((prevKoeff) => parseFloat((prevKoeff + 0.01).toFixed(2)));
        }, 70);
    
        return () => clearInterval(intervalId);
      }, [startAddKoeff]);

    const updateBet = (event) => {
        const value = event.target.value;
        if (value === '') {
          setBet(''); // Оставляем пустую строку, если поле ввода очищено
        } else {
          setBet(parseInt(value, 10)); // Преобразование в число
        }
    };
      
    
    const addBet = () => {
        if(bet > balance){
            setSlipData({
                isShow: true,
                text: 'У вас недостаточно средств для ставки'
            })
            return
        }
        setBalance(balance - bet);
        updateUserBalance(balance - bet)
        setStartPlay(true);
    }
    const addWin = () => {
        setSlipData({
            isShow: true,
            text: `Вы выиграли ${Math.floor(bet * koeff)}`
        });
        setBalance((prevBalance) => Math.floor(prevBalance + (bet * koeff)));
        updateUserBalance(balance + Math.floor(bet * koeff));
        setStartPlay(false);
    }
    return(
        <div className={styles['overlay']}>
            <div className={styles.container}>
                <SlipNotification
                    text={slipData.text}
                    isShow={slipData.isShow}/>
                <div className={styles['score-container']}>
                    <ScoreContainer
                        name={'Баланс'}
                        count={balance}
                        isBalance={true}/>
                </div>
                <div className={styles['view-container']}>
                    <h3 className={styles['koeff']}
                        style={{
                            color: theme.text_first_color
                        }}>{`x${koeff}`}</h3>
                    <h4 className={styles['action_text']}
                        style={{
                            color: theme.text_first_color
                        }}>{actionTitle}</h4>
                    <div className={styles['track']}>
                        <canvas ref={canvasRef} className={styles['track-bg']}></canvas>
                    </div>
                    <motion.div 
                        variants={variants}
                        animate={isFly ? "fly" : "stop"}
                        className={styles['rocket']}
                        transition={{
                            duration: 0.3
                        }}>
                        <img src='rocket.png'/>
                    </motion.div>
                    <div className={styles['cloud-container']}>
                        <div className={styles['cloud']}>
                            <img  src='cloud_1.png'/>
                        </div>
                        <div className={styles['cloud']}>
                            <img  src='cloud_2.png'/>
                        </div>
                        <div className={styles['cloud']}>
                            <img  src='cloud_3.png'/>
                        </div>
                        <div className={styles['cloud']}>
                            <img  src='cloud_2.png'/>
                        </div>
                        <div className={styles['cloud']}>
                            <img  src='cloud_1.png'/>
                        </div>
                    </div>
                </div>
                <div className={styles['bet-container']}
                    style={{
                        background: theme.element_first_color
                    }}>
                    <div className={styles['input-container']}>
                        <button className={styles['input-button']}
                            style={{
                            background: theme.element_second_color
                            }}
                            onClick={() => setBet((prevBet) => prevBet - 1)}
                            disabled={disableButton}>
                            <svg width="18" height="4" viewBox="0 0 18 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 2H9H2" stroke={theme.text_first_color} strokeWidth="3" strokeLinecap="round"/>
                            </svg>
                        </button>
                        <input type='number' 
                            placeholder='Ставка' 
                            min={0}
                            value={bet} 
                            onChange={updateBet}
                            className={styles['input-bet']}
                            style={{
                                color: theme.text_first_color,
                                caretColor: theme.first_color,
                                '--placeholderColor' : theme.text_third_color
                            }}/>
                        <button className={styles['input-button']}
                            style={{
                            background: theme.element_second_color
                            }}
                            onClick={() => setBet((prevBet) => prevBet + 1)}
                            disabled={disableButton}>
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 2V9M9 16V9M9 9H16M9 9H2" stroke={theme.text_first_color} strokeWidth="3" strokeLinecap="round"/>
                            </svg>
                        </button>
                    </div>
                    <button className={styles['add-bet']}
                        style={{
                            background: theme.first_color,
                            color: theme.text_third_color
                        }}
                        onClick={buttonName==='Ставка' ? addBet : addWin }>{buttonName}</button>
                </div>
                {/* <button onClick={() => setIsFly(true)}>Улетел</button> */}
            </div>
        </div>
    )
}
export default Rocket