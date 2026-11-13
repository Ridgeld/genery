// Упаковывает интерфейс в прошивку: index.html (+ font.woff2, если есть) -> gzip -> ../ui_bundle.h
// Запуск после любых правок интерфейса:  node firmware/people_counter/ui/build.mjs
import { readFile, writeFile, access } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, '..', 'ui_bundle.h');

const toArray = (name, buf) => {
  const lines = [];
  for (let i = 0; i < buf.length; i += 20) lines.push('  ' + [...buf.subarray(i, i + 20)].map((b) => '0x' + b.toString(16).padStart(2, '0')).join(','));
  return `const uint8_t ${name}[] PROGMEM = {\n${lines.join(',\n')}\n};\nconst size_t ${name}_LEN = ${buf.length};\n`;
};

const html = await readFile(path.join(dir, 'index.html'));
const gz = gzipSync(html, { level: 9 });
let h = `// Сгенерировано ui/build.mjs — не редактировать вручную.\n#pragma once\n#include <Arduino.h>\n\n`;
h += toArray('INDEX_HTML_GZ', gz);

let fontInfo = 'нет (будет системный шрифт)';
try {
  await access(path.join(dir, 'font.woff2'));
  const font = await readFile(path.join(dir, 'font.woff2'));
  h += '\n#define HAS_UI_FONT 1\n' + toArray('FONT_WOFF2', font);
  fontInfo = `${(font.length / 1024).toFixed(1)} КБ`;
} catch {}

await writeFile(out, h);
console.log(`index.html: ${(html.length / 1024).toFixed(1)} КБ -> gzip ${(gz.length / 1024).toFixed(1)} КБ`);
console.log(`Шрифт: ${fontInfo}`);
console.log(`Записано: ${out}`);
