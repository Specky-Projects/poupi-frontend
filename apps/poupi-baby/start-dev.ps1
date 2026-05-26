Set-Location -LiteralPath $PSScriptRoot
$PSNativeCommandUseErrorActionPreference = $false
$env:NODE_OPTIONS = '--max-old-space-size=4096'
npm.cmd run dev -- -p 3000 *> frontend-live.log
