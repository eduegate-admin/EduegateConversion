# PowerShell script for local APK build (requires Android SDK setup)

param(
    [string]$BuildType = "debug",
    [switch]$Clean,
    [switch]$SetupAndroid
)

$ErrorActionPreference = "Stop"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-ColoredOutput {
    param($Message, $Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Test-CommandExists {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

function Setup-AndroidSDK {
    Write-ColoredOutput "Setting up Android SDK..." $Blue
    
    # Check if Android SDK is installed
    $androidHome = $env:ANDROID_HOME
    if (-not $androidHome -or -not (Test-Path $androidHome)) {
        Write-ColoredOutput "Android SDK not found." $Yellow
        Write-ColoredOutput "Please install Android Studio or set ANDROID_HOME environment variable." $Red
        Write-ColoredOutput "Download from: https://developer.android.com/studio" $Blue
        exit 1
    }
    
    Write-ColoredOutput "Android SDK found at: $androidHome" $Green
    
    # Check for required tools
    $platformTools = Join-Path $androidHome "platform-tools"
    $buildTools = Join-Path $androidHome "build-tools"
    
    if (-not (Test-Path $platformTools)) {
        Write-ColoredOutput "Platform tools not found. Please install through Android Studio SDK Manager." $Red
        exit 1
    }
    
    if (-not (Test-Path $buildTools)) {
        Write-ColoredOutput "Build tools not found. Please install through Android Studio SDK Manager." $Red
        exit 1
    }
    
    # Add to PATH if not already there
    $currentPath = $env:PATH
    if ($currentPath -notlike "*$platformTools*") {
        $env:PATH = "$platformTools;$currentPath"
    }
    
    Write-ColoredOutput "Android SDK setup completed." $Green
}

function Install-Dependencies {
    Write-ColoredOutput "Installing project dependencies..." $Blue
    
    if (Test-Path "package.json") {
        npm install
        Write-ColoredOutput "Dependencies installed." $Green
    } else {
        Write-ColoredOutput "package.json not found!" $Red
        exit 1
    }
}

function Prebuild-Project {
    Write-ColoredOutput "Pre-building Expo project..." $Blue
    
    if ($Clean) {
        Write-ColoredOutput "Cleaning previous builds..." $Blue
        if (Test-Path "android") {
            Remove-Item -Path "android" -Recurse -Force
        }
        if (Test-Path "ios") {
            Remove-Item -Path "ios" -Recurse -Force
        }
    }
    
    # Run expo prebuild
    npx expo prebuild --platform android --clean
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColoredOutput "Expo prebuild failed!" $Red
        exit 1
    }
    
    Write-ColoredOutput "Expo prebuild completed." $Green
}

function Build-APK {
    param($Type)
    
    Write-ColoredOutput "Building APK ($Type)..." $Blue
    
    # Navigate to android directory
    if (-not (Test-Path "android")) {
        Write-ColoredOutput "Android directory not found. Run prebuild first." $Red
        exit 1
    }
    
    Push-Location "android"
    
    try {
        # Make gradlew executable (if on Windows with WSL)
        if (Test-Path "gradlew.bat") {
            $gradlewCmd = ".\gradlew.bat"
        } elseif (Test-Path "gradlew") {
            $gradlewCmd = ".\gradlew"
        } else {
            Write-ColoredOutput "Gradle wrapper not found!" $Red
            exit 1
        }
        
        # Build based on type
        switch ($Type.ToLower()) {
            "debug" {
                Write-ColoredOutput "Building debug APK..." $Blue
                & $gradlewCmd assembleDebug
                $apkPath = "app\build\outputs\apk\debug\app-debug.apk"
            }
            "release" {
                Write-ColoredOutput "Building release APK..." $Blue
                & $gradlewCmd assembleRelease
                $apkPath = "app\build\outputs\apk\release\app-release.apk"
            }
            default {
                Write-ColoredOutput "Invalid build type. Use 'debug' or 'release'." $Red
                exit 1
            }
        }
        
        if ($LASTEXITCODE -ne 0) {
            Write-ColoredOutput "Gradle build failed!" $Red
            exit 1
        }
        
        # Check if APK was created
        if (Test-Path $apkPath) {
            $fullPath = Resolve-Path $apkPath
            Write-ColoredOutput "APK built successfully!" $Green
            Write-ColoredOutput "APK location: $fullPath" $Green
            
            # Copy to project root for easy access
            $destPath = "..\app-$Type.apk"
            Copy-Item $apkPath $destPath -Force
            Write-ColoredOutput "APK copied to project root: app-$Type.apk" $Green
        } else {
            Write-ColoredOutput "APK file not found after build!" $Red
            exit 1
        }
        
    } finally {
        Pop-Location
    }
}

function Show-Requirements {
    Write-ColoredOutput "" $White
    Write-ColoredOutput "=== Local APK Build Requirements ===" $Blue
    Write-ColoredOutput "" $White
    Write-ColoredOutput "Required software:" $Yellow
    Write-ColoredOutput "  1. Node.js (v16 or later)" $White
    Write-ColoredOutput "  2. Android Studio or Android SDK" $White
    Write-ColoredOutput "  3. Java Development Kit (JDK 11 or later)" $White
    Write-ColoredOutput "" $White
    Write-ColoredOutput "Environment variables:" $Yellow
    Write-ColoredOutput "  - ANDROID_HOME: Path to Android SDK" $White
    Write-ColoredOutput "  - JAVA_HOME: Path to JDK (optional)" $White
    Write-ColoredOutput "" $White
    Write-ColoredOutput "Usage:" $Yellow
    Write-ColoredOutput "  .\build-apk-local.ps1 -BuildType debug" $White
    Write-ColoredOutput "  .\build-apk-local.ps1 -BuildType release" $White
    Write-ColoredOutput "  .\build-apk-local.ps1 -BuildType debug -Clean" $White
    Write-ColoredOutput "  .\build-apk-local.ps1 -SetupAndroid" $White
    Write-ColoredOutput "" $White
}

function Main {
    Write-ColoredOutput "=== React Native Expo Local APK Builder ===" $Blue
    Write-ColoredOutput "" $White
    
    try {
        # Show setup instructions if requested
        if ($SetupAndroid) {
            Setup-AndroidSDK
            return
        }
        
        # Show requirements if no build type specified
        if (-not $BuildType -or $BuildType -eq "help") {
            Show-Requirements
            return
        }
        
        # Verify prerequisites
        if (!(Test-CommandExists "node")) {
            Write-ColoredOutput "Node.js not found. Please install Node.js first." $Red
            exit 1
        }
        
        if (!(Test-CommandExists "npx")) {
            Write-ColoredOutput "npx not found. Please ensure Node.js is properly installed." $Red
            exit 1
        }
        
        # Setup Android SDK
        Setup-AndroidSDK
        
        # Install dependencies
        Install-Dependencies
        
        # Prebuild project
        Prebuild-Project
        
        # Build APK
        Build-APK -Type $BuildType
        
        Write-ColoredOutput "" $White
        Write-ColoredOutput "=== Build Completed Successfully! ===" $Green
        
    } catch {
        Write-ColoredOutput "Error occurred: $_" $Red
        Write-ColoredOutput "Stack trace: $($_.ScriptStackTrace)" $Red
        exit 1
    }
}

# Run main function
Main