import { useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import '../../themes/default.scss';
import CanteenView from './CanteenView.jsx';
import AdminApp from './AdminApp.jsx';
import CanteenList from './CanteenList.jsx';
import { DEFAULT_SCHEDULE, buildDayCurves, dayKey, daysAgoKey, nowMinutes } from './canteenStats.js';

// Только для разработки (маршрут /canteen-preview есть лишь в режиме vite dev):
// страницы столовой и «Управления» на сгенерированных данных, без входа и без Firestore.
//   ?occ=70 — сколько людей сейчас, ?days=0 — без истории, ?t=760 — «сейчас» в минутах от полуночи
//   ?view=admin&v=canteen|inbox|firmware|admins|new-canteen — панель управления
function mockDays(daysCount) {
  const docs = [];
  for (let n = daysCount; n >= 0; n -= 1) {
    const date = daysAgoKey(n);
    const inH = {};
    const outH = {};
    const wave = (h, c, w, a) => Math.round(a * Math.exp(-((h - c) ** 2) / (2 * w * w)));
    for (let h = 8; h < 19; h += 1) {
      const k = `h${String(h).padStart(2, '0')}`;
      const amp = 1 + ((n * 7) % 5) / 10;
      inH[k] = wave(h, 12, 1.1, 60 * amp) + wave(h, 9, 0.8, 15) + 4;
      outH[k] = wave(h, 13.2, 1.1, 60 * amp) + wave(h, 10, 0.8, 15) + 4;
    }
    docs.push({ date, in: inH, out: outH });
  }
  return docs;
}

const ts = (minAgo) => ({ toMillis: () => Date.now() - minAgo * 60000 });
const MOCK_DEVICES = [
  { id: 'counter-a1b2c3', canteenRequested: 'main', day: dayKey(), dayIn: 0, dayOut: 0, lastSeen: ts(0.2), rssi: -58, fw: '0.5.1', sim: true },
  { id: 'counter-5e0f11', canteenRequested: 'stolovaya-3', day: dayKey(), lastSeen: ts(3), rssi: -66, fw: '0.5.1' },
  { id: 'counter-9134f0', door: 'Главный вход', canteenId: 'main', approved: true, day: dayKey(), dayIn: 143, dayOut: 98, lastSeen: ts(1), rssi: -61, fw: '0.5.1', ota: 'Обновлено до 0.5.1' },
  { id: 'counter-77e0d1', door: 'Вход со двора', canteenId: 'main', approved: true, day: dayKey(), dayIn: 40, dayOut: 37, lastSeen: ts(45), rssi: -82, fw: '0.5.0', ota: 'Загружаю версию 0.5.1' },
  { id: 'counter-c0ffee', door: 'Вход', canteenId: 'korpus-2', approved: true, day: dayKey(), dayIn: 31, dayOut: 12, lastSeen: ts(2), rssi: -55, fw: '0.5.1' },
];
const MOCK_CANTEENS = [
  { id: 'main', name: 'Политех', capacity: 120, effectiveCapacity: 95, status: 'open', resetHour: 2, schedule: DEFAULT_SCHEDULE },
  { id: 'korpus-2', name: 'Корпус 2', capacity: 60, status: 'sanitary', statusNote: 'Откроемся в 13:30' },
];
const MOCK_VOTES = [{ vote: 'full', at: ts(2) }, { vote: 'full', at: ts(4) }, { vote: 'full', at: ts(6) }, { vote: 'ok', at: ts(9) }];

export default function CanteenPreview() {
  const { theme, setElementColors } = useContext(ElementContext);
  const [params, setParams] = useSearchParams();
  const days = Number(params.get('days') ?? 21);
  const occ = Number(params.get('occ') ?? 72);
  const [clock] = useState(Date.now());
  const [devices, setDevices] = useState(MOCK_DEVICES);
  const [canteens, setCanteens] = useState(MOCK_CANTEENS);
  const isAdmin = params.get('view') === 'admin';

  useEffect(() => {
    setElementColors({
      iconColor: theme.icon_color, titleColor: theme.text_first_color, showArrow: false,
      isHeaderBackground: true, headerBackground: theme.background_color, isHeader: !isAdmin,
      isFooter: !isAdmin, footerBackground: theme.background_color, activeElementIndex: 0,
      background: theme.background_color
    });
    document.body.style.background = theme.background_color;
  }, [theme, setElementColors, isAdmin]);

  const curves = useMemo(() => buildDayCurves(days ? mockDays(days) : []), [days]);
  const now = params.get('t') ? Number(params.get('t')) : nowMinutes(new Date(clock));

  if (isAdmin) {
    const v = params.get('v') || 'canteen';
    const id = params.get('id') || (v === 'canteen' ? 'main' : undefined);
    const save = async (did, data) => setDevices((list) => list.map((d) => (d.id === did ? { ...d, ...data } : d)));
    return (
      <AdminApp
        theme={theme}
        user={{ _id: 'me', name: 'Даниил' }}
        staff={params.get('role') === 'manager' ? { role: 'manager', canteens: ['main'] } : { role: 'super', canteens: [] }}
        votes={MOCK_VOTES}
        view={v}
        selectedId={id}
        onNavigate={(nv, nid) => setParams(nid ? { view: 'admin', v: nv, id: nid } : { view: 'admin', v: nv })}
        onBack={() => {}}
        devices={devices}
        canteens={canteens}
        admins={[{ id: 'me', name: 'Даниил' }, { id: 'u2', name: 'Айгерим', role: 'manager', canteens: ['main'] }]}
        onSaveAdmin={async () => {}}
        firmware={{ version: '0.5.1', url: 'https://github.com/example/genery-firmware/releases/download/v0.5.1/people_counter-0.5.1.bin', enabled: true }}
        curves={curves}
        users={[{ uid: 'u2', name: 'Айгерим' }, { uid: 'u3', name: 'Азамат' }, { uid: 'u4', name: 'Алина' }]}
        usersLoading={false}
        onLoadUsers={() => {}}
        onSaveDevice={save}
        onSaveCanteen={async (cid, data) => setCanteens((list) => list.map((c) => (c.id === cid ? { ...c, ...data } : c)))}
        onRenameCanteen={async (oldId, newId, data) => {
          setCanteens((list) => list.map((c) => (c.id === oldId ? { ...c, ...data, id: newId } : c)));
          setDevices((list) => list.map((d) => (d.canteenId === oldId ? { ...d, canteenId: newId } : d)));
        }}
        onCreateCanteen={async (cid, data) => setCanteens((list) => [...list, { id: cid, ...data }])}
        onDeleteCanteen={async (cid) => setCanteens((list) => list.filter((c) => c.id !== cid))}
        onOpenCanteenPage={() => {}}
        onAddAdmin={async () => {}}
        onRemoveAdmin={async () => {}}
        onPublishFirmware={async () => {}}
        onToggleFirmware={async () => {}}
      />
    );
  }

  if (params.get('view') === 'list') {
    return (
      <CanteenList
        theme={theme}
        items={[
          { id: 'main', name: 'Политех', occupied: 72, capacity: 95, hasDevices: true },
          { id: 'korpus-2', name: 'Корпус 2', occupied: 0, capacity: 60, hasDevices: true, status: 'sanitary' },
          { id: 'bufet', name: 'Буфет, 3 этаж', occupied: 9, capacity: 30, hasDevices: true },
        ]}
        onOpen={() => {}}
        onDevices={() => {}}
      />
    );
  }

  const canteen = MOCK_CANTEENS.find((c) => c.id === (params.get('id') || 'main'));
  return (
    <CanteenView
      theme={theme}
      canteen={canteen}
      capacity={canteen.effectiveCapacity || canteen.capacity}
      occupied={occ}
      hasDevices
      status={{ color: '#C3F82B', text: 'В реальном времени · счётчиков на связи: 1 из 1' }}
      curves={curves}
      today={dayKey(new Date(clock))}
      now={now}
      votes={params.get('votes') === '1' ? MOCK_VOTES : []}
      myVote={null}
      onVote={() => {}}
      onDevices={() => {}}
    />
  );
}
