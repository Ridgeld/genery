import  Block  from '../../block/Block.jsx';
import '../../themes/default.scss';
import { useAuth } from "../../providers/Authprovired.jsx";
import styles from './Menu.module.scss'
import { useNavigate } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { signOut } from 'firebase/auth';

function About(){
  const { authUser, ga } = useAuth();
  const navigateTo = useNavigate();
  const { elementColors, setElementColors } = useContext(ElementContext);

  const handleClick = () =>{
    navigateTo('/sign-in');
  }
  useEffect(() => {
    setElementColors({
        iconColor: 'var(--first-color)',
        titleColor: 'var(--text-first-color)',
        showArrow: false,
        arrowColor: '#0000FF',
        isBackground: false,
        backgroundColor: '#FFFF00',
        isHeader: true,
    });
    },[ElementContext]);

  return (
    <div className={styles.container}>
      {/* <button onClick={() => signOut(ga)}>Выйти</button> */}
      <Block 
        name = "Обновления" 
        description = "Будь в курсе событий" 
        backgroundColor = "var(--first-color)" 
        textColor = "var(--text-first-color)"
        isCircleArrow = {false}
        arrowColor = "var(--text-first-color)" 
        arrowBackgroundColor = "var(--arrow-background-color)"
        linkTo = "/sign-up"/>
      <Block 
        name = "Обновления" 
        description = "Будь в курсе событий" 
        backgroundColor = "var(--first-color)" 
        textColor = "var(--text-first-color)"
        isCircleArrow = {false}
        arrowColor = "var(--text-first-color)" 
        arrowBackgroundColor = "var(--arrow-background-color)"
        linkTo = "/sign-up"/>
      <Block 
        name = "Обновления" 
        description = "Будь в курсе событий" 
        backgroundColor = "var(--first-color)" 
        textColor = "var(--text-first-color)"
        isCircleArrow = {false}
        arrowColor = "var(--text-first-color)" 
        arrowBackgroundColor = "var(--arrow-background-color)"
        linkTo = "/sign-up"/>
      <Block 
        name = "Обновления" 
        description = "Будь в курсе событий" 
        backgroundColor = "var(--first-color)" 
        textColor = "var(--text-first-color)"
        isCircleArrow = {false}
        arrowColor = "var(--text-first-color)" 
        arrowBackgroundColor = "var(--arrow-background-color)"
        linkTo = "/sign-up"/>
    </div>
  )
}
export default About