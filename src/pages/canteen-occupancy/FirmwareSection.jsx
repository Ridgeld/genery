import { useState } from 'react';
import styles from './CanteenOccupancy.module.scss';
import AdminIcon from './AdminIcons.jsx';

import { C } from './themeColors.js';

const GREEN = C.ok;
const AMBER = C.warn;
const RED = C.bad;

const VERSION_RE = /^\d+\.\d+\.\d+$/;
export const cmpVersion = (a = '0.0.0', b = '0.0.0') => {
  const pa = String(a).split('.').map(Number);
  const pb = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i += 1) if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  return 0;
};

// Раздел «Прошивка»: выпуск новой версии для всех плат сразу и ход обновления.
// latest: { version, url, enabled, publishedAt } | null — документ firmware/latest
export default function FirmwareSection({ theme, latest, devices, onPublish, onToggle }) {
  const [version, setVersion] = useState('');
  const [url, setUrl] = useState('');
  const [sha, setSha] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const tile = theme.element_first_color;
  const text = theme.text_first_color;
  const muted = theme.text_second_color;
  const field = { background: theme.background_color, color: text };

  const target = latest?.version;
  const updated = target ? devices.filter((d) => cmpVersion(d.fw, target) >= 0) : [];
  const failed = target ? devices.filter((d) => cmpVersion(d.fw, target) < 0 && /не прошла|Ошибка|недоступен|повреждён|прервалась|Не хватает/i.test(d.ota || '')) : [];
  const waiting = target ? devices.filter((d) => !updated.includes(d) && !failed.includes(d)) : [];

  const publish = async () => {
    const v = version.trim();
    const u = url.trim();
    if (!VERSION_RE.test(v)) return setError('Версия в формате 0.5.1');
    if (target && cmpVersion(v, target) <= 0) return setError(`Версия должна быть новее ${target}`);
    if (!/^https:\/\/\S+\.bin(\?\S*)?$/i.test(u)) return setError('Нужна https-ссылка на файл .bin из GitHub Releases');
    const h = sha.trim().toLowerCase();
    if (h && !/^[0-9a-f]{64}$/.test(h)) return setError('SHA-256 — 64 символа 0–9 и a–f (её печатает release.ps1)');
    if (!window.confirm(`Выпустить прошивку ${v} для всех плат? Они обновятся в течение часа.`)) return undefined;
    setError('');
    setBusy(true);
    try {
      await onPublish({ version: v, url: u, sha256: h });
      setVersion(''); setUrl(''); setSha('');
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  const deviceRow = (d, color, label) => (
    <div key={d.id} className={styles.personRow}>
      <span className={styles.liveDot} style={{ background: color, width: 10, height: 10 }} />
      <div className={styles.devTitle}>
        <b style={{ color: text }}>{d.door || d.id}</b>
        <span style={{ color: muted }}>{d.ota || d.id}</span>
      </div>
      <span className={styles.devPill} style={{ color, background: 'rgba(127,127,140,.12)' }}>{label}</span>
    </div>
  );

  return (
    <>
      {latest ? (
        <div className={styles.devCard} style={{ background: tile }}>
          <div className={styles.devHead}>
            <span className={styles.devIcon} style={{ background: theme.first_color, color: '#fff' }}><AdminIcon name="chip" /></span>
            <div className={styles.devTitle}>
              <b style={{ color: text }}>Версия {latest.version}</b>
              <span style={{ color: muted }}>
                {latest.publishedAt?.toDate ? `выпущена ${latest.publishedAt.toDate().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}` : 'текущая'}
              </span>
            </div>
            <span className={styles.devPill} style={{ color: latest.enabled === false ? AMBER : GREEN, background: 'rgba(127,127,140,.12)' }}>
              <i style={{ background: latest.enabled === false ? AMBER : GREEN }} />
              {latest.enabled === false ? 'пауза' : 'раздаётся'}
            </span>
          </div>

          <div className={styles.devStats}>
            <div style={{ background: theme.background_color }}>
              <small style={{ color: muted }}>Обновлены</small>
              <b style={{ color: GREEN }}>{updated.length}</b>
            </div>
            <div style={{ background: theme.background_color }}>
              <small style={{ color: muted }}>Ожидают</small>
              <b style={{ color: text }}>{waiting.length}</b>
            </div>
            <div style={{ background: theme.background_color }}>
              <small style={{ color: muted }}>Ошибки</small>
              <b style={{ color: failed.length ? RED : text }}>{failed.length}</b>
            </div>
          </div>

          <a className={styles.linkLine} href={latest.url} target="_blank" rel="noreferrer" style={{ color: muted }}>{latest.url}</a>
          <span className={styles.linkLine} style={{ color: muted }}>{latest.sha256 ? `SHA-256: ${latest.sha256}` : 'SHA-256 не указана — файл проверяется только по целостности образа'}</span>

          <button
            type="button"
            className={styles.devButton}
            onClick={() => onToggle(latest.enabled === false)}
            style={{ background: latest.enabled === false ? theme.first_color : theme.element_second_color }}
          >
            {latest.enabled === false ? 'Продолжить обновление' : 'Приостановить обновление'}
          </button>
        </div>
      ) : (
        <div className={styles.chartCard} style={{ background: tile }}>
          <div className={styles.empty} style={{ color: muted }}>Обновления через интернет ещё не выпускались.</div>
        </div>
      )}

      {target && devices.length > 0 && (
        <>
          <div className={styles.sectionTitle} style={{ color: text }}>Платы</div>
          <div className={styles.devCard} style={{ background: tile }}>
            {failed.map((d) => deviceRow(d, RED, `v${d.fw || '?'}`))}
            {waiting.map((d) => deviceRow(d, AMBER, `v${d.fw || '?'}`))}
            {updated.map((d) => deviceRow(d, GREEN, `v${d.fw}`))}
          </div>
        </>
      )}

      <div className={styles.sectionTitle} style={{ color: text }}>Новая версия</div>
      <div className={styles.devCard} style={{ background: tile }}>
        <ol className={styles.steps} style={{ color: muted }}>
          <li>Увеличьте версию в прошивке и запустите <b style={{ color: text }}>firmware\release.ps1</b> — появится файл .bin.</li>
          <li>GitHub → Releases → новый релиз, прикрепите .bin и опубликуйте.</li>
          <li>Скопируйте ссылку на файл и вставьте ниже.</li>
        </ol>
        <div className={styles.formRow} style={{ gridTemplateColumns: '96px minmax(0, 1fr)' }}>
          <label>
            <small style={{ color: muted }}>Версия</small>
            <input className={styles.devInput} style={field} placeholder="0.5.1" value={version} onChange={(e) => setVersion(e.target.value)} inputMode="decimal" />
          </label>
          <label>
            <small style={{ color: muted }}>Ссылка на .bin</small>
            <input className={styles.devInput} style={field} placeholder="https://github.com/…/releases/download/…/people_counter-0.5.1.bin" value={url} onChange={(e) => setUrl(e.target.value)} autoCapitalize="off" spellCheck="false" />
          </label>
        </div>
        <label>
          <small style={{ color: muted }}>SHA-256 (из вывода release.ps1, по желанию — плата сверит файл перед установкой)</small>
          <input className={styles.devInput} style={field} placeholder="547e922f92547935f7512384a8db189b…" value={sha} onChange={(e) => setSha(e.target.value)} autoCapitalize="off" spellCheck="false" />
        </label>
        {error && <div className={styles.formError}>{error}</div>}
        <button type="button" className={styles.devButton} disabled={busy} onClick={publish} style={{ background: theme.first_color }}>
          <AdminIcon name="upload" size={18} />
          {busy ? 'Публикую…' : 'Выпустить для всех плат'}
        </button>
        <div className={styles.formHint} style={{ color: muted }}>
          Платы проверяют обновления раз в час и после включения. Если новая версия не выйдет на связь за 15 минут, плата сама вернётся к старой.
        </div>
      </div>
    </>
  );
}
