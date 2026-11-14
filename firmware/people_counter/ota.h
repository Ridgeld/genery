#pragma once
/*
 * Обновление прошивки через интернет — для всех плат сразу.
 *
 * Администратор выкладывает .bin в GitHub Releases и на сайте («Управление → Прошивка»)
 * записывает в Firestore документ firmware/latest { version, url, enabled }.
 * Плата раз в час (и после включения) читает этот документ. Если версия новее своей —
 * скачивает файл по HTTPS во вторую половину памяти и перезагружается.
 *
 * Защита: новая прошивка считается рабочей только после первой успешной отправки на сервер.
 * Если этого не случилось за 15 минут или плата 3 раза подряд перезагрузилась —
 * откат на предыдущую прошивку, а версия запоминается как «плохая» и больше не ставится.
 *
 * Подключается в people_counter.ino после cloud.h.
 */
#include <Update.h>
#include "esp_ota_ops.h"
#include "mbedtls/sha256.h"

const uint32_t OTA_CHECK_PERIOD    = 60UL * 60 * 1000;   // проверка раз в час
const uint32_t OTA_CONFIRM_TIMEOUT = 15UL * 60 * 1000;   // новая прошивка должна выйти на связь за 15 мин

String   otaState = "idle";      // idle | checking | downloading | error
int      otaProgress = 0;
uint32_t otaLastCheck = 0;
bool     otaEverChecked = false;
bool     otaPendingConfirm = false;
bool     otaForceCheck = false;

// Сравнение версий вида 0.5.0: >0 если a новее b
int cmpVersion(const String &a, const String &b) {
  int pa[3] = {0, 0, 0}, pb[3] = {0, 0, 0};
  sscanf(a.c_str(), "%d.%d.%d", &pa[0], &pa[1], &pa[2]);
  sscanf(b.c_str(), "%d.%d.%d", &pb[0], &pb[1], &pb[2]);
  for (int i = 0; i < 3; i++) if (pa[i] != pb[i]) return pa[i] - pb[i];
  return 0;
}

// Значение поля документа Firestore в REST-ответе: "key": { "stringValue": "..." }
String fsField(const String &body, const char *key, const char *type) {
  int i = body.indexOf(String("\"") + key + "\"");
  if (i < 0) return "";
  int t = body.indexOf(String("\"") + type + "\"", i);
  int close = body.indexOf('}', i);
  if (t < 0 || (close >= 0 && t > close)) return "";
  return jsonStr(body.substring(t), type);
}

int httpsGet(const String &url, String &resp, const String &bearer) {
  WiFiClientSecure client;
  client.useBuiltinCACertBundle();
  HTTPClient http;
  http.setConnectTimeout(8000);
  http.setTimeout(10000);
  if (!http.begin(client, url)) { resp = "begin failed"; return -1; }
  if (bearer.length()) http.addHeader("Authorization", "Bearer " + bearer);
  int code = http.GET();
  resp = code > 0 ? http.getString() : http.errorToString(code);
  http.end();
  return code;
}

void otaRollback(const char *why) {
  Serial.printf("[ОБНОВЛЕНИЕ] Откат прошивки %s: %s\n", FW_VERSION, why);
  prefs.begin("ota", false);
  prefs.putString("bad", FW_VERSION);
  prefs.putBool("pending", false);
  prefs.putUChar("tries", 0);
  prefs.end();
  const esp_partition_t *prev = esp_ota_get_next_update_partition(NULL);
  if (prev && esp_ota_set_boot_partition(prev) == ESP_OK) {
    Serial.println("[ОБНОВЛЕНИЕ] Возвращаюсь к предыдущей прошивке, перезагрузка");
    delay(300);
    ESP.restart();
  }
  Serial.println("[ОБНОВЛЕНИЕ] Предыдущей прошивки нет — остаюсь на текущей");
}

// Вызывается в начале setup(): учёт перезагрузок после обновления
void otaBootCheck() {
  prefs.begin("ota", false);
  bool pending = prefs.getBool("pending", false);
  uint8_t tries = pending ? prefs.getUChar("tries", 0) + 1 : 0;
  if (pending) prefs.putUChar("tries", tries);
  prefs.end();
  if (!pending) return;
  if (tries > 3) { otaRollback("3 перезагрузки подряд"); return; }
  otaPendingConfirm = true;
  Serial.printf("[ОБНОВЛЕНИЕ] Новая прошивка %s, жду подтверждения связи (запуск %u)\n", FW_VERSION, tries);
}

// Вызывается после успешной отправки на сервер: новая прошивка рабочая
void otaConfirm() {
  if (!otaPendingConfirm) return;
  otaPendingConfirm = false;
  prefs.begin("ota", false);
  prefs.putBool("pending", false);
  prefs.putUChar("tries", 0);
  prefs.end();
  otaMsg = "Обновлено до " FW_VERSION;
  Serial.printf("[ОБНОВЛЕНИЕ] Прошивка %s работает, обновление подтверждено\n", FW_VERSION);
}

bool otaFail(const String &msg) {
  otaState = "error";
  otaMsg = msg;
  Serial.printf("[ОБНОВЛЕНИЕ] Ошибка: %s\n", msg.c_str());
  return false;
}

