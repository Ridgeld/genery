// import React, { useEffect, useRef, useState } from "react";

// import styles from './DownloadBanner.module.scss';


// export default function DownloadBanner() {

// const [deferredPrompt, setDeferredPrompt] = useState(null);
// const [isInstallable, setIsInstallable] = useState(true);

// useEffect(() => {
//   const handleBeforeInstallPrompt = (e) => {
//     e.preventDefault();
//     setDeferredPrompt(e); // Сохраняем событие для позднего вызова
//     setIsInstallable(true); // Показываем кнопку установки
//   };

//   // Добавляем слушателя события beforeinstallprompt
//   window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

//   // Убираем слушателя при размонтировании компонента
//   return () => {
//     window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
//   };
// }, []);

// const handleInstallClick = () => {
//   if (deferredPrompt) {
//     deferredPrompt.prompt(); // Показываем диалог установки
//     deferredPrompt.userChoice
//       .then((choiceResult) => {
//         if (choiceResult.outcome === "accepted") {
//           console.log("Пользователь установил приложение");
//         } else {
//           console.log("Пользователь отклонил установку");
//         }
//       })
//       .catch((error) => {
//         console.error("Ошибка при установке приложения:", error);
//       });
    
//     // Сброс состояния после показа диалога
//     setDeferredPrompt(null);
//     setIsInstallable(false);
//   }
// };

// if (!isInstallable) {
//   return null; // Не показываем кнопку, если она не должна быть установлена
// }



//     return (
//         <div className={styles['wrapper']}>
//             <button onClick={handleInstallClick}>
//                 Установить приложение
//             </button>
//         </div>
//     );

// }
// import React, { useEffect, useState } from "react";
// import styles from './DownloadBanner.module.scss';

// export default function DownloadBanner() {
//   const [deferredPrompt, setDeferredPrompt] = useState(null);
//   const [isInstallable, setIsInstallable] = useState(false);

//   useEffect(() => {
//     const handleBeforeInstallPrompt = (e) => {
//       e.preventDefault();
//       setDeferredPrompt(e); // Сохраняем событие для позднего вызова
//       setIsInstallable(true); // Показываем кнопку установки
//     };

//     // Добавляем слушателя события beforeinstallprompt
//     window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

//     // Убираем слушателя при размонтировании компонента
//     return () => {
//       window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
//     };
//   }, []);

//   const handleInstallClick = () => {
//     if (deferredPrompt) {
//       deferredPrompt.prompt(); // Показываем диалог установки
//       deferredPrompt.userChoice
//         .then((choiceResult) => {
//           if (choiceResult.outcome === "accepted") {
//             console.log("Пользователь установил приложение");
//           } else {
//             console.log("Пользователь отклонил установку");
//           }
//         })
//         .catch((error) => {
//           console.error("Ошибка при установке приложения:", error);
//         });

//       // Сброс состояния после показа диалога
//       setDeferredPrompt(null);
//       setIsInstallable(false); // Скрываем кнопку после использования
//     }
//   };

//   if (!isInstallable) {
//     return null; // Не показываем кнопку, если она не должна быть установлена
//   }

//   return (
//     <div className={styles['wrapper']}>
//       <button onClick={handleInstallClick}>Установить приложение</button>
//     </div>
//   );
// }


import React, { useContext, useEffect, useState } from "react";
import styles from './DownloadBanner.module.scss';
import { ElementContext } from '../../../providers/ElementProvider';
import { useNavigate } from "react-router-dom";

export default function DownloadBanner() {
    const { theme, elementColors, setElementColors } = useContext(ElementContext);  

    // const isShow = localStorage.getItem('isBannerShow');
    const [isBannerShow, setIsBannerShow] = useState(localStorage.getItem('isBannerShow'))
    const navigateTo = useNavigate()

    useEffect(() => {
        if (!isBannerShow){
            console.log(9)
            navigateTo(`/menu`);
        }
    },[])

    useEffect(() => {
        // Пытаемся найти кнопку
        const installButton = document.querySelector(".install_button");
    
        if (installButton) {
            installButton.style.display = "flex"; // Показываем кнопку
        }
    
        // При размонтировании скрываем кнопку
        return () => {
            if (installButton) {
                installButton.style.display = "none";
            }
        };
    }, []);

    const handleSkipButtonClick = () =>{
        localStorage.setItem('isBannerShow', false)
        navigateTo('/menu');
    }

    return (
        <div className={styles['wrapper']}
            style={{
                background: '#0040F9'
            }}>
            <button className={styles['close-button']}
                onClick={() => navigateTo('/menu')}> 
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.4467 1.5533L9 9.10661M16.5533 16.6599L9 9.10661M9 9.10661L16.5533 1.5533M9 9.10661L1.4467 16.6599" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
            <div className={styles['info']}>
                <h4 className={styles['hashtag']}>
                    # 2 года
                </h4>
                <h1 className={styles['title']}>
                    СКАЧАЙ <br/> ПРИЛОЖЕНИЕ
                </h1>
                <span className={styles['text']}>
                    Устал искать ссылку на сайт?<br/>
                    Добавь его на главный экран и не парься
                </span>
            </div>
            <div className={styles['absolute-svg']}>
                <svg width="1203" height="345" viewBox="0 0 1203 345" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 96.3389L82.8243 170.06L156.649 96.3389L230.473 170.06L278.517 81.5166L328.905 236.37L386.715 117.792L437.103 195.024L506.631 39L559.362 298L633 66L704 236.37L789 117.792L866 236.37L978 81.5166L1024 195.024L1096.5 96.3389L1192.5 236.37" stroke="#C3F82B" stroke-width="23.4802"/>
                </svg>
            </div>
            <button className={styles['skip-button']} onClick={handleSkipButtonClick}>
                Пропустить
            </button>
        </div>
        )
}

