import PushNotificationService from "../services/pushNotificationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import callContextCache from "../utils/callContextCache";

/**
 * Push Notification Integration Utility
 *
 * This class provides easy integration points for push notifications
 * with your authentication flow and app lifecycle events.
 */
class PushNotificationIntegration {
  /**
   * Call this when the app launches (in App.js useEffect) - Crash Safe
   * Initializes push notifications and sets up background handlers
   */
  static async onAppLaunch() {
    try {
      console.log("🚀 App Launch: Initializing push notifications...");

      // Check if PushNotificationService is available
      if (!PushNotificationService) {
        throw new Error("PushNotificationService not available");
      }

      if (typeof PushNotificationService.completeSetup !== "function") {
        throw new Error(
          "PushNotificationService.completeSetup is not a function"
        );
      }

      const result = await PushNotificationService.completeSetup();

      // Validate result structure
      if (result && typeof result === "object") {
        if (result.success) {
          console.log("✅ Push notifications initialized on app launch");
        } else {
          console.warn(
            "⚠️ Push notification initialization failed on app launch:",
            result.message || "Unknown error"
          );
        }
      } else {
        console.warn("⚠️ Invalid result from push notification setup:", result);
        return { success: false, message: "Invalid setup result" };
      }

      return result;
    } catch (error) {
      console.error(
        "❌ Error during app launch push notification setup:",
        error
      );
      return {
        success: false,
        message: error?.message || "Unknown error",
        error: error?.toString() || "Unknown error",
      };
    }
  }

  /**
   * Call this when user successfully logs in - Crash Safe
   * Registers the FCM token with your API
   */
  static async onUserLogin(userId = null, userData = null) {
    try {
      console.log("👤 User Login: Registering push notification token...");

      // Check service availability
      if (!PushNotificationService) {
        throw new Error("PushNotificationService not available");
      }

      // Ensure FCM is initialized first with error handling
      let initResult;
      try {
        if (typeof PushNotificationService.initializeFCM !== "function") {
          throw new Error("initializeFCM method not available");
        }
        initResult = await PushNotificationService.initializeFCM();
      } catch (initError) {
        throw new Error(
          "FCM initialization failed: " +
            (initError?.message || "Unknown error")
        );
      }

      if (!initResult || !initResult.success) {
        throw new Error(
          "FCM initialization failed: " +
            (initResult?.message || "Unknown result")
        );
      }

      // Register token with API with error handling
      let registrationResult;
      try {
        if (
          typeof PushNotificationService.registerFCMTokenWithAPI !== "function"
        ) {
          throw new Error("registerFCMTokenWithAPI method not available");
        }
        registrationResult =
          await PushNotificationService.registerFCMTokenWithAPI();
      } catch (regError) {
        throw new Error(
          "Token registration failed: " + (regError?.message || "Unknown error")
        );
      }

      if (registrationResult && registrationResult.success) {
        console.log("✅ Push notification token registered for user login");

        // Store user context for future reference with safe AsyncStorage
        if ((userId || userData) && AsyncStorage) {
          try {
            await AsyncStorage.setItem(
              "pushNotificationUserContext",
              JSON.stringify({
                userId: userId || null,
                userData: userData || null,
                registeredAt: new Date().toISOString(),
              })
            );
          } catch (storageError) {
            console.warn("⚠️ Failed to store user context:", storageError);
            // Don't fail the whole operation for storage issues
          }
        }
      } else {
        console.error(
          "❌ Failed to register push notification token on login:",
          registrationResult.message
        );
      }

      return registrationResult;
    } catch (error) {
      console.error(
        "❌ Error during user login push notification setup:",
        error
      );
      return { success: false, message: error.message, error };
    }
  }

