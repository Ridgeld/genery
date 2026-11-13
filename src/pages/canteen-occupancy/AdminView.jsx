import styles from './CanteenOccupancy.module.scss';
import DevicesView from './DevicesView.jsx';
import CanteensSection from './CanteensSection.jsx';
import AdminsSection from './AdminsSection.jsx';
import FirmwareSection from './FirmwareSection.jsx';

const TABS = [
  { key: 'devices', label: 'Счётчики' },
  { key: 'canteens', label: 'Столовые' },
  { key: 'admins', label: 'Админы' },
  { key: 'firmware', label: 'Прошивка' },
];

// Страница «Управление»: три раздела. Данные и действия приходят снаружи (props).
export default function AdminView({ theme, tab, onTab, devices, devicesLoaded, onSaveDevice, canteens, onSaveCanteen,
  onCreateCanteen, onOpenCanteen, admins, myUid, users, usersLoading, onLoadUsers, onAddAdmin, onRemoveAdmin,
  firmware, onPublishFirmware, onToggleFirmware }) {
  const pendingCount = devices.filter((d) => d.approved !== true).length;

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <div>
          <div className={styles.headerTitle} style={{ color: theme.text_first_color }}>Управление</div>
          <div className={styles.liveStatus} style={{ color: theme.text_second_color }}>Только для администраторов</div>
        </div>
      </div>

      <div className={styles.segments} style={{ background: theme.element_first_color }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => onTab(t.key)}
            className={styles.segment}
            style={{
              background: tab === t.key ? theme.first_color : 'transparent',
              color: tab === t.key ? '#fff' : theme.text_first_color
            }}
          >
            {t.label}
            {t.key === 'devices' && pendingCount > 0 && <i className={styles.segmentBadge}>{pendingCount}</i>}
          </button>
        ))}
      </div>

      {tab === 'devices' && (
        <DevicesView theme={theme} devices={devices} loaded={devicesLoaded} onSave={onSaveDevice} />
      )}
      {tab === 'canteens' && (
        <CanteensSection
          theme={theme}
          canteens={canteens}
          devices={devices}
          onSave={onSaveCanteen}
          onCreate={onCreateCanteen}
          onOpen={onOpenCanteen}
        />
      )}
      {tab === 'admins' && (
        <AdminsSection
          theme={theme}
          admins={admins}
          myUid={myUid}
          users={users}
          usersLoading={usersLoading}
          onLoadUsers={onLoadUsers}
          onAdd={onAddAdmin}
          onRemove={onRemoveAdmin}
        />
      )}
      {tab === 'firmware' && (
        <FirmwareSection
          theme={theme}
          latest={firmware}
          devices={devices.filter((d) => d.approved === true)}
          onPublish={onPublishFirmware}
          onToggle={onToggleFirmware}
        />
      )}
    </div>
  );
}
