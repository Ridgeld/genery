import { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  collection, collectionGroup, deleteDoc, doc, getDocs, onSnapshot, serverTimestamp, setDoc, updateDoc
} from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { useAuth } from '../../providers/Authprovired.jsx';
import styles from './CanteenOccupancy.module.scss';
import '../../themes/default.scss';
import AdminView from './AdminView.jsx';
import useIsAdmin from './useIsAdmin.js';

const byName = (a, b) => String(a.name || a.id).localeCompare(String(b.name || b.id), 'ru');

// Страница «Управление» (/canteen-devices): счётчики, столовые и администраторы. Только для админов.
export default function CanteenDevices() {
  const { theme, setElementColors } = useContext(ElementContext);
  const { authUser } = useAuth();
  const navigateTo = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'devices';
  const isAdmin = useIsAdmin();

  const [devices, setDevices] = useState([]);
  const [devicesLoaded, setDevicesLoaded] = useState(false);
  const [canteens, setCanteens] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [firmware, setFirmware] = useState(null);
  const [users, setUsers] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [, setClock] = useState(0);

  // Живые списки — только для админа (остальным правила всё равно не дадут менять)
  useEffect(() => {
    if (!isAdmin) return undefined;
    const fail = (what) => (e) => console.error(`Ошибка чтения (${what}):`, e);
    const offDevices = onSnapshot(collection(db, 'devices'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => String(a.canteenId).localeCompare(String(b.canteenId))
        || String(a.door || a.id).localeCompare(String(b.door || b.id)));
      setDevices(list);
      setDevicesLoaded(true);
    }, fail('счётчики'));
    const offCanteens = onSnapshot(collection(db, 'canteens'), (snap) => {
      setCanteens(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byName));
    }, fail('столовые'));
    const offAdmins = onSnapshot(collection(db, 'admins'), (snap) => {
      setAdmins(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byName));
    }, fail('администраторы'));
    const offFirmware = onSnapshot(doc(db, 'firmware', 'latest'), (snap) => {
      setFirmware(snap.exists() ? snap.data() : null);
    }, fail('прошивка'));
    return () => { offDevices(); offCanteens(); offAdmins(); offFirmware(); };
  }, [isAdmin]);

  useEffect(() => {
    const t = setInterval(() => setClock((c) => c + 1), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setElementColors({
      iconColor: theme.icon_color,
      titleColor: theme.text_first_color,
      showArrow: true,
      arrowColor: theme.text_first_color,
      arrowLink: () => navigateTo('/canteen'),
      isHeaderBackground: true,
      headerBackground: theme.background_color,
      isHeader: true,
      isFooter: true,
      footerBackground: theme.background_color,
      activeElementIndex: 0,
      background: theme.background_color
    });
    document.body.style.background = theme.background_color;
  }, [theme, setElementColors, navigateTo]);

  const guard = async (what, fn) => {
    try {
      await fn();
    } catch (e) {
      console.error(`Не удалось: ${what}`, e);
      alert(`Не удалось ${what}: ${e.message}`);
    }
  };

  // Пользователи для поиска администраторов — загружаются один раз, при первом фокусе в поиске
  const loadUsers = async () => {
    if (users || usersLoading) return;
    setUsersLoading(true);
    try {
      const snap = await getDocs(collectionGroup(db, 'info'));
      const list = snap.docs
        .filter((d) => d.id === 'preferences' && d.ref.path.startsWith('users/'))
        .map((d) => ({ uid: d.data().uid || d.ref.parent.parent.id, name: d.data().name || '', photo: d.data().photo || '' }))
        .filter((u) => u.uid && u.name);
      setUsers(list);
    } catch (e) {
      console.error('Не удалось загрузить пользователей:', e);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  if (isAdmin !== true) {
    return (
      <div className={styles.container}>
        <div className={styles.chartCard} style={{ background: theme.element_first_color }}>
          <div className={styles.empty} style={{ color: theme.text_second_color }}>
            {isAdmin === null ? 'Проверяю доступ…' : 'Эта страница доступна только администратору.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminView
      theme={theme}
      tab={tab}
      onTab={(t) => setParams({ tab: t }, { replace: true })}
      devices={devices}
      devicesLoaded={devicesLoaded}
      onSaveDevice={(id, data) => guard('сохранить счётчик', () => updateDoc(doc(db, 'devices', id), data))}
      canteens={canteens}
      onSaveCanteen={(id, data) => guard('сохранить столовую', () => updateDoc(doc(db, 'canteens', id), data))}
      onCreateCanteen={(id, data) => guard('создать столовую', () => setDoc(doc(db, 'canteens', id), data))}
      onOpenCanteen={(id) => navigateTo(`/canteen?id=${encodeURIComponent(id)}`)}
      admins={admins}
      myUid={authUser?._id}
      users={users}
      usersLoading={usersLoading}
      onLoadUsers={loadUsers}
      onAddAdmin={(u) => guard('добавить администратора', () => setDoc(doc(db, 'admins', u.uid), {
        name: u.name, photo: u.photo, addedBy: authUser?._id || '', addedAt: serverTimestamp()
      }))}
      onRemoveAdmin={(uid) => guard('убрать администратора', () => deleteDoc(doc(db, 'admins', uid)))}
      firmware={firmware}
      onPublishFirmware={({ version, url }) => guard('выпустить прошивку', () => setDoc(doc(db, 'firmware', 'latest'), {
        version, url, enabled: true, publishedAt: serverTimestamp(), publishedBy: authUser?._id || ''
      }))}
      onToggleFirmware={(enabled) => guard('изменить обновление', () => updateDoc(doc(db, 'firmware', 'latest'), { enabled }))}
    />
  );
}
