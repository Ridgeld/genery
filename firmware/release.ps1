# Выпуск новой версии прошивки счётчика.
#   powershell -ExecutionPolicy Bypass -File firmware\release.ps1
# 1. Перед запуском увеличьте FW_VERSION в people_counter\people_counter.ino (например, 0.5.0 -> 0.5.1).
# 2. Скрипт пересобирает интерфейс, компилирует прошивку и кладёт файл в firmware\releases\people_counter-<версия>.bin
# 3. Дальше: GitHub -> Releases -> Draft a new release -> тег v<версия> -> прикрепить .bin -> Publish.
#    Скопировать ссылку на файл и вставить на сайте: «Управление» -> «Прошивка» -> «Выпустить для всех».
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$sketch = Join-Path $root 'people_counter\people_counter.ino'
$build = "$env:LOCALAPPDATA\Temp\people_counter_build"
$ver = ([regex]::Match((Get-Content $sketch -Raw -Encoding UTF8), '#define FW_VERSION\s+"([^"]+)"')).Groups[1].Value
if (-not $ver) { throw 'Не нашёл FW_VERSION в people_counter.ino' }
$out = Join-Path $root "releases\people_counter-$ver.bin"
if (Test-Path $out) { throw "Версия $ver уже выпущена ($out). Увеличьте FW_VERSION." }
New-Item -ItemType Directory -Force (Join-Path $root 'releases') | Out-Null
New-Item -ItemType Directory -Force $build | Out-Null

"Версия: $ver"
node (Join-Path $root 'people_counter\ui\build.mjs')
$sw = [Diagnostics.Stopwatch]::StartNew()
$log = "$env:LOCALAPPDATA\Temp\people_counter_release.log"
$ErrorActionPreference = 'Continue'
& "${env:ProgramFiles(x86)}\Arduino\arduino_debug.exe" --verify --board esp32:esp32:esp32:PartitionScheme=min_spiffs `
  --pref "build.path=$build" $sketch *> $log
$code = $LASTEXITCODE
$text = [IO.File]::ReadAllText($log, [Text.Encoding]::UTF8)
if ($code -ne 0) { $text -split "`n" | Where-Object { $_ -match 'error' } | Select-Object -First 20; throw "Компиляция не удалась (код $code), лог: $log" }
($text -split "`n" | Where-Object { $_ -match 'Скетч|Sketch uses' }) -join ''
Copy-Item (Join-Path $build 'people_counter.ino.bin') $out
$hash = (Get-FileHash $out -Algorithm SHA256).Hash.ToLower()
"Готово за $([int]$sw.Elapsed.TotalSeconds) с: $out"
"Размер: $((Get-Item $out).Length) байт, SHA-256: $hash"
''
'Дальше:'
"  1. GitHub -> Releases -> Draft a new release, тег v$ver, прикрепите people_counter-$ver.bin, Publish."
'  2. Правой кнопкой по файлу в релизе -> «Копировать ссылку».'
"  3. Сайт -> Управление -> Прошивка: версия $ver, вставьте ссылку -> «Выпустить для всех»."