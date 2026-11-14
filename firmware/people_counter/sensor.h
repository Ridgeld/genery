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
 * Подключение: VIN → 3V3, GND → GND, SDA → GPIO 21, SCL → GPIO 22.
 * Если датчик не найден при включении — плата работает в режиме имитации (simMode).
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

// Возвращает true, если датчик найден и откалиброван
bool sensorBegin() {
  Wire.begin(TOF_SDA, TOF_SCL);
  Wire.setClock(400000);
  if (tof.begin() != 0) return false;            // begin() возвращает 0 при успехе
  tof.setDistanceModeLong();
  tof.setTimingBudgetInMs(33);
  tof.setIntermeasurementPeriod(35);

  sensorCalibrate();
  return true;
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
  sensorThresholdMm = effectiveThreshold();
  Serial.printf("[ДАТЧИК] Калибровка: пол %u мм, порог %u мм\n", sensorFloorMm, sensorThresholdMm);

  tofZone = 0;
  zoneBusy[0] = zoneBusy[1] = false;
  pathFill = 1;
  tof.setROI(TOF_ROI_W, TOF_ROI_H, TOF_CENTER_A);
  tof.startRanging();
  return n > 0;
}

void sensorLoop() {
  if (simMode || !tof.checkForDataReady()) return;
  uint16_t d = tof.getDistance();
  uint8_t st = tof.getRangeStatus();
  tof.clearInterrupt();

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
