import { useState } from "react";
import { Alert, I18nManager, Animated, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNRestart from "react-native-restart";

/**
 * Custom hook for handling language switching with RTL support
 * @param {Object} options - Configuration options
 * @param {string} options.navigateAfterChange - Screen to navigate to after language change (e.g., 'Login', 'Home')
 * @param {boolean} options.checkAuth - Whether to check authentication status and navigate accordingly
 * @returns {Object} - Language switching utilities
 */
const useLanguageSwitch = (options = {}) => {
  const { navigateAfterChange = null, checkAuth = false } = options;

  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [isChanging, setIsChanging] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  /**
   * Main function to change language with all necessary side effects
   * @param {string} lng - Language code ('en', 'ar', etc.)
   */
  const changeLanguage = async (lng) => {
    // if (lng === selectedLanguage || isChanging) return;

    try {
      setIsChanging(true);

      // Animate button press if animation is available
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Store the selected language
      await AsyncStorage.setItem("appLanguage", lng);

      // Update language code in CallContext for API requests
      const callContextStr = await AsyncStorage.getItem("@CallContext");
      if (callContextStr) {
        const callContext = JSON.parse(callContextStr);
        callContext.LanguageCode = lng;
        await AsyncStorage.setItem("@CallContext", JSON.stringify(callContext));
      }

      // Change language in i18n
      await i18n.changeLanguage(lng);
      setSelectedLanguage(lng);

      // Check if RTL direction changed
      const isRTL = lng === "ar";
      const needsRTLChange = I18nManager.isRTL !== isRTL;

      if (needsRTLChange) {
        // Force RTL setting
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);

        // Alert user and restart app
        Alert.alert(
          t("language_changed") || "Language Changed",
          t("app_will_restart") || "The app will restart to apply changes",
          [
            {
              text: t("restart_now") || "Restart Now",
              onPress: () => {
                setTimeout(() => {
                  try {
                    if (Platform.OS !== "web") {
                      RNRestart.Restart();
                    }
                  } catch (error) {
                    console.error("Restart error:", error);
                  }
                }, 300);
              },
            },
          ],
          { cancelable: false }
        );
      }

      handleNavigation(lng);
    } catch (error) {
      console.error("Error changing language:", error);
      setIsChanging(false);
      Alert.alert(
        t("error") || "Error",
        t("failed_to_change_language") || "Failed to change language"
      );
    }
  };

  /**
   * Handle navigation after language change (no RTL change)
   */
  const handleNavigation = async (lng) => {
    setTimeout(async () => {
      setIsChanging(false);
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        navigation.navigate("Drawer");
        return;
      } else {
        navigation.navigate("Login");
      }
    }, 300);
  };

  return {
    changeLanguage,
    isChanging,
    selectedLanguage,
    scaleAnim,
  };
};

export default useLanguageSwitch;
