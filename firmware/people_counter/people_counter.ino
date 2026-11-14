/*
 * Счётчик людей — ESP32 + TOF400C (VL53L1X)
 *
 * Настройка Wi‑Fi с телефона, подсчёт по двум зонам датчика (sensor.h), почасовая очередь отправки
 * в Firestore (cloud.h), обновление через интернет (ota.h), настройки с сервера (remote.h),
 * веб-панель устройства (ui/index.html -> ui_bundle.h), сторожевой таймер.
 *
 * Как настроить (для мастера):
 *   1. Подать питание. Светодиод медленно мигает — устройство ждёт настройки.
 *   2. На телефоне подключиться к Wi‑Fi «Counter-XXXXXX» (без пароля).
 *      Страница настройки откроется сама (или откройте http://192.168.4.1).
 *   3. Выбрать сеть, ввести пароль, нажать «Подключить».
 *   4. Светодиод горит постоянно — устройство работает.
 *
 *   Сброс Wi‑Fi: удерживать кнопку BOOT 5 секунд.
 *   В новом месте: если сохранённая сеть не найдена за 60 с, портал откроется сам.
 *
 * Монитор порта (115200): + вход, - выход, s статус, r обнулить,
 *                         p открыть портал, f забыть Wi‑Fi, h помощь.
 */

#include <WiFi.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <Preferences.h>
#include <ESPmDNS.h>
#include <time.h>
#include <vector>
#include <algorithm>
#include "esp_mac.h"
#include "esp_task_wdt.h"
#include "ui_bundle.h"   // интерфейс: ui/index.html, собирается командой node ui/build.mjs

#define FW_VERSION      "0.6.1"
#define PIN_LED         2      // встроенный светодиод ESP32 DevKit
#define PIN_BUTTON      0      // кнопка BOOT
#define DEFAULT_SERVER  "genery-c83e3"
#define DEFAULT_CANTEEN "main"
#define TZ_INFO         "<+06>-6"   // UTC+6 (Бишкек)

#define WDT_TIMEOUT_MS  60000       // зависла программа дольше минуты — перезагрузка

const uint32_t FIRST_CONNECT_TIMEOUT = 60UL * 1000;      // после включения: нет сети 60 с → портал
const uint32_t LOST_CONNECT_TIMEOUT  = 5UL * 60 * 1000;  // во время работы: нет сети 5 мин → портал
const uint32_t RECONNECT_PERIOD      = 30UL * 1000;
const uint32_t PORTAL_RETRY_PERIOD   = 3UL * 60 * 1000;  // в портале иногда пробуем старую сеть
const uint32_t PORTAL_RETRY_DURATION = 20UL * 1000;
const uint32_t PORTAL_CLOSE_DELAY    = 60UL * 1000;      // после успеха портал живёт ещё минуту
const uint32_t CONNECT_TEST_TIMEOUT  = 20UL * 1000;
const uint32_t SEND_MIN_INTERVAL     = 10UL * 1000;      // не чаще раза в 10 с
const uint32_t HEARTBEAT_INTERVAL    = 5UL * 60 * 1000;  // «я жив» раз в 5 мин
const uint32_t SAVE_STATE_INTERVAL   = 30UL * 1000;      // запись в flash не чаще раза в 30 с
const uint32_t BUTTON_HOLD_RESET     = 5000;

WebServer   server(80);
DNSServer   dns;
Preferences prefs;

String deviceId, apName;
String cfgSsid, cfgPass, cfgServer, cfgCanteen;

// --- Wi‑Fi / портал ---
bool     portalActive = false;
bool     portalRetrying = false;
uint32_t portalSuccessAt = 0, lastPortalRetry = 0;
uint32_t lastConnectedAt = 0, lastReconnect = 0;
bool     everConnected = false, netServicesStarted = false;

// Проверка подключения, запущенная со страницы настройки
bool     testing = false;
uint32_t testStartedAt = 0;
String   testSsid, testPass, testServer;
String   testState = "idle", testMessage;   // idle | testing | ok | fail

volatile uint16_t lastDisconnectReason = 0;
volatile uint32_t lastDisconnectAt = 0;

String scanCache = "[]";

// --- Настройки, которые администратор меняет на сайте (читаются с сервера) ---
bool     cfgInvert = false;      // поменять вход и выход местами
uint16_t cfgThreshold = 0;       // порог срабатывания датчика, мм (0 — по калибровке пола)
uint16_t cfgDebounce = 300;      // минимальный интервал между двумя людьми, мс
uint8_t  cfgResetHour = 0;       // час ночного обнуления (рабочий день начинается в это время)
uint32_t otaRequestSeen = 0;     // последняя обработанная команда «обновить сейчас»
bool     simMode = true;         // датчика нет — проходы задаются вручную
uint32_t rawA = 0, rawB = 0;     // «сырые» срабатывания зон A и B за рабочий день (диагностика датчика)
uint16_t sensorFloorMm = 0;      // расстояние до пола по калибровке
uint16_t sensorThresholdMm = 0;  // действующий порог: ближе — в зоне кто-то есть
uint16_t sensorDistA = 0, sensorDistB = 0;   // последние измерения зон (для панели)