// Скачивает и ставит прошивку. sha256 (hex) — если задан, файл сверяется до перезагрузки.
bool otaInstall(const String &ver, const String &url, String sha256) {
  sha256.toLowerCase();
  Serial.printf("[ОБНОВЛЕНИЕ] Скачиваю %s: %s\n", ver.c_str(), url.c_str());
  otaState = "downloading";
  otaProgress = 0;
  otaMsg = "Загружаю версию " + ver;

  WiFiClientSecure client;
  client.useBuiltinCACertBundle();
  HTTPClient http;
  http.setFollowRedirects(HTTPC_FORCE_FOLLOW_REDIRECTS);  // GitHub отдаёт файл через перенаправление
  http.setConnectTimeout(10000);
  http.setTimeout(20000);
  if (!http.begin(client, url)) return otaFail("Неверная ссылка на прошивку");
  int code = http.GET();
  if (code != 200) { http.end(); return otaFail("Файл прошивки недоступен (" + String(code) + ")"); }
  int len = http.getSize();
  if (len <= 0) { http.end(); return otaFail("Неизвестный размер файла"); }
  if (!Update.begin(len)) { http.end(); return otaFail(String("Не хватает места: ") + Update.errorString()); }

  // Читаем по кусочкам: пишем в память, считаем SHA-256 и не даём сработать сторожевому таймеру
  mbedtls_sha256_context sha;
  mbedtls_sha256_init(&sha);
  mbedtls_sha256_starts(&sha, 0);
  WiFiClient *stream = http.getStreamPtr();
  static uint8_t buf[2048];
  size_t done = 0;
  int lastPrinted = -10;
  uint32_t lastData = millis();
  while (done < (size_t)len) {
    esp_task_wdt_reset();
    size_t avail = stream->available();
    if (!avail) {
      if (!stream->connected() || millis() - lastData > 20000) break;
      delay(2);
      continue;
    }
    int r = stream->readBytes(buf, avail > sizeof buf ? sizeof buf : avail);
    if (r <= 0) continue;
    if (Update.write(buf, r) != (size_t)r) break;
    mbedtls_sha256_update(&sha, buf, r);
    done += r;
    lastData = millis();
    otaProgress = (int)(done * 100 / len);
    if (otaProgress - lastPrinted >= 10) { lastPrinted = otaProgress; Serial.printf("[ОБНОВЛЕНИЕ] %d%%\n", otaProgress); }
  }
  http.end();
  uint8_t digest[32];
  mbedtls_sha256_finish(&sha, digest);
  mbedtls_sha256_free(&sha);
  if (done != (size_t)len) { Update.abort(); return otaFail("Загрузка прервалась"); }
  if (sha256.length()) {
    char hex[65];
    for (int i = 0; i < 32; i++) snprintf(hex + i * 2, 3, "%02x", digest[i]);
    if (sha256 != hex) { Update.abort(); return otaFail("Контрольная сумма SHA-256 не совпала — файл повреждён"); }
    Serial.println("[ОБНОВЛЕНИЕ] SHA-256 совпала");
  }
  if (!Update.end(true)) return otaFail(String("Файл повреждён: ") + Update.errorString());

  prefs.begin("ota", false);
  prefs.putBool("pending", true);
  prefs.putUChar("tries", 0);
  prefs.end();
  if (stateDirty) saveState();
  Serial.printf("[ОБНОВЛЕНИЕ] Версия %s установлена, перезагрузка\n", ver.c_str());
  delay(500);
  ESP.restart();
  return true;
}

// Проверка документа firmware/latest
void otaCheck() {
  otaLastCheck = millis();
  otaEverChecked = true;
  otaForceCheck = false;
  if (!fbEnsureToken()) return;
  otaState = "checking";

  String resp;
  int code = httpsGet("https://firestore.googleapis.com/v1/projects/" + cfgServer +
                      "/databases/(default)/documents/firmware/latest", resp, fbIdToken);
  otaState = "idle";
  if (code == 404) { otaMsg = "Установлена последняя версия"; return; }
  if (code != 200) { otaMsg = "Не удалось проверить обновления (" + String(code) + ")"; return; }

  String ver = fsField(resp, "version", "stringValue");
  String url = fsField(resp, "url", "stringValue");
  String enabled = fsField(resp, "enabled", "booleanValue");
  String sha = fsField(resp, "sha256", "stringValue");
  if (enabled == "false") { otaMsg = "Обновления приостановлены"; return; }
  if (!ver.length() || !url.startsWith("https://")) { otaMsg = "Установлена последняя версия"; return; }
  if (cmpVersion(ver, FW_VERSION) <= 0) { otaMsg = "Установлена последняя версия"; return; }

  prefs.begin("ota", true);
  String bad = prefs.getString("bad", "");
  prefs.end();
  if (bad == ver) { otaMsg = "Версия " + ver + " не прошла проверку, пропущена"; return; }

  otaInstall(ver, url, sha);
}

void otaLoop() {
  if (otaPendingConfirm && millis() > OTA_CONFIRM_TIMEOUT) {
    otaRollback("нет связи с сервером 15 минут");
    otaPendingConfirm = false;  // если откатиться некуда — работаем дальше
    return;
  }
  if (WiFi.status() != WL_CONNECTED || otaPendingConfirm || portalActive) return;
  if (cloudState != "ok" && !otaForceCheck) return;     // сначала должна заработать связь с сервером
  if (otaForceCheck || !otaEverChecked || millis() - otaLastCheck > OTA_CHECK_PERIOD) otaCheck();
}
