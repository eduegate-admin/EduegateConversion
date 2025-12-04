// notification/pushNotificationHelper.js
import { Alert, Platform, PermissionsAndroid } from "react-native";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef } from "react";
import i18n from "../localization/i18n";

// Platform-specific imports (only for native platforms)
let messaging = null;

if (Platform.OS !== "web") {
  try {
    messaging = require("@react-native-firebase/messaging").default;
  } catch (error) {
    console.warn("⚠️ Firebase messaging not available:", error.message);
  }
}

const FCM_TOKEN_KEY = "fcm_push_token";

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.warn(
      "Push notifications are not supported on simulators/emulators"
    );
    return null;
  }

  // Check if messaging is available (web platform or module not loaded)
  if (!messaging) {
    console.warn("Firebase messaging not available on this platform");
    return null;
  }

  try {
    // Request permission for notifications
    const authStatus = await messaging().requestPermission();

    // Protect against cases where requestPermission returns null or undefined
    if (authStatus === null || authStatus === undefined) {
      console.warn("messaging().requestPermission returned null or undefined");
      Alert.alert(i18n.t("failed_to_get_push_token"));
      return null;
    }

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      Alert.alert(i18n.t("failed_to_get_push_token"));
      return null;
    }

    // For Android 13+ (API level 33+), request POST_NOTIFICATIONS permission
    if (Platform.OS === "android" && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log("POST_NOTIFICATIONS permission denied");
        return null;
      }
    }

    // Get FCM token
    const fcmToken = await messaging().getToken();

    if (!fcmToken) {
      console.error("Failed to get FCM token");
      return null;
    }

    console.log("FCM Token:", fcmToken);

    // Save token locally
    await AsyncStorage.setItem(FCM_TOKEN_KEY, fcmToken);
    return fcmToken;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
}

export async function getStoredPushToken() {
  try {
    var fcmToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);

    if (!fcmToken) {
      fcmToken = await registerForPushNotificationsAsync();
    }

    return fcmToken;
  } catch (error) {
    console.error("Error getting stored FCM token:", error);
    return null;
  }
}

export async function clearPushToken() {
  try {
    return await AsyncStorage.removeItem(FCM_TOKEN_KEY);
  } catch (error) {
    console.error("Error clearing FCM token:", error);
    return false;
  }
}

const PushNotification = () => {
  const unsubscribeOnMessage = useRef();
  const unsubscribeOnNotificationOpenedApp = useRef();

  useEffect(() => {
    const setupNotifications = async () => {
      // Skip setup if messaging is not available (web platform)
      if (!messaging) {
        console.log(
          "⚠️ Skipping push notification setup - messaging not available on this platform"
        );
        return;
      }

      try {
        // Register for FCM tokens
        await registerForPushNotificationsAsync();

        // Handle foreground messages
        unsubscribeOnMessage.current = messaging().onMessage(
          async (remoteMessage) => {
            console.log("FCM Message received in foreground:", remoteMessage);

            if (remoteMessage.notification) {
              Alert.alert(
                remoteMessage.notification.title || "Notification",
                remoteMessage.notification.body || ""
              );
            }
          }
        );

        // Handle notification opened app from background/quit state
        unsubscribeOnNotificationOpenedApp.current =
          messaging().onNotificationOpenedApp((remoteMessage) => {
            console.log(
              "Notification caused app to open from background:",
              remoteMessage
            );
          });

        // Check if app was opened from a notification (when app was quit)
        const initialNotification = await messaging().getInitialNotification();
        if (initialNotification) {
          console.log(
            "Notification caused app to open from quit state:",
            initialNotification
          );
        }

        // Listen for token refresh
        const unsubscribeTokenRefresh = messaging().onTokenRefresh(
          async (fcmToken) => {
            console.log("FCM Token refreshed:", fcmToken);
            await AsyncStorage.setItem(FCM_TOKEN_KEY, fcmToken);
          }
        );

        return () => {
          unsubscribeTokenRefresh();
        };
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    setupNotifications();

    return () => {
      if (unsubscribeOnMessage.current) {
        unsubscribeOnMessage.current();
      }
      if (unsubscribeOnNotificationOpenedApp.current) {
        unsubscribeOnNotificationOpenedApp.current();
      }
    };
  }, []);

  return null; // This component doesn't return JSX
};

export default PushNotification;
