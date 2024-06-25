import  Block  from '../../block/Block.jsx';
import '../../themes/default.scss';
import { useAuth } from "../../providers/Authprovired.jsx";
import styles from './Menu.module.scss'
import { useNavigate } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import { ElementContext, useTheme } from '../../providers/ElementProvider.jsx';
import { signOut } from 'firebase/auth';
import InfoBlock from '../../components/blocks/info-block/InfoBlock.jsx';
// import { useTheme } from '../../providers/ElementProvider.jsx';
import quotes from './qoutes.js';

function About(){
  const [quote, setQuote] = useState('')
  const { authUser } = useAuth();
  const navigateTo = useNavigate();
  const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);


//   const fetchQuote = async () => {
//     try {
//         const response = await fetch('./quotes.txt');
//         const data = await response.text();
//         const quotes = data.split('\n').filter(line => line.trim() !== '');
//         const randomIndex = Math.floor(Math.random() * quotes.length);
//         return quotes[randomIndex];
//     } catch (error) {
//         console.error('Error fetching quotes:', error);
//         return 'Ошибка загрузки цитаты';
//     }
//   };
    const fetchQuote = () => {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        return quotes[randomIndex];
    };

  const updateQuote = async () => {
      const newQuote = await fetchQuote();
      setQuote(newQuote);
      localStorage.setItem('dailyQuote', newQuote);
      localStorage.setItem('quoteDate', new Date().toISOString());
  };

  useEffect(() => {
      const storedQuote = localStorage.getItem('dailyQuote');
      const storedDate = localStorage.getItem('quoteDate');
      const today = new Date().toISOString().split('T')[0];

      if (storedQuote && storedDate && storedDate.split('T')[0] === today) {
            // updateQuote();
            setQuote(storedQuote);
      } else {
            updateQuote();
      }

      const intervalId = setInterval(updateQuote, 24 * 60 * 60 * 1000); // 24 hours
      return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setElementColors({
        iconColor: theme.icon_color,
        titleColor: theme.text_first_color,
        showArrow: false,
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
      <InfoBlock
          name={'Ежедневная цитата'}
          text={quote}
          circleColor={theme.block_arrow_first_color}
      />
      <Block 
          name = "Обновления" 
          description = "Будь в курсе событий" 
          backgroundColor = {theme.block_first_color}
          isBorder={true}
          borderColor={theme.block_border_color} 
          textColor = {theme.text_first_color}
          arrowColor = {theme.text_first_color}
          arrowBackgroundColor = {theme.block_arrow_first_color}
          linkTo = "/updates"/>
      <Block 
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
          linkTo = "/timetable"/>
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
          linkTo = "/shop"/>
    </div>
  )
}
export default About