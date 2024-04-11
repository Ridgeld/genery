import styles from './Buttons.module.scss'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react';

export function Buttons(){
  const navigate = useNavigate();
  useEffect(() => {
      navigate('/logo');

    return () => clearTimeout(timeoutId);
  }, [navigate]);
  return (
    <div className={styles.container}>
        <button className={`${styles.button} ${styles.stroke}`} onClick={useEffect}>Регистрация</button>
        <button className={`${styles.button} ${styles.fill}`}>Войти</button>
    </div>
  )
}