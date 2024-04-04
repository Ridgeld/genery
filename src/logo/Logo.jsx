import { Link, useNavigate } from 'react-router-dom'
import styles from './Logo.module.scss'
import { useEffect } from 'react';


export default function Logo(){
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      navigate('/about');
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [navigate]);

  return (
  <div className={styles.logo_container}>
    <div className={styles.icon}>
      <svg width="52" height="77" viewBox="0 0 52 77" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M41.3678 0.329357C41.8305 0.602395 42.1885 1.02708 42.3834 1.53404C42.5783 2.04099 42.5985 2.60025 42.4409 3.12045L33.9274 31.2816H49.6355C50.0971 31.2814 50.5487 31.4188 50.9345 31.6769C51.3203 31.935 51.6234 32.3025 51.8064 32.7339C51.9894 33.1653 52.0442 33.6419 51.9642 34.1047C51.8842 34.5675 51.6728 34.9964 51.3562 35.3383L13.5394 76.2422C13.1735 76.6383 12.6865 76.8966 12.158 76.9749C11.6294 77.0532 11.0904 76.947 10.6287 76.6735C10.1671 76.4 9.81006 75.9754 9.61582 75.4689C9.42159 74.9624 9.40161 74.4038 9.55914 73.8842L18.0727 45.7183H2.36449C1.90287 45.7185 1.45129 45.581 1.06551 45.3229C0.679735 45.0649 0.376639 44.6974 0.193644 44.266C0.0106482 43.8345 -0.0442359 43.358 0.035766 42.8952C0.115768 42.4323 0.327153 42.0035 0.643828 41.6616L38.4606 0.757645C38.8261 0.362076 39.3123 0.103994 39.8401 0.0253618C40.3679 -0.0532702 40.9063 0.0521723 41.3678 0.324545V0.329357Z" fill="url(#paint0_linear_1714_2)"/>
        <defs>
        <linearGradient id="paint0_linear_1714_2" x1="4.59157e-08" y1="61.4587" x2="53.7171" y2="59.4387" gradientUnits="userSpaceOnUse">
        <stop stop-color="#2400FF"/>
        <stop offset="1" stop-color="#00C2FF"/>
        </linearGradient>
        </defs>
      </svg>
    </div>
    <div className={styles.title}>GENERY</div>
  </div>
  )
}