import { Platform } from "react-native";
import {
  getFacebookConfig,
  isAnalyticsEnabled,
} from "../config/analyticsConfig";

// Platform-specific imports
let Facebook = null;
let analytics = null;

// Helper to lazily require native-only modules without letting the bundler
// statically analyze the require string. Using eval("require") prevents
// Metro/webpack from trying to resolve native-only modules when bundling for web.
function tryRequireNative(moduleName) {
  try {
    // eslint-disable-next-line no-eval
    return eval("require")(moduleName);
  } catch (err) {
    // Module not available (likely on web); return null
    return null;
  }
}

class AnalyticsService {
  constructor() {
    this.isInitialized = false;
    this.facebookInitialized = false;
    this.firebaseInitialized = false;
  }

  // Helper method to safely log Facebook events
  logFacebookEvent(eventName, parameters) {
    if (this.facebookInitialized && Facebook && Platform.OS !== "web") {
      try {
        Facebook.logEvent(eventName, parameters);
      } catch (error) {
        console.error(`Error logging Facebook event ${eventName}:`, error);
      }
    }
  }

  // Initialize Analytics Services
  async initialize() {
    try {
      if (!isAnalyticsEnabled()) {
        console.log("Analytics disabled in configuration");
        return;
      }

      if (Platform.OS === "web") {
        console.log("🌐 Running on web - Analytics will use console logging");
        console.log("📊 Web Analytics Mode: Events will be logged to console");
        this.isInitialized = true;
        return;
      }

      // Initialize Facebook SDK
      await this.initializeFacebook();

      // Initialize Firebase Analytics
      await this.initializeFirebase();

      this.isInitialized = true;
      console.log("Analytics services initialized successfully");
    } catch (error) {
      console.error("Error initializing analytics:", error);
    }
  }

  async initializeFacebook() {
    try {
      if (Platform.OS === "web") {
        console.log("Facebook SDK not available on web platform");
        this.facebookInitialized = false;
        return;
      }
      // Lazy-load the expo-facebook module only on native platforms
      if (!Facebook) {
        Facebook = tryRequireNative("expo-facebook");
      }

      if (!Facebook) {
        console.warn(
          "Facebook SDK not available - skipping Facebook initialization"
        );
        this.facebookInitialized = false;
        return;
      }

      const facebookConfig = getFacebookConfig();
      // expo-facebook may export the methods directly or as default
      const FB = Facebook.default || Facebook;
      await FB.initializeAsync({
        appId: facebookConfig.appId,
      });
      this.facebookInitialized = true;
      console.log("Facebook SDK initialized");
    } catch (error) {
      console.error("Facebook SDK initialization error:", error);
      this.facebookInitialized = false;
    }
  }

  async initializeFirebase() {
    try {
      if (Platform.OS === "web") {
        console.log("Firebase Analytics not fully supported on web platform");
        this.firebaseInitialized = false;
        return;
      }
      // Lazy-load the react-native-firebase analytics module only on native
      if (!analytics) {
        const mod = tryRequireNative("@react-native-firebase/analytics");
        analytics = mod && (mod.default || mod);
      }

      if (!analytics) {
        console.warn(
          "Firebase Analytics not available - skipping Firebase initialization"
        );
        this.firebaseInitialized = false;
        return;
      }

      await analytics().setAnalyticsCollectionEnabled(true);
      this.firebaseInitialized = true;
      console.log("Firebase Analytics initialized");
    } catch (error) {
      console.error("Firebase Analytics initialization error:", error);
      this.firebaseInitialized = false;
    }
  }

  // Set User Properties
  async setUserProperties(properties) {
    try {
      if (this.firebaseInitialized && analytics && Platform.OS !== "web") {
        Object.keys(properties).forEach(async (key) => {
          await analytics().setUserProperty(key, String(properties[key]));
        });
      }
      console.log("User properties set:", properties);
    } catch (error) {
      console.error("Error setting user properties:", error);
    }
  }

  // Set User ID
  async setUserId(userId) {
    try {
      if (this.firebaseInitialized && analytics && Platform.OS !== "web") {
        await analytics().setUserId(String(userId));
      }
      console.log("User ID set:", userId);
    } catch (error) {
      console.error("Error setting user ID:", error);
    }
  }

