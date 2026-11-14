import { useMemo } from 'react';
import s from './AdminDashboard.module.scss';
import AdminShell from './AdminShell.jsx';
import CanteenDashboard from './CanteenDashboard.jsx';
import InboxView from './InboxView.jsx';
import CanteensSection from './CanteensSection.jsx';
import AdminsSection from './AdminsSection.jsx';
import FirmwareSection from './FirmwareSection.jsx';
import { correctionFor, dayKey, effectiveCap, liveOccupancy, nowMinutes } from './canteenStats.js';

// Панель управления целиком. Ничего не загружает: данные и действия приходят из props
// (CanteenDevices.jsx — из Firestore, CanteenPreview.jsx — тестовые).
// staff: { role: 'super' | 'manager', canteens: [...] } — менеджер видит только свои столовые.
export default function AdminApp({
  theme, user, staff, view, selectedId, onNavigate, onBack,
  devices, canteens: allCanteens, admins, firmware, curves, votes, users, usersLoading,
  onLoadUsers, onSaveDevice, onSaveCanteen, onRenameCanteen, onCreateCanteen, onDeleteCanteen, onOpenCanteenPage,
  onAddAdmin, onRemoveAdmin, onSaveAdmin, onPublishFirmware, onToggleFirmware,
}) {
  const isSuper = staff?.role !== 'manager';
  const canteens = isSuper ? allCanteens : allCanteens.filter((c) => staff.canteens.includes(c.id));
  const canteenIds = useMemo(() => new Set(allCanteens.map((c) => c.id)), [allCanteens]);
  // Подключённые платы — одобрены и привязаны к существующей столовой; остальные — «новые»
  const active = devices.filter((d) => d.approved === true && canteenIds.has(d.canteenId));
  const pending = isSuper ? devices.filter((d) => !active.includes(d)) : [];

  const canteenItems = canteens.map((c) => {
    const own = active.filter((d) => d.canteenId === c.id);
    const today = dayKey(new Date(), c.resetHour);
    const live = liveOccupancy(own, today, correctionFor(c, today));
    return { ...c, occupied: live.occupied, capacity: effectiveCap(c), online: live.online, total: own.length };
  });

  // Менеджеру недоступны системные разделы
  let v = view;
  if (!isSuper && v !== 'canteen') v = 'canteen';
  const current = v === 'canteen' ? (canteens.find((c) => c.id === selectedId) || canteens[0]) : null;
  const titles = { inbox: 'Новые платы', firmware: 'Прошивка', admins: 'Сотрудники', 'new-canteen': 'Новая столовая' };
  const title = current ? (current.name || current.id) : (titles[v] || 'Счётчики');

  let content;
  if (v === 'canteen' && current) {
    const today = dayKey(new Date(), current.resetHour);
    content = (
      <CanteenDashboard
        theme={theme}
        canteen={current}
        devices={active.filter((d) => d.canteenId === current.id)}
        assignedTotal={devices.filter((d) => d.canteenId === current.id).length}
        allCanteens={allCanteens}
        latestFw={firmware}
        curves={curves}
        votes={votes}
        today={today}
        now={nowMinutes()}
        readOnly={!isSuper}
        onSaveDevice={onSaveDevice}
        onSaveCanteen={async (data, renameTo) => {
          if (renameTo) {
            await onRenameCanteen(current.id, renameTo, data);
            onNavigate('canteen', renameTo);
          } else {
            await onSaveCanteen(current.id, data);
          }
        }}
        onDeleteCanteen={() => onDeleteCanteen(current.id)}
        onOpenPage={() => onOpenCanteenPage(current.id)}
      />
    );
  } else if (v === 'canteen') {
    content = <div className={s.card}><div className={s.empty}>Вам пока не назначена ни одна столовая.</div></div>;
  } else if (v === 'inbox') {
    content = (
      <InboxView theme={theme} devices={pending} canteens={allCanteens} onConnect={onSaveDevice} onCreateCanteen={() => onNavigate('new-canteen')} />
    );
  } else if (v === 'firmware') {
    content = (
      <>
        <div className={s.pageHead}><div><h1>Прошивка</h1><p>Обновление всех плат через интернет</p></div></div>
        <div style={{ maxWidth: 720, width: '100%' }}>
          <FirmwareSection theme={theme} latest={firmware} devices={active} onPublish={onPublishFirmware} onToggle={onToggleFirmware} />
        </div>
      </>
    );
  } else if (v === 'admins') {
    content = (
      <>
        <div className={s.pageHead}><div><h1>Сотрудники</h1><p>Суперадминистраторы управляют всем, менеджеры — статусом и коррекцией своих столовых</p></div></div>
        <div style={{ maxWidth: 760, width: '100%' }}>
          <AdminsSection
            theme={theme}
            admins={admins}
            myUid={user?._id}
            canteens={allCanteens}
            users={users}
            usersLoading={usersLoading}
            onLoadUsers={onLoadUsers}
            onAdd={onAddAdmin}
            onRemove={onRemoveAdmin}
            onSave={onSaveAdmin}
          />
        </div>
      </>
    );
  } else {
    content = (
      <>
        <div className={s.pageHead}><div><h1>Новая столовая</h1><p>После создания к ней можно подключать платы</p></div></div>
        <div style={{ maxWidth: 720, width: '100%' }}>
          <CanteensSection theme={theme} canteens={allCanteens} devices={devices} onlyForm onCreate={async (id, data) => { await onCreateCanteen(id, data); onNavigate('canteen', id); }} />
        </div>
      </>
    );
  }

  return (
    <AdminShell
      theme={theme}
      user={user}
      isSuper={isSuper}
      canteens={canteenItems}
      pendingCount={pending.length}
      view={v}
      selectedId={current?.id || selectedId}
      onNavigate={onNavigate}
      onBack={onBack}
      title={title}
    >
      {content}
    </AdminShell>
  );
}
