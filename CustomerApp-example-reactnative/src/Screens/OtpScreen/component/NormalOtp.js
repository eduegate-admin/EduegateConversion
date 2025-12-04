import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import { useTranslation } from "react-i18next";
import appSettings from "../../../../Client/appSettings";
import { useAppContext } from "../../../AppContext/AppContext";
import { useCallContext } from "../../../AppContext/CallContext";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import CustomButton from "../../../component/CustomButton";
import { useAnalytics } from "../../../hooks/useAnalytics";
import { getStoredPushToken } from "../../../notification/PushNotification";
import AuthService from "../../../services/AuthService";
import UserService from "../../../services/UserService";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";

const client = process.env.CLIENT;

const NormalOtp = ({ route }) => {
  const navigation = useNavigation();
  const { login } = useAppContext();
  const { t } = useTranslation();
  const analytics = useAnalytics();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [styles, setStyle] = useState(ClientStyles(client, "OTP"));
  const [isLoading, setIsLoading] = useState(false);

  const inputRefs = useRef([]);
  const mobileNumber = route.params.mobileNumber || "";

  // App settings
  const AppSettings = appSettings[client] || {};
  const Screen = AppSettings.screens?.SignUp_screen || null;
  const blockNewUser = AppSettings.BlockNewUser || false;

  const {
    callContext,
    // setMobileNo1,
    setOTP,
    // loadUserData,
    fetchIPAddress,
    // createCallContextObject,
    storeCallContext,
  } = useCallContext();

  /** ----------------- Hooks ----------------- */
  useEffect(() => {
    setStyle(ClientStyles(client, "OTP"));
  }, [client]);

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        try {
          // await loadUserData();
          await fetchIPAddress();
          // await createCallContextObject();
          await storeCallContext();
        } catch (err) {
          console.error("Failed to init context:", err);
        }
      };
      init();
    }, [])
  );

  useEffect(() => {
    const checkAutoLogin = async () => {
      try {
        const resp = await AuthService.getAutoLoginFlag(mobileNumber);
        if (resp.data) {
          await handleVerify();
        }
      } catch (error) {
        console.error("Failed to check auto-login:", error);
      }
    };

    checkAutoLogin();
  }, [client, mobileNumber]);

  const handleChange = (text, index) => {
    if (text.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const registerDeviceToken = async () => {
    const pushToken = await getStoredPushToken();
    if (pushToken) await AuthService.registerToken(pushToken);
  };

  const handleVerify = async () => {
    setIsLoading(true);
    const enteredOtp = otp.join("");

    // Track OTP verification attempt
    analytics.trackCustomEvent("otp_verification_attempt", {
      mobile_number: mobileNumber.substring(0, 6) + "****",
      otp_length: enteredOtp.length,
    });

    try {
      const response = await AuthService.verifyOtp(mobileNumber, enteredOtp);
      const token = response.data;
      await AsyncStorage.setItem("authToken", JSON.stringify(token));

      if (!token) {
        // Track invalid OTP
        analytics.trackCustomEvent("otp_verification_failed", {
          mobile_number: mobileNumber.substring(0, 6) + "****",
          reason: "invalid_otp",
        });
        return showInvalidOtpError();
      }

      // Track successful login
      analytics.trackLogin("mobile_otp");

      // Set user ID for analytics
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsedData = JSON.parse(userData);
        analytics.setUserId(parsedData.id || parsedData.userId);
        analytics.setUserProperties({
          mobile_number: mobileNumber.substring(0, 6) + "****",
          login_method: "mobile_otp",
        });
      }

      await registerDeviceToken();
      await login(token);
      await initializeContext(mobileNumber, enteredOtp);
      await handleUserRedirection(token, enteredOtp);
    } catch (error) {
      console.error("OTP Verification Error:", error);

      // Track OTP verification error
      analytics.trackCustomEvent("otp_verification_failed", {
        mobile_number: mobileNumber.substring(0, 6) + "****",
        reason: "verification_error",
        error: error.message,
      });

      Toast.show({
        type: "error",
        text1: t("otp_verification_failed"),
        text2: t("regenerate_otp_continue"),
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

      navigation.navigate("OtpScreen", { mobileNumber: formattedNumber });
      Toast.show({
        type: "success",
        text1: t("otp_sent_success"),
        text2: t("otp_check_message"),
        position: "top",
      });
    } catch (error) {
      console.error("Failed to send OTP:", error);
      Toast.show({
        type: "error",
        text1: t("otp_failed"),
        text2: `${t("otp_not_generated")} ${formattedNumber}`,
        position: "top",
      });
    }
  };

  /** ----------------- Helpers ----------------- */
  const showInvalidOtpError = () => {
    Toast.show({
      type: "error",
      text1: t("invalid_otp"),
      text2: t("please_enter_valid_otp"),
      position: "top",
    });
  };

  const initializeContext = async (mobile, otpCode) => {
    // await loadUserData();
    await fetchIPAddress();
    // await createCallContextObject();
    await storeCallContext();
    // setMobileNo1(mobile);
    setOTP(otpCode);
  };

  const handleUserRedirection = async (token, enteredOtp) => {
    if (!callContext.IPAddress) return;

    const respUser = await UserService.getUserDetails();
    await AsyncStorage.setItem("userData", JSON.stringify(respUser.data));
    await initializeContext(mobileNumber, enteredOtp);

    const user = respUser.data || {};
    if (blockNewUser && !(user.LoginEmailID || user.Customer?.FirstName)) {
      return restrictNewUser(token);
    }

    if (Array.isArray(user.Contacts) && user.Contacts.length > 0) {
      const firstContact = user.Contacts[0];
      if (
        firstContact.FirstName &&
        firstContact.LastName &&
        user.LoginEmailID
      ) {
        return redirectToHome(token);
      }
    }

    return Screen ? redirectToSignUp(token) : redirectToHome(token);
  };

  const restrictNewUser = async (token) => {
    await login(token, false);
    Toast.show({
      type: "error",
      text1: t("login_restricted"),
      text2: t("contact_administrator"),
      position: "top",
    });
    setTimeout(() => navigation.navigate("Login"), 800);
  };

  const redirectToHome = async (token) => {
    await login(token, false);

    // Register push notification token after successful login
    try {
      console.log("👤 OTP verified - registering push notification token...");
      const PushNotificationIntegration =
        require("../../../utils/pushNotificationIntegration").default;
      await PushNotificationIntegration.onUserLogin();
      console.log("✅ Push notification token registered after login");
    } catch (pushError) {
      console.error(
        "❌ Failed to register push notification token after login:",
        pushError
      );
      // Don't block login flow if push notification registration fails
    }

    Toast.show({
      type: "success",
      text1: t("otp_verified"),
      text2: t("redirecting_to_home"),
      position: "top",
    });
    setTimeout(() => navigation.navigate("Drawer"), 800);
  };

  const redirectToSignUp = async (token) => {
    await login(token, true);
    Toast.show({
      type: "success",
      text1: t("otp_verified"),
      text2: t("redirecting_to_signup"),
      position: "top",
    });
    setTimeout(() => navigation.navigate("SignUp", { mobileNumber }), 800);
  };

  /** ----------------- Render ----------------- */
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      {client === "benchmarkfoods" && (
        <View style={styles.header}>
          <CommonHeaderLeft type="back" />
        </View>
      )}

      <View style={styles.container}>
        <Text style={styles.title}>
          {client === "foodworld" ? t("verify_phone") : t("enter_4_digit_code")}
        </Text>
        <Text style={styles.subText}>
          {client === "foodworld"
            ? `${t("code_sent_to")} ${mobileNumber}`
            : t("sent_to_you")}
        </Text>

        {/* OTP Inputs */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.otpBox}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(event) => handleKeyPress(event, index)}
              cursorColor={client === "foodworld" ? "#68B054" : "#1D9ADC"}
            />
          ))}
        </View>

        {/* Resend OTP */}
        <View
          style={{ marginTop: 20, marginBottom: 20, zIndex: -1 }}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignSelf: "center",
              paddingVertical: 10,
            }}
            onPress={() => sendOTP(mobileNumber)}
            activeOpacity={0.7}
          >
            <Text style={styles.ResendText}>{t("did_not_get_code")}</Text>
            <Text style={styles.ResendText2}>{t("resend_otp")}</Text>
          </TouchableOpacity>
        </View>

        {/* Verify Button */}
        {client === "benchmarkfoods" ? (
          <TouchableOpacity disabled={isLoading} onPress={handleVerify}>
            <LinearGradient
              colors={["#1D9ADC", "#0B489A"]}
              start={{ x: 1, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>{t("verify")}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <CustomButton
            buttonText={t("verify")}
            handleButtonPress={handleVerify}
            position="absolute"
            bottom={0.125}
            Width={"90%"}
            Height={"6%"}
            Radius={15}
            fontSize={14}
            type="normal"
            loading={isLoading}
            disabled={isLoading}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default NormalOtp;
