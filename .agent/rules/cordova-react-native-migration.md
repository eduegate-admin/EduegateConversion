---
trigger: always_on
---

Goal:
Convert the entire Cordova legacy application into a fully working, production-grade React Native application using TypeScript.

Important Note:
Only the folders named:
- Educate.ParentApp-legacy-cordova
- Educate.StaffApp-legacy-cordova
- Educate.StudentApp-legacy-cordova
- Educate.VisitorApp-legacy-cordova
are actual legacy Cordova apps.

Use only the example React Native apps (CustomerApp-example-reactnative and EmployeeApp-example-reactnative) as **reference patterns**, NOT functional sources.

Conversion Tasks:
------------------

1. Analyze the Cordova Folder
   - Read all HTML templates under /www, including:
       /apps
       /clients
       /css
       /data
       /scripts
       /partials
       /img
       /images
   - Analyze index.html to understand routing and entry point.
   - Map JS files inside /www/scripts to React Native screens, hooks, or services.
   - Extract dynamic logic, API calls, controllers, etc.

2. Create a Brand New React Native Project
   - Create a new folder next to the legacy folder named:
       <LegacyAppName>-ReactNative
   - Initialize a TypeScript React Native project.
   - Create this folder structure:
        /src
           /screens
           /navigation
           /components
           /services
           /hooks
           /helpers
           /assets/images
           /assets/fonts
   - Use React Navigation (stack + tab if needed).
   - Use axios for API requests.

3. Convert HTML → React Native Screens
   For each HTML file in /www/apps, /www/partials, /www/clients:
   - Convert the layout into React Native JSX.
   - Convert CSS files into StyleSheet objects.
   - Convert dynamic JS logic into React Hooks (useState, useEffect).
   - Break complex UIs into reusable components.
   - Maintain the UI hierarchy and flow exactly as the Cordova app.

4. Convert Cordova JavaScript Logic
   Inside /www/scripts:
   - Move API calls to /src/services.
   - Move utility functions to /src/helpers.
   - Convert controller-like JS into React functional components + hooks.
   - Convert event handlers into React Native equivalents.
   - Migrate localStorage/sessionStorage → AsyncStorage.

5. Cordova Plugin Replacement
   Replace Cordova plugins with React Native libraries:
   - Camera → react-native-camera or expo-camera
   - File operations → react-native-fs
   - SQLite → react-native-sqlite-storage
   - Push Notifications → Firebase FCM
   - Device Info → react-native-device-info
   - InAppBrowser → react-native-inappbrowser-reborn
   If any plugin mapping is unclear, ask before implementing.

6. Create Navigation Structure
   - Convert hyperlinks, menu items, router logic into React Navigation routes.
   - Ensure screen flow matches the legacy Cordova UX.

7. Asset Migration
   - Move images from /www/img and /www/images into /assets/images.
   - Move fonts from /www/fonts into /assets/fonts and configure react-native.config.js.

8. Validate Entire App
   - Ensure the generated React Native project compiles cleanly.
   - Verify all screens are connected.
   - Ensure each converted screen renders and has no missing styles.
   - Confirm all business logic matches the Cordova version.

Rules:
- Do not reuse logic from the RN example apps; only copy structure and styling standards.
- Do not delete anything in the legacy folder.
- Maintain exact business logic of the Cordova app.
- Follow modular, clean React Native architecture.

Output:
- Provide the full new React Native folder structure.
- Show converted screens, components, services, and navigation files.
- List all plugin replacements.
- Summarize any manual tasks (if needed).

Begin by analyzing the folder structure inside this legacy project and produce a complete migration plan before generating code.
