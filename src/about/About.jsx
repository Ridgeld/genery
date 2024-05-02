import  Block  from '../block/Block.jsx';
import '../themes/default.scss';
// import { Header } from '../header/Header.jsx'
// import { Buttons } from './buttons/Buttons.jsx';
// import { Image_container } from './image_container/Image_container.jsx'
// import { MySlider } from './slider/Slider.jsx'
import { useAuth } from "../providers/Authprovired.jsx";
import { signOut } from 'firebase/auth';
import {MySlider} from './slider/Slider.jsx';
import Button from './buttons/Button.jsx';
import styles from './About.module.scss'
import { useNavigate } from 'react-router-dom';

function About(){
  const { authUser, ga } = useAuth();
  const navigateTo = useNavigate()
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
          <Button name= "Начать" onClick={navigateTo('/sign-in')}/>
        </div>
    </div>
  )
}
export default About