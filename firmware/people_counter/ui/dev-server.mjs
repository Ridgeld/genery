// Тестовый сервер, имитирующий API ESP32, чтобы верстать интерфейс в браузере.
// Запуск: node firmware/people_counter/ui/dev-server.mjs   ->  http://localhost:5180
// ?portal=1 в адресе страницы не нужен: при старте устройство «не настроено».
// В окне Wi‑Fi пароль "wrong" имитирует ошибку, любой другой — успешное подключение.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 5180;
const H = 36;
const started = Date.now() - 2 * 3600e3 - 14 * 60e3;

const st = {
  portal: !process.env.CONNECTED,
  // CONNECTED=<имя сети> — запустить в состоянии «уже подключено»
  wifi: { connected: !!process.env.CONNECTED, ssid: process.env.CONNECTED || '', ip: process.env.CONNECTED ? '192.168.1.57' : '', rssi: -58 },
  test: { state: 'idle', msg: '' },
  server: 'genery-c83e3',
  canteen: 'main',
  count: { occupancy: 23, in: 412, out: 389, pendingIn: 3, pendingOut: 1 },
  sends: 148, lastSend: '13.11 20:41:10',
  hist: { step: 10, occ: [], rssi: [] },
};
// История для графиков
let o = 14;
for (let i = 0; i < H; i++) {
  const a = Math.random() < 0.55 ? Math.floor(Math.random() * 4) : 0;
  const b = Math.random() < 0.45 ? Math.floor(Math.random() * 3) : 0;
  o = Math.max(0, o + a - b);
  st.hist.occ.push(o);
  st.hist.rssi.push(-55 - Math.round(Math.random() * 8));
}
st.count.occupancy = o;
setInterval(() => {
  const h = st.hist;
  h.occ.push(st.count.occupancy);
  h.rssi.push(st.wifi.connected ? -54 - Math.round(Math.random() * 9) : 0);
  for (const k of ['occ', 'rssi']) if (h[k].length > H) h[k].shift();
}, 10000);

const nets = [
  { ssid: 'Dyrik', rssi: -48, lock: true, ent: false },
  { ssid: 'Canteen_Staff', rssi: -61, lock: true, ent: false },
  { ssid: 'TP-Link_5A21', rssi: -70, lock: true, ent: false },
  { ssid: 'School-EDU', rssi: -66, lock: true, ent: true },
  { ssid: 'Guest', rssi: -81, lock: false, ent: false },
];
let scanReady = 0;

const json = (res, obj) => { res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };
const body = (req) => new Promise((r) => { let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => r(new URLSearchParams(d))); });
const now = () => new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(',', '');

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const p = u.pathname;
  if (p === '/' ) { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end(await readFile(path.join(dir, 'index.html'))); }
  if (p === '/capture.html') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end(await readFile(path.join(dir, 'capture.html'))); }
  if (p === '/font.woff2') {
    try { const f = await readFile(path.join(dir, 'font.woff2')); res.writeHead(200, { 'Content-Type': 'font/woff2' }); return res.end(f); }
    catch { res.writeHead(404); return res.end(); }
  }
  if (p === '/status') {
    return json(res, { id: 'counter-9134f0', fw: '0.4.0', server: st.server, canteen: st.canteen, portal: st.portal, sim: true,
      cloud: st.wifi.connected ? { state: 'ok', msg: 'Данные приняты сервером', uid: 'mock' } : { state: 'error', msg: 'Нет Wi‑Fi', uid: '' },
      wifi: st.wifi, test: st.test, count: st.count, lastSend: st.lastSend, sends: st.sends,
      time: now(), uptime: Math.floor((Date.now() - started) / 1000), hist: st.hist });
  }
  if (p === '/scan') {
    if (process.env.CAPTURE) return json(res, { scanning: false, list: nets }); // съёмка инструкции — без ожидания
    if (u.searchParams.has('refresh') || !scanReady) { scanReady = Date.now() + 2500; return json(res, { scanning: true, list: [] }); }
    if (Date.now() < scanReady) return json(res, { scanning: true, list: [] });
    return json(res, { scanning: false, list: nets });
  }
  if (p === '/save' && req.method === 'POST') {
    const b = await body(req);
    st.test = { state: 'testing', msg: '' };
    setTimeout(() => {
      if (b.get('pass') === 'wrong') st.test = { state: 'fail', msg: 'Неверный пароль' };
      else { st.test = { state: 'ok', msg: '' }; st.wifi = { connected: true, ssid: b.get('ssid'), ip: '192.168.1.57', rssi: -52 }; }
    }, 3500);
    return json(res, { ok: true });
  }
  if (p === '/sim' && req.method === 'POST') {
    const d = Number(u.searchParams.get('d'));
    if (d > 0) { st.count.occupancy++; st.count.in++; st.count.pendingIn++; }
    else { st.count.occupancy = Math.max(0, st.count.occupancy - 1); st.count.out++; st.count.pendingOut++; }
    return json(res, { ok: true });
  }
  if (p === '/reset' && req.method === 'POST') { st.count.occupancy = 0; return json(res, { ok: true }); }
  if (p === '/api/send' && req.method === 'POST') {
    if (!st.wifi.connected) return json(res, { ok: false });
    st.count.pendingIn = st.count.pendingOut = 0; st.sends++; st.lastSend = now(); return json(res, { ok: true });
  }
  if (p === '/api/settings' && req.method === 'POST') {
    const b = await body(req);
    if (b.get('server')) st.server = b.get('server');
    if (b.get('canteen')) st.canteen = b.get('canteen');
    return json(res, { ok: true });
  }
  if (p === '/api/forget' && req.method === 'POST') { st.wifi = { connected: false, ssid: '', ip: '', rssi: 0 }; st.portal = true; st.test = { state: 'idle', msg: '' }; return json(res, { ok: true }); }
  if (p === '/api/reboot' && req.method === 'POST') return json(res, { ok: true });
  res.writeHead(404); res.end('Not found');
}).listen(PORT, () => console.log(`UI dev server: http://localhost:${PORT}`));
