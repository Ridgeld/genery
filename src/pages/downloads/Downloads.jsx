import React, { useContext, useEffect, useState } from 'react';
import styles from './Downloads.module.scss'
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../firebase.js';
import DownloadBody from './DownloadBody.jsx';
import LoadingBody from './LoadingBody.jsx';
import { useAuth } from '../../providers/Authprovired.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import EditDownloads from './EditDownloads.jsx';

function Downloads(){
    const {theme, elementColors, setElementColors } = useContext(ElementContext);
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState()

    const { id } = useParams()
    const [ownerId, setOwnerId] = useState()
    const { authUser } = useAuth()
    const navigateTo = useNavigate();
    const [ isEdit, setIsEdit ] = useState(false)

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

      const fetchGroupData = async () => {
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
        fetchGroupData();
    }, [id]);

    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowColor: theme.text_first_color,
            arrowLink: () => navigateTo(`/group/${id}`),
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

        const handleEditDownloads = () =>{
            // navigateTo(`/edit-download/${id}`); 
            setIsEdit(true);
    }

    // useEffect(() => {
    //     setElementColors({
    //         iconColor: theme.icon_color,
    //         titleColor: theme.text_first_color,
    //         showArrow: true,
    //         arrowLink: '#/list-menu',
    //         arrowColor: theme.text_first_color,
    //         isHeaderBackground: true,
    //         headerBackground: theme.background_color,
    //         isHeader: true,
    //         isFooter: true,
    //         footerBackground: theme.background_color,
    //         activeElementIndex: 4,
    //     });
    //     document.body.style.background = theme.background_color
    //     },[theme]);

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
        const handleEdit = () =>{
            setIsEdit(false)
        }

        return (
            <div className={styles.container}>
                {isEdit ? (
                    <EditDownloads id={id} handleEdit={handleEdit}/>
                ) : (
                    <>
                        <div
                            className={styles['title']}
                            style={{
                                color: theme.text_first_color,
                            }}
                        >
                            Файлы
                        </div>
                        <div className={styles['files-container']}>
                            {isLoading ? (
                                <>
                                    <LoadingBody />
                                    <LoadingBody />
                                </>
                            ) : files.length > 0 ? (
                                files.map((file) => (
                                    <DownloadBody
                                        key={file.name}
                                        color={file.color}
                                        name={file.name}
                                        url={file.link}
                                        id={id}
                                    />
                                ))
                            ) : (
                                <div
                                    className={styles['info-body']}
                                    style={{
                                        color: theme.text_first_color,
                                    }}
                                >
                                    Тут пока пусто ...
                                </div>
                            )}
                        </div>
                        {ownerId && ownerId === authUser._id && (
                            <button
                                className={styles['edit']}
                                style={{
                                    background: theme.first_color,
                                }}
                                onClick={handleEditDownloads}
                            >
                                <svg
                                    width="17"
                                    height="17"
                                    viewBox="0 0 17 17"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M0 13.6571V16.5278C0 16.7923 0.20775 17 0.472158 17H3.34288C3.46564 17 3.5884 16.9528 3.67339 16.8584L13.9853 6.55586L10.4441 3.01468L0.141648 13.3172C0.0472159 13.4116 0 13.5249 0 13.6571ZM16.7238 3.81735C16.8114 3.72998 16.8808 3.62621 16.9282 3.51198C16.9756 3.39774 17 3.27528 17 3.1516C17 3.02793 16.9756 2.90547 16.9282 2.79123C16.8808 2.67699 16.8114 2.57322 16.7238 2.48586L14.5141 0.27616C14.4268 0.188618 14.323 0.119166 14.2088 0.0717788C14.0945 0.0243917 13.9721 0 13.8484 0C13.7247 0 13.6023 0.0243917 13.488 0.0717788C13.3738 0.119166 13.27 0.188618 13.1827 0.27616L11.4546 2.00426L14.9957 5.54544L16.7238 3.81735Z"
                                        fill={theme.text_first_color}
                                    />
                                </svg>
                            </button>
                        )}
                    </>
                )}
            </div>
        );
        
}
export default Downloads