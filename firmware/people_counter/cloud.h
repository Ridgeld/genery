#pragma once
/*
 * Отправка данных в Firestore.
 *
 * 1. Устройство входит в Firebase анонимно (у каждой платы свой uid, без паролей).
 *    Токен обновления хранится в NVS, поэтому uid не меняется после перезагрузки.
 * 2. Одним запросом documents:commit пишет:
 *      devices/{deviceId}            — живое состояние: dayIn/dayOut за сегодня, totalIn/totalOut,
 *                                      lastSeen, rssi, ip, fw, canteenId
 *      devices/{deviceId}/days/{дата} — почасовая статистика in.hHH / out.hHH (для графиков сайта)
 *    Счётчики меняются атомарным increment, поэтому несколько дверей не мешают друг другу.
 * 3. Сайт складывает dayIn - dayOut всех одобренных устройств столовой.
 *
 * Подключается в people_counter.ino после объявления глобальных переменных.
 */
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include "firebase_config.h"

String   cloudState = "wait";          // wait | ok | error | auth
String   cloudMsg   = "Ожидание первой отправки";
String   fbUid, fbRefresh, fbIdToken;
uint32_t fbTokenExp = 0;
uint32_t cloudRetryAt = 0, cloudBackoff = 0;
String   sentDay;                       // дата, за которую сервер уже знает dayIn/dayOut

void setCloud(const char *state, const String &msg) {
  cloudState = state;
  cloudMsg = msg;
}

void fbLoad() {
  prefs.begin("fb", true);
  fbUid     = prefs.getString("uid", "");
  fbRefresh = prefs.getString("refresh", "");
  sentDay   = prefs.getString("day", "");
  prefs.end();
}

void fbSave() {
  prefs.begin("fb", false);
  prefs.putString("uid", fbUid);
  prefs.putString("refresh", fbRefresh);
  prefs.putString("day", sentDay);
  prefs.end();
}

// Сбросить вход (например, при смене проекта)
void fbForget() {
  fbUid = fbRefresh = fbIdToken = sentDay = "";
  fbTokenExp = 0;
  fbSave();
}

// Достаёт значение ключа из простого JSON-ответа (без вложенных кавычек)
String jsonStr(const String &body, const char *key) {
  String k = String("\"") + key + "\"";
  int i = body.indexOf(k);
  if (i < 0) return "";
  i = body.indexOf(':', i + k.length());
  if (i < 0) return "";
  i++;
  while (i < (int)body.length() && isspace((unsigned char)body[i])) i++;
  if (i < (int)body.length() && body[i] == '"') {
    int e = body.indexOf('"', i + 1);
    return e < 0 ? "" : body.substring(i + 1, e);
  }
  int e = i;
  while (e < (int)body.length() && body[e] != ',' && body[e] != '}' && !isspace((unsigned char)body[e])) e++;
  return body.substring(i, e);
}

int httpsPost(const String &url, const String &body, const char *contentType, String &resp,
              const String &bearer = "") {
  WiFiClientSecure client;
  client.useBuiltinCACertBundle();     // встроенные корневые сертификаты — соединение проверяется
  HTTPClient http;
  http.setConnectTimeout(8000);
  http.setTimeout(10000);
  if (!http.begin(client, url)) { resp = "begin failed"; return -1; }
  http.addHeader("Content-Type", contentType);
  if (bearer.length()) http.addHeader("Authorization", "Bearer " + bearer);
  int code = http.POST(body);
  resp = code > 0 ? http.getString() : http.errorToString(code);
  http.end();
  return code;
}

bool fbEnsureToken() {
  if (fbIdToken.length() && (int32_t)(fbTokenExp - millis()) > 0) return true;
  String resp;
  int code;

  if (fbRefresh.length()) {
    code = httpsPost("https://securetoken.googleapis.com/v1/token?key=" FIREBASE_API_KEY,
                     "grant_type=refresh_token&refresh_token=" + fbRefresh,
                     "application/x-www-form-urlencoded", resp);
    if (code == 200) {
      fbIdToken  = jsonStr(resp, "id_token");
      fbRefresh  = jsonStr(resp, "refresh_token");
      fbUid      = jsonStr(resp, "user_id");
      fbTokenExp = millis() + (uint32_t)max(60L, jsonStr(resp, "expires_in").toInt() - 300) * 1000UL;
      fbSave();
      return true;
    }
    Serial.printf("[СЕРВЕР] Не удалось обновить вход (%d): %s\n", code, jsonStr(resp, "message").c_str());
    if (code != 400) { setCloud("error", "Нет связи с Firebase (" + String(code) + ")"); return false; }
    fbRefresh = "";    // токен недействителен — регистрируемся заново
  }

  code = httpsPost("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" FIREBASE_API_KEY,
                   "{\"returnSecureToken\":true}", "application/json", resp);
  if (code != 200) {
    String m = jsonStr(resp, "message");
    Serial.printf("[СЕРВЕР] Ошибка анонимного входа (%d): %s\n", code, m.c_str());
    if (m.indexOf("ADMIN_ONLY_OPERATION") >= 0 || m.indexOf("OPERATION_NOT_ALLOWED") >= 0)
      setCloud("auth", "В Firebase не включён анонимный вход");
    else
      setCloud("auth", "Ошибка входа в Firebase: " + (m.length() ? m : String(code)));
    return false;
  }
  fbIdToken  = jsonStr(resp, "idToken");
  fbRefresh  = jsonStr(resp, "refreshToken");
  fbUid      = jsonStr(resp, "localId");
  fbTokenExp = millis() + (uint32_t)max(60L, jsonStr(resp, "expiresIn").toInt() - 300) * 1000UL;
  fbSave();
  Serial.printf("[СЕРВЕР] Устройство зарегистрировано в Firebase, uid %s\n", fbUid.c_str());
  return true;
}

