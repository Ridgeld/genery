import React, { useContext } from 'react';
import styles from './Downloads.module.scss'
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../../firebase';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { color } from 'framer-motion';

function RemoveBody({color, name, url, id, onDelete}){
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
                // onClick={(e) => {
                //     e.preventDefault();
                //     handleDownload(url, name);
                //   }}>
                onClick={onDelete}>
                <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.3031 1.1967L6.99984 6.5M1.69654 11.8033L6.99984 6.5M6.99984 6.5L12.3031 11.8033M6.99984 6.5L1.69654 1.1967" stroke={theme.text_first_color} stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        </div>
    )
}
export default RemoveBody