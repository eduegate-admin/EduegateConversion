# Complete App Launch Script
# This script starts everything needed to run the EduegateStaffApp

Write-Host "Starting EduegateStaffApp Complete Setup..." -ForegroundColor Cyan
Write-Host ""

# Set Android SDK paths
Write-Host "Setting up Android SDK paths..." -ForegroundColor Yellow
$env:ANDROID_HOME = "E:\AndroidSDK"
$env:Path = "E:\AndroidSDK\platform-tools;E:\AndroidSDK\emulator;E:\AndroidSDK\tools;" + $env:Path

# Check if emulator is running
Write-Host "Checking for running emulator..." -ForegroundColor Yellow
$devices = adb devices
Write-Host $devices

if ($devices -match "emulator-" -or $devices -match "device") {
    Write-Host "Emulator found!" -ForegroundColor Green
} else {
    Write-Host "No emulator found. Starting Pixel_9a..." -ForegroundColor Yellow
    Start-Process emulator -ArgumentList "-avd","Pixel_9a"
    Write-Host "Waiting for emulator to boot (30 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}

# Navigate to project
Set-Location "E:\EduegateConversion\EduegateStaffApp"

Write-Host ""
Write-Host "Building and launching app..." -ForegroundColor Cyan
Write-Host "This will take 1-2 minutes..." -ForegroundColor Yellow
Write-Host ""

# Run the app
npx react-native run-android

Write-Host ""
Write-Host "Done! Check your emulator!" -ForegroundColor Green
