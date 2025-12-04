import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { I18nManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppProvider } from "./src/AppContext/AppContext";
import { CallContextProvider } from "./src/AppContext/CallContext";
import { CartProvider } from "./src/AppContext/CartContext";
import { WishlistProvider } from "./src/AppContext/WishlistContext";
import PushNotification from "./src/notification/PushNotification";
import Toast from "react-native-toast-message";
import { toastConfig } from "./src/config/toastConfig";
import { useHardReloadOnResize } from "./src/hooks/useWindowRerender";
import { fontMap } from "./src/config/fontConfig";
import AppStack from "./src/navigation/AppStack";
import * as Font from "expo-font";
import analyticsService from "./src/services/analyticsService";
import "./src/localization/i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "./src/localization/i18n";

const App = () => {
  useHardReloadOnResize();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync(fontMap);
      setFontsLoaded(true);
    };

    const initializeRTL = async () => {
      try {
        // Get stored language preference
        const storedLanguage = await AsyncStorage.getItem("appLanguage");
        const isRTL = storedLanguage === "ar";

        // Force RTL if language is Arabic
        if (isRTL !== I18nManager.isRTL) {
          I18nManager.allowRTL(isRTL);
          I18nManager.forceRTL(isRTL);
        }
      } catch (error) {
        console.error("Error initializing RTL:", error);
      }
    };

    const initializeApp = async () => {
      try {
        // Initialize RTL first
        await initializeRTL();

        // Initialize analytics services with error isolation
        try {
          if (
            analyticsService &&
            typeof analyticsService.initialize === "function"
          ) {
            await analyticsService.initialize();
            await analyticsService.trackAppLaunch();
          } else {
            console.warn("⚠️ Analytics service not available");
          }
        } catch (analyticsError) {
          console.warn("⚠️ Analytics initialization failed:", analyticsError);
          // Continue with app initialization
        }

        // Initialize push notifications with comprehensive error handling
        try {
          console.log("🚀 App.js: Initializing push notifications...");
          const PushNotificationIntegration =
            require("./src/utils/pushNotificationIntegration").default;

          if (
            PushNotificationIntegration &&
            typeof PushNotificationIntegration.onAppLaunch === "function"
          ) {
            await PushNotificationIntegration.onAppLaunch();
            console.log(
              "✅ App.js: Push notifications initialization completed"
            );
          } else {
            console.warn("⚠️ Push notification integration not available");
          }
        } catch (pushError) {
          console.error(
            "❌ Push notification initialization failed:",
            pushError
          );
          // Don't block app startup if push notifications fail
        }
      } catch (error) {
        console.error(
          "❌ App.js: Critical error during app initialization:",
          error
        );
        // App should continue to load even if initialization fails
      }
    };

    const cleanup = () => {
      try {
        console.log("🧹 App.js: Cleaning up on app unmount...");

        // Safe cleanup with multiple fallbacks
        try {
          const PushNotificationService =
            require("./src/services/pushNotificationService").default;
          if (
            PushNotificationService &&
            typeof PushNotificationService.cleanup === "function"
          ) {
            PushNotificationService.cleanup();
          } else {
            console.warn("⚠️ PushNotificationService cleanup not available");
          }
        } catch (requireError) {
          console.warn(
            "⚠️ Failed to load PushNotificationService for cleanup:",
            requireError
          );
        }
      } catch (error) {
        console.error("❌ App.js: Error during cleanup:", error);
      }
    };

    loadFonts();
    initializeApp();

    // Cleanup function for when component unmounts (app closes)
    return cleanup;
  }, []);

  if (!fontsLoaded) return null;

  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider
        style={{ direction: I18nManager.isRTL ? "rtl" : "ltr" }}
      >
        <CallContextProvider>
          <AppProvider>
            <WishlistProvider>
              <CartProvider>
                <AppStack />
                <PushNotification />
                <Toast config={toastConfig} />
              </CartProvider>
            </WishlistProvider>
          </AppProvider>
        </CallContextProvider>
      </SafeAreaProvider>
    </I18nextProvider>
  );
};

export default App;
