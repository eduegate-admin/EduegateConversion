# PowerShell script to build APK using Docker for React Native Expo App
# Run this script as Administrator

param(
    [switch]$SkipDockerInstall,
    [switch]$SkipPrerequisites,
    [string]$BuildType = "development",
    [string]$OutputDir = ".\build-output"
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-ColoredOutput {
    param($Message, $Color = "White")
    if ($Color -eq $null -or $Color -eq "") {
        $Color = "White"
    }
    Write-Host $Message -ForegroundColor $Color
}

function Test-CommandExists {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

function Install-Chocolatey {
    if (!(Test-CommandExists "choco")) {
        Write-ColoredOutput "Installing Chocolatey..." $Blue
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    } else {
        Write-ColoredOutput "Chocolatey already installed." $Green
    }
}

function Install-Docker {
    if (!(Test-CommandExists "docker")) {
        Write-ColoredOutput "Installing Docker Desktop..." $Blue
        Install-Chocolatey
        choco install docker-desktop -y
        Write-ColoredOutput "Docker installed. Please restart your system and run this script again." $Yellow
        exit 1
    } else {
        Write-ColoredOutput "Docker already installed." $Green
    }
}

function Start-DockerService {
    Write-ColoredOutput "Starting Docker service..." $Blue
    
    # Check if Docker Desktop is running
    $dockerProcess = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
    if (!$dockerProcess) {
        Write-ColoredOutput "Starting Docker Desktop..." $Blue
        Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        
        # Wait for Docker to start
        $timeout = 120
        $counter = 0
        while ($counter -lt $timeout) {
            try {
                docker version | Out-Null
                break
            } catch {
                Start-Sleep 2
                $counter += 2
                Write-ColoredOutput "Waiting for Docker to start... ($counter/$timeout seconds)" $Yellow
            }
        }
        
        if ($counter -ge $timeout) {
            Write-ColoredOutput "Docker failed to start within timeout period." $Red
            exit 1
        }
    }
    
    Write-ColoredOutput "Docker is running." $Green
}

function Install-Prerequisites {
    if (!$SkipPrerequisites) {
        Write-ColoredOutput "Installing prerequisites..." $Blue
        
        # Install Node.js if not present
        if (!(Test-CommandExists "node")) {
            Install-Chocolatey
            choco install nodejs -y
        }
        
        # Install Git if not present
        if (!(Test-CommandExists "git")) {
            Install-Chocolatey
            choco install git -y
        }
        
        Write-ColoredOutput "Prerequisites installed." $Green
    }
}

function Create-Dockerfile {
    Write-ColoredOutput "Creating Dockerfile..." $Blue
    
    $dockerfileContent = @"
# Multi-stage Docker build for React Native Expo APK generation
FROM node:18-bullseye AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    openjdk-11-jdk \
    wget \
    unzip \
    git \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set JAVA_HOME
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
ENV PATH=`$PATH:`$JAVA_HOME/bin

# Install Android SDK
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=`$ANDROID_HOME
ENV PATH=`$PATH:`$ANDROID_HOME/cmdline-tools/latest/bin:`$ANDROID_HOME/platform-tools:`$ANDROID_HOME/build-tools/33.0.2

RUN mkdir -p `$ANDROID_HOME/cmdline-tools && \
    cd `$ANDROID_HOME/cmdline-tools && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && \
    unzip commandlinetools-linux-9477386_latest.zip && \
    mv cmdline-tools latest && \
    rm commandlinetools-linux-9477386_latest.zip

# Accept Android SDK licenses
RUN yes | sdkmanager --licenses

# Install Android SDK components
RUN sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.2"

# Install global npm packages
RUN npm install -g @expo/cli eas-cli

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Create output directory
RUN mkdir -p /output

# Build script
COPY docker-build.sh /docker-build.sh
RUN chmod +x /docker-build.sh

CMD ["/docker-build.sh"]
"@

    $dockerfileContent | Out-File -FilePath "Dockerfile" -Encoding utf8
    Write-ColoredOutput "Dockerfile created." $Green
}

function Create-DockerBuildScript {
    Write-ColoredOutput "Creating Docker build script..." $Blue
    
    $buildScript = @"
#!/bin/bash
set -e

echo "Starting APK build process..."

# Configure Expo for local builds
echo "Configuring Expo..."
npx expo install --fix

# Pre-build the project
echo "Pre-building project..."
npx expo prebuild --platform android --clean

# Navigate to android directory
cd android

# Set permissions for gradlew
chmod +x ./gradlew

# Build APK
echo "Building APK..."
if [ "`$BUILD_TYPE" = "release" ]; then
    ./gradlew assembleRelease
    cp app/build/outputs/apk/release/app-release.apk /output/app-release.apk
    echo "Release APK built successfully!"
else
    ./gradlew assembleDebug
    cp app/build/outputs/apk/debug/app-debug.apk /output/app-debug.apk
    echo "Debug APK built successfully!"
fi

echo "APK build completed!"
"@

    $buildScript | Out-File -FilePath "docker-build.sh" -Encoding utf8
    Write-ColoredOutput "Docker build script created." $Green
}

function Create-DockerIgnore {
    Write-ColoredOutput "Creating .dockerignore..." $Blue
    
    $dockerIgnore = @"
node_modules
.expo
.git
build-output
*.log
.DS_Store
Thumbs.db
.vscode
.idea
*.apk
android/app/build
ios/build
"@

    $dockerIgnore | Out-File -FilePath ".dockerignore" -Encoding utf8
    Write-ColoredOutput ".dockerignore created." $Green
}

function Build-APK {
    Write-ColoredOutput "Building APK using Docker..." $Blue
    
    # Create output directory
    if (!(Test-Path $OutputDir)) {
        New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    }
    
    # Build Docker image
    Write-ColoredOutput "Building Docker image..." $Blue
    docker build -t expo-apk-builder .
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColoredOutput "Docker build failed!" $Red
        exit 1
    }
    
    # Run Docker container to build APK
    Write-ColoredOutput "Running APK build in container..." $Blue
    docker run --rm -v "${PWD}\${OutputDir}:/output" -e BUILD_TYPE=$BuildType expo-apk-builder
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColoredOutput "APK build failed!" $Red
        exit 1
    }
    
    Write-ColoredOutput "APK build completed successfully!" $Green
    Write-ColoredOutput "APK saved to: $OutputDir" $Green
}

