param(
  [string]$OutputDir = "dist"
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$manifestPath = Join-Path $root "manifest.json"
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$version = $manifest.version
$packageName = "TabTidy-$version.zip"
$outputPath = Join-Path (Join-Path $root $OutputDir) $packageName
$stagingPath = Join-Path (Join-Path $root $OutputDir) "package"

if (-not (Test-Path (Join-Path $root $OutputDir))) {
  New-Item -ItemType Directory -Path (Join-Path $root $OutputDir) | Out-Null
}

if (Test-Path $stagingPath) {
  Remove-Item -LiteralPath $stagingPath -Recurse -Force
}

New-Item -ItemType Directory -Path $stagingPath | Out-Null

$includeFiles = @(
  "manifest.json",
  "background.js",
  "manager.html",
  "manager.css",
  "manager.js",
  "popup.html",
  "popup.css",
  "popup.js",
  "README.md",
  "PRIVACY.md"
)

foreach ($file in $includeFiles) {
  Copy-Item -LiteralPath (Join-Path $root $file) -Destination (Join-Path $stagingPath $file)
}

Copy-Item -LiteralPath (Join-Path $root "icons") -Destination (Join-Path $stagingPath "icons") -Recurse

if (Test-Path $outputPath) {
  Remove-Item -LiteralPath $outputPath -Force
}

Compress-Archive -Path (Join-Path $stagingPath "*") -DestinationPath $outputPath -Force
Remove-Item -LiteralPath $stagingPath -Recurse -Force

Write-Host "Created $outputPath"