  // Generic event tracking
  async trackEvent(eventName, parameters = {}) {
    try {
      // Firebase Analytics
      if (this.firebaseInitialized && analytics && Platform.OS !== "web") {
        await analytics().logEvent(eventName, parameters);
      }

      // Facebook Analytics
      if (this.facebookInitialized && Facebook && Platform.OS !== "web") {
        this.logFacebookEvent(eventName, parameters);
      }

      // Web platform fallback - log to console
      if (Platform.OS === "web") {
        console.log(`[Web Analytics] ${eventName}:`, parameters);
      }

      console.log(`Event tracked: ${eventName}`, parameters);
    } catch (error) {
      console.error(`Error tracking event ${eventName}:`, error);
    }
  }

  // App Events
  async trackAppLaunch() {
    await this.trackEvent("app_launch", {
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    });
  }

  async trackAppOpen() {
    await this.trackEvent("app_open", {
      platform: Platform.OS,
    });
  }

  // Authentication Events
  async trackLogin(method = "email") {
    await this.trackEvent("login", {
      method: method,
    });
  }

  async trackSignUp(method = "email") {
    await this.trackEvent("sign_up", {
      method: method,
    });
  }

  async trackLogout() {
    await this.trackEvent("logout", {
      timestamp: new Date().toISOString(),
    });
  }

  // E-commerce Events
  async trackViewItem(item) {
    const parameters = {
      item_id: item.id,
      item_name: item.name,
      item_category: item.category || "unknown",
      currency: item.currency || "AED",
      value: item.price || 0,
    };

    await this.trackEvent("view_item", parameters);

    // Facebook specific product view
    if (this.facebookInitialized && Facebook && Platform.OS !== "web") {
      this.logFacebookEvent("fb_mobile_content_view", {
        fb_content_id: item.id,
        fb_content_type: "product",
        fb_currency: parameters.currency,
        fb_value: parameters.value,
      });
    }
  }

  async trackAddToCart(item, quantity = 1) {
    const parameters = {
      item_id: item.id,
      item_name: item.name,
      item_category: item.category || "unknown",
      quantity: quantity,
      currency: item.currency || "AED",
      value: (item.price || 0) * quantity,
    };

    await this.trackEvent("add_to_cart", parameters);

    // Facebook specific add to cart
    if (this.facebookInitialized) {
      this.logFacebookEvent("fb_mobile_add_to_cart", {
        fb_content_id: item.id,
        fb_content_type: "product",
        fb_currency: parameters.currency,
        fb_value: parameters.value,
      });
    }
  }

  async trackRemoveFromCart(item, quantity = 1) {
    const parameters = {
      item_id: item.id,
      item_name: item.name,
      item_category: item.category || "unknown",
      quantity: quantity,
      currency: item.currency || "AED",
      value: (item.price || 0) * quantity,
    };

    await this.trackEvent("remove_from_cart", parameters);
  }

  async trackPurchase(transactionData) {
    const parameters = {
      transaction_id: transactionData.orderId,
      currency: transactionData.currency || "AED",
      value: transactionData.totalAmount,
      items: transactionData.items || [],
      payment_method: transactionData.paymentMethod,
      coupon: transactionData.couponCode,
    };

    await this.trackEvent("purchase", parameters);

    // Facebook specific purchase
    if (this.facebookInitialized) {
      this.logFacebookEvent("fb_mobile_purchase", {
        fb_order_id: transactionData.orderId,
        fb_currency: parameters.currency,
        fb_value: parameters.value,
        fb_content_type: "product",
      });
    }
  }

  async trackBeginCheckout(cartData) {
    const parameters = {
      currency: cartData.currency || "AED",
      value: cartData.totalAmount,
      items: cartData.items || [],
      item_count: cartData.itemCount || 0,
    };

    await this.trackEvent("begin_checkout", parameters);

    // Facebook specific checkout
    if (this.facebookInitialized) {
      this.logFacebookEvent("fb_mobile_initiated_checkout", {
        fb_currency: parameters.currency,
        fb_value: parameters.value,
        fb_num_items: parameters.item_count,
      });
    }
  }