function Cleanup-Files {
    Write-ColoredOutput "Cleaning up temporary files..." $Blue
    
    $filesToClean = @("Dockerfile", "docker-build.sh", ".dockerignore")
    foreach ($file in $filesToClean) {
        if (Test-Path $file) {
            Remove-Item $file -Force
        }
    }
    
    Write-ColoredOutput "Cleanup completed." $Green
}

function Main {
    Write-ColoredOutput "=== React Native Expo APK Builder with Docker ===" $Blue
    Write-ColoredOutput "Build Type: $BuildType" $Yellow
    Write-ColoredOutput "Output Directory: $OutputDir" $Yellow
    Write-ColoredOutput "" $White
    
    try {
        # Check if running as Administrator
        $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
        if (!$isAdmin) {
            Write-ColoredOutput "This script requires Administrator privileges for Docker installation." $Yellow
            Write-ColoredOutput "Please run PowerShell as Administrator and try again." $Red
            exit 1
        }
        
        # Install prerequisites
        Install-Prerequisites
        
        # Install and start Docker
        if (!$SkipDockerInstall) {
            Install-Docker
        }
        Start-DockerService
        
        # Create Docker files
        Create-Dockerfile
        Create-DockerBuildScript
        Create-DockerIgnore
        
        # Build APK
        Build-APK
        
        # Show results
        Write-ColoredOutput "" $White
        Write-ColoredOutput "=== Build Completed Successfully! ===" $Green
        Write-ColoredOutput "APK files available in: $OutputDir" $Green
        
        # List generated files
        $apkFiles = Get-ChildItem -Path $OutputDir -Filter "*.apk"
        if ($apkFiles) {
            Write-ColoredOutput "" $White
            Write-ColoredOutput "Generated APK files:" $Blue
            foreach ($file in $apkFiles) {
                Write-ColoredOutput "  - $($file.Name) ($('{0:N2}' -f ($file.Length / 1MB)) MB)" $Green
            }
        }
        
    } catch {
        Write-ColoredOutput "Error occurred: $_" $Red
        exit 1
    } finally {
        # Cleanup temporary files
        Cleanup-Files
    }
}

# Run main function
Main