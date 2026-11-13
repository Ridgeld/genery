# Счётчик людей для столовой (ESP32 + TOF400C / VL53L1X)

## Как это работает

```
ESP32 (дверь 1) ─┐                         ┌─ canteens/main        { name, capacity }
ESP32 (дверь 2) ─┼─ HTTPS → Firestore ─────┼─ devices/{id}         { canteenId, approved, day, dayIn, dayOut, lastSeen, rssi, ... }
ESP32 (дверь N) ─┘                         └─ devices/{id}/days/{YYYY-MM-DD}  { in: {h12: 5}, out: {h12: 3} }
                                                     │
                       Сайт /canteen?id=main  ←──────┘  сумма dayIn − dayOut всех одобренных дверей
```

- Каждая плата входит в Firebase **анонимно** (свой uid, без паролей) и пишет только в свой документ.
- События отправляются пачками: первое сразу, дальше не чаще раза в 10 с; «пульс» раз в 5 мин.
- Без интернета события копятся в памяти (переживают перезагрузку) и уходят, когда связь вернётся.
- Новый день (по времени UTC+6) начинает счёт `dayIn/dayOut` с нуля — это ночной сброс.

## Разовая настройка Firebase (делает администратор)

1. **Authentication → Sign-in method → Anonymous → Enable.**
2. **Firestore → Rules:** замените правила содержимым [`firestore-rules-counter.txt`](firestore-rules-counter.txt)
   и нажмите Publish. Важно: общее правило `/{document=**}` в нём пускает только **неанонимных**
   пользователей — иначе любой, кто войдёт анонимно с публичным ключом, получит доступ ко всей базе.
3. **Firestore → Data:** создайте документ `canteens/main` с полями
   `name` (string, например «Столовая №1») и `capacity` (number, например 120).

## Подключение нового счётчика

1. Мастер включает питание и настраивает Wi‑Fi с телефона (точка `Counter-XXXXXX`).
2. Через ~10 секунд в Firestore появляется документ `devices/counter-xxxxxx`.
3. Администратор проверяет поле `canteenId` (по умолчанию `main`, меняется в настройках
   устройства) и добавляет поле **`approved` = true (boolean)**. С этого момента сайт учитывает дверь.

Несколько дверей одной столовой — несколько устройств с одинаковым `canteenId`.
Другая столовая — свой `canteens/{id}` и `canteenId` на устройствах; страница: `/canteen?id={id}`.

## Прошивка

- Код: `people_counter/people_counter.ino`, отправка: `people_counter/cloud.h`.
- Интерфейс панели: `people_counter/ui/index.html`. После правок: `node people_counter/ui/build.mjs`
  (пересобирает `ui_bundle.h`). Предпросмотр без платы: `node people_counter/ui/dev-server.mjs`.
- Плата: ESP32 Dev Module, Partition Scheme: **Minimal SPIFFS (1.9MB APP with OTA)**.
- Монитор порта (115200): `+` вход, `-` выход, `s` статус, `r` обнулить, `p` портал, `f` забыть Wi‑Fi.
