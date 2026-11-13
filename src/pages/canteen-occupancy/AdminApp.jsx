import { useMemo } from 'react';
import s from './AdminDashboard.module.scss';
import AdminShell from './AdminShell.jsx';
import CanteenDashboard from './CanteenDashboard.jsx';
import InboxView from './InboxView.jsx';
import CanteensSection from './CanteensSection.jsx';
import AdminsSection from './AdminsSection.jsx';
import FirmwareSection from './FirmwareSection.jsx';
import { dayKey, liveOccupancy, nowMinutes } from './canteenStats.js';

// Панель управления целиком. Ничего не загружает: данные и действия приходят из props
// (CanteenDevices.jsx — из Firestore, CanteenPreview.jsx — тестовые).
export default function AdminApp({
  theme, user, view, selectedId, onNavigate, onBack,
  devices, canteens, admins, firmware, curves, users, usersLoading,
  onLoadUsers, onSaveDevice, onSaveCanteen, onCreateCanteen, onDeleteCanteen, onOpenCanteenPage,
  onAddAdmin, onRemoveAdmin, onPublishFirmware, onToggleFirmware,
}) {
  const today = dayKey();
  const canteenIds = useMemo(() => new Set(canteens.map((c) => c.id)), [canteens]);
  // Подключённые платы — одобрены и привязаны к существующей столовой; остальные — «новые»
  const active = devices.filter((d) => d.approved === true && canteenIds.has(d.canteenId));
  const pending = devices.filter((d) => !active.includes(d));

  const canteenItems = canteens.map((c) => {
    const own = active.filter((d) => d.canteenId === c.id);
    const live = liveOccupancy(own, today);
    return { ...c, occupied: live.occupied, capacity: Number(c.capacity) || 0, online: live.online, total: own.length };
  });

  const current = view === 'canteen' ? canteens.find((c) => c.id === selectedId) : null;
  const titles = { inbox: 'Новые платы', firmware: 'Прошивка', admins: 'Администраторы', 'new-canteen': 'Новая столовая' };
  const title = current ? (current.name || current.id) : (titles[view] || 'Счётчики');

  let content;
  if (view === 'canteen' && current) {
    content = (
      <CanteenDashboard
        theme={theme}
        canteen={current}
        devices={active.filter((d) => d.canteenId === current.id)}
        assignedTotal={devices.filter((d) => d.canteenId === current.id).length}
        allCanteens={canteens}
        latestFw={firmware}
        curves={curves}
        today={today}
        now={nowMinutes()}
        onSaveDevice={onSaveDevice}
        onSaveCanteen={(data) => onSaveCanteen(current.id, data)}
        onDeleteCanteen={() => onDeleteCanteen(current.id)}
        onOpenPage={() => onOpenCanteenPage(current.id)}
      />
    );
  } else if (view === 'inbox') {
    content = (
      <InboxView theme={theme} devices={pending} canteens={canteens} onConnect={onSaveDevice} onCreateCanteen={() => onNavigate('new-canteen')} />
    );
  } else if (view === 'firmware') {
    content = (
      <>
        <div className={s.pageHead}><div><h1>Прошивка</h1><p>Обновление всех плат через интернет</p></div></div>
        <div style={{ maxWidth: 720, width: '100%' }}>
          <FirmwareSection theme={theme} latest={firmware} devices={active} onPublish={onPublishFirmware} onToggle={onToggleFirmware} />
        </div>
      </>
    );
  } else if (view === 'admins') {
    content = (
      <>
        <div className={s.pageHead}><div><h1>Администраторы</h1><p>Кто может подключать платы, менять столовые и выпускать прошивку</p></div></div>
        <div style={{ maxWidth: 720, width: '100%' }}>
          <AdminsSection theme={theme} admins={admins} myUid={user?._id} users={users} usersLoading={usersLoading} onLoadUsers={onLoadUsers} onAdd={onAddAdmin} onRemove={onRemoveAdmin} />
        </div>
      </>
    );
  } else {
    content = (
      <>
        <div className={s.pageHead}><div><h1>Новая столовая</h1><p>После создания к ней можно подключать платы</p></div></div>
        <div style={{ maxWidth: 720, width: '100%' }}>
          <CanteensSection theme={theme} canteens={canteens} devices={devices} onlyForm onCreate={async (id, data) => { await onCreateCanteen(id, data); onNavigate('canteen', id); }} />
        </div>
      </>
    );
  }

  return (
    <AdminShell
      theme={theme}
      user={user}
      canteens={canteenItems}
      pendingCount={pending.length}
      view={view}
      selectedId={selectedId}
      onNavigate={onNavigate}
      onBack={onBack}
      title={title}
    >
      {content}
    </AdminShell>
  );
}