  /**
   * Call this when user logs out - Crash Safe
   * Unregisters the FCM token and cleans up
   */
  static async onUserLogout() {
    try {
      console.log("👋 User Logout: Unregistering push notification token...");

      // Check service availability
      if (!PushNotificationService) {
        console.warn(
          "⚠️ PushNotificationService not available for logout cleanup"
        );
        return { success: false, message: "Service not available" };
      }

      // Cleanup all subscriptions and handlers (important for iOS)
      try {
        if (typeof PushNotificationService.cleanup === "function") {
          PushNotificationService.cleanup();
        } else {
          console.warn("⚠️ Cleanup method not available");
        }
      } catch (cleanupError) {
        console.warn("⚠️ Cleanup failed:", cleanupError);
        // Continue with logout process
      }

      // Unregister token with error handling
      let result = { success: true, message: "No token to unregister" };
      try {
        if (typeof PushNotificationService.unregisterFCMToken === "function") {
          result = await PushNotificationService.unregisterFCMToken();
        } else {
          console.warn("⚠️ unregisterFCMToken method not available");
        }
      } catch (unregisterError) {
        console.error("❌ Token unregistration failed:", unregisterError);
        result = {
          success: false,
          message: unregisterError?.message || "Unregistration failed",
          error: unregisterError,
        };
      }

      if (result && result.success) {
        console.log("✅ Push notification token unregistered for user logout");
      } else {
        console.error(
          "❌ Failed to unregister push notification token on logout:",
          result?.message || "Unknown error"
        );
      }

      // Clean up user context with safe AsyncStorage access
      if (AsyncStorage) {
        try {
          await AsyncStorage.removeItem("pushNotificationUserContext");
        } catch (storageError) {
          console.warn("⚠️ Failed to clear user context:", storageError);
          // Don't fail logout for storage issues
        }
      }

      return result || { success: false, message: "Unknown result" };
    } catch (error) {
      console.error(
        "❌ Error during user logout push notification cleanup:",
        error
      );
      return {
        success: false,
        message: error?.message || "Unknown error",
        error: error?.toString() || "Unknown error",
      };
    }
  }

  /**
   * Handle notification tap from anywhere in the app
   * This can be called by notification event handlers
   */
  static async handleNotificationTap(notificationData) {
    try {
      console.log("📱 Handling notification tap:", notificationData);

      // Use the service's message handling
      await PushNotificationService.handleMessage(notificationData, true);

      return { success: true };
    } catch (error) {
      console.error("❌ Error handling notification tap:", error);
      return { success: false, message: error.message, error };
    }
  }

  /**
   * Get current push notification status
   * Useful for debugging and status screens
   */
  static async getStatus() {
    try {
      const serviceStatus = await PushNotificationService.getStatus();
      const userContext = await AsyncStorage.getItem(
        "pushNotificationUserContext"
      );

      return {
        success: true,
        status: {
          ...serviceStatus.status,
          userContext: userContext ? JSON.parse(userContext) : null,
        },
      };
    } catch (error) {
      console.error("❌ Error getting push notification status:", error);
      return { success: false, message: error.message, error };
    }
  }

  /**
   * Force refresh token registration (useful for debugging)
   */
  static async refreshTokenRegistration() {
    try {
      console.log("🔄 Force refreshing token registration...");

      const result = await PushNotificationService.registerFCMTokenWithAPI();

      if (result.success) {
        console.log("✅ Token registration refreshed successfully");
      } else {
        console.error("❌ Token registration refresh failed:", result.message);
      }

      return result;
    } catch (error) {
      console.error("❌ Error refreshing token registration:", error);
      return { success: false, message: error.message, error };
    }
  }

  /**
   * Check if user is eligible for push notifications
   * (i.e., logged in and has required permissions)
   */
  static async isEligibleForPushNotifications() {
    try {
      // Check if user is logged in
      const userData = await AsyncStorage.getItem("userData");
      const callContext = await callContextCache.get();

      if (!userData || !callContext) {
        return {
          success: true,
          eligible: false,
          reason: "User not logged in",
        };
      }

      // Check if FCM token exists
      const tokenResult = await PushNotificationService.getFCMToken();
      if (!tokenResult.success || !tokenResult.token) {
        return {
          success: true,
          eligible: false,
          reason: "FCM token not available",
        };
      }

      return {
        success: true,
        eligible: true,
        token: tokenResult.token,
      };
    } catch (error) {
      console.error("❌ Error checking push notification eligibility:", error);
      return { success: false, message: error.message, error };
    }
  }

  /**
   * Retry failed operations (useful for error recovery)
   */
  static async retryFailedOperations() {
    try {
      console.log("🔄 Retrying failed push notification operations...");

      const results = {
        initialization: null,
        registration: null,
      };

      // Try to initialize if not already done
      const initResult = await PushNotificationService.initializeFCM();
      results.initialization = initResult;

      if (initResult.success) {
        // Try to register if user is logged in
        const eligibility =
          await PushNotificationIntegration.isEligibleForPushNotifications();

        if (eligibility.eligible) {
          const registrationResult =
            await PushNotificationService.registerFCMTokenWithAPI();
          results.registration = registrationResult;
        } else {
          results.registration = {
            success: false,
            message:
              "User not eligible for registration: " + eligibility.reason,
          };
        }
      }

      console.log("🔄 Retry operations completed:", results);
      return { success: true, results };
    } catch (error) {
      console.error("❌ Error during retry operations:", error);
      return { success: false, message: error.message, error };
    }
  }
}

export default PushNotificationIntegration;