// --- Счётчик и очередь отправки ---
// «Внутри» считается так же, как на сайте: входы минус выходы за рабочий день (не меньше 0).
// В час ночного обнуления (cfgResetHour, UTC+6) счёт дня начинается заново.
int32_t  occupancy = 0;
uint32_t dayIn = 0, dayOut = 0;
String   curDay;                 // рабочий день, к которому относятся dayIn/dayOut
uint32_t totalIn = 0, totalOut = 0;
uint32_t pendingIn = 0, pendingOut = 0;   // сумма по корзинам (для экрана)

// Неотправленные проходы по часам: без связи они копятся с меткой часа
// и потом попадают в свои часы на графике, а не в час отправки.
struct Bucket { uint32_t hourEpoch; uint16_t in, out; };   // hourEpoch = unix-время / 3600, 0 — время неизвестно
const uint8_t MAX_BUCKETS = 72;                            // трое суток без связи
Bucket   buckets[MAX_BUCKETS];
uint8_t  bucketCount = 0;
bool     stateDirty = false;
uint32_t lastStateSave = 0;
uint32_t lastSendAt = 0, sendCount = 0;
bool     everSent = false;
String   lastSendInfo = "—";

// --- История для графиков на странице (последние 6 минут, точка каждые 10 с) ---
const uint8_t  HIST_LEN = 36;
const uint32_t HIST_STEP = 10UL * 1000;
uint16_t histOcc[HIST_LEN];
int8_t   histRssi[HIST_LEN];
uint8_t  histCount = 0, histHead = 0;     // histHead — куда писать следующую точку
uint32_t lastHistAt = 0;

// Действия, которые выполняются после ответа браузеру
bool pendingForget = false;
uint32_t rebootAt = 0;

// ======================================================================
// Утилиты
// ======================================================================

String jsonEscape(const String &s) {
  String o;
  o.reserve(s.length() + 4);
  for (size_t i = 0; i < s.length(); i++) {
    char c = s[i];
    if (c == '"' || c == '\\') { o += '\\'; o += c; }
    else if ((uint8_t)c < 0x20) { char b[8]; snprintf(b, sizeof b, "\\u%04x", c); o += b; }
    else o += c;
  }
  return o;
}

bool timeValid() { return time(nullptr) > 1700000000; }

// Рабочий день: дата с учётом часа ночного обнуления (при resetHour=2 время 01:30 ещё «вчера»)
String businessDay(time_t t) {
  t -= (time_t)cfgResetHour * 3600;
  struct tm tm;
  localtime_r(&t, &tm);
  char d[11];
  strftime(d, sizeof d, "%Y-%m-%d", &tm);
  return d;
}

int localHour(time_t t) {
  struct tm tm;
  localtime_r(&t, &tm);
  return tm.tm_hour;
}

void recountPending() {
  pendingIn = pendingOut = 0;
  for (uint8_t i = 0; i < bucketCount; i++) { pendingIn += buckets[i].in; pendingOut += buckets[i].out; }
}

void addToBucket(int dir) {
  uint32_t h = timeValid() ? (uint32_t)(time(nullptr) / 3600) : 0;
  Bucket *b = nullptr;
  for (int i = bucketCount - 1; i >= 0; i--) if (buckets[i].hourEpoch == h) { b = &buckets[i]; break; }
  if (!b) {
    if (bucketCount < MAX_BUCKETS) {
      b = &buckets[bucketCount++];
      *b = {h, 0, 0};
    } else {
      b = &buckets[MAX_BUCKETS - 1];   // буфер полон — добавляем в последнюю корзину
    }
  }
  if (dir > 0) b->in++; else b->out++;
  recountPending();
}

String timeString() {
  struct tm t;
  if (!getLocalTime(&t, 0)) return "не синхронизировано";
  char b[24];
  strftime(b, sizeof b, "%d.%m %H:%M:%S", &t);
  return b;
}

bool isFatalReason(uint16_t r) {
  switch (r) {
    case 2: case 15: case 202: case 204:          // ошибки пароля / рукопожатия
    case 201: case 210: case 211:                 // сеть не найдена / не тот тип защиты
      return true;
  }
  return false;
}

String reasonText(uint16_t r) {
  switch (r) {
    case 2: case 15: case 202: case 204: return "Неверный пароль";
    case 201: case 210:                  return "Сеть не найдена (далеко или выключена)";
    case 211:                            return "Неподходящий тип защиты сети";
  }
  return "Не удалось подключиться (код " + String(r) + ")";
}

// ======================================================================
// Хранение настроек и состояния (NVS)
// ======================================================================

