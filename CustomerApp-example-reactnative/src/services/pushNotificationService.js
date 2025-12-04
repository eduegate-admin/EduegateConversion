import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert, AppState } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { navigationRef } from '../navigation/NavigationService';
import apiClient from './apiClient';
import callContextCache from '../utils/callContextCache';

// Platform-specific imports (only for native platforms)
let messaging = null;
let notifee = null;
let AndroidImportance = null;

if (Platform.OS !== 'web') {
  try {
    messaging = require('@react-native-firebase/messaging').default;
    const notifeeModule = require('@notifee/react-native');
    notifee = notifeeModule.default;
    AndroidImportance = notifeeModule.AndroidImportance;
  } catch (error) {
    console.warn('⚠️ Native push notification modules not available:', error.message);
  }
}

// Storage keys for FCM token management
const STORAGE_KEYS = {
  FCM_TOKEN: 'fcm_token',
  FCM_TOKEN_REGISTERED: 'fcm_token_registered',
  FCM_LAST_REGISTRATION: 'fcm_last_registration',
};

// Create notification channel for Android
const createNotificationChannel = async () => {
  if (Platform.OS === 'android' && notifee && AndroidImportance) {
    try {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });
    } catch (error) {
      console.warn('⚠️ Failed to create notification channel:', error);
    }
  }
};

