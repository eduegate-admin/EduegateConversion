import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import CustomHeader from "../../component/CustomHeader";
import CommonHeaderLeft from "../../component/CommonHeaderLeft";
import useLanguageSwitch from "../../hooks/useLanguageSwitch";
import appSettings from "../../../Client/appSettings";

const client = process.env.CLIENT;
const LanguageSettings = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { changeLanguage, isChanging, selectedLanguage, scaleAnim } =
    useLanguageSwitch({
      checkAuth: true,
    });
  const conditionalHeaderProps = appSettings[client]?.conditionalHeaderProps

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
         conditionalHeaderProps ? (
          <CustomHeader
            title={t("language_settings")}
            leftComponent={<CommonHeaderLeft type="back" />}
            elevation={0}
            borderBottomLeftRadius={0}
            borderBottomRightRadius={0}
            // dbgcolor="#12a14f"
            backgroundColor="#12a14f"
            showCustomIcons={true}
            hideicon={true}
            color="#FFFFFF"
          />
        ) :<CustomHeader
          title={t("language_settings")}
          leftComponent={<CommonHeaderLeft type="back" />}
        />
      ),
    });
  }, [navigation, t]);

  const languages = [
    {
      code: "en",
      name: "English",
      nativeName: "English",
      flag: "🇬🇧",
      description: "Change language to English",
    },
    {
      code: "ar",
      name: "Arabic",
      nativeName: "العربية",
      flag: "🇦🇪",
      description: "تغيير اللغة إلى العربية",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>{t("select_your_language")}</Text>
          <Text style={styles.subtitle}>
            {t("language_preference_description")}
          </Text>
        </View>

        <View style={styles.languageList}>
          {languages.map((lang, index) => (
            <Animated.View
              key={lang.code}
              style={{
                transform: [
                  { scale: selectedLanguage === lang.code ? scaleAnim : 1 },
                ],
              }}
            >
              <TouchableOpacity
                style={[
                  styles.languageItem,
                  selectedLanguage === lang.code && styles.selectedLanguageItem,
                  index === languages.length - 1 && styles.lastLanguageItem,
                ]}
                onPress={() => changeLanguage(lang.code)}
                activeOpacity={0.7}
                disabled={isChanging}
              >
                <View style={styles.languageLeftSection}>
                  <View
                    style={[
                      styles.flagContainer,
                      selectedLanguage === lang.code &&
                        styles.selectedFlagContainer,
                    ]}
                  >
                    <Text style={styles.flagEmoji}>{lang.flag}</Text>
                  </View>
                  <View style={styles.languageTextContainer}>
                    <Text
                      style={[
                        styles.languageName,
                        selectedLanguage === lang.code &&
                          styles.selectedLanguageName,
                      ]}
                    >
                      {lang.name}
                    </Text>
                    <Text
                      style={[
                        styles.languageNativeName,
                        selectedLanguage === lang.code &&
                          styles.selectedLanguageNativeName,
                      ]}
                    >
                      {lang.nativeName}
                    </Text>
                  </View>
                </View>
                {isChanging && selectedLanguage !== lang.code ? (
                  <View style={styles.checkmark} />
                ) : selectedLanguage === lang.code ? (
                  isChanging ? (
                    <ActivityIndicator size="small" color="#4CAF50" />
                  ) : (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )
                ) : null}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoText}>{t("language_change_info")}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    flex: 1,
    paddingHorizontal: wp("5%"),
    paddingTop: hp("2%"),
  },
  headerSection: {
    marginBottom: hp("3%"),
    paddingHorizontal: wp("2%"),
  },
  title: {
    fontSize: RFValue(22),
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: hp("1%"),
    fontFamily: "Poppins-Bold",
  },
  subtitle: {
    fontSize: RFValue(13),
    color: "#6B7280",
    lineHeight: RFValue(20),
    fontFamily: "Poppins-Regular",
  },
  languageList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp("2.5%"),
    paddingHorizontal: wp("5%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  lastLanguageItem: {
    borderBottomWidth: 0,
  },
  selectedLanguageItem: {
    backgroundColor: "#E8F5E9",
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  languageLeftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flagContainer: {
    width: wp("12%"),
    height: wp("12%"),
    borderRadius: wp("6%"),
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("4%"),
  },
  selectedFlagContainer: {
    backgroundColor: "#C8E6C9",
  },
  flagEmoji: {
    fontSize: RFValue(24),
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: RFValue(16),
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
    fontFamily: "Poppins-SemiBold",
  },
  selectedLanguageName: {
    color: "#2E7D32",
    fontWeight: "700",
  },
  languageNativeName: {
    fontSize: RFValue(13),
    color: "#6B7280",
    fontFamily: "Poppins-Regular",
  },
  selectedLanguageNativeName: {
    color: "#388E3C",
    fontWeight: "500",
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "#FFFFFF",
    fontSize: RFValue(16),
    fontWeight: "bold",
  },
  infoSection: {
    marginTop: hp("3%"),
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("2%"),
    backgroundColor: "#FFF9E6",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FFC107",
  },
  infoText: {
    fontSize: RFValue(12),
    color: "#F57C00",
    lineHeight: RFValue(18),
    fontFamily: "Poppins-Regular",
  },
});

export default LanguageSettings;
