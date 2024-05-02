import styles from './Button.module.scss'
import { useNavigate } from 'react-router-dom'

function Button(props){
  const navigateTo = useNavigate();

  const handleClick = () => {
    navigateTo(props.linkTo)
  }
  return (
    <button className={styles.button} onClick={handleClick}>
      {props.name}
      <div className={styles.arrow}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.29289 9.53553C0.902369 9.92606 0.902369 10.5592 1.29289 10.9497C1.68342 11.3403 2.31658 11.3403 2.70711 10.9497L1.29289 9.53553ZM11.4853 1.75736C11.4853 1.20508 11.0376 0.75736 10.4853 0.75736L1.48528 0.75736C0.932997 0.75736 0.485281 1.20508 0.485281 1.75736C0.485281 2.30965 0.932997 2.75736 1.48528 2.75736L9.48528 2.75736L9.48528 10.7574C9.48528 11.3096 9.933 11.7574 10.4853 11.7574C11.0376 11.7574 11.4853 11.3096 11.4853 10.7574L11.4853 1.75736ZM2.70711 10.9497L11.1924 2.46447L9.77817 1.05025L1.29289 9.53553L2.70711 10.9497Z" fill="white"/>
        </svg>
      </div>
    </button>
  )
}
export default Button