import styles from './Buttons.module.scss'
export function Buttons(){
  return (
    <div className={styles.container}>
        <button className={`${styles.button} ${styles.stroke}`}>Регистрация</button>
        <button className={`${styles.button} ${styles.fill}`}>Войти</button>
    </div>
  )
}