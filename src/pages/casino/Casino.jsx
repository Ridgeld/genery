import React, { useContext, useEffect, useState } from 'react';
import styles from './Casino.module.scss'
import AlertNotification from '../../components/notifictions/AlertNotification/AlertNotification';
import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification';
import { createItems } from './Casino.js';
import { useAuth } from "../../providers/Authprovired.jsx";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import Wheel from '../../components/wheel/Wheel.jsx';
import { useNavigate } from 'react-router-dom';
import Chip from '../../components/chip/Chip.jsx';
import numbers from './Number.js';
import ScoreContainer from '../../components/score-container/ScoreContainer.jsx';


function Casino(){
    const {theme, elementColors, setElementColors } = useContext(ElementContext);
    // const [showAlert, setShowAlert] = useState(false);
    const items = createItems(theme);
    const navigateTo = useNavigate();
    const [showWheel, setShowWheel] = useState(false);
    const { authUser } = useAuth();
    const [balance, setBalance] = useState(0);
    const [bets, setBets] = useState([]);
    const [payout, setPayout] = useState(0);
    const [isWheelSpinning, setIsWheelSpinning] = useState(false);
    const [resultNumber, setResultNumber] = useState(null);

    const [alertProp, setAlertProp] = useState({
        isShow: false,
        title: 'Заголовок',
        text: 'текст',
        firstButtonName: 'выйти',
        secondButtonName: 'играть',

    });

    const [slipProp, setSlipProp] = useState({
        isShow: false,
        text: ''
    });

    useEffect(() => {
        if (slipProp.isShow) {
          const timer = setTimeout(() => {
            setSlipProp({
                isShow: false
            });
          }, 1000);
    
          return () => clearTimeout(timer);
        }
      }, [slipProp]);

    const playAgain = () => {
        // window.location.reload();
        setAlertProp({
            isShow: false,
            title: 'Заголовок',
            text: 'текст',
            firstButtonName: 'выйти',
            secondButtonName: 'играть',
        });

        setShowWheel(false);
        setBets([]);
        setPayout(0);
        setIsWheelSpinning(false);
    }
    const quitGame = () => {
        navigateTo('/menu');
    }
    const handleWheel = () => {
        setShowWheel(true);
    }

    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowLink: '#/game-menu',
            arrowColor: theme.text_first_color,
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
                    console.log(userData);
                    setBalance(userData.balance < 100 ? 1000: userData.balance);
                } else {
                    console.log("No such document!");
                }
            } else {
                console.error('authUser or authUser._id is undefined');
            }
        }

        fetchUserPreferences();
    }, [authUser]);

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

    const handleItemClick = (item) => {
        if(balance < 100){
            setSlipProp({
                isShow: true,
                text: 'У вас недостаточно средств для ставки'
            })
            return
        }
        setBets(prevBets => {
          const betExists = prevBets.some(bet => bet.item === item);

          if (betExists) {
            const newBets = prevBets.filter(bet => bet.item !== item);
            setBalance(balance + 100);
            return newBets;
          } else {
            const newBets = [...prevBets, { item, bet: 100 }];
            setBalance(balance - 100);
            return newBets;
          }
        });
    };

    const alertPrize = (indicatedSegment) => {
        setIsWheelSpinning(true);

        setResultNumber(Number(indicatedSegment.text));
        console.log(Number(indicatedSegment.text));
        
    };
    useEffect(() => {
        console.log(bets)
        if (isWheelSpinning) {
            calculatePayout(resultNumber);
        }
    }, [bets, isWheelSpinning]);

    const calculatePayout = (number) => {
        const properties = numbers[number];
        let totalPayout = 0;
        let baseBet = 0;
        bets.forEach(bet => {
          if (bet.item === number || properties.includes(bet.item)) {
            baseBet += bet.bet;
          }
        });
    
        const hasNumberBet = bets.some(bet => bet.item === number);
        console.log('Base bet:', baseBet);
        console.log('Has number bet:', hasNumberBet);

        if (hasNumberBet) {
            totalPayout = baseBet * 4;
        } else {
          const matches = bets.filter(bet => properties.includes(bet.item)).length;
          totalPayout = baseBet * matches;
        }
    
        setPayout(totalPayout);
        setBalance(balance + totalPayout);
        updateUserBalance(balance + totalPayout);

        setAlertProp({
            isShow: true,
            title: 'Вы выиграли',
            text: `Ваш выигрыш составил: ${totalPayout}`,
            firstButtonName: 'Выйти',
            secondButtonName: 'Играть',
            firstButtonOnClick: quitGame,
            secondButtonOnClick: playAgain,
        });
    };
    return(
        <div className={styles.container}>
            <AlertNotification
                title={alertProp.title}
                text={alertProp.text}
                isShow={alertProp.isShow}
                firstButtonName={alertProp.firstButtonName}
                secondButtonName={alertProp.secondButtonName}
                firstButtonOnClick={alertProp.firstButtonOnClick}
                secondButtonOnClick={alertProp.secondButtonOnClick}/>
            <SlipNotification
                isShow={slipProp.isShow}
                text={slipProp.text}/>
            <Wheel 
                isShow={showWheel}
                onStop={alertPrize}/>
            <div className={styles.area}>
                <ScoreContainer 
                    name={'Баланс'}
                    isBalance={true}
                    count={balance}/>

                <div className={styles.table}>
                    {items.map((item) => (
                        <div className={styles.item}
                            key={item.name}
                            style={{
                                background: item.isZero ? item.background : 'transparent',
                                gridColumn: item.grid === 'column' ? item.size : '',
                                gridRow: item.grid === 'row' ? item.size : '',
                                border: `1px solid ${theme.element_first_color}`,
                                borderRadius: item.border,
                                color: theme.text_first_color
                            }}
                            onClick={() => handleItemClick(item.name)}>
                                {bets.some(bet => bet.item === item.name) && <Chip price={100}/>}
                                {item.isCircle ?
                                <div className={styles.circle}
                                    style={{
                                        background: item.circleColor,
                                        color: theme.text_first_color
                                    }}>{item.name}</div>
                                    : item.name
                                }</div>
                    ))}
                    <button className={styles.spin}
                        style={{
                            background: theme.element_first_color,
                            color: theme.text_first_color
                        }}
                        onClick={handleWheel}>крутить</button>
                </div>
            </div>
        </div>
    )
}
export default Casino