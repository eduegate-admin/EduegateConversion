import { useEffect } from "react";
import { Platform } from "react-native";
import analyticsService from "../services/analyticsService";

/**
 * Web-compatible navigation analytics hook
 * Use this in components to manually track screen views on web platform
 */
export const useWebScreenTracking = (screenName, screenClass = "Screen") => {
  useEffect(() => {
    if (Platform.OS === "web") {
      analyticsService.trackScreenView(screenName, screenClass);
    }
  }, [screenName, screenClass]);
};

/**
 * Higher-order component for web screen tracking
 * Wrap your screen components with this for automatic tracking
 */
export const withWebScreenTracking = (Component, screenName) => {
  return (props) => {
    useWebScreenTracking(screenName);
    return <Component {...props} />;
  };
};

export default {
  useWebScreenTracking,
  withWebScreenTracking,
};
