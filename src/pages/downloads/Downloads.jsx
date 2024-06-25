import React, { useContext, useEffect, useState } from 'react';
import styles from './Downloads.module.scss'
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase.js';
import DownloadBody from './DownloadBody.jsx';
import LoadingBody from './LoadingBody.jsx';
function Downloads(){
    const {theme, elementColors, setElementColors } = useContext(ElementContext);
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState()

    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowLink: '#/list-menu',
            arrowColor: theme.text_first_color,
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: true,
            footerBackground: theme.background_color,
            activeElementIndex: 3,
        });
        document.body.style.background = theme.background_color
        },[theme]);

        // useEffect(() => {
        //     const fetchFiles = async () => {
        //       const folderRef = ref(storage, 'files'); // Укажите вашу папку
        //       const fileList = await listAll(folderRef);
        //       const files = await Promise.all(fileList.items.map(async itemRef => {
        //         const url = await getDownloadURL(itemRef);
        //         return { name: itemRef.name, url };
        //       }));
        //       setFiles(files);
        //     };
        
        //     fetchFiles();
        //   }, []); 
        useEffect(() => {
            const fetchFiles = async () => {
                try {
                    setIsLoading(true); // Устанавливаем isLoading в true перед началом загрузки
    
                    const folderRef = ref(storage, 'files'); // Укажите вашу папку
                    const fileList = await listAll(folderRef);
                    const files = await Promise.all(fileList.items.map(async itemRef => {
                        const url = await getDownloadURL(itemRef);
                        return { name: itemRef.name, url };
                    }));
                    
                    setFiles(files);
                } catch (error) {
                    console.error('Error fetching files:', error);
                } finally {
                    setIsLoading(false); 
                }
            };
    
            fetchFiles();
        }, []);
    return(
        <div className={styles.container}>
            <div className={styles['title']}
                style={{
                    color: theme.text_first_color
                }}>Файлы</div>
            <div className={styles['files-container']}>
                {isLoading && <>
                    <LoadingBody/>
                    <LoadingBody/>
                    </> }
                {!isLoading && files.map(file => (
                    <DownloadBody
                        key={file.name}
                        name={file.name}
                        url={file.url}/>
                        ))}
                {/* {files.map(file => (
                    <DownloadBody
                        key={file.name}
                        name={file.name}
                        url={file.url}/>
                ))} */}
                    {/* // <div key={file.name}>
                    // <span>{file.name}</span>
                    // <button onClick={() => window.location.href = file.url}>Download</button>
                    // </div> */}
            </div>
        </div>
    )
}
export default Downloads