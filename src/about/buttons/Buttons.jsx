import styles from './Buttons.module.scss'
export function Buttons(){
  return (
    <div className={styles.container}>
        <button className={`${styles.button} ${styles.stroke}`}>Регистрация</button>
        <button className={`${styles.button} ${styles.fill}`}>
          Войти
          <div className={styles.arrow}>
            <svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 7C0.447715 7 0 7.44772 0 8C0 8.55228 0.447715 9 1 9V7ZM18.7071 8.70711C19.0976 8.31658 19.0976 7.68342 18.7071 7.29289L12.3431 0.928932C11.9526 0.538408 11.3195 0.538408 10.9289 0.928932C10.5384 1.31946 10.5384 1.95262 10.9289 2.34315L16.5858 8L10.9289 13.6569C10.5384 14.0474 10.5384 14.6805 10.9289 15.0711C11.3195 15.4616 11.9526 15.4616 12.3431 15.0711L18.7071 8.70711ZM1 9H18V7H1V9Z" fill="white"/>
            </svg>
          </div>
        </button>
    </div>
  )
}