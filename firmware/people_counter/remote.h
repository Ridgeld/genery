#pragma once
/*
 * Настройки платы с сервера — без перепрошивки.
 * Администратор меняет их на сайте («Управление → столовая → счётчик → Настройки датчика»),
 * они лежат в документе devices/{id}:
 *   invert      (bool)  — поменять вход и выход местами
 *   threshold   (int)   — порог срабатывания, мм (0 — по калибровке пола)
 *   debounceMs  (int)   — минимальный интервал между двумя людьми, мс
 *   resetHour   (int)   — час ночного обнуления (берётся из настроек столовой)
 *   otaRequest  (int)   — метка «обновить эту плату сейчас»
 * Те же настройки датчика мастер может поменять на панели самой платы. Чтобы сайт не затирал
 * их каждые 5 минут, значение с сервера применяется только когда оно ИЗМЕНИЛОСЬ на сервере
 * (последнее увиденное хранится в NVS). Действующие значения плата сообщает в effInvert/effThreshold/effDebounce.
 * Подключается в people_counter.ino после ota.h.
 */

const uint32_t REMOTE_CONFIG_PERIOD = 5UL * 60 * 1000;
uint32_t remoteConfigAt = 0;
bool     remoteConfigEver = false;
String   remoteConfigMsg = "ещё не загружены";

// Последние значения, увиденные на сервере (-1 — ещё не видели)
int32_t seenInvert = -1, seenThreshold = -1, seenDebounce = -1;

void loadSeenRemote() {
  prefs.begin("rseen", true);
  seenInvert = prefs.getInt("inv", -1);
  seenThreshold = prefs.getInt("thr", -1);
  seenDebounce = prefs.getInt("deb", -1);
  prefs.end();
}

void saveSeenRemote() {
  prefs.begin("rseen", false);
  prefs.putInt("inv", seenInvert);
  prefs.putInt("thr", seenThreshold);
  prefs.putInt("deb", seenDebounce);
  prefs.end();
}

void remoteConfigLoop(bool force) {
  if (!force && remoteConfigEver && millis() - remoteConfigAt < REMOTE_CONFIG_PERIOD) return;
  remoteConfigAt = millis();
  remoteConfigEver = true;
  if (!fbEnsureToken()) return;

  String resp;
  int code = httpsGet("https://firestore.googleapis.com/v1/projects/" + cfgServer +
                      "/databases/(default)/documents/devices/" + deviceId, resp, fbIdToken);
  if (code != 200) { remoteConfigMsg = "не удалось загрузить (" + String(code) + ")"; return; }

  bool changed = false, seenChanged = false;
  String v;
  // Настройки датчика: применяем, только если администратор поменял их на сайте
  v = fsField(resp, "invert", "booleanValue");
  if (v.length()) {
    int32_t r = v == "true" ? 1 : 0;
    if (r != seenInvert) { seenInvert = r; seenChanged = true; if ((bool)r != cfgInvert) { cfgInvert = r; changed = true; } }
  }
  v = fsField(resp, "threshold", "integerValue");
  if (v.length()) {
    int32_t r = constrain(v.toInt(), 0, 4000);
    if (r != seenThreshold) { seenThreshold = r; seenChanged = true; if (r != cfgThreshold) { cfgThreshold = r; changed = true; } }
  }
  v = fsField(resp, "debounceMs", "integerValue");
  if (v.length()) {
    int32_t r = constrain(v.toInt(), 0, 5000);
    if (r != seenDebounce) { seenDebounce = r; seenChanged = true; if (r != cfgDebounce) { cfgDebounce = r; changed = true; } }
  }
  // Час обнуления и команды — всегда с сервера
  v = fsField(resp, "resetHour", "integerValue");
  if (v.length() && (uint8_t)v.toInt() != cfgResetHour) { cfgResetHour = constrain(v.toInt(), 0, 23); changed = true; }
  v = fsField(resp, "otaRequest", "integerValue");
  if (v.length() && (uint32_t)v.toInt() > otaRequestSeen) {
    otaRequestSeen = v.toInt();
    otaForceCheck = true;               // администратор нажал «Обновить эту плату»
    changed = true;
    Serial.println("[НАСТРОЙКИ] Команда с сайта: проверить обновление");
  }

  remoteConfigMsg = "загружены " + timeString();
  if (seenChanged) saveSeenRemote();
  if (changed) {
    saveRemoteConfig();
    Serial.printf("[НАСТРОЙКИ] С сервера: инверсия %s, порог %u мм, антидребезг %u мс, сброс в %02u:00\n",
                  cfgInvert ? "да" : "нет", cfgThreshold, cfgDebounce, cfgResetHour);
  }
}
