import { useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import '../../themes/default.scss';
import CanteenView from './CanteenView.jsx';
import AdminView from './AdminView.jsx';
import { buildDayCurves, dayKey, daysAgoKey, nowMinutes } from './canteenStats.js';

// Только для разработки (маршрут /canteen-preview есть лишь в режиме vite dev):
// страница столовой на сгенерированных данных, без входа и без Firestore.
// ?occ=70 — сколько людей сейчас, ?days=0 — без истории.
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
  { id: 'counter-a1b2c3', canteenId: 'main', day: dayKey(), dayIn: 0, dayOut: 0, lastSeen: ts(0.2), rssi: -58, fw: '0.4.0', sim: true },
  { id: 'counter-9134f0', door: 'Главный вход', canteenId: 'main', approved: true, day: dayKey(), dayIn: 143, dayOut: 98, lastSeen: ts(1), rssi: -61, fw: '0.5.0', ota: 'Обновлено до 0.5.0' },
  { id: 'counter-77e0d1', door: 'Вход со двора', canteenId: 'main', approved: true, day: dayKey(), dayIn: 40, dayOut: 37, lastSeen: ts(45), rssi: -79, fw: '0.4.0', ota: 'Загружаю версию 0.5.0' },
];

export default function CanteenPreview() {
  const { theme, setElementColors } = useContext(ElementContext);
  const [params] = useSearchParams();
  const days = Number(params.get('days') ?? 21);
  const occ = Number(params.get('occ') ?? 72);
  const [clock] = useState(Date.now());
  const [tab, setTab] = useState(params.get('tab') || 'devices');

  useEffect(() => {
    setElementColors({
      iconColor: theme.icon_color, titleColor: theme.text_first_color, showArrow: false,
      isHeaderBackground: true, headerBackground: theme.background_color, isHeader: true,
      isFooter: true, footerBackground: theme.background_color, activeElementIndex: 0,
      background: theme.background_color
    });
    document.body.style.background = theme.background_color;
  }, [theme, setElementColors]);

  const curves = useMemo(() => buildDayCurves(days ? mockDays(days) : []), [days]);
  const now = params.get('t') ? Number(params.get('t')) : nowMinutes(new Date(clock));

  if (params.get('view') === 'admin') {
    return (
      <AdminView
        theme={theme}
        tab={tab}
        onTab={setTab}
        devices={MOCK_DEVICES}
        devicesLoaded
        onSaveDevice={async () => {}}
        canteens={[{ id: 'main', name: 'Политех', capacity: 100 }, { id: 'korpus-2', name: 'Корпус 2', capacity: 60 }]}
        onSaveCanteen={async () => {}}
        onCreateCanteen={async () => {}}
        onOpenCanteen={() => {}}
        admins={[{ id: 'me', name: 'Даниил' }, { id: 'u2', name: 'Айгерим' }]}
        myUid="me"
        users={[{ uid: 'u2', name: 'Айгерим' }, { uid: 'u3', name: 'Азамат' }, { uid: 'u4', name: 'Алина' }]}
        usersLoading={false}
        onLoadUsers={() => {}}
        onAddAdmin={async () => {}}
        onRemoveAdmin={async () => {}}
        firmware={{ version: '0.5.0', url: 'https://github.com/example/genery-firmware/releases/download/v0.5.0/people_counter-0.5.0.bin', enabled: true }}
        onPublishFirmware={async () => {}}
        onToggleFirmware={async () => {}}
      />
    );
  }

  return (
    <CanteenView
      theme={theme}
      name="Политех"
      capacity={100}
      occupied={occ}
      hasDevices
      status={{ color: '#C3F82B', text: 'В реальном времени · счётчиков на связи: 1 из 1' }}
      curves={curves}
      today={dayKey(new Date(clock))}
      now={now}
      onDevices={() => {}}
    />
  );
}
