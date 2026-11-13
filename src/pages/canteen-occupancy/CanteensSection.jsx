import { useState } from 'react';
import styles from './CanteenOccupancy.module.scss';
import AdminIcon from './AdminIcons.jsx';

// Латиница для ID столовой: «Политех №2» -> «politeh-2»
const TR = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya', ң: 'n', ө: 'o', ү: 'u',
};
export const slugify = (s) => s.toLowerCase().split('').map((c) => TR[c] ?? c).join('')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

// Раздел «Столовые»: список, редактирование названия и вместимости, создание новой.
// canteens: [{ id, name, capacity }], devices — для подсчёта дверей
export default function CanteensSection({ theme, canteens, devices, onSave, onCreate, onOpen, onlyForm = false }) {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [id, setId] = useState('');
  const [idTouched, setIdTouched] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const tile = theme.element_first_color;
  const text = theme.text_first_color;
  const muted = theme.text_second_color;
  const field = { background: theme.background_color, color: text };

  const finalId = idTouched ? id : slugify(name);

  const create = async () => {
    const cap = Number(capacity);
    if (!name.trim()) return setError('Введите название');
    if (!cap || cap < 1) return setError('Укажите вместимость — число мест');
    if (!/^[a-z0-9-]{2,40}$/.test(finalId)) return setError('ID: только латиница, цифры и дефис');
    if (canteens.some((c) => c.id === finalId)) return setError('Столовая с таким ID уже есть');
    setError('');
    setBusy(true);
    try {
      await onCreate(finalId, { name: name.trim(), capacity: cap });
      setName(''); setCapacity(''); setId(''); setIdTouched(false);
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  return (
    <>
      {!onlyForm && canteens.map((c) => {
        const doors = devices.filter((d) => d.canteenId === c.id);
        const active = doors.filter((d) => d.approved === true).length;
        return (
          <div key={c.id} className={styles.devCard} style={{ background: tile }}>
            <div className={styles.devHead}>
              <span className={styles.devIcon} style={{ background: theme.first_color, color: '#fff' }}>
                <AdminIcon name="building" />
              </span>
              <div className={styles.devTitle}>
                <b style={{ color: text }}>{c.name || c.id}</b>
                <span style={{ color: muted }}>ID: {c.id}</span>
              </div>
              <button type="button" className={styles.roundBtn} onClick={() => onOpen(c.id)} style={{ background: theme.background_color, color: text }} aria-label="Открыть страницу">
                <AdminIcon name="arrow" size={18} />
              </button>
            </div>

            <div className={styles.devStats}>
              <div style={{ background: theme.background_color }}>
                <small style={{ color: muted }}>Мест</small>
                <b style={{ color: text }}>{c.capacity || '—'}</b>
              </div>
              <div style={{ background: theme.background_color }}>
                <small style={{ color: muted }}>Дверей</small>
                <b style={{ color: text }}>{active}{doors.length > active ? ` +${doors.length - active}` : ''}</b>
              </div>
              <div style={{ background: theme.background_color }}>
                <small style={{ color: muted }}>Ссылка</small>
                <b style={{ color: text }}>?id={c.id}</b>
              </div>
            </div>

            <div className={styles.formRow}>
              <label>
                <small style={{ color: muted }}>Название</small>
                <input
                  className={styles.devInput}
                  style={field}
                  defaultValue={c.name || ''}
                  onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== c.name) onSave(c.id, { name: v }); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                />
              </label>
              <label className={styles.formNarrow}>
                <small style={{ color: muted }}>Мест</small>
                <input
                  className={styles.devInput}
                  style={field}
                  type="number"
                  min="1"
                  inputMode="numeric"
                  defaultValue={c.capacity || ''}
                  onBlur={(e) => { const v = Number(e.target.value); if (v > 0 && v !== Number(c.capacity)) onSave(c.id, { capacity: v }); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                />
              </label>
            </div>
          </div>
        );
      })}

      {!onlyForm && <div className={styles.sectionTitle} style={{ color: text }}>Новая столовая</div>}
      <div className={styles.devCard} style={{ background: tile }}>
        <div className={styles.formRow}>
          <label>
            <small style={{ color: muted }}>Название</small>
            <input className={styles.devInput} style={field} placeholder="Например, «Политех, корпус 2»" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className={styles.formNarrow}>
            <small style={{ color: muted }}>Мест</small>
            <input className={styles.devInput} style={field} type="number" min="1" inputMode="numeric" placeholder="120" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </label>
        </div>
        <label>
          <small style={{ color: muted }}>ID (латиницей, вводится на плате в поле «ID столовой»)</small>
          <input
            className={styles.devInput}
            style={field}
            placeholder="создастся из названия"
            value={finalId}
            onChange={(e) => { setIdTouched(true); setId(e.target.value.toLowerCase()); }}
            autoCapitalize="off"
            spellCheck="false"
          />
        </label>
        {error && <div className={styles.formError}>{error}</div>}
        <button type="button" className={styles.devButton} disabled={busy} onClick={create} style={{ background: theme.first_color }}>
          <AdminIcon name="plus" size={18} />
          {busy ? 'Создаю…' : 'Создать столовую'}
        </button>
      </div>
    </>
  );
}
