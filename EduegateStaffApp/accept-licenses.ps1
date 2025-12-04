Write-Host "📝 Accepting Android SDK Licenses..." -ForegroundColor Cyan

# Set Android SDK path
$sdkPath = "C:\Users\USER\AppData\Local\Android\Sdk"
$sdkManager = "$sdkPath\cmdline-tools\latest\bin\sdkmanager.bat"

# Check if sdkmanager exists
if (Test-Path $sdkManager) {
    Write-Host "Found sdkmanager" -ForegroundColor Green

    Write-Host "Accepting all licenses..." -ForegroundColor Yellow

    # Force CMD to handle input correctly
    cmd /c "echo y | `"$sdkManager`" --licenses"

    Write-Host "All licenses accepted!" -ForegroundColor Green
}
else {
    Write-Host "sdkmanager not found" -ForegroundColor Red
    Write-Host "Please open Android Studio and accept licenses in SDK Manager" -ForegroundColor Yellow
}
