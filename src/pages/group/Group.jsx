// import { useAuth } from "../../providers/Authprovired.jsx";
// import { useParams } from 'react-router-dom';


// import AuthUserGroup from "./AuthUserGroup.jsx";

// function Group(){
//     const { authUser } = useAuth();
//     const { id } = useParams();

//     if (!id || id === authUser._id) {
//         return <AuthUserGroup id={authUser._id} />;
//       } else {
//         // return <OtherUserProfile id={id} />;
//       }
// }
// export default Group
import React, { useEffect, useState } from 'react';
import { useAuth } from "../../providers/Authprovired";
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase.js';

import AuthUserGroup from "./AuthUserGroup.jsx";
import OtherUserProfile from "./OtherUserGroup.jsx";

function Group() {
  const { authUser } = useAuth();
  const { id } = useParams();
  const [ownerId, setOwnerId] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [id]);


  if (ownerId === authUser._id) {
    return <AuthUserGroup id={id} />;
  } else {
    return <OtherUserProfile id={id} />;
  }
}

export default Group;
