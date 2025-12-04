# Quick Run Script for EduegateStaffApp
# This script sets up PATH and runs the React Native app

Write-Host "🚀 Starting EduegateStaffApp..." -ForegroundColor Cyan

# Add Android SDK to PATH
Write-Host "📱 Setting up Android SDK paths..." -ForegroundColor Yellow
$env:Path += ";C:\Users\USER\AppData\Local\Android\Sdk\platform-tools"
$env:Path += ";C:\Users\USER\AppData\Local\Android\Sdk\emulator"
$env:Path += ";C:\Users\USER\AppData\Local\Android\Sdk\tools"

# Check if emulator is running
Write-Host "🔍 Checking for running devices..." -ForegroundColor Yellow
$devices = adb devices
Write-Host $devices

if ($devices -match "emulator" -or $devices -match "device") {
    Write-Host "✅ Device/Emulator found!" -ForegroundColor Green
    
    # Navigate to project directory
    Set-Location "E:\EduegateConversion\EduegateStaffApp"
    
    Write-Host "🏗️  Building and running app..." -ForegroundColor Cyan
    Write-Host "⏳ First build may take 2-5 minutes..." -ForegroundColor Yellow
    
    # Run the app
    npx react-native run-android
    
} else {
    Write-Host "❌ No device or emulator found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please do ONE of the following:" -ForegroundColor Yellow
    Write-Host "1. Start emulator: emulator -avd Pixel_9a" -ForegroundColor White
    Write-Host "2. Connect Android phone with USB debugging enabled" -ForegroundColor White
    Write-Host ""
    Write-Host "Then run this script again!" -ForegroundColor Cyan
}
