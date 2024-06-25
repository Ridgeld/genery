import React, { useContext, useEffect, useState } from 'react';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import styles from './CashBack.module.scss'
import Input from '../../components/inputs/Input.jsx';
import MainButton from '../../components/buttons/MainButton/MainButton.jsx';
import AlertNotification from '../../components/notifictions/AlertNotification/AlertNotification.jsx';
import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification.jsx';

function CashBack(){
    const { theme, elementColors, setElementColors } = useContext(ElementContext);
    const [winCount, setWinCount] = useState('0 c');
    const [sum, setSum] = useState('');
    const [koeff, setKoeff] = useState('');
    const [show, setShow] = useState(false);

    const calculateWin = () => {
        setShow(true);

        if(sum !== ' ' && koeff !== ' '){
            setWinCount(sum * koeff + ' с')
        }
        return
    }

    const closeWindow =() =>{
        setShow(false)
    }
    
    useEffect(() => {
        if (show) {
          const timer = setTimeout(() => {
            setShow(false);
          }, 1000);
    
          return () => clearTimeout(timer);
        }
      }, [show]);
    
    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowLink: '#/list-menu',
            arrowColor: theme.background_color,
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: false,
            footerBackground: theme.background_color,
            activeElementIndex: 1,
        });
        document.body.style.background = theme.background_color
        },[theme]);
    

    return(
        <div className={styles.container}>
            {/* <AlertNotification
                title={'Вы проиграли'}
                text={'Сыграйте еще раз или попробуйте другую игру'}
                isShow={show}
                firstButtonName={'Выйти'}
                secondButtonName={'Играть'}
                firstButtonOnClick={closeWindow}
                secondButtonOnClick={''}/> */}
            {/* <SlipNotification
                text={'Функция в разработке'}
                isShow={show}/> */}
            <div className={styles['block-body']}
                style={{
                    background: theme.element_first_color
                }}>
                <div className={styles['block-name']}
                    style={{
                        color: theme.text_first_color
                    }}>
                    1X ГЛЕБ
                </div>
                <div className={styles['block-text']}
                    style={{
                        color: theme.text_first_color
                    }}>
                    Ваш выигрыш составил:
                </div>
                    <div className={styles['block-price']}
                    style={{
                        color: theme.text_first_color
                    }}>
                        {winCount}
                    </div>
            </div>
            <Input
                key={1}
                type="number" 
                placeholder="Введите сумму ставки" 
                // onInputChange={handleInputChange} 
                onInputChange={(e) => setSum(e.target.value)}
                backgroundColor={theme.element_first_color}
                textColor={theme.text_first_color}
                placeholderColor={theme.text_second_color}/>
            <Input
                key={2}
                type="number" 
                placeholder="Введите коэффициент ставки" 
                // onInputChange={handleInputChange} 
                onInputChange={(e) => setKoeff(e.target.value)}
                backgroundColor={theme.element_first_color}
                textColor={theme.text_first_color}
                placeholderColor={theme.text_second_color}/>
            <MainButton
                name="Рассчитать"
                backgroundColor={theme.first_color}
                textColor={theme.text_first_color}
                onButtonClick={calculateWin}/>
        </div>
    )
}
export default CashBack