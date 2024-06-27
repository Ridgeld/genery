import React, { useContext, useEffect, useRef, useState } from 'react';
import styles from './Tapcoin.module.scss';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import ScoreContainer from '../../components/score-container/ScoreContainer.jsx'
import { motion , AnimatePresence} from 'framer-motion';
import Coin from '../../components/coin/Coin.jsx';
import { db } from '../../../firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from "../../providers/Authprovired.jsx";

function Tapcoin(){
    const { theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);
    const { authUser } = useAuth();
    const [balance, setBalance] = useState();
    const [limit, setLimit] = useState(0);
    const [accessCoins, setAccessCoins] = useState();
    const coinRef = useRef();
    const [angle, setAngle] = useState(0);
    const [clicks, setClicks] = useState([]);

    useEffect(()=>{
        setAccessCoins(limit)
    }, [limit])
    
    

    useEffect(() => {
        const fetchUserPreferences = async () => {
            if (authUser && authUser._id) {
                const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    // console.log(userData);
                    setBalance(userData.balance);
                    setLimit(userData.limit);
                } else {
                    console.log("No such document!");
                }
            } else {
                console.error('authUser or authUser._id is undefined');
            }
        }

        fetchUserPreferences();
    }, [])


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
    useEffect(() =>{
        updateUserBalance(balance)
    }, [balance])

    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowColor: theme.text_first_color,
            arrowLink: '#/game-menu',
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: true,
            footerBackground: theme.background_color,
            activeElementIndex: 3,
        });
        document.body.style.background = theme.background_color
        },[theme]);
    
    useEffect(() =>{
        if(accessCoins < limit){
            const timer = setTimeout(() => {
                setAccessCoins(accessCoins + 1)
              }, 500);
        
              return () => clearTimeout(timer);
        }
    }, [accessCoins]);

    const earnMoney = (e) =>{
        if(accessCoins <= 0) return
        setBalance(balance + 1)
        setAccessCoins(accessCoins - 1);

        const newClick = {
            x: e.clientX,
            y: e.clientY,
            id: Date.now(),
          };
          setClicks((prevClicks) => [...prevClicks, newClick]);
      
          // Удалить div через 1 секунду
          setTimeout(() => {
            setClicks((prevClicks) => prevClicks.filter((click) => click.id !== newClick.id));
          }, 50);
    }
    // const rotateCoin = (angle) =>{
    //     coinRef.current.style.transform = 'rotateY(40deg)'
    // }
    useEffect(() => {
        if (coinRef.current) {
          coinRef.current.style.transform = `rotateY(${angle}deg)`;
          if (angle) {
            setTimeout(() => {
              setAngle(0);
            },70); // 500ms delay before resetting to 0 degrees
          }
        }
      }, [angle]);

    
    return(
        <div className={styles.container}>
            <AnimatePresence>
                {clicks.map((click) => (
                    <motion.div
                        className={styles['score-add']}
                        key={click.id}
                        initial={{ opacity: 1, top: click.y - 10, left: click.x - 10 }}
                        animate={{ opacity: 0, top: click.y -40, left: click.x - 10 }}
                        exit={{ opacity: 0 }}
                        style={{
                            color: theme.text_first_color
                        }}
                    >+1</motion.div>
                ))}
            </AnimatePresence>
            <div className={styles['score-container']}>
                <ScoreContainer
                    name={'Баланс'}
                    count={balance}
                    isBalance={true}/>
            </div>
            <div className={styles['wrapper-action']}>
                <div className={styles['coin']}
                    ref={coinRef}
                    onClick={earnMoney}>
                    <div className={styles['control-point-1']} onClick={() => setAngle(30)}/>
                    <div className={styles['control-point-2']} onClick={() => setAngle(-30)}/>
                    <div className={styles['control-point-3']} onClick={() => setAngle(30)}/>
                    <div className={styles['control-point-4']} onClick={() => setAngle(-30)}/>
                    <div className={styles['control-point-center']}/>
                    <div className={styles['coin-outer']}
                        style={{
                            background: theme.first_color
                        }}>
                        <div className={styles['coin-inner']}></div>
                    </div>
                </div>
            </div>
            <div className={styles['data-container']}>
                    <div className={styles['limit']}>
                        <div className={styles['icon']}>
                            <svg width="12" height="18" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.17925 0.737957C9.28191 0.797057 9.36135 0.88898 9.4046 0.998711C9.44784 1.10844 9.45234 1.22949 9.41735 1.34209L7.52826 7.43758H11.0138C11.1162 7.43754 11.2164 7.46728 11.302 7.52314C11.3876 7.57901 11.4549 7.65854 11.4955 7.75192C11.5361 7.84531 11.5483 7.94846 11.5305 8.04864C11.5128 8.14882 11.4659 8.24164 11.3956 8.31565L3.0043 17.1693C2.9231 17.2551 2.81506 17.311 2.69778 17.3279C2.58049 17.3449 2.46089 17.3219 2.35845 17.2627C2.25601 17.2035 2.17679 17.1116 2.13369 17.0019C2.09059 16.8923 2.08616 16.7714 2.12111 16.6589L4.0102 10.5624H0.524666C0.422234 10.5624 0.322033 10.5327 0.236431 10.4768C0.150829 10.421 0.0835737 10.3414 0.0429683 10.248C0.00236276 10.1547 -0.00981566 10.0515 0.00793624 9.95134C0.0256882 9.85116 0.0725932 9.75833 0.142861 9.68432L8.53417 0.83066C8.61526 0.745039 8.72314 0.689177 8.84025 0.672158C8.95737 0.655138 9.07685 0.677961 9.17925 0.736916V0.737957Z" fill={theme.light_color}/>
                            </svg>
                        </div>
                        <div className={styles['data']}
                            style={{
                                color: theme.text_first_color
                            }}>
                            {`${accessCoins} / ${limit}`}
                        </div>
                    </div>
            </div>
        </div>
    )
}
export default Tapcoin