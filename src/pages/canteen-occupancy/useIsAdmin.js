import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { useAuth } from '../../providers/Authprovired.jsx';

// Администратор = есть документ admins/{uid}. Писать в admins могут только сами администраторы
// (правила Firestore), поэтому обычный пользователь не может назначить себя сам.
// Возвращает null, пока идёт проверка, затем true/false.
export default function useIsAdmin() {
  const { authUser } = useAuth();
  const uid = authUser?._id;
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    if (!uid) { setIsAdmin(false); return undefined; }
    return onSnapshot(
      doc(db, 'admins', uid),
      (snap) => setIsAdmin(snap.exists()),
      () => setIsAdmin(false)
    );
  }, [uid]);

  return isAdmin;
}
