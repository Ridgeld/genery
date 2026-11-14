import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Timestamp, collection, collectionGroup, deleteDoc, doc, getDocs, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where, writeBatch
} from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { useAuth } from '../../providers/Authprovired.jsx';
import styles from './CanteenOccupancy.module.scss';
import '../../themes/default.scss';
import AdminApp from './AdminApp.jsx';
import { useStaff } from './useIsAdmin.js';
import useDayDocs from './useDayDocs.js';
import { buildDayCurves } from './canteenStats.js';

const byName = (a, b) => String(a.name || a.id).localeCompare(String(b.name || b.id), 'ru');

// Панель «Управление» (/canteen-devices?v=canteen&id=main): столовые, новые платы, прошивка, администраторы.
export default function CanteenDevices() {
  const { theme, setElementColors } = useContext(ElementContext);
  const { authUser } = useAuth();
  const navigateTo = useNavigate();
  const [params, setParams] = useSearchParams();
  const staff = useStaff();
  const isAdmin = staff === undefined ? null : !!staff;   // доступ к панели — любой сотрудник

  const [devices, setDevices] = useState([]);
  const [votes, setVotes] = useState([]);
  const [canteens, setCanteens] = useState([]);
  const [canteensLoaded, setCanteensLoaded] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [firmware, setFirmware] = useState(null);
  const [users, setUsers] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [, setClock] = useState(0);

  useEffect(() => {
    if (!isAdmin) return undefined;
    const fail = (what) => (e) => console.error(`Ошибка чтения (${what}):`, e);
    const offs = [
      onSnapshot(collection(db, 'devices'), (snap) => {
        setDevices(snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => String(a.door || a.id).localeCompare(String(b.door || b.id), 'ru')));
      }, fail('счётчики')),
      onSnapshot(collection(db, 'canteens'), (snap) => {
        setCanteens(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byName));
        setCanteensLoaded(true);
      }, fail('столовые')),
      onSnapshot(collection(db, 'admins'), (snap) => {
        setAdmins(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byName));
      }, fail('администраторы')),
      onSnapshot(doc(db, 'firmware', 'latest'), (snap) => setFirmware(snap.exists() ? snap.data() : null), fail('прошивка')),
    ];
    return () => offs.forEach((off) => off());
  }, [isAdmin]);

  useEffect(() => {
    const t = setInterval(() => setClock((c) => c + 1), 30000);
    return () => clearInterval(t);
  }, []);

  // Полноэкранная панель: без шапки и нижнего меню сайта
  useEffect(() => {
    setElementColors({
      iconColor: theme.icon_color,
      titleColor: theme.text_first_color,
      showArrow: false,
      isHeader: false,
      isFooter: false,
      background: theme.background_color
    });
    document.body.style.background = theme.background_color;
  }, [theme, setElementColors]);

  // Раздел и выбранная столовая — в адресе страницы
  let view = params.get('v');
  let selectedId = params.get('id');
  if (!view) {
    view = canteens.length ? 'canteen' : 'new-canteen';
    selectedId = canteens[0]?.id;
  }
  if (view === 'canteen' && canteensLoaded && !canteens.some((c) => c.id === selectedId)) {
    selectedId = canteens[0]?.id;
    if (!selectedId) view = 'new-canteen';
  }
  const navigate = (v, id) => setParams(id ? { v, id } : { v });

  // История выбранной столовой — для графика
  const historyIds = useMemo(
    () => (view === 'canteen' ? devices.filter((d) => d.approved === true && d.canteenId === selectedId).map((d) => d.id) : []),
    [view, selectedId, devices]
  );
  const dayDocs = useDayDocs(historyIds);
  const curves = useMemo(() => buildDayCurves(dayDocs), [dayDocs]);

  // Отзывы студентов по выбранной столовой за последние полчаса
  useEffect(() => {
    if (!isAdmin || view !== 'canteen' || !selectedId) { setVotes([]); return undefined; }
    return onSnapshot(
      query(collection(db, 'canteens', selectedId, 'feedback'), where('at', '>=', Timestamp.fromMillis(Date.now() - 30 * 60000))),
      (snap) => setVotes(snap.docs.map((d) => d.data())),
      (e) => console.error('Ошибка чтения отзывов:', e)
    );
  }, [isAdmin, view, selectedId]);

  const guard = async (what, fn) => {
    try {
      await fn();
    } catch (e) {
      console.error(`Не удалось: ${what}`, e);
      alert(`Не удалось ${what}: ${e.message}`);
      throw e;
    }
  };

  const loadUsers = async () => {
    if (users || usersLoading) return;
    setUsersLoading(true);
    try {
      const snap = await getDocs(collectionGroup(db, 'info'));
      setUsers(snap.docs
        .filter((d) => d.id === 'preferences' && d.ref.path.startsWith('users/'))
        .map((d) => ({ uid: d.data().uid || d.ref.parent.parent.id, name: d.data().name || '', photo: d.data().photo || '' }))
        .filter((u) => u.uid && u.name));
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
          <button type="button" className={styles.devicesLink} style={{ margin: '0 auto 20px', display: 'block', background: theme.element_second_color, color: theme.text_first_color }} onClick={() => navigateTo('/canteen')}>
            На страницу столовой
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminApp
      theme={theme}
      user={authUser}
      staff={staff}
      votes={votes}
      view={view}
      selectedId={selectedId}
      onNavigate={navigate}
      onBack={() => navigateTo(selectedId ? `/canteen?id=${encodeURIComponent(selectedId)}` : '/canteen')}
      devices={devices}
      canteens={canteens}
      admins={admins}
      firmware={firmware}
      curves={curves}
      users={users}
      usersLoading={usersLoading}
      onLoadUsers={loadUsers}
      onSaveDevice={(id, data) => guard('сохранить счётчик', () => updateDoc(doc(db, 'devices', id), data))}
      onSaveCanteen={(id, data) => guard('сохранить столовую', async () => {
        const batch = writeBatch(db);
        batch.update(doc(db, 'canteens', id), data);
        // Час ночного обнуления передаём платам столовой — они начинают рабочий день так же, как сайт
        if ('resetHour' in data) {
          devices.filter((d) => d.canteenId === id).forEach((d) => batch.update(doc(db, 'devices', d.id), { resetHour: data.resetHour }));
        }
        await batch.commit();
      })}
      onRenameCanteen={(oldId, newId, data) => guard('сменить ID столовой', async () => {
        // ID документа в Firestore неизменен: создаём новый, переносим платы, удаляем старый — одной операцией
        const old = canteens.find((c) => c.id === oldId) || {};
        const { id: _omit, ...rest } = old;
        const batch = writeBatch(db);
        batch.set(doc(db, 'canteens', newId), { ...rest, ...data });
        devices.filter((d) => d.canteenId === oldId).forEach((d) => batch.update(doc(db, 'devices', d.id), {
          canteenId: newId, ...('resetHour' in data ? { resetHour: data.resetHour } : {}),
        }));
        batch.delete(doc(db, 'canteens', oldId));
        await batch.commit();
      })}
      onSaveAdmin={(uid, data) => guard('изменить сотрудника', () => updateDoc(doc(db, 'admins', uid), data))}
      onCreateCanteen={(id, data) => guard('создать столовую', () => setDoc(doc(db, 'canteens', id), data))}
      onDeleteCanteen={(id) => guard('удалить столовую', async () => { await deleteDoc(doc(db, 'canteens', id)); navigate('canteen'); })}
      onOpenCanteenPage={(id) => navigateTo(`/canteen?id=${encodeURIComponent(id)}`)}
      onAddAdmin={(u) => guard('добавить администратора', () => setDoc(doc(db, 'admins', u.uid), {
        name: u.name, photo: u.photo, addedBy: authUser?._id || '', addedAt: serverTimestamp()
      }))}
      onRemoveAdmin={(uid) => guard('убрать администратора', () => deleteDoc(doc(db, 'admins', uid)))}
      onPublishFirmware={({ version, url, sha256 }) => guard('выпустить прошивку', () => setDoc(doc(db, 'firmware', 'latest'), {
        version, url, sha256: sha256 || '', enabled: true, publishedAt: serverTimestamp(), publishedBy: authUser?._id || ''
      }))}
      onToggleFirmware={(enabled) => guard('изменить обновление', () => updateDoc(doc(db, 'firmware', 'latest'), { enabled }))}
    />
  );
}