String fsStr(const String &v) { return "{\"stringValue\":\"" + jsonEscape(v) + "\"}"; }
String fsInt(long v)          { return "{\"integerValue\":\"" + String(v) + "\"}"; }
String fsBool(bool v)         { return String("{\"booleanValue\":") + (v ? "true" : "false") + "}"; }
String fsInc(const String &path, long v) {
  return "{\"fieldPath\":\"" + path + "\",\"increment\":" + fsInt(v) + "}";
}

// Отправляет накопленные события. true — сервер принял.
bool cloudSend(uint32_t inN, uint32_t outN) {
  struct tm t;
  if (!getLocalTime(&t, 0)) { setCloud("wait", "Жду синхронизации времени"); return false; }
  if (!fbEnsureToken()) return false;

  char day[11], hourKey[4];
  strftime(day, sizeof day, "%Y-%m-%d", &t);
  snprintf(hourKey, sizeof hourKey, "h%02d", t.tm_hour);
  bool newDay = sentDay != day;
  String base = "projects/" + cfgServer + "/databases/(default)/documents";
  String devPath = base + "/devices/" + deviceId;

  // --- devices/{id}: живое состояние ---
  // Столовую (canteenId) назначает администратор на сайте. Плата лишь подсказывает,
  // какую столовую ввёл мастер при установке (canteenRequested).
  String fields = "\"uid\":" + fsStr(fbUid) + ",\"canteenRequested\":" + fsStr(cfgCanteen) +
                  ",\"fw\":" + fsStr(FW_VERSION) + ",\"ip\":" + fsStr(WiFi.localIP().toString()) +
                  ",\"rssi\":" + fsInt(WiFi.RSSI()) + ",\"sim\":" + fsBool(SIMULATE_SENSOR) +
                  ",\"day\":" + fsStr(day) + ",\"ota\":" + fsStr(otaMsg);
  String mask = "\"uid\",\"canteenRequested\",\"fw\",\"ip\",\"rssi\",\"sim\",\"day\",\"ota\"";
  String tr = "{\"fieldPath\":\"lastSeen\",\"setToServerValue\":\"REQUEST_TIME\"}";
  if (newDay) {
    // Первая отправка за день: счётчики дня начинаются заново
    fields += ",\"dayIn\":" + fsInt(inN) + ",\"dayOut\":" + fsInt(outN);
    mask += ",\"dayIn\",\"dayOut\"";
  } else {
    if (inN)  tr += "," + fsInc("dayIn", inN);
    if (outN) tr += "," + fsInc("dayOut", outN);
  }
  if (inN)  tr += "," + fsInc("totalIn", inN);
  if (outN) tr += "," + fsInc("totalOut", outN);

  String writes = "{\"update\":{\"name\":\"" + devPath + "\",\"fields\":{" + fields + "}}," +
                  "\"updateMask\":{\"fieldPaths\":[" + mask + "]},\"updateTransforms\":[" + tr + "]}";

  // --- devices/{id}/days/{дата}: почасовая статистика ---
  if (inN || outN) {
    String dtr;
    if (inN)  dtr += fsInc(String("in.") + hourKey, inN);
    if (outN) dtr += (dtr.length() ? "," : "") + fsInc(String("out.") + hourKey, outN);
    writes += ",{\"update\":{\"name\":\"" + devPath + "/days/" + day + "\",\"fields\":{\"uid\":" + fsStr(fbUid) +
              "}},\"updateMask\":{\"fieldPaths\":[\"uid\"]}," +
              "\"updateTransforms\":[" + dtr + "]}";
  }

  String resp;
  int code = httpsPost("https://firestore.googleapis.com/v1/" + base + ":commit",
                       "{\"writes\":[" + writes + "]}", "application/json", resp, fbIdToken);

  if (code == 200) {
    if (newDay) { sentDay = day; fbSave(); }
    setCloud("ok", "Данные приняты сервером");
    return true;
  }

  String m = jsonStr(resp, "message");
  Serial.printf("[СЕРВЕР] Ошибка записи (%d): %s\n", code, m.c_str());
  if (code == 401)      { fbIdToken = ""; setCloud("error", "Вход устарел, обновляю"); }
  else if (code == 403) setCloud("error", "Нет доступа: проверьте правила Firestore");
  else if (code == 404) setCloud("error", "Проект «" + cfgServer + "» не найден");
  else if (code < 0)    setCloud("error", "Нет связи с сервером");
  else                  setCloud("error", "Ошибка сервера " + String(code));
  return false;
}
