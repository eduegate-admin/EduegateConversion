import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  ImageBackground,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  Platform
} from "react-native";
import CustomButton from "../../../component/CustomButton";
import CustomTextInput from "../../../component/CustomTextInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthService from "../../../services/AuthService";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";
import Toast from "react-native-toast-message";
import { useCallContext } from "../../../AppContext/CallContext";
import { useTranslation } from "react-i18next";
import { RFValue } from "react-native-responsive-fontsize";
import appSettings from "../../../../Client/appSettings";

const client = process.env.CLIENT;

const LoginWithBackgroundImage = () => {
  const inputRef = React.useRef(null);
  const {
    // loadUserData,
    fetchIPAddress,
    // createCallContextObject,
    storeCallContext,
    clearCallContext,
  } = useCallContext();
  const AppSettings = appSettings[client];
  const clientNameKey = appSettings[client]?.Text?.ClientNameKey;
  const [prefix, setPrefix] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [styles, setStyle] = useState(ClientStyles(client, "Login"));
  const navigation = useNavigation();
  const { t } = useTranslation();

  useEffect(() => {
    const clientStyle = ClientStyles(client, "Login");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, [client]);

  useEffect(() => {
    const fetchPrefixes = async () => {
      try {
        const response = await AuthService.Prefixes();
        if (response.data) {
          setPrefix(response.data[0]);
        } else {
          Alert.alert(t("error"), t("data_not_found"));
        }
      } catch (error) {
        Alert.alert(t("error"), t("failed_to_get_prefixes"));
      }
    };
    fetchPrefixes();
  }, []);

  const validateAndFormatUaeMobileNumber = (input) => {
    if (!input) return null;
    const cleaned = input.replace(/\D/g, "");

    if (/^05[0245689]\d{7}$/.test(cleaned)) {
      return cleaned;
    }

    return null;
  };

  const authenticateUser = async () => {
    await AsyncStorage.clear();
    await clearCallContext();
    setIsLoading(true);
    const formattedNumber = validateAndFormatUaeMobileNumber(mobileNumber);

    if (!formattedNumber) {
      Toast.show({
        type: "error",
        text1: t("please_enter_valid_mobile_number"),
        text2: mobileNumber ? `${mobileNumber} ${t("not_valid_number")}` : "",
        position: "top",
        visibilityTime: 4000,
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await AuthService.getUserByMobile(formattedNumber);
      if (!response.data || response.data.length === 0) {
        await sendOTP(formattedNumber);
        return;
      }

      await AsyncStorage.setItem("userData", JSON.stringify(response.data));
      // await loadUserData();
      await fetchIPAddress();
      // await createCallContextObject();
      await storeCallContext();

      await sendOTP(formattedNumber);
    } catch (error) {
      console.log("Error during login:", error);
      Toast.show({
        type: "error",
        text1: t("failed_to_authenticate"),
        text2: t("please_try_again"),
        position: "top",
        visibilityTime: 4000,
      });
      setIsLoading(false);
    }
  };

  const sendOTP = async (formattedNumber) => {
    try {
      const response = await AuthService.sendOtp(formattedNumber);
      // console.log("OTP sent:", response.data);
      if (!response.data) {
        setIsLoading(false);
        return;
      }
      navigation.navigate("OtpScreen", {
        mobileNumber: formattedNumber,
      });
      Toast.show({
        type: "success",
        text1: t("otp_sent_success"),
        text2: `${t("otp_check_message")} ${mobileNumber}`,
        position: "top",
        visibilityTime: 4000,
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to send OTP:", error);
      Toast.show({
        type: "error",
        text1: t("otp_failed"),
        text2: `${t("otp_not_generated")} ${mobileNumber}`,
        position: "top",
        visibilityTime: 4000,
      });
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <ImageBackground
          style={styles.ImageBackground}
          source={require("../../../assets/images/client/almadina/bg_login.jpg")}
        >
          <View style={styles.headerContent}>
            <Image
              style={styles.Image}
              source={require(`../../../assets/images/client/${client}/icon.png`)}
            />
            <Text style={styles.WelcomeText}>{t("welcometo")} {t(clientNameKey)}</Text>
            <Text style={styles.LoginText}>{t("login_to_your")}</Text>
            <Text style={styles.LoginText}>{t("account")}</Text>
          </View>
        </ImageBackground>

        <View style={styles.middleView}>
          <View style={styles.innerView}>
            <Text style={styles.mobile}>{t("phone_number")}</Text>
            <TouchableWithoutFeedback onPress={() => {
              if (Platform.OS === 'web') {
                const input = document.querySelector('input[type="tel"]');
                if (input) input.focus();
              }
            }}>
              <View style={[styles.InputView, Platform.OS === 'web' ? { cursor: 'text' } : null]}>
                <CustomTextInput
                  ref={inputRef}
                  Width={0.85}
                  Height={0.058}
                  placeholder={"050-xxx-xxxx"}
                  fontSize={RFValue(14)}
                  value={mobileNumber}
                  handleText={(text) => {
                    const cleanedText = text.replace(/\D/g, "");
                    let formattedText = cleanedText;

                    if (cleanedText.length > 3) {
                      formattedText = `${cleanedText.slice(0, 3)} ${cleanedText.slice(3, 6)}${cleanedText.length > 6 ? " " + cleanedText.slice(6, 10) : ""}`;
                    }
                    setMobileNumber(formattedText);
                  }}
                  type="phone"
                  borderWidth={StyleSheet.hairlineWidth}
                  borderRadius={8}
                  borderColor={"#000"}
                  onSubmitEditing={authenticateUser}
                  returnKeyType="done"
                  style={Platform.OS === 'web' ? { outline: 'none' } : null}
                />
              </View>
            </TouchableWithoutFeedback>
            <Text style={[styles.WelcomeText, { textAlign: "center" }]}>
              {t("securing_your_personal_info")}
            </Text>
          </View>

          <CustomButton
            buttonText={t("continue_with_otp")}
            handleButtonPress={authenticateUser}
            position="absolute"
            bottom={0.155}
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

export default LoginWithBackgroundImage;
