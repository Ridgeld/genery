import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { useAuth } from '../../providers/Authprovired.jsx';

// Сотрудник = есть документ admins/{uid}. Писать в admins может только суперадмин
// (правила Firestore), поэтому обычный пользователь не может назначить себя сам.
//   role: 'super'   — всё: платы, прошивка, столовые, сотрудники (по умолчанию для старых записей)
//   role: 'manager' — только свои столовые (canteens: [...]): статус работы и ручная коррекция
// Возвращает undefined, пока идёт проверка; null — не сотрудник; иначе { role, canteens }.
export function useStaff() {
  const { authUser } = useAuth();
  const uid = authUser?._id;
  const [staff, setStaff] = useState(undefined);

  useEffect(() => {
    if (!uid) { setStaff(null); return undefined; }
    return onSnapshot(
      doc(db, 'admins', uid),
      (snap) => {
        if (!snap.exists()) { setStaff(null); return; }
        const d = snap.data();
        setStaff({ role: d.role === 'manager' ? 'manager' : 'super', canteens: Array.isArray(d.canteens) ? d.canteens : [] });
      },
      () => setStaff(null)
    );
  }, [uid]);

  return staff;
}

export const canManage = (staff, canteenId) => !!staff && (staff.role === 'super' || staff.canteens.includes(canteenId));

// Суперадмин? null — пока идёт проверка
export default function useIsAdmin() {
  const staff = useStaff();
  if (staff === undefined) return null;
  return staff?.role === 'super';
}
