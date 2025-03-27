import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [name, setName] = useState('');
  const ga = auth;


  useEffect(() => {
    const unListen = onAuthStateChanged(ga, user => {
      if(user) {
        const fetchUserPreferences = async () => {
              const userDocRef = doc(db, 'users', user.uid, 'info', 'preferences');
              const docSnap = await getDoc(userDocRef);
  
              if (docSnap.exists()) {
                  const userData = docSnap.data();
                  console.log(userData);

                  setAuthUser({
                    _id: user.uid,
                    avatar: userData.photo,
                    name: userData.name,
                    cover: userData.cover,
                    mainGroup: userData.mainGroup,
                    email: user.email,
                  });
              } else {
                  console.log("No such document!");
              }
        };
  
        fetchUserPreferences();
      } else {
        setAuthUser(null)
      }
    });
    return () => {
      unListen();
    };
  }, []);

  const userSignOut = () => {
    signOut(ga)
      .then(() => console.log('success'))
      .catch((e) => console.log(e));
  };

  const values = useMemo(() => ({
    authUser,
    setAuthUser,
    ga,

  }), [authUser])
    

  //   authUser,
  //   setAuthUser,
  //   userSignOut,
  //   ga,
  // };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