  // Search Events
  async trackSearch(searchTerm, category = null) {
    const parameters = {
      search_term: searchTerm,
    };

    if (category) {
      parameters.item_category = category;
    }

    await this.trackEvent("search", parameters);

    // Facebook specific search
    if (this.facebookInitialized) {
      this.logFacebookEvent("fb_mobile_search", {
        fb_search_string: searchTerm,
      });
    }
  }

  // Navigation Events
  async trackScreenView(screenName, screenClass = null) {
    const parameters = {
      screen_name: screenName,
    };

    if (screenClass) {
      parameters.screen_class = screenClass;
    }

    await this.trackEvent("screen_view", parameters);
  }

  // Wishlist Events
  async trackAddToWishlist(item) {
    const parameters = {
      item_id: item.id,
      item_name: item.name,
      item_category: item.category || "unknown",
      currency: item.currency || "AED",
      value: item.price || 0,
    };

    await this.trackEvent("add_to_wishlist", parameters);

    // Facebook specific wishlist
    if (this.facebookInitialized) {
      this.logFacebookEvent("fb_mobile_add_to_wishlist", {
        fb_content_id: item.id,
        fb_content_type: "product",
        fb_currency: parameters.currency,
        fb_value: parameters.value,
      });
    }
  }

  async trackRemoveFromWishlist(item) {
    const parameters = {
      item_id: item.id,
      item_name: item.name,
      item_category: item.category || "unknown",
      currency: item.currency || "AED",
      value: item.price || 0,
    };

    await this.trackEvent("remove_from_wishlist", parameters);
  }

  // Share Events
  async trackShare(contentType, contentId, method = "unknown") {
    const parameters = {
      content_type: contentType,
      item_id: contentId,
      method: method,
    };

    await this.trackEvent("share", parameters);
  }

  // Custom App Events
  async trackLocationPermission(granted) {
    await this.trackEvent("location_permission", {
      granted: granted,
    });
  }

  async trackNotificationPermission(granted) {
    await this.trackEvent("notification_permission", {
      granted: granted,
    });
  }

  async trackAddressAdd(addressType = "home") {
    await this.trackEvent("address_add", {
      address_type: addressType,
    });
  }

  async trackOrderTrack(orderId) {
    await this.trackEvent("order_track", {
      order_id: orderId,
    });
  }

  async trackContactUs(method = "form") {
    await this.trackEvent("contact_us", {
      method: method,
    });
  }

  async trackAppRating(rating) {
    await this.trackEvent("app_rating", {
      rating: rating,
    });
  }

  async trackLanguageChange(language) {
    await this.trackEvent("language_change", {
      language: language,
    });
  }

  async trackPaymentMethodSelect(method) {
    await this.trackEvent("payment_method_select", {
      payment_method: method,
    });
  }

  async trackCouponApply(couponCode, success) {
    await this.trackEvent("coupon_apply", {
      coupon_code: couponCode,
      success: success,
    });
  }

  async trackFilterApply(filters) {
    await this.trackEvent("filter_apply", {
      filters: JSON.stringify(filters),
    });
  }

  async trackSortApply(sortBy) {
    await this.trackEvent("sort_apply", {
      sort_by: sortBy,
    });
  }

  // User Engagement Events
  async trackViewPromotion(promoId, promoName) {
    await this.trackEvent("view_promotion", {
      promotion_id: promoId,
      promotion_name: promoName,
    });
  }

  async trackSelectPromotion(promoId, promoName) {
    await this.trackEvent("select_promotion", {
      promotion_id: promoId,
      promotion_name: promoName,
    });
  }

  async trackViewItemList(listName, items = []) {
    await this.trackEvent("view_item_list", {
      item_list_name: listName,
      items: items,
    });
  }

  async trackSelectItem(item, listName = null) {
    const parameters = {
      item_id: item.id,
      item_name: item.name,
      item_category: item.category || "unknown",
    };

    if (listName) {
      parameters.item_list_name = listName;
    }

    await this.trackEvent("select_item", parameters);
  }

  // Error Tracking
  async trackError(errorType, errorMessage) {
    await this.trackEvent("app_error", {
      error_type: errorType,
      error_message: errorMessage,
    });
  }
}

// Export singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;
