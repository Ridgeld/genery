import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const ga = auth;

  useEffect(() => {
    const unListen = onAuthStateChanged(ga, user => {
      if(user) {setAuthUser({
        _id: user.uid,
        avatar: '45',
        name: user.displayName
      })
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
