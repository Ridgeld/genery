import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import '../../themes/default.scss';
import CanteenView from './CanteenView.jsx';
import useIsAdmin from './useIsAdmin.js';
import useDayDocs from './useDayDocs.js';
import { buildDayCurves, dayKey, liveOccupancy, nowMinutes } from './canteenStats.js';

const DEFAULT_CAPACITY = 120;
const STATUS_COLORS = { ok: '#C3F82B', bad: '#FF4365', none: '#7D7D8C' };

// Страница заполненности: загружает данные счётчиков из Firestore и передаёт их в CanteenView.
// Адрес: /canteen?id=main (по умолчанию main)
export default function CanteenOccupancy() {
  const { theme, setElementColors } = useContext(ElementContext);
  const navigateTo = useNavigate();
  const [searchParams] = useSearchParams();
  const canteenId = searchParams.get('id') || 'main';
  const isAdmin = useIsAdmin();

  const [info, setInfo] = useState({ capacity: DEFAULT_CAPACITY, name: '' });
  const [devices, setDevices] = useState([]);       // одобренные счётчики этой столовой
  const [devicesLoaded, setDevicesLoaded] = useState(false);
  const [clock, setClock] = useState(Date.now());   // «сейчас», обновляется раз в 30 с

  // Карточка столовой: canteens/{id} { name, capacity }
  useEffect(() => onSnapshot(
    doc(db, 'canteens', canteenId),
    (snap) => {
      const data = snap.exists() ? snap.data() : {};
      setInfo({ capacity: Number(data.capacity) || DEFAULT_CAPACITY, name: data.name || '' });
    },
    (error) => console.error('Ошибка чтения столовой:', error)
  ), [canteenId]);

  // Счётчики столовой в реальном времени. Учитываются только одобренные (approved: true)
  useEffect(() => onSnapshot(
    query(collection(db, 'devices'), where('canteenId', '==', canteenId)),
    (snap) => {
      setDevices(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((d) => d.approved === true));
      setDevicesLoaded(true);
    },
    (error) => {
      console.error('Ошибка чтения счётчиков:', error);
      setDevicesLoaded(true);
    }
  ), [canteenId]);

  // История за 5 недель (включая сегодня). Обновляется каждые 5 минут
  const dayDocs = useDayDocs(devices.map((d) => d.id));

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
      arrowLink: () => navigateTo('/menu'),
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

  const today = dayKey(new Date(clock));
  const curves = useMemo(() => buildDayCurves(dayDocs), [dayDocs]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const live = useMemo(() => liveOccupancy(devices, today), [devices, today, clock]);
  const hasDevices = devices.length > 0;

  let status = { color: STATUS_COLORS.none, text: devicesLoaded ? 'Счётчики ещё не подключены' : 'Загрузка…' };
  if (hasDevices && live.online > 0) {
    status = { color: STATUS_COLORS.ok, text: `В реальном времени · счётчиков на связи: ${live.online} из ${live.total}` };
  } else if (hasDevices) {
    const at = live.lastSeen
      ? new Date(live.lastSeen).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      : '—';
    status = { color: STATUS_COLORS.bad, text: `Счётчики не на связи · данные на ${at}` };
  }

  return (
    <CanteenView
      theme={theme}
      name={info.name}
      capacity={info.capacity}
      occupied={live.occupied}
      hasDevices={hasDevices}
      status={status}
      curves={curves}
      today={today}
      now={nowMinutes(new Date(clock))}
      onDevices={isAdmin ? () => navigateTo('/canteen-devices') : null}
    />
  );
}
