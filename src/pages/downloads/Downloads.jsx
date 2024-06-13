import React, { useContext, useEffect, useState } from 'react';
import styles from './Downloads.module.scss'
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase.js';
import DownloadBody from './DownloadBody.jsx';
function Downloads(){
    const { elementColors, setElementColors } = useContext(ElementContext);
    const [files, setFiles] = useState([]);

    useEffect(() => {
        setElementColors({
            iconColor: 'var(--first-color)',
            titleColor: 'var(--text-first-color)',
            showArrow: true,
            arrowLink: '#/menu',
            arrowColor: 'var(--text-first-color)',
            isHeaderBackground: true,
            headerBackground: 'var(--background-color)',
            isHeader: true,
            isFooter: true,
            footerBackground: 'var(--background-color)',
            activeElementIndex: 3,
        });
        },[ElementContext]);

        useEffect(() => {
            const fetchFiles = async () => {
              const folderRef = ref(storage, 'files'); // Укажите вашу папку
              const fileList = await listAll(folderRef);
              const files = await Promise.all(fileList.items.map(async itemRef => {
                const url = await getDownloadURL(itemRef);
                return { name: itemRef.name, url };
              }));
              setFiles(files);
            };
        
            fetchFiles();
          }, []); 
    return(
        <div className={styles.container}>
            <div className={styles['title']}
                style={{
                    color: 'var(--text-first-color)'
                }}>Файлы</div>
            <div className={styles['files-container']}>
                {files.map(file => (
                    <DownloadBody
                        key={file.name}
                        name={file.name}
                        url={file.url}/>
                    // <div key={file.name}>
                    // <span>{file.name}</span>
                    // <button onClick={() => window.location.href = file.url}>Download</button>
                    // </div>
                ))}
            </div>
        </div>
    )
}
export default Downloads