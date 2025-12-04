import { useState, useEffect, useCallback } from "react";
import PushNotificationService from "../services/pushNotificationService";

/**
 * React hook for managing push notifications
 * Provides a simple interface for FCM token management and registration
 */
export const usePushNotifications = () => {
  const [fcmToken, setFcmToken] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Initialize Firebase push notifications
   */
  const initialize = useCallback(async (navigation = null) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🚀 Initializing push notifications...");

      // Check if service is available
      if (
        !PushNotificationService ||
        typeof PushNotificationService.initializeFCM !== "function"
      ) {
        throw new Error("PushNotificationService not available");
      }

      const result = await PushNotificationService.initializeFCM(navigation);

      if (result && result.success) {
        setIsInitialized(true);

        // Get the FCM token after successful initialization with error handling
        try {
          if (typeof PushNotificationService.getFCMToken === "function") {
            const tokenResult = await PushNotificationService.getFCMToken();
            if (tokenResult && tokenResult.success && tokenResult.token) {
              setFcmToken(tokenResult.token);
            }
          }
        } catch (tokenError) {
          console.warn("⚠️ Failed to get FCM token:", tokenError);
        }

        // Check registration status with error handling
        try {
          if (
            typeof PushNotificationService.isFCMTokenRegistered === "function"
          ) {
            const registrationStatus =
              await PushNotificationService.isFCMTokenRegistered();
            if (registrationStatus && registrationStatus.success) {
              setIsRegistered(registrationStatus.isRegistered);
            }
          }
        } catch (regError) {
          console.warn("⚠️ Failed to check registration status:", regError);
        }

        console.log("✅ Push notifications initialized successfully");
      } else {
        const errorMsg = result?.message || "Unknown initialization error";
        setError(errorMsg);
        console.error("❌ Push notification initialization failed:", errorMsg);
      }

      return result;
    } catch (err) {
      const errorMessage =
        err.message || "Failed to initialize push notifications";
      setError(errorMessage);
      console.error("❌ Push notification initialization error:", err);
      return { success: false, message: errorMessage, error: err };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register FCM token with API (call after user login)
   */
  const registerToken = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("📡 Registering FCM token with API...");

      const result = await PushNotificationService.registerFCMTokenWithAPI();

      if (result.success) {
        setIsRegistered(true);
        console.log("✅ FCM token registered with API successfully");
      } else {
        setError(result.message);
        console.error("❌ FCM token registration failed:", result.message);
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || "Failed to register FCM token";
      setError(errorMessage);
      console.error("❌ FCM token registration error:", err);
      return { success: false, message: errorMessage, error: err };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Unregister FCM token (call when user logs out)
   */
  const unregisterToken = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🗑️ Unregistering FCM token...");

      const result = await PushNotificationService.unregisterFCMToken();

      if (result.success) {
        setIsRegistered(false);
        console.log("✅ FCM token unregistered successfully");
      } else {
        setError(result.message);
        console.error("❌ FCM token unregistration failed:", result.message);
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || "Failed to unregister FCM token";
      setError(errorMessage);
      console.error("❌ FCM token unregistration error:", err);
      return { success: false, message: errorMessage, error: err };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Complete setup (initialize + register if user is logged in)
   */
  const completeSetup = useCallback(async (navigation = null) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔧 Starting complete push notification setup...");

      const result = await PushNotificationService.completeSetup(navigation);

      if (result.success) {
        setIsInitialized(true);

        // Update token and registration status
        const tokenResult = await PushNotificationService.getFCMToken();
        if (tokenResult.success) {
          setFcmToken(tokenResult.token);
        }

        const registrationStatus =
          await PushNotificationService.isFCMTokenRegistered();
        if (registrationStatus.success) {
          setIsRegistered(registrationStatus.isRegistered);
        }

        console.log("✅ Complete push notification setup finished");
      } else {
        setError(result.message);
        console.error("❌ Complete setup failed:", result.message);
      }

      return result;
    } catch (err) {
      const errorMessage =
        err.message || "Failed to complete push notification setup";
      setError(errorMessage);
      console.error("❌ Complete setup error:", err);
      return { success: false, message: errorMessage, error: err };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get current status of push notifications
   */
  const getStatus = useCallback(async () => {
    try {
      const result = await PushNotificationService.getStatus();

      if (result.success) {
        setFcmToken(result.status.fcmToken);
        setIsRegistered(result.status.isRegistered);
        // Note: We don't update isInitialized from status as it's a runtime state
      }

      return result;
    } catch (err) {
      console.error("❌ Error getting push notification status:", err);
      return { success: false, message: err.message, error: err };
    }
  }, []);

  /**
   * Refresh token and registration status
   */
  const refreshStatus = useCallback(async () => {
    try {
      setIsLoading(true);

      // Get fresh token
      const tokenResult = await PushNotificationService.getFCMToken();
      if (tokenResult.success) {
        setFcmToken(tokenResult.token);
      }

      // Check registration status
      const registrationResult =
        await PushNotificationService.isFCMTokenRegistered();
      if (registrationResult.success) {
        setIsRegistered(registrationResult.isRegistered);
      }

      return { success: true };
    } catch (err) {
      console.error("❌ Error refreshing push notification status:", err);
      return { success: false, message: err.message, error: err };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh status on component mount
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return {
    // State
    fcmToken,
    isInitialized,
    isRegistered,
    isLoading,
    error,

    // Actions
    initialize,
    registerToken,
    unregisterToken,
    completeSetup,
    getStatus,
    refreshStatus,
  };
};

export default usePushNotifications;
