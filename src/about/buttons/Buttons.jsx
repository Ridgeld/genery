import styles from './Buttons.module.scss'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react';

export function Buttons(){
  const navigate = useNavigate();

  const redirect = () =>{
    navigate('/menu');
  }
  return (
    <div className={styles.container}>
        <button className={`${styles.button} ${styles.stroke}`}>Регистрация</button>
        <button className={`${styles.button} ${styles.fill}`} onClick={redirect} >Войти</button>
    </div>
  )
}