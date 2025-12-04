import { createNavigationContainerRef } from "@react-navigation/native";

// Create navigation reference for push notifications and other services
export const navigationRef = createNavigationContainerRef();

/**
 * Navigation service for use outside of React components
 * Particularly useful for push notification navigation
 */
export const NavigationService = {
  /**
   * Navigate to a specific screen
   */
  navigate(name, params) {
    if (navigationRef.isReady()) {
      navigationRef.navigate(name, params);
    } else {
      console.warn("⚠️ Navigation not ready, cannot navigate to:", name);
    }
  },

  /**
   * Go back to previous screen
   */
  goBack() {
    if (navigationRef.isReady()) {
      navigationRef.goBack();
    } else {
      console.warn("⚠️ Navigation not ready, cannot go back");
    }
  },

  /**
   * Reset navigation stack
   */
  reset(state) {
    if (navigationRef.isReady()) {
      navigationRef.reset(state);
    } else {
      console.warn("⚠️ Navigation not ready, cannot reset navigation");
    }
  },

  /**
   * Check if navigation is ready
   */
  isReady() {
    return navigationRef.isReady();
  },

  /**
   * Get current route name
   */
  getCurrentRoute() {
    if (navigationRef.isReady()) {
      return navigationRef.getCurrentRoute();
    }
    return null;
  },
};

export default NavigationService;
