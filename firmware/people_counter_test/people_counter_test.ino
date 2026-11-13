/*
 * Этап 0 — проверка датчика TOF400C (VL53L1X) на ESP32.
 *
 * Подключение:
 *   TOF400C VIN -> ESP32 3.3V
 *   TOF400C GND -> ESP32 GND
 *   TOF400C SDA -> ESP32 GPIO 21
 *   TOF400C SCL -> ESP32 GPIO 22
 *   XSHUT, GPIO1 — пока не подключаем
 *
 * Что делает:
 *   1. Сканирует шину I2C (датчик должен найтись по адресу 0x29).
 *   2. Запускает датчик в режиме дальних измерений (до 4 м).
 *   3. Поочерёдно меряет две зоны (A и B) — на них потом будет
 *      строиться определение направления (вход / выход).
 *
 * Serial Monitor: 115200 бод.
 */

#include <Wire.h>
#include "SparkFun_VL53L1X.h"

#define PIN_SDA 21
#define PIN_SCL 22

// Поле датчика 16x16 SPAD. Делим его на две половины 8x16.
// 167 и 231 — оптические центры левой и правой половины (из AN ST для подсчёта людей).
#define ROI_WIDTH   8
#define ROI_HEIGHT  16
#define CENTER_A    167
#define CENTER_B    231

SFEVL53L1X sensor;

uint8_t  zone = 0;           // 0 = A, 1 = B
uint16_t distA = 0, distB = 0;
uint8_t  statusA = 0, statusB = 0;
uint32_t lastPrint = 0;

void scanI2C() {
  Serial.println(F("Сканирую I2C..."));
  uint8_t found = 0;
  for (uint8_t addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.printf("  найдено устройство: 0x%02X%s\n", addr,
                    addr == 0x29 ? "  <- это VL53L1X" : "");
      found++;
    }
  }
  if (!found) {
    Serial.println(F("  НИЧЕГО НЕ НАЙДЕНО. Проверьте провода SDA/SCL, питание 3.3V и GND."));
  }
}

void setup() {
  Serial.begin(115200);
  delay(1500);
  Serial.println();
  Serial.println(F("=== Тест датчика TOF400C (VL53L1X) ==="));

  Wire.begin(PIN_SDA, PIN_SCL);
  Wire.setClock(400000);
  scanI2C();

  if (sensor.begin() != 0) {   // begin() возвращает 0 при успехе
    Serial.println(F("ОШИБКА: датчик не отвечает. Проверьте подключение и перезагрузите плату."));
    while (true) delay(1000);
  }
  Serial.printf("Датчик OK, ID = 0x%04X\n", sensor.getSensorID());

  sensor.setDistanceModeLong();
  sensor.setTimingBudgetInMs(33);
  sensor.setIntermeasurementPeriod(35);
  sensor.setROI(ROI_WIDTH, ROI_HEIGHT, CENTER_A);
  sensor.startRanging();

  Serial.println(F("Измерения запущены. Проведите рукой под датчиком из стороны в сторону."));
  Serial.println(F("Формат: зона A | зона B  (мм, статус: 0 = ок)"));
}

void loop() {
  if (!sensor.checkForDataReady()) return;

  uint16_t d = sensor.getDistance();
  uint8_t  st = sensor.getRangeStatus();
  sensor.clearInterrupt();

  if (zone == 0) { distA = d; statusA = st; }
  else           { distB = d; statusB = st; }

  // Переключаемся на другую половину поля для следующего измерения
  zone ^= 1;
  sensor.setROI(ROI_WIDTH, ROI_HEIGHT, zone == 0 ? CENTER_A : CENTER_B);

  if (millis() - lastPrint >= 200) {
    lastPrint = millis();
    Serial.printf("A: %4u мм (st %u) | B: %4u мм (st %u)\n", distA, statusA, distB, statusB);
  }
}
