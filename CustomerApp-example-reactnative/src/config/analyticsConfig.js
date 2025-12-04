/**
 * Analytics Configuration
 *
 * This file contains all analytics-related configuration settings.
 * Update these values based on your app's configuration and environment.
 */

const ANALYTICS_CONFIG = {
  // Facebook SDK Configuration
  facebook: {
    appId: "1234567890123456", // Replace with your Facebook App ID
    clientToken: "your-facebook-client-token", // Replace with your Facebook Client Token
    displayName: "CustomerAppV2.1",

    // Optional: Environment-specific configuration
    development: {
      appId: "1234567890123456", // Development Facebook App ID
      clientToken: "dev-client-token",
    },
    production: {
      appId: "0987654321098765", // Production Facebook App ID
      clientToken: "prod-client-token",
    },
  },

  // Google Analytics / Firebase Configuration
  firebase: {
    // These are typically configured via google-services.json and GoogleService-Info.plist
    // but you can add additional configuration here if needed
    enableCrashlytics: true,
    enablePerformanceMonitoring: true,
    enableAnalytics: true,
  },

  // General Analytics Settings
  general: {
    // Enable/disable analytics based on environment or user preference
    enabled: true,

    // Enable debug mode (more verbose logging)
    debugMode: __DEV__,

    // Automatically collect screen views
    autoScreenViews: true,

    // Automatically collect app crashes
    autoCrashReporting: true,

    // Data retention period (in days)
    dataRetentionDays: 365,

    // Privacy settings
    respectDoNotTrack: true,
    anonymizeIp: true,
  },

  // Custom event tracking configuration
  events: {
    // E-commerce events
    ecommerce: {
      trackProductViews: true,
      trackAddToCart: true,
      trackRemoveFromCart: true,
      trackPurchases: true,
      trackCheckoutSteps: true,
      trackWishlistActions: true,
    },

    // User behavior events
    userBehavior: {
      trackScreenViews: true,
      trackButtonClicks: true,
      trackFormSubmissions: true,
      trackSearchQueries: true,
      trackSocialSharing: true,
    },

    // App performance events
    performance: {
      trackAppLaunch: true,
      trackScreenLoadTimes: true,
      trackApiResponseTimes: true,
      trackErrors: true,
    },

    // Marketing events
    marketing: {
      trackPromotionViews: true,
      trackPromotionClicks: true,
      trackCouponUsage: true,
      trackReferrals: true,
    },
  },

  // Custom properties to track
  customProperties: {
    userSegments: ["new_user", "returning_user", "premium_user"],
    appVersion: true,
    deviceInfo: true,
    locationData: false, // Set to true if you want to track location
    demographicData: false, // Set to true for demographic tracking
  },

  // Privacy and compliance settings
  privacy: {
    // GDPR compliance
    gdprCompliant: true,

    // Allow users to opt-out of tracking
    allowOptOut: true,

    // Data minimization - only collect necessary data
    minimizeDataCollection: true,

    // Encrypt sensitive data
    encryptSensitiveData: true,
  },

  // Regional settings
  regional: {
    // Primary currency for e-commerce tracking
    primaryCurrency: "AED",

    // Primary language
    primaryLanguage: "en",

    // Time zone
    timeZone: "Asia/Dubai",

    // Country code
    countryCode: "AE",
  },
};

// Helper functions to get configuration based on environment
export const getAnalyticsConfig = () => {
  const isDevelopment = __DEV__;
  const config = { ...ANALYTICS_CONFIG };

  // Use environment-specific Facebook config if available
  if (isDevelopment && config.facebook.development) {
    config.facebook = { ...config.facebook, ...config.facebook.development };
  } else if (!isDevelopment && config.facebook.production) {
    config.facebook = { ...config.facebook, ...config.facebook.production };
  }

  return config;
};

export const getFacebookConfig = () => {
  const config = getAnalyticsConfig();
  return config.facebook;
};

export const getFirebaseConfig = () => {
  const config = getAnalyticsConfig();
  return config.firebase;
};

export const isAnalyticsEnabled = () => {
  const config = getAnalyticsConfig();
  return config.general.enabled;
};

export const isEventTrackingEnabled = (eventCategory, eventType) => {
  const config = getAnalyticsConfig();
  return config.events[eventCategory]?.[eventType] ?? true;
};

export default ANALYTICS_CONFIG;
