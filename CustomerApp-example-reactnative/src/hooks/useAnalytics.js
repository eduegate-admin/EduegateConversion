import { useCallback } from "react";
import analyticsService from "../services/analyticsService";

/**
 * Custom hook for analytics tracking
 * Provides convenient methods to track various user interactions and events
 */
export const useAnalytics = () => {
  // Screen tracking
  const trackScreen = useCallback((screenName, screenClass = null) => {
    analyticsService.trackScreenView(screenName, screenClass);
  }, []);

  // Authentication events
  const trackLogin = useCallback((method = "email") => {
    analyticsService.trackLogin(method);
  }, []);

  const trackSignUp = useCallback((method = "email") => {
    analyticsService.trackSignUp(method);
  }, []);

  const trackLogout = useCallback(() => {
    analyticsService.trackLogout();
  }, []);

  // E-commerce events
  const trackProductView = useCallback((product) => {
    analyticsService.trackViewItem(product);
  }, []);

  const trackAddToCart = useCallback((product, quantity = 1) => {
    analyticsService.trackAddToCart(product, quantity);
  }, []);

  const trackRemoveFromCart = useCallback((product, quantity = 1) => {
    analyticsService.trackRemoveFromCart(product, quantity);
  }, []);

  const trackPurchase = useCallback((transactionData) => {
    analyticsService.trackPurchase(transactionData);
  }, []);

  const trackBeginCheckout = useCallback((cartData) => {
    analyticsService.trackBeginCheckout(cartData);
  }, []);

  // Search events
  const trackSearch = useCallback((searchTerm, category = null) => {
    analyticsService.trackSearch(searchTerm, category);
  }, []);

  // Wishlist events
  const trackAddToWishlist = useCallback((product) => {
    analyticsService.trackAddToWishlist(product);
  }, []);

  const trackRemoveFromWishlist = useCallback((product) => {
    analyticsService.trackRemoveFromWishlist(product);
  }, []);

  // Share events
  const trackShare = useCallback(
    (contentType, contentId, method = "unknown") => {
      analyticsService.trackShare(contentType, contentId, method);
    },
    []
  );

  // App-specific events
  const trackLocationPermission = useCallback((granted) => {
    analyticsService.trackLocationPermission(granted);
  }, []);

  const trackNotificationPermission = useCallback((granted) => {
    analyticsService.trackNotificationPermission(granted);
  }, []);

  const trackAddressAdd = useCallback((addressType = "home") => {
    analyticsService.trackAddressAdd(addressType);
  }, []);

  const trackOrderTrack = useCallback((orderId) => {
    analyticsService.trackOrderTrack(orderId);
  }, []);

  const trackContactUs = useCallback((method = "form") => {
    analyticsService.trackContactUs(method);
  }, []);

  const trackAppRating = useCallback((rating) => {
    analyticsService.trackAppRating(rating);
  }, []);

  const trackLanguageChange = useCallback((language) => {
    analyticsService.trackLanguageChange(language);
  }, []);

  const trackPaymentMethodSelect = useCallback((method) => {
    analyticsService.trackPaymentMethodSelect(method);
  }, []);

  const trackCouponApply = useCallback((couponCode, success) => {
    analyticsService.trackCouponApply(couponCode, success);
  }, []);

  const trackFilterApply = useCallback((filters) => {
    analyticsService.trackFilterApply(filters);
  }, []);

  const trackSortApply = useCallback((sortBy) => {
    analyticsService.trackSortApply(sortBy);
  }, []);

  // Promotion events
  const trackViewPromotion = useCallback((promoId, promoName) => {
    analyticsService.trackViewPromotion(promoId, promoName);
  }, []);

  const trackSelectPromotion = useCallback((promoId, promoName) => {
    analyticsService.trackSelectPromotion(promoId, promoName);
  }, []);

  // Item list events
  const trackViewItemList = useCallback((listName, items = []) => {
    analyticsService.trackViewItemList(listName, items);
  }, []);

  const trackSelectItem = useCallback((item, listName = null) => {
    analyticsService.trackSelectItem(item, listName);
  }, []);

  // Error tracking
  const trackError = useCallback((errorType, errorMessage) => {
    analyticsService.trackError(errorType, errorMessage);
  }, []);

  // User properties
  const setUserProperties = useCallback((properties) => {
    analyticsService.setUserProperties(properties);
  }, []);

  const setUserId = useCallback((userId) => {
    analyticsService.setUserId(userId);
  }, []);

  // Custom event tracking
  const trackCustomEvent = useCallback((eventName, parameters = {}) => {
    analyticsService.trackEvent(eventName, parameters);
  }, []);

  return {
    // Screen tracking
    trackScreen,

    // Authentication
    trackLogin,
    trackSignUp,
    trackLogout,

    // E-commerce
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackPurchase,
    trackBeginCheckout,

    // Search
    trackSearch,

    // Wishlist
    trackAddToWishlist,
    trackRemoveFromWishlist,

    // Share
    trackShare,

    // App-specific
    trackLocationPermission,
    trackNotificationPermission,
    trackAddressAdd,
    trackOrderTrack,
    trackContactUs,
    trackAppRating,
    trackLanguageChange,
    trackPaymentMethodSelect,
    trackCouponApply,
    trackFilterApply,
    trackSortApply,

    // Promotions
    trackViewPromotion,
    trackSelectPromotion,

    // Item lists
    trackViewItemList,
    trackSelectItem,

    // Error tracking
    trackError,

    // User management
    setUserProperties,
    setUserId,

    // Custom events
    trackCustomEvent,
  };
};
