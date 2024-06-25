import  Block  from '../../block/Block.jsx';
import { useAuth } from "../../providers/Authprovired.jsx";
import styles from './GameMenu.module.scss'
import { useNavigate } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import { ElementContext, useTheme } from '../../providers/ElementProvider.jsx';
import { signOut } from 'firebase/auth';
import InfoBlock from '../../components/blocks/info-block/InfoBlock.jsx';
// import { useTheme } from '../../providers/ElementProvider.jsx';

function GameMenu(){
  const { authUser } = useAuth();
  const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);


  useEffect(() => {
    setElementColors({
        iconColor: theme.icon_color,
        titleColor: theme.text_first_color,
        showArrow: true,
        arrowLink: '#/menu',
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

  return (
    <div className={styles.container}>
      {/* <button onClick={() => signOut(ga)}>Выйти</button> */}
      {/* <InfoBlock
          name={'Ежедневная цитата'}
          text={quote}
          circleColor={theme.block_arrow_first_color}
      /> */}
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
      {/* <Block 
          name = "Меню игр" 
          description = "Сделаешь ставку?" 
          backgroundColor = {theme.block_second_color} 
          isBorder={false}
          borderColor={theme.block_border_color} 
          textColor = {theme.text_second_color} 
          arrowColor = {theme.text_second_color}  
          arrowBackgroundColor = {theme.block_arrow_second_color} 
          linkTo = "/game-menu"/>
      <Block 
          name = "Расписание" 
          description = "Какой сейчас урок?" 
          backgroundColor = {theme.block_third_color} 
          isBorder={false}
          borderColor={theme.block_border_color} 
          textColor = {theme.text_first_color} 
          arrowColor = {theme.text_first_color} 
          arrowBackgroundColor = {theme.block_arrow_third_color} 
          linkTo = "/sign-up"/>
      <Block 
          name = "Магазин" 
          description = "Прояви себя" 
          backgroundColor = {theme.block_first_color} 
          isBorder={true}
          borderColor={theme.block_border_color} 
          textColor = {theme.text_first_color}
          isCircleArrow = {false}
          arrowColor = {theme.text_first_color}
          arrowBackgroundColor = {theme.block_arrow_first_color}
          linkTo = "/shop"/> */}
    </div>
  )
}
export default GameMenu