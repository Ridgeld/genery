import React, { createContext } from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import  App from './App.jsx'
import Layout from './components/layout/Layout.jsx';
// import AppRouter from './components/AppRouter.jsx';
import { ElementProvider } from './providers/ElementProvider.jsx';
import themes from './themes/Themes.js';

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/service-worker.js')
//       .then((registration) => {
//         console.log('Service Worker зарегистрирован:', registration);
//       })
//       .catch((error) => {
//         console.log('Ошибка регистрации Service Worker:', error);
//       });
//   });
// }
if ("serviceWorker" in navigator) {
  // Регистрация сервис-воркера
  navigator.serviceWorker
    .register("/serviceworker.js", { scope: "/" })
    .then((registration) => {
      console.log("Сервис-воркер зарегистрирован", registration);
    })
    .catch((error) => {
      console.error("Ошибка при регистрации сервис-воркера:", error);
    });

  // Слушаем событие beforeinstallprompt
  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", (e) => {
    console.log("Событие beforeinstallprompt поймано");
    e.preventDefault();
    deferredPrompt = e; // Сохраняем событие для вызова prompt() позже

    // Показываем кнопку для установки
    const installButton = document.createElement("button");
    installButton.textContent = "Установить приложение";
    installButton.className = 'install_button';
    document.body.appendChild(installButton);



    const insideCircle = document.createElement('div');
    insideCircle.innerHTML = 
    `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.5 1.13605C6.5 0.583763 6.94772 0.136047 7.5 0.136047C8.05228 0.136047 8.5 0.583763 8.5 1.13605L6.5 1.13605ZM8.20711 14.5711C7.81658 14.9616 7.18342 14.9616 6.79289 14.5711L0.428932 8.20712C0.0384076 7.81659 0.0384076 7.18343 0.428932 6.7929C0.819456 6.40238 1.45262 6.40238 1.84315 6.7929L7.5 12.4498L13.1569 6.7929C13.5474 6.40238 14.1805 6.40238 14.5711 6.7929C14.9616 7.18343 14.9616 7.81659 14.5711 8.20712L8.20711 14.5711ZM8.5 1.13605L8.5 13.864L6.5 13.864L6.5 1.13605L8.5 1.13605Z" fill="#fff"/>
    </svg>`
    insideCircle.className = 'circle';
    installButton.appendChild(insideCircle)

    installButton.addEventListener("click", () => {
      if (deferredPrompt) {
        deferredPrompt.prompt(); // Показываем диалог установки
        deferredPrompt.userChoice
          .then((choiceResult) => {
            if (choiceResult.outcome === "accepted") {
              console.log("Пользователь установил приложение");
            } else {
              console.log("Пользователь отклонил установку");
              navigateTo('/menu')
            }
          })
          .catch((error) => {
            console.error("Ошибка при установке приложения:", error);
          });

        // Убираем кнопку после того, как пользователь сделал выбор
        // installButton.style.display = "none";
        deferredPrompt = null;
      }
    });
  });
} else {
  console.log("Service Worker не поддерживается в этом браузере.");
}



ReactDOM.createRoot(document.getElementById('main')).render(

  
  <React.StrictMode>
    <ElementProvider>
      <Layout>
        <App/>
      </Layout>
    </ElementProvider>
  </React.StrictMode>
)

