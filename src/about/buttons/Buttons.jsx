import styles from './Buttons.module.scss'
export function Image_container(){
  return (
    <div className={styles.container}>
        <button className='button stroke'>Привет</button>
    </div>
  )
}