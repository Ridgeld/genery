#pragma once
/*
 * Подсчёт людей датчиком VL53L1X (плата TOF400C) над дверью.
 *
 * Поле зрения датчика (16×16 SPAD) делится на две половины 8×16 — зону A и зону B,
 * они измеряются по очереди. Человек, проходящий под датчиком, даёт последовательность
 *   A  →  A+B  →  B  →  никого   = проход в одну сторону (вход)
 *   B  →  A+B  →  A  →  никого   = в другую (выход)
 * Если человек подошёл и развернулся, последовательность не полная — проход не засчитывается.
 * Направление можно поменять на сайте (invert), если датчик повесили «задом наперёд».
 *
 * Подключение: VIN → 3V3, GND → GND, SDA → GPIO 21, SCL → GPIO 22, XSHUT → 3V3 (чтобы датчик не выключался наводкой).
 * Если датчик не найден — плата работает в режиме имитации (simMode) и раз в секунду ищет его снова.
 * Отладка в реальном времени — страница /debug (debug_page.h).
 * Если датчик «замолчал» больше чем на 1,5 с — он перезапускается (счётчик restarts в /status).
 * Подключается в people_counter.ino после countEvent().
 */
#include <Wire.h>
#include "SparkFun_VL53L1X.h"

#define TOF_SDA      21
#define TOF_SCL      22
#define TOF_ROI_W    8
#define TOF_ROI_H    16
#define TOF_CENTER_A 167     // оптический центр левой половины поля
#define TOF_CENTER_B 231     // правой половины

SFEVL53L1X tof;
uint8_t  tofZone = 0;                 // какая зона измеряется сейчас: 0 = A, 1 = B
bool     zoneBusy[2] = {false, false};
int      pathTrack[4] = {0, 0, 0, 0};
int      pathFill = 1;
uint32_t lastCountAt = 0;

uint16_t effectiveThreshold() {
  // По умолчанию срабатываем, когда объект ближе 75% расстояния до пола (голова/плечи)
  return cfgThreshold ? cfgThreshold : (uint16_t)(sensorFloorMm * 3 / 4);
}

bool sensorCalibrate();

uint32_t lastDataAt = 0;          // когда пришло последнее НАСТОЯЩЕЕ измерение (0 — ещё не было)
uint32_t lastRestartAt = 0;       // когда последний раз (пере)запускали датчик
uint8_t  restartFails = 0;        // перезапусков подряд, на которые датчик не ответил
bool     floorGuessed = false;    // пол не измерен (взято 2200 мм по умолчанию)
uint32_t hzWindowAt = 0, hzWindowReads = 0, lastDiagAt = 0;

// Датчик на связи: найден и присылал измерения в последние 1,5 с
bool sensorPresent() {
  return !simMode && lastDataAt && millis() - lastDataAt < 1500;
}

// Настройка режима измерений (после включения и после перезапуска датчика)
bool tofConfigure() {
  if (tof.begin() != 0) return false;             // begin() возвращает 0 при успехе
  tof.setDistanceModeLong();
  tof.setTimingBudgetInMs(33);
  tof.setIntermeasurementPeriod(35);
  return true;
}

// Возвращает true, если датчик найден и откалиброван
bool sensorBegin() {
  Wire.begin(TOF_SDA, TOF_SCL);
  Wire.setClock(100000);       // 100 кГц: надёжнее на длинных проводах и макетке
  Wire.setTimeOut(20);         // зависшая шина не должна тормозить всю плату
  if (!tofConfigure()) return false;
  restartFails = 0;
  if (!sensorFloorMm || floorGuessed) {
    sensorCalibrate();                 // первое подключение — меряем пол
  } else {
    // Пол уже известен (датчик переподключили) — сразу считаем, без паузы на калибровку
    tofZone = 0;
    zoneBusy[0] = zoneBusy[1] = false;
    pathFill = 1;
    tof.setROI(TOF_ROI_W, TOF_ROI_H, TOF_CENTER_A);
    tof.startRanging();
  }
  lastRestartAt = millis();
  return true;
}

// Датчик «замолчал» (дребезг контакта, просадка питания) — перезапускаем его без перезагрузки платы
void sensorRestart() {
  sensorRestarts++;
  if (sensorRestarts <= 3 || sensorRestarts % 20 == 0) Serial.printf("[ДАТЧИК] Нет данных %lu мс — перезапуск датчика (%lu-й раз). Проверьте пайку и провода SDA/SCL/питания\n",
                (unsigned long)(millis() - lastDataAt), (unsigned long)sensorRestarts);
  lastRestartAt = millis();
  Wire.end();
  Wire.begin(TOF_SDA, TOF_SCL);
  Wire.setClock(100000);
  Wire.setTimeOut(20);
  if (tofConfigure()) {
    restartFails = 0;
    tofZone = 0;
    zoneBusy[0] = zoneBusy[1] = false;
    pathFill = 1;
    tof.setROI(TOF_ROI_W, TOF_ROI_H, TOF_CENTER_A);
    tof.startRanging();
  } else if (++restartFails >= 3) {
    // Датчик не отвечает совсем — считаем его отключённым и снова ищем раз в секунду
    simMode = true;
    restartFails = 0;
    Serial.println("[ДАТЧИК] Потерян — режим имитации, ищу датчик каждую секунду");
  }
}