void loadConfig() {
  prefs.begin("cfg", true);
  cfgSsid   = prefs.getString("ssid", "");
  cfgPass   = prefs.getString("pass", "");
  cfgServer = prefs.getString("server", DEFAULT_SERVER);
  cfgCanteen = prefs.getString("canteen", DEFAULT_CANTEEN);
  prefs.end();
}

void saveConfig() {
  prefs.begin("cfg", false);
  prefs.putString("ssid", cfgSsid);
  prefs.putString("pass", cfgPass);
  prefs.putString("server", cfgServer);
  prefs.putString("canteen", cfgCanteen);
  prefs.end();
}

void loadState() {
  prefs.begin("counter", true);
  dayIn      = prefs.getUInt("din", 0);
  dayOut     = prefs.getUInt("dout", 0);
  curDay     = prefs.getString("cday", "");
  occupancy  = dayIn > dayOut ? (int32_t)(dayIn - dayOut) : 0;
  totalIn    = prefs.getUInt("tin", 0);
  totalOut   = prefs.getUInt("tout", 0);
  bucketCount = 0;
  size_t len = prefs.getBytesLength("bk");
  if (len && len % sizeof(Bucket) == 0 && len <= sizeof(buckets)) {
    prefs.getBytes("bk", buckets, len);
    bucketCount = len / sizeof(Bucket);
  } else {
    // Переход с 0.5.x: старая очередь была без часов
    uint32_t pin = prefs.getUInt("pin", 0), pout = prefs.getUInt("pout", 0);
    if (pin || pout) { buckets[0] = {0, (uint16_t)pin, (uint16_t)pout}; bucketCount = 1; }
  }
  prefs.end();
  recountPending();

  prefs.begin("rcfg", true);
  cfgInvert      = prefs.getBool("inv", false);
  cfgThreshold   = prefs.getUShort("thr", 0);
  cfgDebounce    = prefs.getUShort("deb", 300);
  cfgResetHour   = prefs.getUChar("rst", 0);
  otaRequestSeen = prefs.getUInt("otaReq", 0);
  prefs.end();
}

void saveRemoteConfig() {
  prefs.begin("rcfg", false);
  prefs.putBool("inv", cfgInvert);
  prefs.putUShort("thr", cfgThreshold);
  prefs.putUShort("deb", cfgDebounce);
  prefs.putUChar("rst", cfgResetHour);
  prefs.putUInt("otaReq", otaRequestSeen);
  prefs.end();
}

void saveState() {
  prefs.begin("counter", false);
  prefs.putUInt("din", dayIn);
  prefs.putUInt("dout", dayOut);
  prefs.putString("cday", curDay);
  prefs.putUInt("tin", totalIn);
  prefs.putUInt("tout", totalOut);
  prefs.putBytes("bk", buckets, bucketCount * sizeof(Bucket));
  prefs.remove("pin");
  prefs.remove("pout");
  prefs.end();
  stateDirty = false;
  lastStateSave = millis();
}

String otaMsg = "";  // состояние обновления прошивки (видно на панели и на сайте)

#include "cloud.h"   // отправка в Firestore (использует настройки и утилиты выше)
#include "ota.h"     // обновление прошивки через интернет
#include "remote.h"  // настройки платы с сервера

// ======================================================================
// Счётчик
// ======================================================================

void recalcOccupancy() {
  occupancy = dayIn > dayOut ? (int32_t)(dayIn - dayOut) : 0;
}

// Новый рабочий день — счёт «внутри» начинается с нуля (как на сайте)
void rollDay() {
  if (!timeValid()) return;   // время ещё не синхронизировано
  String d = businessDay(time(nullptr));
  if (curDay == d) return;
  if (curDay.length()) Serial.printf("[СЧЁТ] Новый день %s — счёт за день начат заново\n", d.c_str());
  curDay = d;
  dayIn = dayOut = 0;
  rawA = rawB = 0;
  recalcOccupancy();
  stateDirty = true;
}

// Проход: +1 вход, -1 выход (вызывает алгоритм датчика или имитация)
void countEvent(int dir) {
  rollDay();
  if (cfgInvert) dir = -dir;          // датчик повешен «задом наперёд»
  if (dir > 0) { dayIn++; totalIn++; }
  else         { dayOut++; totalOut++; }
  addToBucket(dir);
  recalcOccupancy();
  stateDirty = true;
  Serial.printf("[СЧЁТ] %s внутри: %ld   (ждут отправки: +%lu / -%lu)\n",
                dir > 0 ? "ВХОД. " : "ВЫХОД.", (long)occupancy,
                (unsigned long)pendingIn, (unsigned long)pendingOut);
}

// Обнуляет счёт за сегодня и на плате, и на сервере
void resetCounter() {
  dayIn = dayOut = 0;
  bucketCount = 0;
  recountPending();
  recalcOccupancy();
  sentDay = "";        // следующая отправка запишет на сервер dayIn = dayOut = 0
  fbSave();
  everSent = false;    // отправить сразу
  cloudBackoff = 0;
  stateDirty = true;
  Serial.println("[СЧЁТ] Счётчик обнулён (на плате и на сервере)");
}

