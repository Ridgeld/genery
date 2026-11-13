# Снимает экраны панели платы для инструкции мастера.
# Перед запуском нужны два тестовых сервера (см. firmware/people_counter/ui/dev-server.mjs):
#   PORT=5181 CAPTURE=1                  — плата ещё не настроена
#   PORT=5182 CAPTURE=1 CONNECTED=<сеть> — плата уже в сети
# и (для экрана администратора) vite dev на 5174.
param([string]$Only = '')   # например: -Only "dash settings" — переснять только эти экраны
$names = @($Only -split '[ ,;]+' | Where-Object { $_ })

$ErrorActionPreference = 'Continue'
$img = Join-Path $PSScriptRoot 'img'
New-Item -ItemType Directory -Force $img | Out-Null
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
$profile = "$env:LOCALAPPDATA\Temp\edge_capture_profile"

$shots = @(
  @{ name = 'portal-list';     url = 'http://localhost:5181/capture.html?s=portal-list' },
  @{ name = 'portal-form';     url = 'http://localhost:5181/capture.html?s=portal-form' },
  @{ name = 'portal-busy';     url = 'http://localhost:5181/capture.html?s=portal-busy' },
  @{ name = 'portal-ok';       url = 'http://localhost:5181/capture.html?s=portal-ok' },
  @{ name = 'portal-fail';     url = 'http://localhost:5181/capture.html?s=portal-fail' },
  @{ name = 'dash';            url = 'http://localhost:5182/capture.html?s=dash' },
  @{ name = 'settings';        url = 'http://localhost:5182/capture.html?s=settings' },
  @{ name = 'admin-devices';   url = 'http://localhost:5182/capture.html?src=' + [uri]::EscapeDataString('http://localhost:5174/#/canteen-preview?view=admin') },
  @{ name = 'canteen-page';    url = 'http://localhost:5182/capture.html?src=' + [uri]::EscapeDataString('http://localhost:5174/#/canteen-preview?t=760&occ=72') }
)

foreach ($s in $shots) {
  if ($names.Count -and ($names -notcontains $s.name)) { continue }
  $out = Join-Path $img "$($s.name).png"
  & $edge --headless=new --disable-gpu --hide-scrollbars --no-first-run "--user-data-dir=$profile" `
    --force-device-scale-factor=2 --window-size=390,844 --virtual-time-budget=15000 `
    "--screenshot=$out" $s.url 2>$null | Out-Null
  Start-Sleep -Milliseconds 500
  if (Test-Path $out) { "{0,-16} {1,8} байт" -f $s.name, (Get-Item $out).Length } else { "$($s.name): НЕ СНЯТ" }
}
