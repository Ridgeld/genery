import { useEffect, useState } from 'react';
import s from './AdminDashboard.module.scss';
import Icon from './AdminIcons.jsx';

const GREEN = '#C3F82B';
const RED = '#FF4365';
const GRAY = '#7D7D8C';

// Каркас панели управления: боковое меню слева, содержимое по центру.
// На телефоне меню прячется и открывается кнопкой в верхней строке.
// canteens: [{ id, name, occupied, capacity, online, total }]
export default function AdminShell({ theme, user, isSuper = true, canteens, pendingCount, view, selectedId, onNavigate, onBack, title, children }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [view, selectedId]);

  const vars = {
    '--bg': theme.background_color,
    '--panel': theme.element_first_color,
    '--panel2': theme.element_second_color,
    '--text': theme.text_first_color,
    '--muted': theme.text_second_color === '#E1E1E1' ? '#8A8A99' : theme.text_second_color,
    '--accent': theme.gradient_first_color || '#0040F9',
    '--accent-bg': theme.first_color,
    '--line': 'rgba(127,127,140,.16)',
    '--hover': 'rgba(127,127,140,.10)',
  };

  const item = (key, id, icon, label, extra) => {
    const active = view === key && (id === undefined || id === selectedId);
    return (
      <button key={`${key}-${id || ''}`} type="button" className={`${s.navItem} ${active ? s.navItemActive : ''}`} onClick={() => onNavigate(key, id)}>
        {icon}
        {label}
        {extra}
      </button>
    );
  };

  return (
    <div className={s.root} style={vars}>
      <div className={`${s.scrim} ${open ? s.scrimOn : ''}`} onClick={() => setOpen(false)} />

      <aside className={`${s.sidebar} ${open ? s.sidebarOpen : ''}`}>
        <div className={s.brand}>
          <span className={s.brandIcon}><Icon name="door" size={20} /></span>
          <div><b>Счётчики</b><small>Управление столовыми</small></div>
        </div>

        <button type="button" className={s.navItem} onClick={onBack}>
          <Icon name="back" size={18} /><span className={s.navText}><span>На сайт</span></span>
        </button>
        {isSuper && item('inbox', undefined, <Icon name="inbox" size={18} />,
          <span className={s.navText}><span>Новые платы</span></span>,
          pendingCount > 0 ? <span className={s.navCount}>{pendingCount}</span> : null)}

        <div className={s.navLabel}>Столовые</div>
        {canteens.map((c) => {
          const color = !c.total ? GRAY : c.online === c.total ? GREEN : c.online ? '#FFC24B' : RED;
          return item('canteen', c.id, <span className={s.dot} style={{ background: color }} />,
            <span className={s.navText}>
              <span>{c.name || c.id}</span>
              <small>{c.total ? `${c.occupied} из ${c.capacity} · дверей ${c.total}` : 'нет счётчиков'}</small>
            </span>);
        })}
        {isSuper && item('new-canteen', undefined, <Icon name="plus" size={18} />, <span className={s.navText}><span>Добавить столовую</span></span>)}

        {isSuper && (
          <>
            <div className={s.navLabel}>Система</div>
            {item('firmware', undefined, <Icon name="chip" size={18} />, <span className={s.navText}><span>Прошивка</span></span>)}
            {item('admins', undefined, <Icon name="shield" size={18} />, <span className={s.navText}><span>Сотрудники</span></span>)}
          </>
        )}

        <div className={s.sideBottom}>
          {pendingCount > 0 && view !== 'inbox' && (
            <div className={s.promo}>
              <b>Новые платы: {pendingCount}</b>
              <p>Мастер установил платы. Выберите для них столовую и подключите.</p>
              <button type="button" className={`${s.btn} ${s.btnPrimary}`} style={{ width: '100%', justifyContent: 'center' }} onClick={() => onNavigate('inbox')}>
                Разобрать
              </button>
            </div>
          )}
          {user && (
            <div className={s.userCard}>
              {user.avatar ? <img src={user.avatar} alt="" /> : <span className="avatar">{(user.name || '?').charAt(0)}</span>}
              <div><b>{user.name || 'Администратор'}</b><small>{isSuper ? 'суперадминистратор' : 'менеджер столовой'}</small></div>
            </div>
          )}
        </div>
      </aside>

      <div className={s.topbar}>
        <button type="button" className={s.iconBtn} onClick={() => setOpen(true)} aria-label="Меню"><Icon name="menu" size={18} /></button>
        <b>{title}</b>
        {pendingCount > 0 && view !== 'inbox' && (
          <button type="button" className={s.btn} onClick={() => onNavigate('inbox')}>
            <Icon name="inbox" size={16} /><span className={s.navCount}>{pendingCount}</span>
          </button>
        )}
      </div>

      <main className={s.main}>
        <div className={s.mainInner}>{children}</div>
      </main>
    </div>
  );
}
