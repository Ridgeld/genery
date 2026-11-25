// Командное меню (Ctrl+K / Cmd+K / «/»): любое действие панели с клавиатуры.
// commands: [{ id, group, label, hint, icon, keywords, run }]
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import s from './AdminDashboard.module.scss';
import Icon from './AdminIcons.jsx';
import { EASE } from './motion.jsx';

const norm = (t) => String(t || '').toLowerCase().replace(/ё/g, 'е');

export function useCommandHotkey(setOpen) {
  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName) || e.target?.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K' || e.code === 'KeyK')) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);
}

export default function CommandMenu({ open, onClose, commands }) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => { if (open) { setQ(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 30); } }, [open]);

  const results = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    return commands.filter((c) => {
      const hay = norm(`${c.label} ${c.group} ${c.keywords || ''} ${c.hint || ''}`);
      return words.every((w) => hay.includes(w));
    });
  }, [q, commands]);

  useEffect(() => { setActive(0); }, [q]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const run = (c) => { onClose(); setTimeout(() => c.run(), 0); };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    if (e.key === 'Enter' && results[active]) { e.preventDefault(); run(results[active]); }
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  // Группы в порядке появления
  let lastGroup = null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={s.cmdScrim}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            className={s.cmd}
            role="dialog"
            aria-label="Команды"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: EASE }}
          >
            <div className={s.cmdInput}>
              <Icon name="search" size={18} />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKey}
                placeholder="Что сделать? Например: «санитарный», «прошивка», «Корпус»"
                aria-label="Поиск команды"
              />
              <kbd>Esc</kbd>
            </div>
            <div className={s.cmdList} ref={listRef}>
              {results.length === 0 && <div className={s.cmdEmpty}>Ничего не найдено</div>}
              {results.map((c, i) => {
                const head = c.group !== lastGroup ? <div key={`g-${c.group}`} className={s.cmdGroup}>{c.group}</div> : null;
                lastGroup = c.group;
                return [
                  head,
                  <button
                    key={c.id}
                    type="button"
                    data-i={i}
                    className={`${s.cmdItem} ${i === active ? s.cmdItemOn : ''}`}
                    onMouseMove={() => setActive(i)}
                    onClick={() => run(c)}
                  >
                    {i === active && <motion.span layoutId="cmdHL" className={s.cmdHL} transition={{ duration: 0.12 }} />}
                    <span className={s.cmdIcon}>{c.iconNode || <Icon name={c.icon || 'arrow'} size={16} />}</span>
                    <span className={s.cmdLabel}>{c.label}</span>
                    {c.hint && <span className={s.cmdHint}>{c.hint}</span>}
                  </button>,
                ];
              })}
            </div>
            <div className={s.cmdFoot}>
              <span><kbd>↑</kbd><kbd>↓</kbd> выбрать</span>
              <span><kbd>Enter</kbd> выполнить</span>
              <span><kbd>Ctrl</kbd><kbd>K</kbd> открыть из любого места</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
