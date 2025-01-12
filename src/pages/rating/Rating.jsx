import React, { useContext, useEffect, useRef, useState } from 'react';
import styles from './Rating.module.scss';
import { ElementContext } from '../../providers/ElementProvider';
import { useNavigate } from 'react-router-dom';

export default function Rating(){
    const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);

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
            isFooter: false,
            footerBackground: theme.background_color,
            activeElementIndex: 0,
            background: theme.background_color
        });
        document.body.style.background = theme.background_color
        },[ElementContext]);
    
    const [alertProp, setAlertProp] = useState({
        isShow: false,
        title: 'Заголовок',
        text: 'текст',
        firstButtonName: 'выйти',
        secondButtonName: 'играть',

    });
    





        // if (gameOver) {
        //     setAlertProp({
        //         isShow: true,
        //         title: 'Вы проиграли!',
        //         text: `Ваш счет: ${score}`,
        //         firstButtonName: 'Выйти',
        //         secondButtonName: 'Играть',
        //         firstButtonOnClick: () => navigateTo('/game-menu'),
        //         secondButtonOnClick: () => resetGame()
        
        //     })
        //     // context.fillText("GAME OVER", 5, 90);
        // }



    return(
        <div className={styles['container']}>
            <iframe className={styles['game']} src="https://students-rating-private-k4ev417e7-ridgelds-projects.vercel.app/"></iframe>
        </div>
    )
}