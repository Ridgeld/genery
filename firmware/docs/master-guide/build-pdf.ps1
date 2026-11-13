# Собирает PDF инструкции мастера из guide.html (через Microsoft Edge).
#   powershell -ExecutionPolicy Bypass -File firmware\docs\master-guide\build-pdf.ps1
# -Preview <папка> — дополнительно сохранить страницы картинками для проверки вёрстки.
param([string]$Preview = '')

$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
$profileDir = "$env:LOCALAPPDATA\Temp\edge_capture_profile"
$html = Join-Path $PSScriptRoot 'guide.html'
$pdf = Join-Path (Split-Path $PSScriptRoot -Parent) 'Инструкция мастера — счётчик людей.pdf'
$url = ([uri]$html).AbsoluteUri

& $edge --headless=new --disable-gpu --no-first-run "--user-data-dir=$profileDir" --no-pdf-header-footer `
  --virtual-time-budget=5000 "--print-to-pdf=$pdf" $url 2>$null | Out-Null
Start-Sleep -Seconds 1
"PDF: $pdf ($([math]::Round((Get-Item $pdf).Length / 1MB, 2)) МБ)"

if ($Preview) {
  $pages = ([regex]::Matches((Get-Content $html -Raw -Encoding UTF8), '<section class="page')).Count
  $full = Join-Path $Preview 'guide-full.png'
  & $edge --headless=new --disable-gpu --hide-scrollbars --no-first-run "--user-data-dir=$profileDir" `
    "--window-size=794,$($pages * 1123 + 10)" --virtual-time-budget=5000 "--screenshot=$full" $url 2>$null | Out-Null
  Start-Sleep -Seconds 1
  Add-Type -AssemblyName System.Drawing
  $src = [System.Drawing.Image]::FromFile($full)
  for ($i = 0; $i -lt $pages; $i++) {
    $bmp = New-Object System.Drawing.Bitmap 794, 1123
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, 794, 1123), (New-Object System.Drawing.Rectangle 0, ($i * 1123), 794, 1123), [System.Drawing.GraphicsUnit]::Pixel)
    $bmp.Save((Join-Path $Preview "page$($i + 1).png"))
    $g.Dispose(); $bmp.Dispose()
  }
  $src.Dispose()
  "Страниц: $pages, превью в $Preview"
}
