import { useEffect } from "react";
import { Platform } from "react-native";
import analyticsService from "../services/analyticsService";

// Conditional import for navigation hook
let useNavigationState = null;
if (Platform.OS !== "web") {
  try {
    const navigation = require("@react-navigation/native");
    useNavigationState = navigation.useNavigationState;
  } catch (error) {
    console.warn("NavigationAnalytics: Could not load navigation hooks");
  }
}

/**
 * Navigation analytics component to track screen views automatically
 * This component should be placed inside NavigationContainer
 */
export const NavigationAnalytics = () => {
  // Skip on web platform
  if (Platform.OS === "web") {
    useEffect(() => {
      console.log(
        "NavigationAnalytics: Disabled on web platform - screen tracking via manual events"
      );
    }, []);
    return null;
  }

  // Skip if navigation hook is not available
  if (!useNavigationState) {
    console.warn("NavigationAnalytics: Navigation state hook not available");
    return null;
  }

  let navigationState;
  try {
    navigationState = useNavigationState((state) => state);
  } catch (error) {
    // Silently fail if navigation state is not available (component not inside navigator)
    return null;
  }

  useEffect(() => {
    const trackScreenView = (state) => {
      if (state && state.routes) {
        const currentRoute = getCurrentRoute(state);
        if (currentRoute) {
          analyticsService.trackScreenView(
            currentRoute.name,
            currentRoute.params?.screenClass || "Screen"
          );
        }
      }
    };

    if (navigationState) {
      trackScreenView(navigationState);
    }
  }, [navigationState]);

  return null; // This is a tracking component, renders nothing
};

/**
 * Helper function to get current route from navigation state
 */
const getCurrentRoute = (state) => {
  if (!state || !state.routes || state.routes.length === 0) {
    return null;
  }

  const route = state.routes[state.index || 0];

  // If this route has nested state, recurse
  if (route.state) {
    return getCurrentRoute(route.state);
  }

  return route;
};

export default NavigationAnalytics;
