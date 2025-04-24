import { useContext, useEffect, useState } from 'react';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import styles from './QuoteGenerate.module.scss'
import MainButton from '../../components/buttons/MainButton/MainButton';

import qoutes from '../menu/qoutes.js';
import { useNavigate } from 'react-router-dom';


export default function QuoteGenerate() {
    const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);
  
    const navigateTo = useNavigate()
    const [qoute, setQoute] = useState(qoutes[Math.floor(Math.random() * qoutes.length)]);

      useEffect(() => {
        setElementColors({
          iconColor: theme.first_color,
          titleColor: theme.text_first_color,
          showArrow: true,
          arrowLink: () => navigateTo('/game-menu'),
          arrowColor: theme.text_first_color,
          isHeaderBackground: false,
          headerBackground: theme.background_color,
          isHeader: true,
          isFooter: true,
          footerBackground: theme.background_color,
          activeElementIndex: 4,
        });
        document.body.style.background = theme.background_color;
      }, [theme]);

    return (
      <div className={styles['container']}>
        <div className={styles['block']}
          style={{
            background: theme.element_first_color,
            color: theme.text_first_color
          }}>
          <h2 className={styles['block-title']}
            style={{
              color: theme.text_first_color
            }}>Цитата:</h2>
          {qoute}
        </div>
        <MainButton 
          name={'Сгенерировать'}
          backgroundColor={theme.first_color}
          textColor={'white'}
          onButtonClick={() => setQoute(qoutes[Math.floor(Math.random() * qoutes.length)])}/>
      </div>
    );
}