#include "sensor.h"  // подсчёт по двум зонам датчика VL53L1X

void historyLoop() {
  if (millis() - lastHistAt < HIST_STEP) return;
  lastHistAt = millis();
  rollDay();
  histOcc[histHead]  = (uint16_t)occupancy;
  histRssi[histHead] = WiFi.status() == WL_CONNECTED ? (int8_t)WiFi.RSSI() : 0;
  histHead = (histHead + 1) % HIST_LEN;
  if (histCount < HIST_LEN) histCount++;
}

// Массив истории в JSON, от старых точек к новым
void appendHist(String &j, const char *key, const uint16_t *u16, const int8_t *i8) {
  j += "\"";
  j += key;
  j += "\":[";
  uint8_t start = (histHead + HIST_LEN - histCount) % HIST_LEN;
  for (uint8_t i = 0; i < histCount; i++) {
    uint8_t k = (start + i) % HIST_LEN;
    if (i) j += ',';
    j += String(u16 ? (int)u16[k] : (int)i8[k]);
  }
  j += "]";
}

// ======================================================================
// Отправка на сервер (пакетами)
// ======================================================================

bool sendBatch(bool heartbeat) {
  if (WiFi.status() != WL_CONNECTED) { setCloud("error", "Нет Wi‑Fi"); return false; }

  // Фиксируем, что отправляем: корзины, появившиеся во время запроса, останутся в очереди
  uint8_t n = bucketCount;
  uint32_t inN = pendingIn, outN = pendingOut;
  uint32_t t0 = millis();
  bool ok = cloudSend(buckets, n);
  Serial.printf("[ОТПРАВКА%s] in=+%lu out=-%lu (%u ч) -> %s (%lu мс)\n", heartbeat ? " / пульс" : "",
                (unsigned long)inN, (unsigned long)outN, n, ok ? "OK" : cloudMsg.c_str(),
                (unsigned long)(millis() - t0));
  if (!ok && cloudState == "wait") {
    // Время ещё не синхронизировано — это не ошибка, пробуем снова через пару секунд
    cloudBackoff = 2000;
    cloudRetryAt = millis() + cloudBackoff;
    return false;
  }
  if (!ok) {
    // Повтор через 30 с, 1, 2, 4 мин... но не реже раза в 5 мин
    const uint32_t maxBackoff = 5UL * 60 * 1000;
    cloudBackoff = cloudBackoff ? (cloudBackoff * 2 > maxBackoff ? maxBackoff : cloudBackoff * 2) : 30UL * 1000;
    cloudRetryAt = millis() + cloudBackoff;
    return false;
  }
  // Убираем отправленные корзины
  for (uint8_t i = n; i < bucketCount; i++) buckets[i - n] = buckets[i];
  bucketCount -= n;
  recountPending();
  stateDirty = true;
  cloudBackoff = 0;
  otaConfirm();   // после обновления: связь есть — новая прошивка рабочая
  remoteConfigLoop(false);   // заодно забрать настройки с сервера (раз в 5 минут)
  sendCount++;
  everSent = true;
  lastSendAt = millis();
  lastSendInfo = timeString();
  return true;
}

void senderLoop() {
  if (WiFi.status() != WL_CONNECTED) return;  // без сети события копятся в очереди
  uint32_t now = millis();
  if (cloudBackoff && (int32_t)(now - cloudRetryAt) < 0) return;  // ждём паузу после ошибки
  bool hasData = pendingIn || pendingOut;

  if (!everSent)                                              sendBatch(!hasData);  // сразу после подключения
  else if (hasData && now - lastSendAt >= SEND_MIN_INTERVAL)  sendBatch(false);
  else if (!hasData && now - lastSendAt >= HEARTBEAT_INTERVAL) sendBatch(true);
}

// ======================================================================
// Wi‑Fi и портал настройки
// ======================================================================

void onWiFiEvent(WiFiEvent_t event, WiFiEventInfo_t info) {
  if (event == ARDUINO_EVENT_WIFI_STA_DISCONNECTED) {
    lastDisconnectReason = info.wifi_sta_disconnected.reason;
    lastDisconnectAt = millis();
  }
}

void startPortal(const char *reason) {
  Serial.printf("[ПОРТАЛ] Открываю точку доступа \"%s\" (%s)\n", apName.c_str(), reason);
  Serial.println("         Подключитесь к ней с телефона: страница настройки откроется сама");
  Serial.println("         (или откройте http://192.168.4.1)");
  WiFi.disconnect(false);
  WiFi.mode(WIFI_AP_STA);
  WiFi.softAP(apName.c_str());
  delay(100);
  dns.setErrorReplyCode(DNSReplyCode::NoError);
  dns.start(53, "*", WiFi.softAPIP());
  portalActive = true;
  portalRetrying = false;
  portalSuccessAt = 0;
  lastPortalRetry = millis();
  testState = "idle";
  WiFi.scanNetworks(true);
}

