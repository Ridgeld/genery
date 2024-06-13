import React, { useContext, useEffect, useState } from 'react';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import styles from './CashBack.module.scss'
import Input from '../../components/inputs/Input.jsx';
import MainButton from '../../components/buttons/MainButton/MainButton.jsx';
import AlertNotification from '../../components/notifictions/AlertNotification/AlertNotification.jsx';
import SlipNotification from '../../components/notifictions/SlipNotification/SlipNotification.jsx';

function CashBack(){
    const { elementColors, setElementColors } = useContext(ElementContext);
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
            iconColor: 'var(--first-color)',
            titleColor: 'var(--text-first-color)',
            showArrow: true,
            arrowLink: '#/menu',
            arrowColor: 'var(--text-first-color)',
            isHeaderBackground: true,
            headerBackground: 'var(--background-color)',
            isHeader: true,
            isFooter: false,
            footerBackground: 'var(--background-color)',
            activeElementIndex: 1,
        });
        },[ElementContext]);
    

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
                    background: 'var(--element-first-color)'
                }}>
                <div className={styles['block-name']}
                    style={{
                        color: 'var(--text-first-color)'
                    }}>
                    1X ГЛЕБ
                </div>
                <div className={styles['block-text']}
                    style={{
                        color: 'var(--text-first-color)'
                    }}>
                    Ваш выигрыш составил:
                </div>
                    <div className={styles['block-price']}
                    style={{
                        color: 'var(--text-first-color)'
                    }}>
                        {winCount}
                    </div>
            </div>
            <Input
                type="number" 
                placeholder="Введите сумму ставки" 
                // onInputChange={handleInputChange} 
                onInputChange={(e) => setSum(e.target.value)}
                backgroundColor="var(--element-first-color)"
                textColor="var(--text-first-color)"
                placeholderColor="var(--casino-first-color)"/>
            <Input
                type="number" 
                placeholder="Введите коэффициент ставки" 
                // onInputChange={handleInputChange} 
                onInputChange={(e) => setKoeff(e.target.value)}
                backgroundColor="var(--element-first-color)"
                textColor="var(--text-first-color)"
                placeholderColor="var(--casino-first-color)"/>
            <MainButton
                name="Рассчитать"
                backgroundColor={'var(--first-color)'}
                textColor={'var(--text-first-color)'}
                onButtonClick={calculateWin}/>
        </div>
    )
}
export default CashBack