import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ImageBackground,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import Toast from "react-native-toast-message";
import appSettings from "../../../../Client/appSettings";
import { useAppContext } from "../../../AppContext/AppContext";
import { useCallContext } from "../../../AppContext/CallContext";
import { useDimensionContext } from "../../../AppContext/DimensionContext";
import CustomButton from "../../../component/CustomButton";
import { getStoredPushToken } from "../../../notification/PushNotification";
import AuthService from "../../../services/AuthService";
import UserService from "../../../services/UserService";

const client = process.env.CLIENT;

const BgImageWithOtp = ({ navigation, route }) => {
  const { t } = useTranslation();
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );
  const mobileNumber = route.params.mobileNumber || "";
  const { login } = useAppContext();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const inputRefs = useRef([]);
  const timerRef = useRef(null);
  const AppSettings = appSettings[client] || {};
  const clientNameKey = appSettings[client]?.Text?.ClientNameKey;

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

  useFocusEffect(
    useCallback(() => {
      // loadUserData();
      fetchIPAddress();
      // createCallContextObject();
      storeCallContext();
    }, [])
  );

  // Timer countdown effect
  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (timer === 0 && !canResend) {
      setCanResend(true);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timer, canResend]);

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

  const registerDeviceToken = async (user) => {
    const pushToken = await getStoredPushToken();

    if (pushToken) {
      await AuthService.registerToken(pushToken);
    }
  };

  const sendOTP = async (formattedNumber) => {
    if (!canResend) {
      Toast.show({
        type: "info",
        text1: t("please_wait"),
        text2: `${t("resend_available_in")} ${timer} ${t("seconds")}`,
        position: "top",
      });
      return;
    }

    try {
      const resp = await AuthService.sendOtp(formattedNumber);
      if (!resp.data) return;

      // Start 30 second timer
      setTimer(30);
      setCanResend(false);

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

  const handleVerify = async () => {
    setIsLoading(true);
    const enteredOtp = otp.join("");

    try {
      // if (enteredOtp.length !== 4) {
      // await loadUserData();
      // await fetchIPAddress();
      // await createCallContextObject();
      // await storeCallContext();

      const response = await AuthService.verifyOtp(mobileNumber, enteredOtp);
      const token = response.data;

      if (token) {
        await AsyncStorage.setItem("authToken", JSON.stringify(token));
        // console.log("token", token);
        registerDeviceToken(mobileNumber);
        await login(token);
        //  await loadUserData();
        await fetchIPAddress();
        // await createCallContextObject();
        await storeCallContext();
        // setMobileNo1(mobileNumber);
        setOTP(enteredOtp);

        if (callContext.IPAddress) {
          const respUser = await UserService.getUserDetails();
          await AsyncStorage.setItem("userData", JSON.stringify(respUser.data));

          // await loadUserData();
          await fetchIPAddress();
          // await createCallContextObject();
          await storeCallContext();
          setIsLoading(true);
          const IsUserExist = respUser.data || {};
          // console.log("respUser", IsUserExist.Contacts);

          if (
            Array.isArray(IsUserExist.Contacts) &&
            IsUserExist.Contacts.length > 0
          ) {
            const firstContact = IsUserExist.Contacts[0];
            if (
              firstContact.FirstName &&
              firstContact.LastName &&
              IsUserExist.LoginEmailID
            ) {
              Toast.show({
                type: "success",
                text1: t("otp_verified"),
                text2: t("redirecting_to_home"),
                position: "top",
                visibilityTime: 3000,
              });
              setTimeout(() => {
                navigation.navigate("Drawer");
              }, 800);
              setIsLoading(false);
            }
          } else {
            // console.log("first");
            // setIsLoggedIn(false);
            Toast.show({
              type: "success",
              text1: t("otp_verified"),
              text2: t("redirecting_to_signup"),
              position: "top",
              visibilityTime: 3000,
            });

            setTimeout(() => {
              navigation.navigate("SignUp", {
                mobileNumber,
              });
            }, 800);
            setIsLoading(false);
          }
        }
      } else {
        Toast.show({
          type: "error",
          text1: t("invalid_otp"),
          text2: t("please_enter_valid_otp"),
          position: "top",
          visibilityTime: 3000,
        });
        setIsLoading(false);
      }

      // } else {
      //   Alert.alert("Invalid OTP", "Enter a valid 4-digit OTP.");
      // }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      Toast.show({
        type: "error",
        text1: t("otp_verification_failed"),
        text2: t("regenerate_otp_continue"),
        position: "top",
        visibilityTime: 3000,
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={responsiveStyle.container}>
        <ImageBackground
          style={responsiveStyle.ImageBackground}
          source={require("../../../assets/images/client/almadina/bg_login.jpg")}
        >
          <View style={responsiveStyle.headerContent}>
            <Image
              style={responsiveStyle.Image}
              source={require(
                `../../../assets/images/client/${client}/icon.png`
              )}
            />
            <Text style={responsiveStyle.WelcomeText}>
              {t("welcometo")} {t(clientNameKey)}
            </Text>
            <Text style={responsiveStyle.LoginText}>{t("verify_your")}</Text>
            <Text style={responsiveStyle.LoginText}>
              {t("phone_number_text")}
            </Text>
          </View>
        </ImageBackground>

        <View style={responsiveStyle.middleView}>
          <Text style={responsiveStyle.title}>{t("otp_required_text")}</Text>
          <Text style={responsiveStyle.subText}>
            {t("A_verification_code_has_been_sent_to_")}
            {mobileNumber}
          </Text>

          <View style={responsiveStyle.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={responsiveStyle.otpBox}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(event) => handleKeyPress(event, index)}
                cursorColor={"#61AD4E"}
              />
            ))}
          </View>
          <View
            style={{marginBottom: 20 }}
          >
            <TouchableWithoutFeedback 
              onPress={() => sendOTP(mobileNumber)}
              disabled={!canResend}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignSelf: "flex-start",
                  paddingVertical: 4,
                  opacity: canResend ? 1 : 0.5,
                }}
              >
                <Text
                  style={[
                    responsiveStyle.resendButtonText,
                    { color: "#3B3B3B" },
                  ]}
                >
                  {t("didn't_get_the")}
                </Text>
                <Text
                  style={[
                    responsiveStyle.resendButtonText,
                    { color: canResend ? "#61AD4E" : "#A0A0A0" },
                  ]}
                >
                  {" "}{t("resend_Otp")}
                </Text>
                {!canResend && timer > 0 && (
                  <Text
                    style={[
                      responsiveStyle.resendButtonText,
                      { color: "#61AD4E", marginLeft: 4, fontWeight: "700" },
                    ]}
                  >
                    {" "}({timer}s)
                  </Text>
                )}
                <Text
                  style={[
                    responsiveStyle.resendButtonText,
                    { color: "#3B3B3B" },
                  ]}
                >
                  .
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
          <CustomButton
            buttonText={t("verify_and_proceed")}
            handleButtonPress={handleVerify}
            position="absolute"
            bottom={0.125}
            Width={"90%"}
            Height={"6%"}
            Radius={8}
            fontSize={RFValue(15)}
            type="normal"
            borderColor={"#61AD4E"}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = (width, height) =>
  StyleSheet.create({
    container: {
      flex: 1,
      //   alignItems: "center",
      width: width,
      height: height,
      backgroundColor: "#ffffff",
    },
    ImageBackground: {
      width: width,
      height: height * 0.44,
      resizeMode: "cover",
    },
    headerContent: {
      marginTop: height * 0.12,
      width: width,
      height: height * 0.32,
      paddingHorizontal: width * 0.07,
      justifyContent: "center",
    },
    Image: {
      width: width * 0.18,
      height: width * 0.18,
      resizeMode: "cover",
    },
    WelcomeText: {
      color: "#97999D",
      textAlign: "left",
      fontSize: width * 0.04 && height * 0.019,
      fontWeight: "600",
      marginTop: height * 0.015,
    },
    LoginText: {
      color: "#000",
      textAlign: "left",
      fontSize: width * 0.085 && height * 0.04,
      fontWeight: "600",
    },
    middleView: {
      backgroundColor: "#fff",
      // marginTop: height * 0.02,
      width: width,
      height: height * 0.59,
      paddingHorizontal: width * 0.07,
      // alignItems: "center",
    },
    title: {
      fontSize: width * 0.06 && height * 0.029,
      fontWeight: "600",
      marginTop: height * 0.025,
      color: "#000",
    },
    subText: {
      fontSize: width * 0.037 && height * 0.018,
      fontWeight: "500",
      color: "#808080",
      marginVertical: height * 0.02,
    },
    otpContainer: {
      flexDirection: "row",
      justifyContent: "center",
    },
    otpBox: {
      width: width * 0.18,
      height: width * 0.14,
      borderWidth: 1.4,
      textAlign: "center",
      justifyContent: "center",
      fontSize: width * 0.086 && height * 0.04,
      fontWeight: "600",
      color: "#61AD4E",
      marginHorizontal: width * 0.02,
      borderRadius: 4,
      borderColor: "#61AD4E",
      marginVertical: height * 0.035,
    },
    resendButton: {
      marginTop: width * 0.007,
      // padding: 10,
    },
    resendButtonText: {
      color: "#61AD4E",
      fontSize: width * 0.043 && height * 0.02,
      fontWeight: "600",
    },
    disabledButton: {
      opacity: 0.5,
    },
  });

export default BgImageWithOtp;
