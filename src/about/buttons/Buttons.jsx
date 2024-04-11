import styles from './Buttons.module.scss'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react';

export function Buttons(){
  const redirect = () =>{
    navigate('/me');
  }
  return (
    <div className={styles.container}>
        <button className={`${styles.button} ${styles.stroke}`} onClick={redirect}>Регистрация</button>
        <button className={`${styles.button} ${styles.fill}`}>Войти</button>
    </div>
  )
}