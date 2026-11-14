import { useMemo, useState } from 'react';
import styles from './CanteenOccupancy.module.scss';
import AdminIcon from './AdminIcons.jsx';

const Avatar = ({ photo, name, theme }) => (
  photo
    ? <img className={styles.avatar} src={photo} alt="" />
    : (
      <span className={styles.avatar} style={{ background: theme.element_second_color, color: '#fff' }}>
        {(name || '?').trim().charAt(0).toUpperCase()}
      </span>
    )
);

// Раздел «Администраторы»: список, удаление и добавление по поиску имени.
// admins: [{ id(uid), name, photo }], users: [{ uid, name, photo }] — загружаются по запросу
export default function AdminsSection({ theme, admins, myUid, canteens = [], users, usersLoading, onLoadUsers, onAdd, onRemove, onSave }) {
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState('');
  const tile = theme.element_first_color;
  const text = theme.text_first_color;
  const muted = theme.text_second_color;

  const adminIds = useMemo(() => new Set(admins.map((a) => a.id)), [admins]);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2 || !users) return [];
    return users.filter((u) => (u.name || '').toLowerCase().includes(s)).slice(0, 8);
  }, [q, users]);

  const run = async (key, fn) => {
    setBusy(key);
    try { await fn(); } finally { setBusy(''); }
  };

  return (
    <>
      <div className={styles.devCard} style={{ background: tile }}>
        {admins.map((a, i) => (
          <div key={a.id} style={i ? { borderTop: '1px solid rgba(255,255,255,.06)' } : undefined}>
          <div className={styles.personRow}>
            <Avatar photo={a.photo} name={a.name} theme={theme} />
            <div className={styles.devTitle}>
              <b style={{ color: text }}>{a.name || 'Без имени'}</b>
              <span style={{ color: muted }}>
                {a.id === myUid ? 'это вы · ' : ''}
                {a.role === 'manager' ? `менеджер: ${(a.canteens || []).map((id) => canteens.find((c) => c.id === id)?.name || id).join(', ') || 'столовые не выбраны'}` : 'суперадминистратор'}
              </span>
            </div>
            {a.id !== myUid && onSave && (
              <select
                className={styles.roleSelect}
                style={{ background: theme.background_color, color: text }}
                value={a.role === 'manager' ? 'manager' : 'super'}
                onChange={(e) => run(a.id, () => onSave(a.id, { role: e.target.value }))}
                aria-label="Роль"
              >
                <option value="super">Суперадмин</option>
                <option value="manager">Менеджер</option>
              </select>
            )}
            {a.id !== myUid && (
              <button
                type="button"
                className={styles.roundBtn}
                disabled={busy === a.id}
                onClick={() => { if (window.confirm(`Убрать «${a.name || a.id}» из администраторов?`)) run(a.id, () => onRemove(a.id)); }}
                style={{ background: 'rgba(255,67,101,.14)', color: '#FF4365' }}
                aria-label="Убрать из администраторов"
              >
                <AdminIcon name="trash" size={18} />
              </button>
            )}
          </div>
          {a.role === 'manager' && onSave && (
            <div className={styles.chips}>
              {canteens.map((c) => {
                const on = (a.canteens || []).includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={styles.chip}
                    style={{ background: on ? theme.first_color : theme.background_color, color: on ? '#fff' : text }}
                    onClick={() => run(a.id, () => onSave(a.id, {
                      canteens: on ? (a.canteens || []).filter((x) => x !== c.id) : [...(a.canteens || []), c.id],
                    }))}
                  >
                    {c.name || c.id}
                  </button>
                );
              })}
            </div>
          )}
          </div>
        ))}
      </div>

      <div className={styles.sectionTitle} style={{ color: text }}>Добавить администратора</div>
      <div className={styles.devCard} style={{ background: tile }}>
        <div className={styles.searchField} style={{ background: theme.background_color, color: muted }}>
          <AdminIcon name="search" size={18} />
          <input
            style={{ color: text }}
            placeholder="Имя пользователя Genery"
            value={q}
            onFocus={onLoadUsers}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {usersLoading && <div className={styles.formHint} style={{ color: muted }}>Загружаю пользователей…</div>}
        {!usersLoading && q.trim().length >= 2 && results.length === 0 && (
          <div className={styles.formHint} style={{ color: muted }}>Никого не нашлось</div>
        )}
        {q.trim().length < 2 && !usersLoading && (
          <div className={styles.formHint} style={{ color: muted }}>Введите хотя бы 2 буквы имени</div>
        )}

        {results.map((u) => {
          const already = adminIds.has(u.uid);
          return (
            <div key={u.uid} className={styles.personRow}>
              <Avatar photo={u.photo} name={u.name} theme={theme} />
              <div className={styles.devTitle}>
                <b style={{ color: text }}>{u.name}</b>
                <span style={{ color: muted }}>{already ? 'уже администратор' : 'пользователь'}</span>
              </div>
              {!already && (
                <button
                  type="button"
                  className={styles.smallBtn}
                  disabled={busy === u.uid}
                  onClick={() => run(u.uid, () => onAdd(u))}
                  style={{ background: theme.first_color }}
                >
                  <AdminIcon name="shield" size={16} />
                  {busy === u.uid ? '…' : 'Сделать'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.source} style={{ color: muted }}>
        Администраторы видят кнопку «Управление» на странице столовой и могут подключать счётчики, менять столовые и список администраторов.
      </div>
    </>
  );
}
