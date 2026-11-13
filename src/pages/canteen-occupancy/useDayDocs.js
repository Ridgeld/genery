import { useEffect, useState } from 'react';
import { collection, documentId, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { HISTORY_DAYS, daysAgoKey } from './canteenStats.js';

// Почасовая история (devices/{id}/days) указанных счётчиков за последние недели.
// Перечитывается раз в 5 минут и при смене набора счётчиков.
export default function useDayDocs(deviceIds) {
  const key = [...deviceIds].sort().join(',');
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    if (!key) { setDocs([]); return undefined; }
    let cancelled = false;
    const load = async () => {
      try {
        const from = daysAgoKey(HISTORY_DAYS);
        const parts = await Promise.all(key.split(',').map(async (id) => {
          const snap = await getDocs(query(collection(db, 'devices', id, 'days'), where(documentId(), '>=', from)));
          return snap.docs.map((d) => ({ date: d.id, ...d.data() }));
        }));
        if (!cancelled) setDocs(parts.flat());
      } catch (error) {
        console.error('Ошибка чтения истории:', error);
      }
    };
    load();
    const timer = setInterval(load, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [key]);

  return docs;
}
