import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Timestamp, addDoc, collection, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import { useAuth } from '../../providers/Authprovired.jsx';
import '../../themes/default.scss';
import CanteenView from './CanteenView.jsx';
import CanteenList from './CanteenList.jsx';
import { canManage, useStaff } from './useIsAdmin.js';
import useDayDocs from './useDayDocs.js';
import { buildDayCurves, correctionFor, dayKey, effectiveCap, liveOccupancy, nowMinutes } from './canteenStats.js';

const DEFAULT_CAPACITY = 120;
const STATUS_COLORS = { ok: '#C3F82B', bad: '#FF4365', none: '#7D7D8C' };
const VOTE_COOLDOWN_MS = 15 * 60 * 1000;

// Страница заполненности для студентов.
//   /canteen            — список столовых по загруженности (если столовая одна — сразу она)
//   /canteen?id=politeh — конкретная столовая
export default function CanteenOccupancy() {
  const { theme, setElementColors } = useContext(ElementContext);
  const { authUser } = useAuth();
  const navigateTo = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const staff = useStaff();

  const [canteens, setCanteens] = useState([]);
  const [canteensLoaded, setCanteensLoaded] = useState(false);
  const [devices, setDevices] = useState([]);        // одобренные счётчики всех столовых
  const [devicesLoaded, setDevicesLoaded] = useState(false);
  const [votes, setVotes] = useState([]);
  const [clock, setClock] = useState(Date.now());

  // Все столовые и все подключённые счётчики (их немного) — для списка и для выбранной столовой
  useEffect(() => onSnapshot(
    collection(db, 'canteens'),
    (snap) => { setCanteens(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setCanteensLoaded(true); },
    (error) => { console.error('Ошибка чтения столовых:', error); setCanteensLoaded(true); }
  ), []);
  useEffect(() => onSnapshot(
    query(collection(db, 'devices'), where('approved', '==', true)),
    (snap) => { setDevices(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setDevicesLoaded(true); },
    (error) => { console.error('Ошибка чтения счётчиков:', error); setDevicesLoaded(true); }
  ), []);

  const idParam = searchParams.get('id');
  const canteenId = idParam || (canteens.length === 1 ? canteens[0].id : null);
  const canteen = canteens.find((c) => c.id === canteenId) || null;
  const own = useMemo(() => devices.filter((d) => d.canteenId === canteenId), [devices, canteenId]);

  // История выбранной столовой
  const dayDocs = useDayDocs(own.map((d) => d.id));
  const curves = useMemo(() => buildDayCurves(dayDocs), [dayDocs]);

  // Отзывы за последние полчаса
  useEffect(() => {
    if (!canteenId) { setVotes([]); return undefined; }
    return onSnapshot(
      query(collection(db, 'canteens', canteenId, 'feedback'), where('at', '>=', Timestamp.fromMillis(Date.now() - 30 * 60000))),
      (snap) => setVotes(snap.docs.map((d) => d.data())),
      () => setVotes([])
    );
  }, [canteenId]);

  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 30 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setElementColors({
      iconColor: theme.icon_color,
      titleColor: theme.text_first_color,
      showArrow: true,
      arrowColor: theme.text_first_color,
      arrowLink: () => (idParam && canteens.length > 1 ? setSearchParams({}) : navigateTo('/menu')),
      isHeaderBackground: true,
      headerBackground: theme.background_color,
      isHeader: true,
      isFooter: true,
      footerBackground: theme.background_color,
      activeElementIndex: 0,
      background: theme.background_color
    });
    document.body.style.background = theme.background_color;
  }, [theme, setElementColors, navigateTo, idParam, canteens.length, setSearchParams]);

  const openPanel = staff ? () => navigateTo(canteenId ? `/canteen-devices?v=canteen&id=${encodeURIComponent(canteenId)}` : '/canteen-devices') : null;

  // ---------- Список столовых ----------
  if (!canteenId) {
    const items = canteens.map((c) => {
      const today = dayKey(new Date(clock), c.resetHour);
      const mine = devices.filter((d) => d.canteenId === c.id);
      const live = liveOccupancy(mine, today, correctionFor(c, today));
      return { ...c, occupied: live.occupied, capacity: effectiveCap(c) || DEFAULT_CAPACITY, hasDevices: mine.length > 0 };
    });
    return (
      <CanteenList
        theme={theme}
        items={canteensLoaded ? items : []}
        onOpen={(id) => setSearchParams({ id })}
        onDevices={staff?.role === 'super' ? openPanel : null}
      />
    );
  }

  // ---------- Одна столовая ----------
  const today = dayKey(new Date(clock), canteen?.resetHour);
  const live = liveOccupancy(own, today, correctionFor(canteen, today));
  const hasDevices = own.length > 0;
  const capacity = effectiveCap(canteen) || DEFAULT_CAPACITY;

  let status = { color: STATUS_COLORS.none, text: devicesLoaded ? 'Счётчики ещё не подключены' : 'Загрузка…' };
  if (hasDevices && live.online > 0) {
    status = { color: STATUS_COLORS.ok, text: `В реальном времени · счётчиков на связи: ${live.online} из ${live.total}` };
  } else if (hasDevices) {
    const at = live.lastSeen
      ? new Date(live.lastSeen).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      : '—';
    status = { color: STATUS_COLORS.bad, text: `нет связи с датчиками · данные на ${at}`, stale: true };
  }

  // Голос «Данные точные?» — не чаще раза в 15 минут с устройства
  const voteKey = `canteenVote:${canteenId}`;
  let myVote = null;
  try { const v = JSON.parse(localStorage.getItem(voteKey) || 'null'); if (v && Date.now() - v.at < VOTE_COOLDOWN_MS) myVote = v.vote; } catch { /* нет доступа к хранилищу */ }
  const forceRender = () => setClock(Date.now());
  const onVote = authUser ? async (vote) => {
    try { localStorage.setItem(voteKey, JSON.stringify({ vote, at: Date.now() })); } catch { /* ничего */ }
    forceRender();
    try {
      await addDoc(collection(db, 'canteens', canteenId, 'feedback'), { vote, uid: authUser._id, at: serverTimestamp(), day: today });
    } catch (e) {
      console.error('Не удалось отправить отзыв:', e);
    }
  } : null;

  return (
    <CanteenView
      theme={theme}
      canteen={canteen || { name: '' }}
      capacity={capacity}
      occupied={live.occupied}
      hasDevices={hasDevices}
      status={status}
      curves={curves}
      today={today}
      now={nowMinutes(new Date(clock))}
      votes={votes}
      myVote={myVote}
      onVote={onVote}
      onDevices={canManage(staff, canteenId) ? openPanel : null}
    />
  );
}
