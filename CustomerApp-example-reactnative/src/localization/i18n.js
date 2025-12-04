import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./locales/en.json";
import ar from "./locales/ar.json";

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

// Get stored language or use device locale
const getInitialLanguage = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem("appLanguage");
    return storedLanguage || (Localization.locale || "en").split("-")[0];
  } catch (error) {
    return "en";
  }
};

// Set RTL layout based on language
const setRTL = (language) => {
  const isRTL = language === "ar";
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }
};

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources,
  lng: (Localization.locale || "en").split("-")[0],
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// Initialize RTL based on current language
getInitialLanguage().then((language) => {
  i18n.changeLanguage(language);
  setRTL(language);
});

// Listen for language changes and update RTL
i18n.on("languageChanged", (language) => {
  setRTL(language);
  AsyncStorage.setItem("appLanguage", language);
});

export default i18n;
