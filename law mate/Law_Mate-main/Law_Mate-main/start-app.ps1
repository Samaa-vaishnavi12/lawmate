$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

$serverJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location "$dir\server"
    npm start
} -ArgumentList $rootDir

$clientJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location "$dir\client"
    npm run dev
} -ArgumentList $rootDir

Write-Host "Starting Law Mate..." -ForegroundColor Green
Write-Host "Backend  -> http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend -> http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop both servers." -ForegroundColor Yellow

try {
    while ($true) {
        Receive-Job -Job $serverJob -Keep
        Receive-Job -Job $clientJob -Keep
        Start-Sleep -Seconds 2
    }
}
finally {
    Stop-Job -Job $serverJob
    Stop-Job -Job $clientJob
    Remove-Job -Job $serverJob
    Remove-Job -Job $clientJob
    Write-Host "Servers stopped." -ForegroundColor Red
}
