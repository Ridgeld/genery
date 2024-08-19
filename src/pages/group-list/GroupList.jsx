import React, { useContext, useEffect, useState } from 'react';
import styles from './GroupList.module.scss'
import { useAuth } from '../../providers/Authprovired';
import SearchItem from '../../components/blocks/search-item/SearchItem';
import SkeletonLoader from '../../components/loaders/skeleton-loader/Skeleton';
import { ElementContext } from '../../providers/ElementProvider';
import { doc, getDoc, onSnapshot, Query, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useNavigate } from 'react-router-dom';

function GroupList(){
    const {theme, elementColors, setElementColors } = useContext(ElementContext);
    const { authUser } = useAuth();
    const [isLoading, setIsLoading ] = useState(false);
    const [ groupData, setGroupData ] = useState(null);
    const navigateTo = useNavigate();
    const [userGroup, setUserGroup] = useState()
    const [ id, setId ] = useState()

    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: false,
            arrowLink: '#/list-menu',
            arrowColor: theme.text_first_color,
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: true,
            footerBackground: theme.background_color,
            activeElementIndex: 2,
        });
        document.body.style.background = theme.background_color
        },[theme]);

    // const fetchGroups = async () =>{
    //     try{
    //         setIsLoading(true);
    //         const groupDocRef = doc(db, 'groups', authUser.mainGroup, 'info', 'info');
    //         const docSnap = await getDoc(groupDocRef);
    
    //         if (docSnap.exists()) {
    //             const groupData = docSnap.data();
    //             setGroupData(groupData);
    //             console.log(groupData)
    //         } else {
    //             console.log("No such document!");
    //             setGroupData({
    //             isGroup: false,
    //             name: 'Группа не найдена',
    //             photo: '1',
    //             membersCount: 0,
    //             owner: null,
    //             });
    //         }
    //     }
    //     catch (error){
    //         console.error('Error fetching files:', error);
    //     }
    //     finally{
    //         setIsLoading(false)
    //     }
    // }

    // useEffect(() =>{
    //     fetchGroups()
    // }, [authUser.mainGroup])

//   useEffect(() => {
//     if (authUser && authUser.mainGroup) {
//       const groupDocRef = doc(db, 'groups', authUser.mainGroup, 'info', 'info');

//       const unsubscribe = onSnapshot(groupDocRef, (docSnap) => {
//         if (docSnap.exists()) {
//           setGroupData(docSnap.data());
//           console.log('Group data updated:', docSnap.data());
//         } else {
//           console.log('No such document!');
//           setGroupData({
//             isGroup: false,
//             name: 'Группа не найдена',
//             photo: '1',
//             membersCount: 0,
//             owner: null,
//           });
//         }
//         setIsLoading(false);
//       }, (error) => {
//         console.error('Error fetching group data:', error);
//         setIsLoading(false);
//       });

//       // Очистка подписки при размонтировании компонента
//       return () => unsubscribe();
//     }
//   }, [authUser]);
// useEffect(() =>{
//     const getUserGroup = async () =>{
//         if(authUser){
//             const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
//             try{
//                 const userDocSnap = await getDoc(userDocRef);
//                 if(userDocSnap.exists()){
//                     await getDoc(userDocRef, 

//                     );
//                 }
//             }
//             catch(error){
//                 console.error(error);
//             }
//         }
//     }
//     getUserGroup()
// }, [])
// useEffect(() => {
//     if (authUser && authUser.mainGroup) {
//       const groupDocRef = doc(db, 'groups', authUser.mainGroup, 'info', 'info');
//       console.log('Setting up onSnapshot for group:', authUser.mainGroup);

//       const unsubscribe = onSnapshot(groupDocRef, (docSnap) => {
//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           console.log('Group data updated:', data);
//           setGroupData(data);
//         } else {
//           console.log('No such document!');
//           setGroupData({
//             isGroup: false,
//             name: 'Группа не найдена',
//             photo: '1',
//             membersCount: 0,
//             owner: null,
//           });
//         }
//         setIsLoading(false);
//       }, (error) => {
//         console.error('Error fetching group data:', error);
//         setIsLoading(false);
//       });

//       // Очистка подписки при размонтировании компонента
//       return () => unsubscribe();
//     }
//   }, [authUser]);
useEffect(() => {
    let unsubscribe;

    const getUserGroup = async () => {
      if (authUser) {
        const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');

        unsubscribe = onSnapshot(userDocRef, async (userDocSnap) => {
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const mainGroup = userData.mainGroup;
            setId(userData.mainGroup)

            if (mainGroup) {
              const groupDocRef = doc(db, 'groups', mainGroup, 'info', 'info');
              const groupDocSnap = await getDoc(groupDocRef);

              if (groupDocSnap.exists()) {
                setGroupData(groupDocSnap.data());
              } else {
                setGroupData({
                  isGroup: false,
                  name: 'Группа не найдена',
                  photo: '1',
                  membersCount: 0,
                  owner: null,
                });
              }
              setIsLoading(false);
            }
          }
        });
      }
    };

    getUserGroup();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [authUser]);


    const handleItemClick =(id) =>{
        // alert(id)
        navigateTo(`/group/${id}`)
        // alert(id);
    }
    return(            
        <div className={styles['container']}>
            {isLoading ? (
            <div className={styles['empty-body']}
                style={{ borderTop: `1px solid ${theme.element_first_color}` }}>
                <div className={styles['empty-photo']}>
                <SkeletonLoader height={'30px'} width={'30px'} shape={'circle'} />
                </div>
                <div className={styles['empty-info']}>
                <div className={styles['empty-name']}
                    style={{ color: theme.text_first_color }}>
                    <SkeletonLoader height={'10px'} width={'100px'} shape={'rect'} />
                </div>
                </div>
            </div>
            ) : (
            groupData && (
                <SearchItem 
                    name={groupData.name}
                    photo={groupData.photo}
                    id={id}
                    onClick={handleItemClick}
                />
            )
            )}
        </div>
    )
}
export default GroupList