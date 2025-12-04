# PowerShell script for building APK using EAS Build (Expo Application Services)
# This is the recommended approach for production builds

param(
    [string]$BuildProfile = "development",
    [switch]$Install,
    [switch]$Configure
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

function Install-Prerequisites {
    Write-ColoredOutput "Installing prerequisites..." $Blue
    
    # Check Node.js
    if (!(Test-CommandExists "node")) {
        Write-ColoredOutput "Node.js not found. Please install Node.js first." $Red
        exit 1
    }
    
    # Install EAS CLI
    if (!(Test-CommandExists "eas")) {
        Write-ColoredOutput "Installing EAS CLI..." $Blue
        npm install -g eas-cli
    } else {
        Write-ColoredOutput "EAS CLI already installed." $Green
    }
    
    # Install Expo CLI
    if (!(Test-CommandExists "expo")) {
        Write-ColoredOutput "Installing Expo CLI..." $Blue
        npm install -g @expo/cli
    } else {
        Write-ColoredOutput "Expo CLI already installed." $Green
    }
}

function Configure-EAS {
    Write-ColoredOutput "Configuring EAS Build..." $Blue
    
    # Check if eas.json exists
    if (!(Test-Path "eas.json")) {
        Write-ColoredOutput "Creating eas.json configuration..." $Blue
        
        # Create EAS configuration
        eas build:configure
        
        # Create custom eas.json with multiple build profiles
        $easConfig = @"
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug",
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    },
    "production-apk": {
      "extends": "production",
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
"@
        
        $easConfig | Out-File -FilePath "eas.json" -Encoding utf8
        Write-ColoredOutput "eas.json created with multiple build profiles." $Green
    } else {
        Write-ColoredOutput "eas.json already exists." $Green
    }
}

function Build-WithEAS {
    param($Profile)
    
    Write-ColoredOutput "Building APK with EAS Build..." $Blue
    Write-ColoredOutput "Build Profile: $Profile" $Yellow
    
    # Login check
    Write-ColoredOutput "Checking Expo authentication..." $Blue
    $loginStatus = expo whoami 2>&1
    if ($loginStatus -like "*Not logged in*" -or $loginStatus -like "*error*") {
        Write-ColoredOutput "Please login to Expo:" $Yellow
        expo login
    }
    
    # Start build
    Write-ColoredOutput "Starting EAS build..." $Blue
    eas build --platform android --profile $Profile
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColoredOutput "Build completed successfully!" $Green
        Write-ColoredOutput "You can download the APK from the Expo dashboard or use 'eas build:list' to see build details." $Green
    } else {
        Write-ColoredOutput "Build failed!" $Red
        exit 1
    }
}

function Show-BuildInstructions {
    Write-ColoredOutput "" $White
    Write-ColoredOutput "=== EAS Build Instructions ===" $Blue
    Write-ColoredOutput "" $White
    Write-ColoredOutput "Available build profiles:" $Yellow
    Write-ColoredOutput "  - development: Debug APK for development" $White
    Write-ColoredOutput "  - preview: Preview APK for testing" $White
    Write-ColoredOutput "  - production: Production AAB for Play Store" $White
    Write-ColoredOutput "  - production-apk: Production APK" $White
    Write-ColoredOutput "" $White
    Write-ColoredOutput "Usage examples:" $Yellow
    Write-ColoredOutput "  .\build-apk-eas.ps1 -BuildProfile development" $White
    Write-ColoredOutput "  .\build-apk-eas.ps1 -BuildProfile preview" $White
    Write-ColoredOutput "  .\build-apk-eas.ps1 -BuildProfile production-apk" $White
    Write-ColoredOutput "" $White
    Write-ColoredOutput "Additional commands:" $Yellow
    Write-ColoredOutput "  .\build-apk-eas.ps1 -Install          # Install prerequisites only" $White
    Write-ColoredOutput "  .\build-apk-eas.ps1 -Configure       # Configure EAS only" $White
    Write-ColoredOutput "" $White
}

function Main {
    Write-ColoredOutput "=== React Native Expo APK Builder (EAS) ===" $Blue
    Write-ColoredOutput "" $White
    
    try {
        # Install prerequisites if requested
        if ($Install) {
            Install-Prerequisites
            Write-ColoredOutput "Prerequisites installed successfully!" $Green
            return
        }
        
        # Configure EAS if requested
        if ($Configure) {
            Install-Prerequisites
            Configure-EAS
            Write-ColoredOutput "EAS configuration completed!" $Green
            return
        }
        
        # Show instructions if no specific action
        if (-not $BuildProfile -or $BuildProfile -eq "help") {
            Show-BuildInstructions
            return
        }
        
        # Full build process
        Install-Prerequisites
        Configure-EAS
        Build-WithEAS -Profile $BuildProfile
        
    } catch {
        Write-ColoredOutput "Error occurred: $_" $Red
        exit 1
    }
}

# Run main function
Main