void stopPortal() {
  Serial.println("[ПОРТАЛ] Настройка завершена, точка доступа выключена");
  dns.stop();
  WiFi.softAPdisconnect(true);
  WiFi.mode(WIFI_STA);
  portalActive = false;
  testState = "idle";
}

void forgetWifi() {
  Serial.println("[WIFI] Сохранённая сеть удалена");
  cfgSsid = "";
  cfgPass = "";
  saveConfig();
  WiFi.disconnect(false, true);
  everConnected = false;
  startPortal("сброс настроек");
}

void startNetServices() {
  netServicesStarted = true;
  configTzTime(TZ_INFO, "pool.ntp.org", "time.google.com");
  if (MDNS.begin(deviceId.c_str())) MDNS.addService("http", "tcp", 80);
  Serial.printf("[WIFI] Сервисная страница: http://%s  или  http://%s.local\n",
                WiFi.localIP().toString().c_str(), deviceId.c_str());
}

void wifiLoop() {
  uint32_t now = millis();
  bool connected = WiFi.status() == WL_CONNECTED;

  // --- Проверка сети, введённой на странице настройки ---
  if (testing) {
    if (connected) {
      testing = false;
      testState = "ok";
      testMessage = WiFi.localIP().toString();
      cfgSsid = testSsid; cfgPass = testPass; cfgServer = testServer;
      saveConfig();
      Serial.printf("[WIFI] Подключено к \"%s\", IP %s. Настройки сохранены\n",
                    cfgSsid.c_str(), testMessage.c_str());
    } else if (lastDisconnectAt > testStartedAt && isFatalReason(lastDisconnectReason)) {
      testing = false;
      testState = "fail";
      testMessage = reasonText(lastDisconnectReason);
      WiFi.disconnect(false);
      Serial.printf("[WIFI] Ошибка подключения к \"%s\": %s\n", testSsid.c_str(), testMessage.c_str());
    } else if (now - testStartedAt > CONNECT_TEST_TIMEOUT) {
      testing = false;
      testState = "fail";
      testMessage = lastDisconnectAt > testStartedAt ? reasonText(lastDisconnectReason)
                                                     : String("Роутер не отвечает");
      WiFi.disconnect(false);
      Serial.printf("[WIFI] Тайм-аут подключения к \"%s\"\n", testSsid.c_str());
    }
  }

  if (connected) {
    if (!everConnected) Serial.printf("[WIFI] В сети \"%s\", IP %s, сигнал %d дБм\n",
                                      WiFi.SSID().c_str(), WiFi.localIP().toString().c_str(), WiFi.RSSI());
    lastConnectedAt = now;
    everConnected = true;
    portalRetrying = false;
    if (!netServicesStarted) startNetServices();
    if (portalActive && !testing) {
      if (!portalSuccessAt) portalSuccessAt = now;
      else if (now - portalSuccessAt > PORTAL_CLOSE_DELAY) stopPortal();
    }
    return;
  }

  // --- Сети нет ---
  if (portalActive) {
    portalSuccessAt = 0;
    if (portalRetrying && now - lastPortalRetry > PORTAL_RETRY_DURATION) {
      portalRetrying = false;
      WiFi.disconnect(false);          // не мешаем телефону, который настраивает устройство
    }
    if (!testing && !portalRetrying && cfgSsid.length() &&
        WiFi.softAPgetStationNum() == 0 && now - lastPortalRetry > PORTAL_RETRY_PERIOD) {
      lastPortalRetry = now;
      portalRetrying = true;
      Serial.printf("[WIFI] Пробую снова сохранённую сеть \"%s\"...\n", cfgSsid.c_str());
      WiFi.begin(cfgSsid.c_str(), cfgPass.c_str());
    }
    return;
  }

  if (cfgSsid.isEmpty()) { startPortal("сеть ещё не настроена"); return; }

  uint32_t limit = everConnected ? LOST_CONNECT_TIMEOUT : FIRST_CONNECT_TIMEOUT;
  if (now - lastConnectedAt > limit) {
    startPortal(everConnected ? "связь потеряна надолго" : "сохранённая сеть не найдена");
    return;
  }
  if (now - lastReconnect > RECONNECT_PERIOD) {
    lastReconnect = now;
    Serial.printf("[WIFI] Нет связи, переподключаюсь к \"%s\"...\n", cfgSsid.c_str());
    WiFi.begin(cfgSsid.c_str(), cfgPass.c_str());
  }
}

// ======================================================================
// Веб-сервер
// ======================================================================

