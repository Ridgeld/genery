import React, { useContext, useEffect, useState } from 'react';
import styles from './Downloads.module.scss'
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { ref, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../../firebase.js';
import DownloadBody from './DownloadBody.jsx';
import LoadingBody from './LoadingBody.jsx';
import { useAuth } from '../../providers/Authprovired.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AddFile from '../../components/modal-windows/add/file/AddFile.jsx';
import RemoveBody from './RemoveBody.jsx';
import AlertNotification from '../../components/notifictions/AlertNotification/AlertNotification.jsx';

function EditDownloads({id, handleEdit}){
    const {theme, elementColors, setElementColors } = useContext(ElementContext);
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState();
    const [ isShow, setIsShow] = useState();
    const [alertProp, setAlertProp] = useState({
        isShow: false,
        title: 'Заголовок',
        text: 'текст',
        firstButtonName: 'выйти',
        secondButtonName: 'играть',

    });


    // const { id } = useParams()
    const [ownerId, setOwnerId] = useState()
    const { authUser } = useAuth()
    const navigateTo = useNavigate()

    useEffect(() => {
        const fetchGroupData = async () => {    
          try {
            const groupDocRef = doc(db, 'groups', id, 'info', 'info');
            const groupDoc = await getDoc(groupDocRef);
    
            if (groupDoc.exists()) {
              const groupData = groupDoc.data();
              setOwnerId(groupData.owner);
            } else {
              console.error('Group not found');
            }
          } catch (error) {
            console.error('Error fetching group data:', error);
          } finally {
            // setLoading(false);
          }
        };
    
        fetchGroupData();
      }, [id]);

      const fetchGroupFiles = async () => {
        if (id) {
            try {
                const downloadDocRef = doc(db, 'groups', id, 'info', 'downloads');
                const docSnap = await getDoc(downloadDocRef);

                if (docSnap.exists()) {
                    const downloadData = docSnap.data();
                    setFiles(downloadData.files || []);
                    console.log(downloadData.files);
                } else {
                    console.log("No such document!");
                    setFiles([]);
                }
            } catch (error) {
                console.error('Error fetching group data:', error);
                setFiles([]);
            } finally {
                setIsLoading(false);
            }
        } else {
            console.error('ID группы не указан');
            setFiles([]);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGroupFiles();
    }, [id]);

    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowColor: theme.text_first_color,
            arrowLink: handleEdit,
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: true,
            footerBackground: theme.background_color,
            activeElementIndex: 2,
            background: theme.background_color
        });
        document.body.style.background = theme.background_color
        },[ElementContext]);



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
        // useEffect(() => {
        //     const fetchFiles = async () => {
        //         try {
        //             setIsLoading(true); // Устанавливаем isLoading в true перед началом загрузки
    
        //             const folderRef = ref(storage, 'files'); // Укажите вашу папку
        //             const fileList = await listAll(folderRef);
        //             const files = await Promise.all(fileList.items.map(async itemRef => {
        //                 const url = await getDownloadURL(itemRef);
        //                 return { name: itemRef.name, url };
        //             }));
                    
        //             setFiles(files);
        //         } catch (error) {
        //             console.error('Error fetching files:', error);
        //         } finally {
        //             setIsLoading(false); 
        //         }
        //     };
    
        //     fetchFiles();
        // }, []);
        // const addFile = (file) =>{

        // }
        const extractFilePath = (url) => {
            if (!url || typeof url !== 'string') {
                console.error('Invalid URL:', url);
                return '';
            }
        
            // Преобразование URL в путь, убирая base URL
            const baseURL = 'https://firebasestorage.googleapis.com/v0/b/genery-c83e3.appspot.com/o/';
            let path = url.replace(baseURL, '');
            path = decodeURIComponent(path); // Декодируем URL-символы
            return path;
        };
        
        
        
// Функция для отображения уведомления
    const deleteFile = (file) => {
        setAlertProp({
            isShow: true,
            title: 'Удаление файла',
            text: `Вы действительно хотите удалить файл ${file.name}?`,
            firstButtonName: 'Отмена',
            firstButtonOnClick: () => setAlertProp({ isShow: false }),
            secondButtonName: 'Удалить',
            secondButtonOnClick: () => handleDelete(file)
        });
    };

// Функция для удаления файла
const handleDelete = async (file) => {
    if (!file || !file.link) {
        console.error('Invalid file or file URL:', file);
        return;
    }

    setAlertProp({ isShow: false }); // Закрываем уведомление

    try {
        // URL файла
        const fileUrl = file.link;
        console.log('File URL:', fileUrl);

        // Извлечение пути файла из URL
        const baseURL = 'https://firebasestorage.googleapis.com/v0/b/genery-c83e3.appspot.com/o/';
        let filePath = fileUrl.replace(baseURL, ''); // Удаляем базовый URL
        filePath = decodeURIComponent(filePath); // Декодируем URL

        // Удаление параметров запроса из пути
        const [pathWithoutParams] = filePath.split('?');
        console.log('File Path:', pathWithoutParams);

        // Удаление файла из Firebase Storage
        const storageRef = ref(storage, pathWithoutParams);
        await deleteObject(storageRef);
        console.log('File deleted from Firebase Storage');

        // Удаление ссылки на файл из Firestore
        const downloadDocRef = doc(db, 'groups', id, 'info', 'downloads');
        const docSnap = await getDoc(downloadDocRef);

        if (docSnap.exists()) {
            const downloadData = docSnap.data();
            const updatedFiles = (downloadData.files || []).filter(f => f.link !== fileUrl);
            await setDoc(downloadDocRef, { files: updatedFiles }, { merge: true });
            setFiles(updatedFiles); // Обновляем состояние файлов
            console.log('File deleted from Firestore');
        } else {
            console.log('No such document in Firestore!');
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};









        const handleClose = async () => {
            await fetchGroupFiles();
            setIsShow(false);
        };
        return (
            <>
            <AlertNotification
                title={alertProp.title}
                text={alertProp.text}
                isShow={alertProp.isShow}
                firstButtonName={alertProp.firstButtonName}
                secondButtonName={alertProp.secondButtonName}
                firstButtonOnClick={alertProp.firstButtonOnClick}
                secondButtonOnClick={alertProp.secondButtonOnClick}/>
            <AddFile id={id} isShow={isShow} close={handleClose}/>
            <div className={styles['title']}
                style={{
                    color: theme.text_first_color
                }}>Файлы</div>
            <div className={styles['files-container']}>
                {isLoading ? (
                    <>
                        <LoadingBody />
                        <LoadingBody />
                    </>
                ) : (
                    <>
                            {files.map(file => (
                                <RemoveBody
                                    key={file.name}
                                    color={file.color}
                                    name={file.name}
                                    url={file.link}
                                    id={id}
                                    onDelete={() => deleteFile(file)}
                                />
                            ))}
                        <div className={styles['add-body']}
                            style={{
                                // color: theme.text_first_color,
                                border: `1px solid ${theme.element_first_color}`,
                                background: theme.background_color
                            }}
                            onClick={() => setIsShow(true)}>
                            <div className={styles['circle']}
                                style={{
                                    background: theme.element_first_color
                                }}>
                                <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.5 1L8.5 8.5M8.5 16L8.5 8.5M8.5 8.5L16 8.5M8.5 8.5L1 8.5" stroke={theme.text_first_color} strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>
                        <button className={styles['button']}
                            style={{
                                background: theme.first_color,
                                color: theme.text_first_color
                            }}
                            onClick={handleEdit}>
                            Сохранить
                        </button>
                    </>
                )}
            </div>
        </>
        );
}
export default EditDownloads