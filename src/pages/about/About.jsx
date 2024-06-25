// import  Block  from '../../block/Block.jsx';
import '../../themes/default.scss';
import { useAuth } from "../../providers/Authprovired.jsx";
import MySlider  from '../../components/slider/Slider.jsx';
import Button from '../../components/buttons/About/Button.jsx';
import styles from './About.module.scss'
import { useNavigate } from 'react-router-dom';
import React, { useContext, useState , useEffect} from 'react';
function About({ setHeaderColor }){
  const { authUser, ga } = useAuth();
  const navigateTo = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);
  // const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);

  const handleClick = () =>{
    navigateTo('/sign-in');
  }
  return (
    <div className={styles.container}>
      {/* <button onClick={() => signOut(ga)}>Выйти</button> */}
      {/* <Block 
        name = "Обновления" 
        description = "Будь в курсе событий" 
        backgroundColor = "var(--first-color)" 
        textColor = "var(--text-first-color)"
        isCircleArrow = {false}
        arrowColor = "var(--text-first-color)" 
        arrowBackgroundColor = "var(--arrow-background-color)"
        linkTo = "/sign-up"/> */}
        <MySlider/>
        <div className={styles.button_container}>
          <Button name= "Начать" linkTo="/sign-in"/>
        </div>
    </div>
  )
}
export default About