String buildScanJson(int n) {
  std::vector<int> idx;
  for (int i = 0; i < n; i++) idx.push_back(i);
  std::sort(idx.begin(), idx.end(), [](int a, int b) { return WiFi.RSSI(a) > WiFi.RSSI(b); });

  std::vector<String> seen;
  String out = "[";
  int added = 0;
  for (int i : idx) {
    String s = WiFi.SSID(i);
    if (!s.length() || std::find(seen.begin(), seen.end(), s) != seen.end()) continue;
    seen.push_back(s);
    wifi_auth_mode_t a = WiFi.encryptionType(i);
    bool ent = a == WIFI_AUTH_WPA2_ENTERPRISE || a == WIFI_AUTH_WPA3_ENTERPRISE ||
               a == WIFI_AUTH_WPA2_WPA3_ENTERPRISE;
    if (added) out += ',';
    out += "{\"ssid\":\"" + jsonEscape(s) + "\",\"rssi\":" + String(WiFi.RSSI(i)) +
           ",\"lock\":" + (a == WIFI_AUTH_OPEN ? "false" : "true") +
           ",\"ent\":" + (ent ? "true" : "false") + "}";
    if (++added >= 20) break;
  }
  return out + "]";
}

void handleScan() {
  if (server.hasArg("refresh")) {
    WiFi.scanDelete();
    WiFi.scanNetworks(true);
    server.send(200, "application/json", "{\"scanning\":true,\"list\":[]}");
    return;
  }
  int n = WiFi.scanComplete();
  bool scanning = true;
  if (n == WIFI_SCAN_FAILED) WiFi.scanNetworks(true);   // скан не запущен — запускаем
  else if (n >= 0) {
    scanCache = buildScanJson(n);
    WiFi.scanDelete();
    scanning = false;
  }
  server.send(200, "application/json",
              String("{\"scanning\":") + (scanning ? "true" : "false") + ",\"list\":" + scanCache + "}");
}

void handleSave() {
  String ssid = server.arg("ssid");
  ssid.trim();
  if (!ssid.length()) { server.send(400, "application/json", "{\"ok\":false}"); return; }

  testSsid = ssid;
  testPass = server.arg("pass");
  testServer = server.arg("server");
  testServer.trim();
  if (!testServer.length()) testServer = cfgServer;

  Serial.printf("[ПОРТАЛ] Получены настройки, проверяю сеть \"%s\"...\n", testSsid.c_str());
  WiFi.disconnect(false);
  portalRetrying = false;
  lastDisconnectReason = 0;
  testStartedAt = millis();
  testing = true;
  testState = "testing";
  WiFi.begin(testSsid.c_str(), testPass.c_str());
  server.send(200, "application/json", "{\"ok\":true}");
}

void handleStatus() {
  bool c = WiFi.status() == WL_CONNECTED;
  String j = "{";
  j += "\"id\":\"" + deviceId + "\",\"fw\":\"" FW_VERSION "\",";
  j += "\"server\":\"" + jsonEscape(cfgServer) + "\",\"canteen\":\"" + jsonEscape(cfgCanteen) + "\",";
  j += "\"cloud\":{\"state\":\"" + cloudState + "\",\"msg\":\"" + jsonEscape(cloudMsg) + "\",\"uid\":\"" + fbUid + "\"},";
  j += "\"ota\":{\"state\":\"" + otaState + "\",\"msg\":\"" + jsonEscape(otaMsg) + "\",\"progress\":" + String(otaProgress) + "},";
  j += String("\"portal\":") + (portalActive ? "true" : "false") + ",";
  j += String("\"sim\":") + (simMode ? "true" : "false") + ",";
  j += "\"sensor\":{\"present\":" + String(simMode ? "false" : "true") + ",\"a\":" + String(sensorDistA) +
       ",\"b\":" + String(sensorDistB) + ",\"floor\":" + String(sensorFloorMm) + ",\"threshold\":" + String(sensorThresholdMm) +
       ",\"rawA\":" + String(rawA) + ",\"rawB\":" + String(rawB) + ",\"invert\":" + (cfgInvert ? "true" : "false") +
       ",\"debounce\":" + String(cfgDebounce) + ",\"resetHour\":" + String(cfgResetHour) +
       ",\"cfgThreshold\":" + String(cfgThreshold) + "},";
  j += String("\"wifi\":{\"connected\":") + (c ? "true" : "false") +
       ",\"ssid\":\"" + jsonEscape(c ? WiFi.SSID() : cfgSsid) + "\"" +
       ",\"ip\":\"" + (c ? WiFi.localIP().toString() : String("")) + "\"" +
       ",\"rssi\":" + String(c ? WiFi.RSSI() : 0) + "},";
  j += "\"test\":{\"state\":\"" + testState + "\",\"msg\":\"" + jsonEscape(testMessage) + "\"},";
  j += "\"count\":{\"occupancy\":" + String(occupancy) + ",\"in\":" + String(totalIn) +
       ",\"out\":" + String(totalOut) + ",\"pendingIn\":" + String(pendingIn) +
       ",\"pendingOut\":" + String(pendingOut) + "},";
  j += "\"lastSend\":\"" + jsonEscape(lastSendInfo) + "\",\"sends\":" + String(sendCount) + ",";
  j += "\"time\":\"" + timeString() + "\",\"uptime\":" + String(millis() / 1000) + ",";
  j += "\"hist\":{\"step\":" + String(HIST_STEP / 1000) + ",";
  appendHist(j, "occ", histOcc, nullptr);   j += ',';
  appendHist(j, "rssi", nullptr, histRssi);
  j += "}}";
  server.sendHeader("Cache-Control", "no-store");
  server.send(200, "application/json", j);
}

