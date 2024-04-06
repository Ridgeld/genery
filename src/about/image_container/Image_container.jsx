import styles from './Image_container.module.scss'
export function Image_container(){
  return (
    <div className={styles.container}>
        <img src='./img_1.png' className={styles.img_1}  />
        <img src='./img_2.png' className={styles.img_2}  />
    </div>
  )
}