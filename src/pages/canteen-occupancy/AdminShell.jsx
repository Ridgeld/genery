import { useEffect, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import s from './AdminDashboard.module.scss';
import Icon from './AdminIcons.jsx';
import CommandMenu, { useCommandHotkey } from './CommandMenu.jsx';
import { EASE, Pulse } from './motion.jsx';
import { C, themePalette, themeVars } from './themeColors.js';

const GREEN = C.ok;
const RED = C.bad;
const GRAY = C.muted;

// Каркас панели управления: «стеклянное» боковое меню, командное меню Ctrl+K, плавные переходы разделов.
// На телефоне меню прячется и открывается кнопкой в верхней строке.
// canteens: [{ id, name, occupied, capacity, online, total }]
export default function AdminShell({
  theme, user, isSuper = true, canteens, pendingCount, view, selectedId, onNavigate, onBack, title, commands = [], children,
}) {
  const [open, setOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => { setOpen(false); }, [view, selectedId]);
  useCommandHotkey(setCmdOpen);

  const pal = themePalette(theme);
  const vars = {
    ...themeVars(theme),
    '--bg': theme.background_color,
    '--panel': theme.element_first_color,
    '--panel2': theme.element_second_color,
    '--text': theme.text_first_color,
    '--muted': pal.muted,
    '--accent': pal.accent,
    '--accent-bg': theme.first_color,
    '--on-accent': pal.onAccent,
    '--on-hero': pal.onHero,
    '--line': 'rgba(127,127,140,.16)',
    '--hover': 'rgba(127,127,140,.10)',
  };

  const item = (key, id, icon, label, extra) => {
    const active = view === key && (id === undefined || id === selectedId);
    return (
      <button
        key={`${key}-${id || ''}`}
        type="button"
        className={`${s.navItem} ${active ? s.navItemActive : ''}`}
        aria-current={active ? 'page' : undefined}
        onClick={() => onNavigate(key, id)}
      >
        {active && <motion.span layoutId="navActive" className={s.navActiveBg} transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
        {icon}
        {label}
        {extra}
      </button>
    );
  };

  return (
    <div className={s.root} style={vars}>
      <div className={s.glow} aria-hidden="true" />
      <div className={s.grain} aria-hidden="true" />
      <div className={`${s.scrim} ${open ? s.scrimOn : ''}`} onClick={() => setOpen(false)} />

      <aside className={`${s.sidebar} ${open ? s.sidebarOpen : ''}`}>
        <div className={s.brand}>
          <span className={s.brandIcon}><Icon name="door" size={20} /></span>
          <div><b>Счётчики</b><small>Управление столовыми</small></div>
        </div>

        <button type="button" className={s.cmdTrigger} onClick={() => setCmdOpen(true)}>
          <Icon name="search" size={16} />
          <span>Найти или сделать…</span>
          <kbd>Ctrl K</kbd>
        </button>

        <LayoutGroup id="nav">
          <button type="button" className={s.navItem} onClick={onBack}>
            <Icon name="back" size={18} /><span className={s.navText}><span>На сайт</span></span>
          </button>
          {isSuper && item('inbox', undefined, <Icon name="inbox" size={18} />,
            <span className={s.navText}><span>Новые платы</span></span>,
            pendingCount > 0 ? <span className={s.navCount}>{pendingCount}</span> : null)}

          <div className={s.navLabel}>Столовые</div>
          {canteens.map((c) => {
            const color = !c.total ? GRAY : c.online === c.total ? GREEN : c.online ? C.warn : RED;
            return item('canteen', c.id, <span className={s.navDot}><Pulse color={color} on={!!c.total && c.online > 0} /></span>,
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
        </LayoutGroup>

        <div className={s.sideBottom}>
          <AnimatePresence>
            {pendingCount > 0 && view !== 'inbox' && (
              <motion.div
                className={s.promo}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <b>Новые платы: {pendingCount}</b>
                <p>Мастер установил платы. Выберите для них столовую и подключите.</p>
                <button type="button" className={`${s.btn} ${s.btnPrimary}`} style={{ width: '100%', justifyContent: 'center' }} onClick={() => onNavigate('inbox')}>
                  Разобрать
                </button>
              </motion.div>
            )}
          </AnimatePresence>
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
        <button type="button" className={s.iconBtn} onClick={() => setCmdOpen(true)} aria-label="Поиск и команды"><Icon name="search" size={18} /></button>
        {pendingCount > 0 && view !== 'inbox' && (
          <button type="button" className={s.btn} onClick={() => onNavigate('inbox')}>
            <Icon name="inbox" size={16} /><span className={s.navCount}>{pendingCount}</span>
          </button>
        )}
      </div>

      <main className={s.main}>
        {/* Новый раздел появляется сразу (без ожидания анимации ухода старого) — переходы мгновенные */}
        <motion.div
          key={`${view}:${selectedId || ''}`}
          className={s.mainInner}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: EASE }}
        >
          {children}
        </motion.div>
      </main>

      <CommandMenu open={cmdOpen} onClose={() => setCmdOpen(false)} commands={commands} />
    </div>
  );
}