// Одна страница на всё: и настройка Wi‑Fi, и панель устройства
void handleRoot() {
  server.sendHeader("Cache-Control", "no-store");
  server.sendHeader("Content-Encoding", "gzip");
  server.send_P(200, "text/html; charset=utf-8", (const char *)INDEX_HTML_GZ, INDEX_HTML_GZ_LEN);
}

void handleFont() {
#ifdef HAS_UI_FONT
  server.sendHeader("Cache-Control", "public, max-age=31536000");
  server.send_P(200, "font/woff2", (const char *)FONT_WOFF2, FONT_WOFF2_LEN);
#else
  server.send(404, "text/plain", "");
#endif
}

void sendOk(bool ok = true) {
  server.send(200, "application/json", ok ? "{\"ok\":true}" : "{\"ok\":false}");
}

void handleNotFound() {
  // Любой адрес в режиме портала ведёт на страницу настройки —
  // так телефон сам показывает её после подключения к точке
  if (portalActive) {
    server.sendHeader("Location", "http://" + WiFi.softAPIP().toString() + "/", true);
    server.send(302, "text/plain", "");
    return;
  }
  server.send(404, "text/plain", "Not found");
}

void setupWeb() {
  server.on("/", HTTP_GET, handleRoot);
  server.on("/scan", HTTP_GET, handleScan);
  server.on("/save", HTTP_POST, handleSave);
  server.on("/status", HTTP_GET, handleStatus);
  server.on("/font.woff2", HTTP_GET, handleFont);
  server.on("/sim", HTTP_POST, []() {
    if (simMode) countEvent(server.arg("d").toInt() >= 0 ? 1 : -1);
    sendOk();
  });
  server.on("/reset", HTTP_POST, []() { resetCounter(); sendOk(); });
  server.on("/api/send", HTTP_POST, []() { sendOk(sendBatch(!(pendingIn || pendingOut))); });
  server.on("/api/settings", HTTP_POST, []() {
    String s = server.arg("server"), c = server.arg("canteen");
    s.trim();
    c.trim();
    bool changed = false;
    if (s.length() && s != cfgServer) {
      cfgServer = s;
      fbForget();                       // другой проект — нужен новый вход
      changed = true;
    }
    if (c.length() && c != cfgCanteen) { cfgCanteen = c; changed = true; }
    if (changed) {
      saveConfig();
      everSent = false;                 // сразу сообщить серверу новые настройки
      cloudBackoff = 0;
      Serial.printf("[НАСТРОЙКИ] Проект: %s, столовая: %s\n", cfgServer.c_str(), cfgCanteen.c_str());
    }
    sendOk(true);
  });
  server.on("/api/forget", HTTP_POST, []() { sendOk(); pendingForget = true; });
  server.on("/api/ota-check", HTTP_POST, []() { otaForceCheck = true; sendOk(); });
  // Настройка датчика на месте установки (действует, пока администратор не поменяет её на сайте)
  server.on("/api/sensor", HTTP_POST, []() {
    if (server.hasArg("invert"))    cfgInvert = server.arg("invert") == "1";
    if (server.hasArg("threshold")) cfgThreshold = constrain(server.arg("threshold").toInt(), 0, 4000);
    if (server.hasArg("debounce"))  cfgDebounce = constrain(server.arg("debounce").toInt(), 0, 5000);
    saveRemoteConfig();
    everSent = false;   // сразу сообщить серверу действующие настройки
    Serial.printf("[НАСТРОЙКИ] С панели платы: инверсия %s, порог %u мм, антидребезг %u мс\n",
                  cfgInvert ? "да" : "нет", cfgThreshold, cfgDebounce);
    sendOk();
  });
  server.on("/api/calibrate", HTTP_POST, []() {
    if (simMode) { sendOk(false); return; }
    bool ok = sensorCalibrate();
    everSent = false;
    sendOk(ok);
  });
  server.on("/api/reboot", HTTP_POST, []() {
    sendOk();
    Serial.println("[НАСТРОЙКИ] Перезагрузка по команде со страницы");
    rebootAt = millis() + 500;
  });
  server.onNotFound(handleNotFound);
  server.begin();
}

// ======================================================================
// Светодиод, кнопка, монитор порта
// ======================================================================

void ledLoop() {
  uint32_t t = millis();
  bool on;
  if (portalActive)                        on = (t / 500) % 2;  // медленно мигает — ждёт настройки
  else if (WiFi.status() != WL_CONNECTED)  on = (t / 100) % 2;  // быстро мигает — подключается
  else                                     on = true;           // горит — всё работает
  digitalWrite(PIN_LED, on);
}

