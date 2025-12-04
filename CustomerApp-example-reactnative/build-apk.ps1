# Master PowerShell script for React Native Expo APK building
# Provides multiple build options: Docker, EAS, and Local

param(
    [ValidateSet("docker", "eas", "local", "help")]
    [string]$Method = "help",
    
    [string]$BuildType = "development",
    [switch]$Install,
    [switch]$Clean
)

$ErrorActionPreference = "Stop"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

function Write-ColoredOutput {
    param($Message, $Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Show-Menu {
    Clear-Host
    Write-ColoredOutput "╔═══════════════════════════════════════════════════════════════╗" $Blue
    Write-ColoredOutput "║                   EXPO APK BUILDER MENU                      ║" $Blue
    Write-ColoredOutput "╠═══════════════════════════════════════════════════════════════╣" $Blue
    Write-ColoredOutput "║                                                               ║" $Blue
    Write-ColoredOutput "║  Choose your preferred APK building method:                  ║" $White
    Write-ColoredOutput "║                                                               ║" $White
    Write-ColoredOutput "║  1. 🐳 DOCKER BUILD (Recommended for consistency)            ║" $Cyan
    Write-ColoredOutput "║     • Isolated environment                                   ║" $White
    Write-ColoredOutput "║     • All dependencies included                              ║" $White
    Write-ColoredOutput "║     • Works on any machine with Docker                      ║" $White
    Write-ColoredOutput "║                                                               ║" $White
    Write-ColoredOutput "║  2. ☁️  EAS BUILD (Expo Application Services)                ║" $Green
    Write-ColoredOutput "║     • Cloud-based building                                   ║" $White
    Write-ColoredOutput "║     • No local Android SDK required                         ║" $White
    Write-ColoredOutput "║     • Professional production builds                        ║" $White
    Write-ColoredOutput "║                                                               ║" $White
    Write-ColoredOutput "║  3. 🏠 LOCAL BUILD (Traditional method)                      ║" $Yellow
    Write-ColoredOutput "║     • Requires Android SDK setup                            ║" $White
    Write-ColoredOutput "║     • Fastest for development                               ║" $White
    Write-ColoredOutput "║     • Full control over build process                       ║" $White
    Write-ColoredOutput "║                                                               ║" $White
    Write-ColoredOutput "╚═══════════════════════════════════════════════════════════════╝" $Blue
    Write-ColoredOutput "" $White
}

function Show-DetailedHelp {
    Show-Menu
    
    Write-ColoredOutput "USAGE EXAMPLES:" $Yellow
    Write-ColoredOutput "" $White
    
    Write-ColoredOutput "🐳 Docker Build:" $Cyan
    Write-ColoredOutput "   .\build-apk.ps1 -Method docker -BuildType development" $White
    Write-ColoredOutput "   .\build-apk.ps1 -Method docker -BuildType release" $White
    Write-ColoredOutput "" $White
    
    Write-ColoredOutput "☁️ EAS Build:" $Green
    Write-ColoredOutput "   .\build-apk.ps1 -Method eas -BuildType development" $White
    Write-ColoredOutput "   .\build-apk.ps1 -Method eas -BuildType preview" $White
    Write-ColoredOutput "   .\build-apk.ps1 -Method eas -BuildType production-apk" $White
    Write-ColoredOutput "" $White
    
    Write-ColoredOutput "🏠 Local Build:" $Yellow
    Write-ColoredOutput "   .\build-apk.ps1 -Method local -BuildType debug" $White
    Write-ColoredOutput "   .\build-apk.ps1 -Method local -BuildType release" $White
    Write-ColoredOutput "" $White
    
    Write-ColoredOutput "INSTALLATION & SETUP:" $Yellow
    Write-ColoredOutput "   .\build-apk.ps1 -Method docker -Install    # Install Docker prerequisites" $White
    Write-ColoredOutput "   .\build-apk.ps1 -Method eas -Install       # Install EAS CLI" $White
    Write-ColoredOutput "   .\build-apk.ps1 -Method local -Install     # Check local requirements" $White
    Write-ColoredOutput "" $White
    
    Write-ColoredOutput "COMPARISON:" $Yellow
    Write-ColoredOutput "" $White
    Write-ColoredOutput "Method  │ Setup Time │ Build Time │ Requirements      │ Best For" $White
    Write-ColoredOutput "────────┼────────────┼────────────┼───────────────────┼─────────────────" $White
    Write-ColoredOutput "Docker  │ Medium     │ Medium     │ Docker only       │ Consistency" $Cyan
    Write-ColoredOutput "EAS     │ Quick      │ Medium     │ Expo account      │ Production" $Green
    Write-ColoredOutput "Local   │ Long       │ Fast       │ Android SDK+Java  │ Development" $Yellow
    Write-ColoredOutput "" $White
}

function Get-UserChoice {
    Write-ColoredOutput "Select build method:" $Yellow
    Write-ColoredOutput "  [1] Docker Build" $Cyan
    Write-ColoredOutput "  [2] EAS Build" $Green
    Write-ColoredOutput "  [3] Local Build" $Yellow
    Write-ColoredOutput "  [H] Help" $Blue
    Write-ColoredOutput "  [Q] Quit" $Red
    Write-ColoredOutput "" $White
    
    do {
        $choice = Read-Host "Enter your choice (1-3, H, Q)"
        switch ($choice.ToUpper()) {
            "1" { return "docker" }
            "2" { return "eas" }
            "3" { return "local" }
            "H" { return "help" }
            "Q" { return "quit" }
            default { 
                Write-ColoredOutput "Invalid choice. Please enter 1, 2, 3, H, or Q." $Red 
            }
        }
    } while ($true)
}

function Execute-DockerBuild {
    Write-ColoredOutput "🐳 Starting Docker Build..." $Cyan
    
    if (!(Test-Path "build-apk-docker.ps1")) {
        Write-ColoredOutput "Docker build script not found!" $Red
        exit 1
    }
    
    if ($Install) {
        & .\build-apk-docker.ps1 -SkipDockerInstall:$false -BuildType $BuildType
    } else {
        & .\build-apk-docker.ps1 -BuildType $BuildType
    }
}

function Execute-EASBuild {
    Write-ColoredOutput "☁️ Starting EAS Build..." $Green
    
    if (!(Test-Path "build-apk-eas.ps1")) {
        Write-ColoredOutput "EAS build script not found!" $Red
        exit 1
    }
    
    if ($Install) {
        & .\build-apk-eas.ps1 -Install
    } else {
        & .\build-apk-eas.ps1 -BuildProfile $BuildType
    }
}

function Execute-LocalBuild {
    Write-ColoredOutput "🏠 Starting Local Build..." $Yellow
    
    if (!(Test-Path "build-apk-local.ps1")) {
        Write-ColoredOutput "Local build script not found!" $Red
        exit 1
    }
    
    if ($Install) {
        & .\build-apk-local.ps1 -SetupAndroid
    } else {
        if ($Clean) {
            & .\build-apk-local.ps1 -BuildType $BuildType -Clean
        } else {
            & .\build-apk-local.ps1 -BuildType $BuildType
        }
    }
}

function Test-Prerequisites {
    Write-ColoredOutput "Checking prerequisites..." $Blue
    
    # Check if we're in a React Native/Expo project
    if (!(Test-Path "package.json")) {
        Write-ColoredOutput "Error: package.json not found. Are you in a React Native/Expo project directory?" $Red
        exit 1
    }
    
    # Check if it's an Expo project
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $hasExpo = $packageJson.dependencies.expo -or $packageJson.devDependencies.expo
    
    if (!$hasExpo) {
        Write-ColoredOutput "Warning: This doesn't appear to be an Expo project." $Yellow
        $continue = Read-Host "Continue anyway? (y/N)"
        if ($continue.ToUpper() -ne "Y") {
            exit 1
        }
    }
    
    Write-ColoredOutput "Project validation passed." $Green
}

function Main {
    try {
        # Test prerequisites
        Test-Prerequisites
        
        # Handle help or interactive mode
        if ($Method -eq "help" -or $Method -eq "") {
            Show-DetailedHelp
            
            if ($Method -eq "") {
                $Method = Get-UserChoice
                if ($Method -eq "quit") {
                    Write-ColoredOutput "Goodbye!" $Blue
                    exit 0
                }
                if ($Method -eq "help") {
                    Show-DetailedHelp
                    return
                }
            } else {
                return
            }
        }
        
        # Execute selected build method
        switch ($Method) {
            "docker" { Execute-DockerBuild }
            "eas" { Execute-EASBuild }
            "local" { Execute-LocalBuild }
            default { 
                Write-ColoredOutput "Invalid method: $Method" $Red
                Show-DetailedHelp
                exit 1
            }
        }
        
    } catch {
        Write-ColoredOutput "Error occurred: $_" $Red
        exit 1
    }
}

# Run main function
Main