import styles from './Buttons.module.scss'
export function Buttons(){
  return (
    <div className={styles.container}>
        <button className={styles.button.stroke}>Регистрация</button>
        <button className={styles.button.fill}>Регистрация</button>
    </div>
  )
}