void printStatus() {
  if (WiFi.status() == WL_CONNECTED)
    Serial.printf("[СТАТУС] Wi‑Fi: \"%s\", IP %s, сигнал %d дБм\n",
                  WiFi.SSID().c_str(), WiFi.localIP().toString().c_str(), WiFi.RSSI());
  else
    Serial.printf("[СТАТУС] Wi‑Fi: нет связи%s\n", portalActive ? " (открыт портал настройки)" : "");
  Serial.printf("         Внутри: %ld, вошло: %lu, вышло: %lu, ждут отправки: +%lu / -%lu\n",
                (long)occupancy, (unsigned long)totalIn, (unsigned long)totalOut,
                (unsigned long)pendingIn, (unsigned long)pendingOut);
  Serial.printf("         Отправок: %lu, последняя: %s, время: %s\n",
                (unsigned long)sendCount, lastSendInfo.c_str(), timeString().c_str());
}

void printHelp() {
  Serial.println("Команды: + вход | - выход | s статус | r обнулить | p портал | f забыть Wi‑Fi | h помощь");
}

void buttonLoop() {
  static uint32_t pressedAt = 0;
  static bool handled = false;
  bool down = digitalRead(PIN_BUTTON) == LOW;
  if (down) {
    if (!pressedAt) { pressedAt = millis(); handled = false; }
    else if (!handled && millis() - pressedAt >= BUTTON_HOLD_RESET) { handled = true; forgetWifi(); }
  } else {
    if (pressedAt && !handled && millis() - pressedAt > 50) printStatus();
    pressedAt = 0;
  }
}

void serialLoop() {
  while (Serial.available()) {
    switch (Serial.read()) {
      case '+': countEvent(+1); break;
      case '-': countEvent(-1); break;
      case 's': printStatus(); break;
      case 'r': resetCounter(); break;
      case 'p': if (!portalActive) startPortal("команда из монитора порта"); break;
      case 'f': forgetWifi(); break;
      case 'h': case '?': printHelp(); break;
    }
  }
}

// ======================================================================

void setup() {
  Serial.begin(115200);
  delay(300);
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_BUTTON, INPUT_PULLUP);

  uint8_t mac[6];
  esp_read_mac(mac, ESP_MAC_WIFI_STA);
  char suffix[8];
  snprintf(suffix, sizeof suffix, "%02X%02X%02X", mac[3], mac[4], mac[5]);
  apName = String("Counter-") + suffix;
  deviceId = String("counter-") + suffix;
  deviceId.toLowerCase();

  Serial.printf("\n=== Счётчик людей %s, прошивка %s ===\n", deviceId.c_str(), FW_VERSION);

  // Сторожевой таймер: если программа зависнет больше чем на минуту — перезагрузка
  esp_task_wdt_config_t wdtCfg = { .timeout_ms = WDT_TIMEOUT_MS, .idle_core_mask = 0, .trigger_panic = true };
  if (esp_task_wdt_reconfigure(&wdtCfg) != ESP_OK) esp_task_wdt_init(&wdtCfg);
  esp_task_wdt_add(NULL);

  loadConfig();
  loadState();
  loadSeenRemote();
  fbLoad();
  otaBootCheck();

  simMode = !sensorBegin();
  if (simMode) Serial.println("[ДАТЧИК] Не найден — режим ИМИТАЦИИ (проходы вводятся вручную)");
  Serial.printf("Восстановлено: внутри %ld, ждут отправки +%lu / -%lu\n",
                (long)occupancy, (unsigned long)pendingIn, (unsigned long)pendingOut);

  WiFi.persistent(false);
  WiFi.onEvent(onWiFiEvent);
  WiFi.setHostname(deviceId.c_str());
  WiFi.setAutoReconnect(true);
  lastConnectedAt = millis();

  if (cfgSsid.length()) {
    Serial.printf("[WIFI] Подключаюсь к сохранённой сети \"%s\"...\n", cfgSsid.c_str());
    WiFi.mode(WIFI_STA);
    WiFi.begin(cfgSsid.c_str(), cfgPass.c_str());
    lastReconnect = millis();
  } else {
    startPortal("сеть ещё не настроена");
  }

  setupWeb();
  printHelp();
}

void loop() {
  esp_task_wdt_reset();
  sensorLoop();
  if (portalActive) dns.processNextRequest();
  server.handleClient();
  serialLoop();
  buttonLoop();
  wifiLoop();
  senderLoop();
  otaLoop();
  historyLoop();
  ledLoop();
  if (stateDirty && millis() - lastStateSave > SAVE_STATE_INTERVAL) saveState();
  if (pendingForget) { pendingForget = false; forgetWifi(); }
  if (rebootAt && (int32_t)(millis() - rebootAt) >= 0) { if (stateDirty) saveState(); ESP.restart(); }
  delay(2);
}
