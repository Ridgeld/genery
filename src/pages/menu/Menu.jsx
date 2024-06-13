import  Block  from '../../block/Block.jsx';
import '../../themes/default.scss';
import { useAuth } from "../../providers/Authprovired.jsx";
import styles from './Menu.module.scss'
import { useNavigate } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { signOut } from 'firebase/auth';
import InfoBlock from '../../components/blocks/info-block/InfoBlock.jsx';

function About(){
  const [quote, setQuote] = useState('')
  const { authUser, ga } = useAuth();
  const navigateTo = useNavigate();
  const { elementColors, setElementColors } = useContext(ElementContext);

  document.body.style.backgroundColor = 'var(--background-color)';

  const handleClick = () =>{
    navigateTo('/sign-in');
  }
  const fetchQuote = async () => {
    try {
        const response = await fetch('/genery/public/assets/qoutes.txt');
        const data = await response.text();
        const quotes = data.split('\n').filter(line => line.trim() !== '');
        const randomIndex = Math.floor(Math.random() * quotes.length);
        return quotes[randomIndex];
    } catch (error) {
        console.error('Error fetching quotes:', error);
        return 'Ошибка загрузки цитаты';
    }
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
          setQuote(storedQuote);
      } else {
          updateQuote();
      }

      const intervalId = setInterval(updateQuote, 24 * 60 * 60 * 1000); // 24 hours
      return () => clearInterval(intervalId);
  }, []);
  useEffect(() => {
    setElementColors({
        iconColor: 'var(--first-color)',
        titleColor: 'var(--text-first-color)',
        showArrow: false,
        arrowColor: '#0000FF',
        isHeaderBackground: true,
        headerBackground: 'var(--background-color)',
        isHeader: true,
        isFooter: true,
        footerBackground: 'var(--background-color)',
        activeElementIndex: 0,
    });
    },[ElementContext]);

  return (
    <div className={styles.container}>
      {/* <button onClick={() => signOut(ga)}>Выйти</button> */}
      <InfoBlock
          name={'Ежедневная цитата'}
          text={quote}
          circleColor={'var(--element-first-color)'}
      />
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
        backgroundColor = "var(--second-color)" 
        textColor = "var(--text-second-color)"
        isCircleArrow = {false}
        arrowColor = "var(--text-second-color)" 
        arrowBackgroundColor = "var(--arrow-background-color)"
        linkTo = "/sign-up"/>
      <Block 
        name = "Обновления" 
        description = "Будь в курсе событий" 
        backgroundColor = "var(--third-color)" 
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