const PushNotificationService = {
  // Store unsubscribe functions for cleanup
  _messageUnsubscribers: [],
  _appStateSubscription: null,

  // ========================================
  // FCM TOKEN MANAGEMENT
  // ========================================

  /**
   * Initialize Firebase push notifications with Cordova migration support
   */
  initializeFCM: async (navigation = null) => {
    try {
      console.log("🔥 Initializing Firebase push notifications...");

      // Check platform compatibility first
      if (Platform.OS === "web") {
        console.warn(
          "⚠️ Firebase messaging not supported on web platform - skipping initialization"
        );
        return {
          success: false,
          message: "Web platform not supported for FCM",
        };
      }

      // Check if messaging is available
      if (!messaging) {
        console.warn(
          "⚠️ Firebase messaging not available - skipping initialization"
        );
        return {
          success: false,
          message: "Firebase messaging not available - check Firebase setup",
        };
      }

      // Request notification permissions with error handling
      let authStatus;
      try {
        authStatus = await messaging().requestPermission();
      } catch (permissionError) {
        console.error("❌ Permission request failed:", permissionError);
        return {
          success: false,
          message: "Permission request failed: " + permissionError.message,
        };
      }

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log("✅ Notification permission granted:", authStatus);

        // Setup message handlers with error handling
        try {
          await PushNotificationService.setupMessageHandlers();
        } catch (handlerError) {
          console.error("❌ Message handlers setup failed:", handlerError);
          // Continue initialization even if handlers fail
        }

        // Setup app state handling (Cordova device resume equivalent)
        try {
          PushNotificationService.setupAppStateHandling();
        } catch (stateError) {
          console.error("❌ App state setup failed:", stateError);
          // Continue initialization even if app state setup fails
        }

        // Get initial FCM token with error handling
        try {
          await PushNotificationService.getFCMToken();
        } catch (tokenError) {
          console.error("❌ Initial token fetch failed:", tokenError);
          // Continue initialization even if token fetch fails
        }

        return { success: true, message: "Firebase initialized successfully" };
      } else {
        console.warn("⚠️ Notification permission denied");
        return { success: false, message: "Notification permission denied" };
      }
    } catch (error) {
      console.error("❌ Firebase initialization failed:", error);
      return { success: false, message: error.message, error };
    }
  },

  /**
   * Get FCM token (migrated from Cordova localStorage)
   */
  getFCMToken: async () => {
    try {
      // Check if messaging is available
      if (!messaging) {
        console.warn("⚠️ Firebase messaging not available");
        return { success: false, message: "Firebase messaging not available" };
      }

      // Try to get cached token first
      let token = await AsyncStorage.getItem(STORAGE_KEYS.FCM_TOKEN);
      console.log("🔍 Getting FCM token - Cached:", token ? "Found" : "Not found");
      if (!token) {
        // Get fresh token from Firebase
        token = await messaging().getToken();
        if (token) {
          await AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);
          console.log("📱 New FCM token generated and stored");
        }
      }

      return { success: true, token };
    } catch (error) {
      console.error("❌ Error getting FCM token:", error);
      return { success: false, message: error.message, error };
    }
  },

  /**
   * Register FCM token with API (Migrated from Cordova implementation)
   */
  registerFCMTokenWithAPI: async () => {
    try {
      console.log("🔄 Starting FCM token registration process...");
      const tokenResult = await PushNotificationService.getFCMToken();
      if (!tokenResult.success || !tokenResult.token) {
        throw new Error("FCM token not available");
      }

      const context = await callContextCache.get();
      if (!context) {
        throw new Error("Call context not available");
      }
      const token = tokenResult.token;

      console.log(
        "📤 Registering FCM token with API:",
        token.substring(0, 20) + "..."
      );

      // Make API call matching Cordova format: GET /RegisterUserDevice?token=xxx
      const response = await apiClient.get(
        `/useraccount/RegisterUserDevice?token=${encodeURIComponent(token)}`,
        {
          headers: {
            Accept: "application/json;charset=UTF-8",
            "Content-Type": "application/json; charset=utf-8",
            CallContext: JSON.stringify(context),
          },
        }
      );

      if (response) {
        const registrationTime = new Date().toISOString();
        await AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN_REGISTERED, "true");
        await AsyncStorage.setItem(
          STORAGE_KEYS.FCM_LAST_REGISTRATION,
          registrationTime
        );
        console.log("✅ FCM token registered successfully with API");
        console.log(`📅 Registration time: ${registrationTime}`);
        console.log(`🔑 Token (first 20 chars): ${token.substring(0, 20)}...`);
        return { success: true, response };
      } else {
        throw new Error("API registration failed");
      }
    } catch (error) {
      console.error("❌ Failed to register FCM token with API:", error);
      throw error;
    }
  },

  /**
   * Unregister FCM token (when user logs out)
   */
  unregisterFCMToken: async () => {
    try {
      console.log("🗑️ Unregistering FCM token...");

      // Clear registration status
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.FCM_TOKEN_REGISTERED,
        STORAGE_KEYS.FCM_LAST_REGISTRATION,
      ]);

      console.log("✅ FCM token unregistered");
      return { success: true, message: "Token unregistered" };
    } catch (error) {
      console.error("❌ FCM token unregistration error:", error);
      return { success: false, message: error.message, error };
    }
  },

  /**
   * Check if FCM token is registered
   */
  isFCMTokenRegistered: async () => {
    try {
      const isRegistered = await AsyncStorage.getItem(
        STORAGE_KEYS.FCM_TOKEN_REGISTERED
      );
      return { success: true, isRegistered: !!isRegistered };
    } catch (error) {
      console.error("❌ Error checking FCM token registration:", error);
      return { success: false, isRegistered: false, error };
    }
  },

  // ========================================
  // MESSAGE HANDLING (CORDOVA MIGRATION)
  // ========================================

  // Store unsubscribe functions for cleanup
  _messageUnsubscribers: [],

  /**
   * Setup message handlers for background and foreground messages
   */
  setupMessageHandlers: async () => {
    try {
      // Check if messaging is available
      if (!messaging) {
        console.warn("⚠️ Firebase messaging not available for message handlers");
        return;
      }

      // Clear any existing handlers first
      PushNotificationService.cleanupMessageHandlers();

      // Background message handler with iOS-safe error handling
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        try {
          console.log("📨 Background message received:", remoteMessage);
          // On iOS, avoid complex operations in background handler
          if (Platform.OS === "ios") {
            // Just log the message, handle it when app becomes active
            await AsyncStorage.setItem(
              "lastBackgroundMessage",
              JSON.stringify({
                message: remoteMessage,
                timestamp: new Date().toISOString(),
              })
            );
          } else {
            await PushNotificationService.handleMessage(remoteMessage, false);
          }
        } catch (error) {
          console.error("❌ Background message handler error:", error);
          // Don't throw errors in background handler on iOS
        }
      });

      // Foreground message handler
      const foregroundUnsubscribe = messaging().onMessage(
        async (remoteMessage) => {
          try {
            console.log("📨 Foreground message received:", remoteMessage);
            await PushNotificationService.handleMessage(remoteMessage, false);
          } catch (error) {
            console.error("❌ Foreground message handler error:", error);
          }
        }
      );
      PushNotificationService._messageUnsubscribers.push(foregroundUnsubscribe);

      // Notification tap handler
      const notificationTapUnsubscribe = messaging().onNotificationOpenedApp(
        (remoteMessage) => {
          try {
            console.log("📱 Notification tapped (background):", remoteMessage);
            // Use setTimeout to ensure navigation is ready
            setTimeout(() => {
              PushNotificationService.handleMessage(remoteMessage, true);
            }, 100);
          } catch (error) {
            console.error("❌ Notification tap handler error:", error);
          }
        }
      );
      PushNotificationService._messageUnsubscribers.push(
        notificationTapUnsubscribe
      );

      console.log("✅ Message handlers setup complete");
    } catch (error) {
      console.error("❌ Error setting up message handlers:", error);
    }
  },

  /**
   * Cleanup message handlers (important for iOS)
   */
  cleanupMessageHandlers: () => {
    try {
      PushNotificationService._messageUnsubscribers.forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      });
      PushNotificationService._messageUnsubscribers = [];
      console.log("✅ Message handlers cleaned up");
    } catch (error) {
      console.error("❌ Error cleaning up message handlers:", error);
    }
  },

  /**
   * Handle device resume and check for initial push payload (Migrated from Cordova)
   */
  handleDeviceResume: async () => {
    try {
      console.log("📱 Device resumed - checking for initial push payload...");

      // Check if messaging is available
      if (!messaging) {
        console.warn("⚠️ Firebase messaging not available for device resume");
        return;
      }

      // Check for initial notification when app was opened from terminated state
      const initialNotification = await messaging().getInitialNotification();

      if (initialNotification) {
        console.log(
          "🔔 Initial push notification received:",
          JSON.stringify(initialNotification)
        );
        await PushNotificationService.handleMessage(initialNotification, true);
      }

      // On iOS, check for background messages that were queued
      if (Platform.OS === "ios") {
        try {
          const lastBackgroundMessage = await AsyncStorage.getItem(
            "lastBackgroundMessage"
          );
          if (lastBackgroundMessage) {
            const { message, timestamp } = JSON.parse(lastBackgroundMessage);

            // Only process if message is recent (within last 5 minutes)
            const messageTime = new Date(timestamp).getTime();
            const now = new Date().getTime();
            const fiveMinutes = 5 * 60 * 1000;

            if (now - messageTime < fiveMinutes) {
              console.log("📱 Processing queued background message:", message);
              await PushNotificationService.handleMessage(message, false);
            }

            // Clear the stored message
            await AsyncStorage.removeItem("lastBackgroundMessage");
          }
        } catch (bgError) {
          console.error("❌ Error processing background message:", bgError);
        }
      }
    } catch (error) {
      console.error("❌ Error handling device resume:", error);
    }
  },

  /**
   * Main message handler (Migrated from Cordova HandleMessage function) - Crash Safe
   */
  handleMessage: async (message, wasTapped = false) => {
    try {
      // Comprehensive message validation
      if (!message) {
        console.log("❌ Message is not available");
        return;
      }

      if (typeof message !== "object") {
        console.error(
          "❌ Invalid message format - expected object:",
          typeof message
        );
        return;
      }

      // Safe JSON stringification
      let messageStr;
      try {
        messageStr = JSON.stringify(message);
      } catch (jsonError) {
        messageStr = "[Unable to stringify message: " + jsonError.message + "]";
      }
      console.log("📨 Processing push message:", messageStr);

      // Safe data extraction with fallbacks
      let messageData;
      try {
        messageData =
          message.data && typeof message.data === "object" ? message.data : {};
      } catch (dataError) {
        console.warn("⚠️ Failed to extract message data:", dataError);
        messageData = {};
      }

      const tap = wasTapped || messageData.tap || messageData.wasTapped;

      // Handle tapped notifications with error isolation
      if (tap) {
        try {
          await PushNotificationService.handleTappedMessage(messageData);
        } catch (tapError) {
          console.error("❌ Tap message handling failed:", tapError);
          // Don't prevent other message processing
        }
      }

      // Handle replacement request notifications with error isolation
      try {
        await PushNotificationService.handleReplacementRequest(
          message,
          messageData
        );
      } catch (replacementError) {
        console.error(
          "❌ Replacement request handling failed:",
          replacementError
        );
        // Don't prevent other message processing
      }
    } catch (error) {
      console.error("❌ Error processing message:", error);
    }
  },

  /**
   * Handle tapped message navigation (Migrated from Cordova)
   */
  handleTappedMessage: async (messageData) => {
    try {
      // Check if user is guest (equivalent to !$rootScope.IsGuestUser)
      const userData = await AsyncStorage.getItem("userData");
      const isGuestUser = !userData;

      if (isGuestUser) {
        // Navigate to home for guest users
        const nav = navigationRef?.current;
        if (nav) {
          nav.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Home" }],
            })
          );
        }
        return;
      }

      // Use enhanced navigation logic
      PushNotificationService.navigateFromNotification(messageData);
    } catch (error) {
      console.error("❌ Error handling tapped message:", error);
    }
  },

  /**
   * Navigate based on notification data (Enhanced Cordova migration with iOS safety)
   */
  navigateFromNotification: (notificationData, navigation = null) => {
    try {
      const { subcommand, referenceid, skutag, title, searchtext } =
        notificationData;
      const nav = navigation || navigationRef;

      // Enhanced navigation safety for iOS
      const safeNavigate = (screenName, params = {}) => {
        try {
          if (!nav || !nav.current) {
            console.warn("⚠️ Navigation ref not available for:", screenName);
            return;
          }

          // Check if navigation is ready
          if (
            typeof nav.current.isReady === "function" &&
            !nav.current.isReady()
          ) {
            console.warn("⚠️ Navigation not ready, retrying in 500ms...");
            setTimeout(() => safeNavigate(screenName, params), 500);
            return;
          }

          nav.current.navigate(screenName, params);
          console.log("🧭 Successfully navigated to:", screenName, params);
        } catch (navError) {
          console.error("❌ Navigation error for", screenName, ":", navError);
        }
      };

      // Handle different notification types (same as Cordova logic)
      switch (subcommand) {
        case "orderdetails":
          if (referenceid) {
            safeNavigate("OrderDetails", { orderID: referenceid });
          }
          break;

        case "tags":
          safeNavigate("ProductListing", {
            searchText: "",
            filterValue: `skutags:${skutag}`,
            filterText: "",
            sortText: "relevance",
            pageType: "Recommended",
            searchTitle: title,
            caption: title,
          });
          break;

        case "search":
          safeNavigate("ProductListing", {
            searchText: searchtext || "",
            filterValue: null,
            filterText: "",
            sortText: "relevance",
            pageType: "Search",
            searchTitle: title,
            caption: title,
          });
          break;

        default:
          safeNavigate("Notifications");
          break;
      }
    } catch (error) {
      console.error("❌ Navigation error:", error);
    }
  },

  /**
   * Handle replacement request notifications (Migrated from Cordova) - Crash Safe
   */
  handleReplacementRequest: async (message, messageData) => {
    try {
      // Safe property extraction with fallbacks
      let title, body, command;

      try {
        title = (
          message?.notification?.title ||
          messageData?.title ||
          ""
        ).toString();
        body = (
          message?.notification?.body ||
          messageData?.body ||
          ""
        ).toString();
        command = (messageData?.command || "").toString();
      } catch (extractError) {
        console.warn(
          "⚠️ Failed to extract replacement request data:",
          extractError
        );
        title = body = command = "";
      }

      // Safe string operations
      let isReplacementRequest = false;
      try {
        isReplacementRequest =
          title.toLowerCase().includes("replacement request") ||
          body.toLowerCase().includes("replacement request") ||
          command.toLowerCase().includes("replacement");
      } catch (stringError) {
        console.warn(
          "⚠️ String operation failed in replacement check:",
          stringError
        );
      }

      if (isReplacementRequest) {
        console.log("🔄 Replacement request received");

        // Extract order ID with safe regex
        let orderId;
        try {
          orderId = messageData?.referenceid;
          if (!orderId && body) {
            const match = body.match(/#(.*)#/);
            if (match && Array.isArray(match) && match.length > 1) {
              orderId = match[1];
            }
          }
        } catch (regexError) {
          console.warn("⚠️ Order ID extraction failed:", regexError);
        }

        // Show confirmation modal with error handling
        try {
          await PushNotificationService.showReplacementRequestModal(orderId);
        } catch (modalError) {
          console.error("❌ Replacement request modal failed:", modalError);
        }

        // Play notification sound with error handling
        try {
          await PushNotificationService.playNotificationSound();
        } catch (soundError) {
          console.error("❌ Notification sound failed:", soundError);
        }
      }
    } catch (error) {
      console.error("❌ Error handling replacement request:", error);
    }
  },

  /**
   * Show replacement request confirmation modal - Crash Safe
   */
  showReplacementRequestModal: async (orderId) => {
    try {
      // Check if Alert is available
      if (!Alert || typeof Alert.alert !== "function") {
        console.error("❌ Alert not available for replacement request modal");
        return;
      }

      // Safe modal with error handling in button press
      Alert.alert(
        "Replacement Request",
        "You have a replacement request, do you want to proceed?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Proceed",
            onPress: async () => {
              try {
                if (orderId && typeof orderId === "string" && orderId.trim()) {
                  const nav = navigationRef?.current;
                  if (nav && typeof nav.navigate === "function") {
                    nav.navigate("OrderDetails", { orderID: orderId.trim() });
                    console.log(
                      "🔄 Proceeded to OrderDetails for replacement:",
                      orderId
                    );
                  } else {
                    console.warn(
                      "⚠️ Navigation not available for replacement request"
                    );
                  }
                } else {
                  console.warn(
                    "⚠️ Invalid order ID for replacement request:",
                    orderId
                  );
                }
              } catch (proceedError) {
                console.error(
                  "❌ Error in replacement request proceed:",
                  proceedError
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("❌ Error showing replacement request modal:", error);
    }
  },

  /**
   * Play notification sound (placeholder for react-native-sound integration)
   */
  playNotificationSound: async () => {
    try {
      console.log("🔊 Playing notification sound...");

      // Note: Implementation would depend on your audio library setup
      // Example with react-native-sound:
      // const Sound = require('react-native-sound');
      // Sound.setCategory('Playback');
      //
      // const notificationSound = new Sound('notification.mp3', Sound.MAIN_BUNDLE, (error) => {
      //   if (error) {
      //     console.log('Failed to load sound:', error);
      //   } else {
      //     notificationSound.play();
      //   }
      // });
    } catch (error) {
      console.error("❌ Error playing notification sound:", error);
    }
  },

  /**
   * Setup app state change handling (equivalent to Cordova's device resume)
   */
  setupAppStateHandling: () => {
    try {
      // Clean up existing subscription
      PushNotificationService.cleanupAppStateHandling();

      // Setup new subscription with iOS-safe handling
      PushNotificationService._appStateSubscription = AppState.addEventListener(
        "change",
        (nextAppState) => {
          try {
            if (nextAppState === "active") {
              // Add slight delay for iOS to ensure app is fully active
              setTimeout(
                () => {
                  PushNotificationService.handleDeviceResume();
                },
                Platform.OS === "ios" ? 300 : 100
              );
            }
          } catch (stateError) {
            console.error("❌ App state change handler error:", stateError);
          }
        }
      );

      console.log("📱 App state change listener setup for push notifications");
    } catch (error) {
      console.error("❌ Error setting up app state handling:", error);
    }
  },

  /**
   * Cleanup app state handling (important for iOS)
   */
  cleanupAppStateHandling: () => {
    try {
      if (PushNotificationService._appStateSubscription) {
        PushNotificationService._appStateSubscription.remove();
        PushNotificationService._appStateSubscription = null;
        console.log("✅ App state subscription cleaned up");
      }
    } catch (error) {
      console.error("❌ Error cleaning up app state handling:", error);
    }
  },

  // ========================================
  // EXISTING NOTIFICATION API METHODS
  // ========================================

  GetUnReadPushNotifications: async () => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(
        `/ecommerce/GetPushNotifications?status=unread&currentPage=1`,
        {
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : "",
            "Content-Type": "application/json",
            callContext: JSON.stringify(callContext) || "",
          },
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  GetAllPushNotifications: async (page) => {
    try {
      const [callContext, authToken] = await Promise.all([
        callContextCache.get(),
        callContextCache.getAuthToken(),
      ]);

      const response = await apiClient.get(
        `/ecommerce/GetPushNotifications?status=all&currentPage=${page}`,
        {
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : "",
            "Content-Type": "application/json",
            callContext: JSON.stringify(callContext) || "",
          },
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // CONVENIENCE METHODS
  // ========================================

  /**
   * Complete setup - initialize Firebase and register token (call after login)
   */
  completeSetup: async (navigation = null) => {
    try {
      console.log("🚀 Starting complete FCM setup...");

      // Step 1: Initialize Firebase
      const initResult =
        await PushNotificationService.initializeFCM(navigation);
      if (!initResult.success) {
        return initResult;
      }

      // Step 2: Register token with API (if user is logged in)
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        try {
          const registrationResult =
            await PushNotificationService.registerFCMTokenWithAPI();
          console.log("✅ Complete FCM setup finished with registration");
          return {
            success: true,
            message: "FCM setup completed successfully",
            initialization: initResult,
            registration: registrationResult,
          };
        } catch (registrationError) {
          console.log(
            "⚠️ FCM initialized but registration failed:",
            registrationError.message
          );
          return {
            success: true,
            message: "FCM initialized, registration will retry on login",
            initialization: initResult,
            registration: { success: false, error: registrationError.message },
          };
        }
      } else {
        console.log(
          "✅ FCM initialized, waiting for user login to register token"
        );
        return {
          success: true,
          message: "FCM initialized, will register on login",
          initialization: initResult,
        };
      }
    } catch (error) {
      console.error("❌ Complete FCM setup failed:", error);
      return { success: false, message: error.message, error };
    }
  },

  /**
   * Get comprehensive FCM status information
   */
  getStatus: async () => {
    try {
      const tokenResult = await PushNotificationService.getFCMToken();
      const registrationResult =
        await PushNotificationService.isFCMTokenRegistered();
      const lastRegistration = await AsyncStorage.getItem(
        STORAGE_KEYS.FCM_LAST_REGISTRATION
      );

      return {
        success: true,
        status: {
          hasFCMToken: !!tokenResult.token,
          fcmToken: tokenResult.token
            ? tokenResult.token.substring(0, 20) + "..."
            : null,
          isRegistered: registrationResult.isRegistered,
          lastRegistration: lastRegistration,
          platform: Platform.OS,
        },
      };
    } catch (error) {
      console.error("❌ Error getting FCM status:", error);
      return { success: false, message: error.message, error };
    }
  },

  /**
   * Cleanup all subscriptions and handlers (important for iOS)
   * Call this when app is being destroyed or during logout
   */
  cleanup: () => {
    try {
      console.log("🧹 Cleaning up push notification service...");

      // Cleanup message handlers
      PushNotificationService.cleanupMessageHandlers();

      // Cleanup app state handling
      PushNotificationService.cleanupAppStateHandling();

      console.log("✅ Push notification service cleanup completed");
    } catch (error) {
      console.error("❌ Error during push notification cleanup:", error);
    }
  },
};

export default PushNotificationService;