// Калибровка: расстояние до пола по всему полю зрения (под датчиком никого быть не должно).
// Вызывается при включении и кнопкой «Калибровать пол» на панели платы.
bool sensorCalibrate() {
  if (simMode && sensorFloorMm) return false;
  tof.stopRanging();
  tof.setROI(16, 16, 199);
  tof.startRanging();
  uint32_t sum = 0, t0 = millis();
  uint8_t n = 0;
  while (n < 20 && millis() - t0 < 4000) {
    if (tof.checkForDataReady()) {
      uint16_t d = tof.getDistance();
      uint8_t st = tof.getRangeStatus();
      tof.clearInterrupt();
      if (st == 0 && d > 300) { sum += d; n++; }
    }
    delay(5);
  }
  tof.stopRanging();
  sensorFloorMm = n ? sum / n : 2200;
  floorGuessed = n == 0;               // не измерили — при следующем подключении откалибруем снова
  sensorThresholdMm = effectiveThreshold();
  Serial.printf("[ДАТЧИК] Калибровка: пол %u мм, порог %u мм\n", sensorFloorMm, sensorThresholdMm);

  tofZone = 0;
  zoneBusy[0] = zoneBusy[1] = false;
  pathFill = 1;
  tof.setROI(TOF_ROI_W, TOF_ROI_H, TOF_CENTER_A);
  tof.startRanging();
  lastRestartAt = millis();            // калибровка занимает до 4 с — не считать это «молчанием»
  return n > 0;
}

uint32_t lastProbeAt = 0;

void sensorLoop() {
  uint32_t now = millis();
  if (simMode) {
    // Датчика нет — раз в секунду пробуем найти (подключили после включения или поправили провод)
    if (now - lastProbeAt < 1000) return;
    lastProbeAt = now;
    if (sensorBegin()) {
      simMode = false;
      Serial.println("[ДАТЧИК] Подключён — режим имитации выключен");
    }
    return;
  }
  if (now - hzWindowAt >= 2000) {                 // частота измерений за последние 2 с
    sensorHz = hzWindowReads * 1000.0f / (now - hzWindowAt);
    hzWindowAt = now;
    hzWindowReads = 0;
  }
  if (now - lastDiagAt >= 30000) {
    lastDiagAt = now;
    Serial.printf("[ДАТЧИК] %.1f изм/с, всего %lu, с ошибкой %lu, перезапусков %lu, A=%u B=%u мм\n",
                  sensorHz, (unsigned long)sensorReads, (unsigned long)sensorBad, (unsigned long)sensorRestarts,
                  sensorDistA, sensorDistB);
  }
  if (!tof.checkForDataReady()) {
    // В норме измерение приходит каждые ~35 мс; молчит дольше 1,5 с — перезапуск (не чаще раза в 1,5 с)
    if ((!lastDataAt || now - lastDataAt > 1500) && now - lastRestartAt > 1500) sensorRestart();
    return;
  }
  uint16_t d = tof.getDistance();
  uint8_t st = tof.getRangeStatus();
  tof.clearInterrupt();
  // Оборванный провод даёт «мусор» с шины (0xFFFF / 0xFF) — это не измерение
  if (d > 6000 || st > 20) return;
  lastDataAt = now;
  sensorReads++;
  hzWindowReads++;
  sensorLastSt = st;
  if (st != 0) sensorBad++;

  uint8_t zone = tofZone;
  tofZone ^= 1;                                   // следующее измерение — другая половина поля
  tof.setROI(TOF_ROI_W, TOF_ROI_H, tofZone == 0 ? TOF_CENTER_A : TOF_CENTER_B);

  sensorThresholdMm = effectiveThreshold();
  if (zone == 0) sensorDistA = d; else sensorDistB = d;
  bool busy = st == 0 && d < sensorThresholdMm;
  if (busy == zoneBusy[zone]) return;

  // Состояние зоны изменилось
  zoneBusy[zone] = busy;
  if (busy) { if (zone == 0) rawA++; else rawB++; stateDirty = true; }

  if (pathFill < 4) pathFill++;
  if (!zoneBusy[0] && !zoneBusy[1]) {
    // Обе зоны свободны — проверяем, был ли полный проход
    if (pathFill == 4) {
      int dir = 0;
      if (pathTrack[1] == 1 && pathTrack[2] == 3 && pathTrack[3] == 2) dir = +1;
      else if (pathTrack[1] == 2 && pathTrack[2] == 3 && pathTrack[3] == 1) dir = -1;
      if (dir && millis() - lastCountAt >= cfgDebounce) {
        lastCountAt = millis();
        countEvent(dir);
      }
    }
    pathFill = 1;
  } else {
    pathTrack[pathFill - 1] = (zoneBusy[0] ? 1 : 0) + (zoneBusy[1] ? 2 : 0);
  }
}
