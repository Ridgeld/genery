import  Block  from '../../block/Block.jsx';
import { useAuth } from "../../providers/Authprovired.jsx";
import styles from './GameMenu.module.scss'
import { useNavigate } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import { ElementContext, useTheme } from '../../providers/ElementProvider.jsx';
import { signOut } from 'firebase/auth';
import InfoBlock from '../../components/blocks/info-block/InfoBlock.jsx';
import PromoBlock from '../../components/blocks/promo-block/PromoBlock.jsx';
import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification.jsx';
import { db } from '../../../firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import PromoMenu from '../../components/modal-windows/promo-menu/PromoMenu.jsx';
// import { useTheme } from '../../providers/ElementProvider.jsx';

function GameMenu(){
  const { authUser } = useAuth();
  const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);
  const [show, setShow] = useState(false)

  const [balance, setBalance] =  useState();
  const [prevPromoData ,setPrevPromoData] = useState()
    const navigateTo = useNavigate();

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

  useEffect(() => {
    setElementColors({
        iconColor: theme.icon_color,
        titleColor: theme.text_first_color,
        showArrow: true,
        arrowLink: () => navigateTo(`/group-list`),
        arrowColor: theme.text_first_color,
        isHeaderBackground: true,
        headerBackground: theme.background_color,
        isHeader: true,
        isFooter: true,
        footerBackground: theme.background_color,
        activeElementIndex: 0,
        background: theme.background_color
    });
    document.body.style.background = theme.background_color
    },[ElementContext]);
  

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

  const blockHandleClick = () =>{
      setShow(true)
  }
  return (
    <div className={styles.container}>
        <style>{`
                ::-webkit-scrollbar {
                  width: 5px; /* Ширина ползунка */
                }

                /* Стилизация ползунка скроллбара */
                ::-webkit-scrollbar-thumb {
                  background: ${theme.element_first_color}; /* Цвет ползунка */
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
        <PromoMenu
            isShow={show}
            setShow={setShow}
            onClick={handleClickMenu}/>
        <PromoBlock 
            name={'Активируйте промокод'}
            buttonText={'Активировать'}
            onClick={blockHandleClick}/>
        <Block 
            name = "Казино" 
            description = "Последний деп?" 
            backgroundColor = {theme.element_first_color}
            isBorder={true}
            borderColor={theme.block_border_color} 
            textColor = {theme.text_first_color}
            arrowColor = {theme.text_first_color}
            arrowBackgroundColor = {theme.block_arrow_first_color}
            linkTo = "/casino"/>
        <Block 
            name = "Генератор цитат" 
            description = "Легенда вернулась" 
            backgroundColor = {theme.first_color}
            isBorder={true}
            borderColor={theme.block_border_color} 
            textColor = {theme.text_third_color}
            arrowColor = {theme.text_third_color}
            arrowBackgroundColor = {''}
            linkTo = "/generate-quote"/>
        <Block 
            name = "GCOIN" 
            description = "тапай по экрану" 
            backgroundColor = {theme.element_first_color}
            isBorder={true}
            borderColor={theme.block_border_color} 
            textColor = {theme.text_first_color}
            arrowColor = {theme.text_first_color}
            arrowBackgroundColor = {theme.block_arrow_second_color}
            linkTo = "/tapcoin"/>
        <Block 
            name = "Ракетка" 
            description = "Не входи в азарт" 
            backgroundColor = {theme.element_first_color}
            isBorder={true}
            borderColor={theme.block_border_color} 
            textColor = {theme.text_first_color}
            arrowColor = {theme.text_first_color}
            arrowBackgroundColor = {theme.block_arrow_first_color}
            linkTo = "/rocket"/>
        <Block 
            name = "Тест" 
            description = "поступи на СВО" 
            backgroundColor = {theme.element_first_color}
            isBorder={true}
            borderColor={theme.block_border_color} 
            textColor = {theme.text_first_color}
            arrowColor = {theme.text_first_color}
            arrowBackgroundColor = {theme.block_arrow_third_color}
            linkTo = "/quiz"/>
        <Block 
            name = "Flyppi bird" 
            description = "9/11" 
            backgroundColor = {theme.element_first_color}
            isBorder={true}
            borderColor={theme.block_border_color} 
            textColor = {theme.text_first_color}
            arrowColor = {theme.text_first_color}
            arrowBackgroundColor = {theme.block_arrow_second_color}
            linkTo = "/flippybird"/>
        <Block 
            name = "Рейтинг студентов" 
            description = "Баллы получай, IQ повышай" 
            backgroundColor = {theme.element_first_color}
            isBorder={true}
            borderColor={theme.block_border_color} 
            textColor = {theme.text_first_color}
            arrowColor = {theme.text_first_color}
            arrowBackgroundColor = {theme.block_arrow_first_color}
            linkTo = "/rating"/>
        <Block 
            name = "Угадай линию" 
            description = "Ну могу 2 балла поставить" 
            backgroundColor = {theme.element_first_color}
            isBorder={true}
            borderColor={theme.block_border_color} 
            textColor = {theme.text_first_color}
            arrowColor = {theme.text_first_color}
            arrowBackgroundColor = {theme.block_arrow_third_color}
            linkTo = "/guessline"/>
    </div>
  )
}
export default GameMenu