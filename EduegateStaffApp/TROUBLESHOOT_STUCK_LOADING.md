# 🔧 Fix: App Stuck on Loading Screen

**Issue:** App shows white screen with Google logo and doesn't load  
**Status:** Troubleshooting  

---

## ⚡ Quick Fixes (Try in Order)

### 1. Reload the App (Fastest - 5 seconds)

**Method A: Keyboard Shortcut**
- Focus on the emulator window
- Press **R** key twice quickly (RR)
- App should reload

**Method B: Dev Menu**
- Press **Ctrl + M** (or **Cmd + M** on Mac) in emulator
- Tap "Reload"
- Or press **R** in the menu

**Method C: Shake Device**
- Click on emulator
- Press **Ctrl + Shift + Z** (shake gesture)
- Tap "Reload"

---

### 2. Restart Metro Bundler (1 minute)

**Close the current Metro terminal**, then:

```powershell
cd E:\EduegateConversion\EduegateStaffApp

# Set environment
$env:ANDROID_HOME = "E:\AndroidSDK"

# Start Metro with reset cache
npx react-native start --reset-cache
```

**Wait for Metro to start**, then the app should automatically reload.

---

### 3. Kill and Restart App (30 seconds)

```powershell
# Set environment
$env:ANDROID_HOME = "E:\AndroidSDK"
$env:Path = "E:\AndroidSDK\platform-tools;" + $env:Path

# Kill the app
adb shell am force-stop com.eduegatestaffapp

# Restart the app
adb shell am start -n com.eduegatestaffapp/.MainActivity
```

---

### 4. Uninstall and Reinstall (2 minutes)

```powershell
# Set environment
$env:ANDROID_HOME = "E:\AndroidSDK"
$env:Path = "E:\AndroidSDK\platform-tools;" + $env:Path

# Uninstall
adb uninstall com.eduegatestaffapp

# Reinstall
npx react-native run-android
```

---

### 5. Full Clean Build (5 minutes)

```powershell
cd E:\EduegateConversion\EduegateStaffApp

# Clean Android build
cd android
.\gradlew clean
cd ..

# Set environment
$env:ANDROID_HOME = "E:\AndroidSDK"
$env:Path = "E:\AndroidSDK\platform-tools;" + $env:Path

# Clean Metro cache
npx react-native start --reset-cache

# In NEW terminal:
npx react-native run-android
```

---

## 🔍 Check Metro Bundler

### Look for Errors:

In the Metro terminal, you should see:
```
✅ Metro is running
✅ Loading dependency graph, done.
```

If you see errors like:
- ❌ "Unable to resolve module"
- ❌ "SyntaxError"
- ❌ "Cannot find module"

**Then:** There's a code issue that needs fixing.

---

## 🐛 Common Causes

### 1. Metro Not Connected
- **Symptom:** White screen, no errors
- **Fix:** Restart Metro bundler

### 2. JavaScript Error
- **Symptom:** Red error screen or white screen
- **Fix:** Check Metro logs, fix code errors

### 3. Wrong API URL
- **Symptom:** Stuck loading, then timeout
- **Fix:** Check `src/constants/config.ts`

### 4. Port Issues
- **Symptom:** Metro can't start
- **Fix:** Kill process on port 8081
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8081).OwningProcess | Stop-Process
  ```

---

## 📱 What Should Happen

### Normal App Launch:
1. White screen (1 second)
2. App loads
3. Login screen appears
4. **Total: 2-3 seconds**

### If Stuck:
- White screen for more than 10 seconds = Problem!

---

## 🎯 Most Likely Issue

Based on your screenshot, this is usually:

**Metro Bundler Not Connected**

### Solution:
1. Close any Metro terminal windows
2. Open NEW terminal
3. Run:
   ```powershell
   cd E:\EduegateConversion\EduegateStaffApp
   $env:ANDROID_HOME = "E:\AndroidSDK"
   npx react-native start --reset-cache
   ```
4. Wait for "Loading dependency graph, done."
5. In emulator, press **R** twice to reload

---

## 📊 Troubleshooting Checklist

- [ ] Emulator is running (✅ confirmed)
- [ ] adb devices shows device (✅ confirmed)
- [ ] Metro bundler is running (❓ check this)
- [ ] No errors in Metro logs (❓ check this)
- [ ] App installed on emulator (✅ yes)
- [ ] Tried reload (RR) (❓ try this first!)

---

## 💡 Quick Test

**Try this RIGHT NOW:**

1. Click on the emulator window
2. Press **R** key twice quickly
3. Wait 5 seconds

**Did the login screen appear?**
- ✅ YES → Problem solved!
- ❌ NO → Continue to next steps

---

## 🚨 If Nothing Works

### Last Resort:

```powershell
# 1. Close ALL terminals
# 2. Close emulator
# 3. Restart emulator from Android Studio
# 4. Run:

cd E:\EduegateConversion\EduegateStaffApp
$env:ANDROID_HOME = "E:\AndroidSDK"
$env:Path = "E:\AndroidSDK\platform-tools;" + $env:Path

# Start Metro
npx react-native start --reset-cache

# In NEW terminal:
npx react-native run-android
```

---

## 📞 What to Check

1. **Metro Terminal** - Any errors?
2. **Emulator** - Can you see the app icon?
3. **Network** - API URL correct? (now set to Pearl live)
4. **Code** - Any recent changes that might cause errors?

---

**Most likely fix: Press RR (R twice) in the emulator!**

Let me know what happens!
