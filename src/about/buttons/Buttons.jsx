import styles from './Buttons.module.scss'
export function Buttons(){
  return (
    <div className={styles.container}>
        <button className='button stroke'>Привет</button>
    </div>
  )
}