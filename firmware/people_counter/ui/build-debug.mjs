// Собирает страницу отладки датчика ui/debug.html в debug_page.h (gzip-массив байт).
// Запуск: node ui/build-debug.mjs  (из папки firmware/people_counter)
// Массив, а не R"(...)"-строка: парсер Arduino IDE 1.8 (ctags) зависает на «сырых» строках.
import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, 'debug.html'));
const gz = gzipSync(html, { level: 9 });
const rows = [];
for (let i = 0; i < gz.length; i += 20) rows.push('  ' + [...gz.subarray(i, i + 20)].map((b) => `0x${b.toString(16).padStart(2, '0')}`).join(','));
const out = `// Сгенерировано ui/build-debug.mjs из ui/debug.html — не редактировать вручную.
// Страница /debug: отладка датчика в реальном времени.
#pragma once
#include <Arduino.h>

const uint8_t DEBUG_HTML_GZ[] PROGMEM = {
${rows.join(',\n')}
};
const size_t DEBUG_HTML_GZ_LEN = ${gz.length};
`;
writeFileSync(join(here, '..', 'debug_page.h'), out);
console.log(`debug_page.h: ${html.length} -> ${gz.length} байт`);
