import React, { useContext } from 'react';
import styles from './Downloads.module.scss'
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../../firebase';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { color } from 'framer-motion';

function DownloadBody({color, name, url, id}){
    const {theme, elementColors, setElementColors } = useContext(ElementContext);
    // const getFileStyles = (name) => {
    //     const extension = name.split('.').pop().toLowerCase();
    //     switch (extension) {
    //       case 'jpg':
    //       case 'jpeg':
    //       case 'png':
    //       case 'gif':
    //         return { arrowColor: theme.background_color, buttonColor: theme.second_color };
    //       case 'pdf':
    //       case 'doc':
    //       case 'docx':
    //       case 'txt':
    //         return { arrowColor: theme.text_first_color, buttonColor: theme.first_color};
    //       case 'mp4':
    //       case 'avi':
    //       case 'mkv':
    //         return { arrowColor: theme.text_first_color, buttonColor: theme.third_color };
    //       default:
    //         return { arrowColor: theme.text_first_color, buttonColor: theme.element_first_color }; // цвет по умолчанию для остальных типов файлов
    //     }
    // };
    // const { arrowColor, buttonColor } = getFileStyles(name);

    // const handleDownload = (name) => {
    // //     const xhr = new XMLHttpRequest();
    // //     xhr.responseType = 'blob';
    // //     xhr.onload = (event) => { const blob = xhr.response; };
    // //     xhr.open('GET', url);
    // //     xhr.send();
    // // Download File with Firebase Storage Reference
    // getDownloadURL(ref(storage, `files/${name}`))
    //     .then((url) => {
    //         // `url` is the download URL for 'images/stars.jpg'

    //         // This can be downloaded directly:
    //         const xhr = new XMLHttpRequest();
    //         xhr.responseType = 'blob';
    //         xhr.onload = (event) => {
    //             const blob = xhr.response;
    //             // Создаем ссылку на скачивание файла
    //             const downloadLink = document.createElement('a');
    //             downloadLink.href = window.URL.createObjectURL(blob);
    //             // Устанавливаем имя файла
    //             downloadLink.download = name;
    //             // Добавляем ссылку на страницу и эмулируем клик по ней
    //             document.body.appendChild(downloadLink);
    //             downloadLink.click();
    //             // Удаляем ссылку из документа
    //             document.body.removeChild(downloadLink);
    //         };
    //         xhr.open('GET', url);
    //         xhr.send();

    //     })
    // .catch((error) => {
    //     // Обработка ошибок
    //     console.log(error)
    // });
    // };
    
    const handleDownload = (fileUrl, fileName) => {
        // Создаем запрос для получения файла
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = (event) => {
            const blob = xhr.response;
            // Создаем ссылку на скачивание файла
            const downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(blob);
            // Устанавливаем имя файла
            downloadLink.download = fileName;
            // Добавляем ссылку на страницу и эмулируем клик по ней
            document.body.appendChild(downloadLink);
            downloadLink.click();
            // Удаляем ссылку из документа
            document.body.removeChild(downloadLink);
        };
        xhr.open('GET', fileUrl);
        xhr.send();
    };
    
    return(
        <div className={styles['download-body']}
            style={{
                border: `2px solid ${theme.element_first_color}`
            }}>
            <div className={styles['download-name']}
                style={{
                    color: theme.text_first_color
                }}>
                {name}
            </div>
            <button className={styles['download-button']}
                style={{
                    background: color
                }}
                onClick={(e) => {
                    e.preventDefault();
                    handleDownload(url, name);
                  }}>
                <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 1C9 0.447715 8.55228 2.41411e-08 8 0C7.44772 -2.41411e-08 7 0.447715 7 1L9 1ZM7.29289 14.435C7.68342 14.8256 8.31658 14.8256 8.70711 14.435L15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685C14.6805 6.26633 14.0474 6.26633 13.6569 6.65685L8 12.3137L2.34315 6.65685C1.95262 6.26633 1.31946 6.26633 0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107L7.29289 14.435ZM7 1L7 13.7279L9 13.7279L9 1L7 1Z" fill={theme.text_first_color}/>
                </svg>
            </button>
        </div>
    )
}
export default DownloadBody