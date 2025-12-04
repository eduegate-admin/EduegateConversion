import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  I18nManager,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useCallContext } from "../../../AppContext/CallContext";
import AuthService from "../../../services/AuthService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { RFValue } from "react-native-responsive-fontsize";
import { useTranslation } from "react-i18next";
import appSettings from "../../../../Client/appSettings";
import { useAnalytics } from "../../../hooks/useAnalytics";
import { useWebScreenTracking } from "../../../hooks/useWebScreenTracking";

const client = process.env.CLIENT;

const LoginWithEmailAndPassword = () => {
  const {
    // loadUserData,
    fetchIPAddress,
    // createCallContextObject,
    storeCallContext,
    clearCallContext,
  } = useCallContext();

  const [prefix, setPrefix] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const analytics = useAnalytics();

  // Track screen view for web platform
  useWebScreenTracking("Login", "AuthScreen");

  const [callingCode] = useState("05x"); // Default UAE
  const socialmedia_login = appSettings[client]?.socialmedia_login;

  useEffect(() => {
    const init = async () => {
      try {
        await AsyncStorage.clear();
        await clearCallContext();

        const response = await AuthService.Prefixes();
        if (response.data) {
          setPrefix(response.data[0]);
        } else {
          Toast.show({
            type: "error",
            text1: t("error"),
            text2: t("data_not_found"),
          });
        }
      } catch {
        Toast.show({
          type: "error",
          text1: t("error"),
          text2: t("failed_to_get_prefixes"),
        });
      }
    };

    init();
  }, []);

  // --- Helpers ---
  const validateAndFormatUaeMobileNumber = (input) => {
    if (!input) return null;
    const cleaned = input.replace(/\D/g, ""); // keep only digits

    if (/^05[0-9]{8}$/.test(cleaned)) {
      return "971" + cleaned.slice(1);
    }

    if (/^9715[0-9]{8}$/.test(cleaned)) {
      return cleaned;
    }

    return null;
  };

  const formatMobileInput = (text) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6)
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
  };

  // --- Authentication ---
  const authenticateUser = async () => {
    const formattedNumber = validateAndFormatUaeMobileNumber(mobileNumber);
    if (!formattedNumber) {
      // Track failed login attempt
      analytics.trackCustomEvent("login_attempt_failed", {
        reason: "invalid_mobile_number",
        input_format: mobileNumber,
      });

      Toast.show({
        type: "error",
        text1: t("invalid_mobile_number"),
        text2: t("please_enter_valid_uae_number"),
        position: "top",
        visibilityTime: 4000,
      });
      return;
    }

    // Track login attempt
    analytics.trackCustomEvent("login_attempt", {
      method: "mobile_number",
      formatted_number: formattedNumber.substring(0, 6) + "****", // Partially mask for privacy
    });

    setIsLoading(true);
    try {
      const response = await AuthService.getUserByMobile(formattedNumber);

      if (!response.data || response.data.length === 0) {
        // Track new user login attempt
        analytics.trackCustomEvent("new_user_login_attempt", {
          mobile_number: formattedNumber.substring(0, 6) + "****",
        });

        await sendOTP(formattedNumber);
        return;
      }

      // Track existing user login attempt
      analytics.trackCustomEvent("existing_user_login_attempt", {
        user_id: response.data.id || "unknown",
        mobile_number: formattedNumber.substring(0, 6) + "****",
      });

      await AsyncStorage.setItem("userData", JSON.stringify(response.data));
      // await loadUserData();
      await fetchIPAddress();
      // await createCallContextObject();
      await storeCallContext();

      await sendOTP(formattedNumber);
    } catch (error) {
      console.log("Error during login:", error);

      // Track login error
      analytics.trackError("login_error", error.message);

      Toast.show({
        type: "error",
        text1: t("failed_to_authenticate"),
        text2: t("please_try_again"),
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (formattedNumber) => {
    try {
      const resp = await AuthService.sendOtp(formattedNumber);

      if (!resp.data) return;

      // Track successful OTP send
      analytics.trackCustomEvent("otp_sent", {
        mobile_number: formattedNumber.substring(0, 6) + "****",
        success: true,
      });

      navigation.navigate("OtpScreen", { mobileNumber: formattedNumber });
      Toast.show({
        type: "success",
        text1: t("otp_sent_success"),
        text2: t("otp_check_message"),
        position: "top",
      });
    } catch (error) {
      console.error("Failed to send OTP:", error);

      // Track OTP send failure
      analytics.trackCustomEvent("otp_sent", {
        mobile_number: formattedNumber.substring(0, 6) + "****",
        success: false,
        error: error.message,
      });

      Toast.show({
        type: "error",
        text1: t("otp_failed"),
        text2: `${t("otp_not_generated")} ${formattedNumber}`,
        position: "top",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={["#B0D8FF", "#DEECFA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.formContainer}>
          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("phone_number")}</Text>
            <TextInput
              style={styles.input}
              placeholder={`${callingCode} xxx xxxx`}
              placeholderTextColor="#888"
              value={mobileNumber}
              onChangeText={(text) => setMobileNumber(formatMobileInput(text))}
              keyboardType="number-pad"
              maxLength={12}
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={authenticateUser}
            style={styles.buttonTouch}
            disabled={isLoading}
          >
            <LinearGradient
              colors={["#1D9ADC", "#0B489A"]}
              start={{ x: 1, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>{t("login")}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Social Media Login */}
          {socialmedia_login && (
            <>
              <View style={styles.lineView}>
                <View style={styles.solidLine}></View>
                <Text style={styles.ORText}>{t("or")}</Text>
                <View style={styles.solidLine}></View>
              </View>
              <View style={styles.socialMediaIconView}>
                <Image
                  style={styles.google}
                  source={require("../../../assets/images/client/benchmarkfoods/Google_logo.png")}
                />
                <Image
                  style={styles.facebook}
                  source={require("../../../assets/images/client/benchmarkfoods/Facebook_Logo.png")}
                />
              </View>
            </>
          )}
        </View>

        {/* Bottom Illustration */}
        <ImageBackground
          style={styles.imageBackground}
          resizeMode="stretch"
          source={require("../../../assets/images/client/benchmarkfoods/Loginbg.png")}
        />
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: wp("100%"),
    height: hp("100%"),
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: wp("91.2%"),
    height: hp("37.75%"),
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    elevation: 5,
    bottom: -hp("11%"),
  },
  imageBackground: {
    bottom: -hp("19%"),
    left: 0,
    right: 0,
    width: wp("100%"),
    height: hp("23.75%"),
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    width: wp("91.1%"),
    alignItems: "center",
    marginTop: hp("1.8%"),
    height: hp("7%"),
  },
  label: {
    position: "absolute",
    top: -hp("1.4%"),
    left: I18nManager.isRTL ? undefined : wp("10%"),
    right: I18nManager.isRTL ? wp("10%") : undefined,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: wp("1%"),
    fontSize: RFValue(14),
    color: "#525252",
    zIndex: 1,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  input: {
    width: wp("80%"),
    height: hp("7%"),
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: RFValue(11),
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  buttonTouch: {
    width: wp("80%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp("3%"),
  },
  gradientButton: {
    width: wp("80%"),
    height: hp("6%"),
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: RFValue(16),
    fontWeight: "500",
    textAlign: "center",
  },
  solidLine: {
    borderTopWidth: 1.02,
    borderTopColor: "#ECECEC",
    width: wp("35%"),
  },
  socialMediaIconView: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: wp("17%"),
    alignItems: "center",
    height: hp("4%"),
  },
  google: { resizeMode: "contain", width: wp("7.29%"), height: hp("4%") },
  facebook: { resizeMode: "contain", width: wp("6.59%"), height: hp("3.2%") },
  ORText: {
    color: "#B0B0B0",
    fontSize: RFValue(12),
    paddingVertical: hp("3.5%"),
    paddingHorizontal: wp("2.6%"),
    textAlign: "center",
  },
  lineView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoginWithEmailAndPassword;
