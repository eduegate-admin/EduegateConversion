import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import CustomButton from "../../../component/CustomButton";
import CustomTextInput from "../../../component/CustomTextInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";
import AuthService from "../../../services/AuthService";
import { useCallContext } from "../../../AppContext/CallContext";
import Toast from "react-native-toast-message";

import '../../../localization/i18n';
import { useTranslation } from 'react-i18next';

const client = process.env.CLIENT;

const LoginWithOutBackgroundImage = () => {
  const {
    callContext,
    // loadUserData,
    fetchIPAddress,
    // createCallContextObject,
    storeCallContext,
    clearCallContext,
  } = useCallContext();

  const navigation = useNavigation();
  const { t } = useTranslation();
  const [styles, setStyle] = useState(ClientStyles(client, "Login"));
  const [prefix, setPrefix] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

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
          // console.log("response", response.data);
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

  const authenticateUser = async () => {
    await AsyncStorage.clear();
    await clearCallContext();
    const isValidMobile = /^(?:\+973|973)?[3-9]\d{7}$/.test(mobileNumber);

    if (!isValidMobile) {
      Toast.show({
        type: "error",
        text1: t('please_enter_valid_mobile_number'),
        text2: mobileNumber ? t('not_valid_number', { mobileNumber }) : "",
        position: "top",
        visibilityTime: 4000,
      });
      return;
    }

    try {
      const fullMobileNumber = `${prefix}${mobileNumber}`;
      const response = await AuthService.getUserByMobile(fullMobileNumber);

       if (!response.data || response.data.length === 0) {
        await sendOTP(fullMobileNumber);
        return;
      }
      await AsyncStorage.setItem("userData", JSON.stringify(response.data));
      // await loadUserData();
      await fetchIPAddress();
      // await createCallContextObject();
      await storeCallContext();

      await sendOTP(fullMobileNumber);
    } catch (error) {
      console.log("Error during login:", error);
      Toast.show({
        type: "error",
        text1: t("failed_to_authenticate"),
        text2: t("please_try_again"),
        position: "top",
        visibilityTime: 4000,
      });
    }
  };

  const sendOTP = async (fullMobileNumber) => {
    try {
      const response = await AuthService.sendOtp(fullMobileNumber);
      // console.log("OTP sent:", response.data);
      if (!response.data) return;
      navigation.navigate("OtpScreen", {
        mobileNumber: fullMobileNumber,
      });
      Toast.show({
        type: "success",
        text1: t('otp_sent_success'),
        text2: t('otp_check_message'),
        position: "top",
        visibilityTime: 4000,
      });
    } catch (error) {
      console.error("Failed to send OTP:", error);
      Toast.show({
        type: "error",
        text1: t('otp_failed'),
        text2: `${t('otp_not_generated')} ${mobileNumber}`,
        position: "top",
        visibilityTime: 4000,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.headerContent}>
          <Text style={styles.WelcomeText}>{t('welcometo')} foodworld</Text>
          <Text style={styles.createText}>{t('create_your_account_now')}</Text>
        </View>

        <View style={styles.middleView}>
          <Text style={styles.numberText}>{t('enter_your_phone_number')}</Text>

          <View style={styles.InputView}>
            <CustomTextInput
              Width={0.2}
              Height={0.06}
              placeholder={prefix}
              fontSize={0.045}
              editable={false}
            />
            <CustomTextInput
              Width={0.65}
              Height={0.06}
              placeholder={t("placeholder_mobile")}
              fontSize={0.045}
              value={mobileNumber}
              handleText={(text) => {
                const cleanedText = text.replace(/\D/g, "");
                if (cleanedText.length <= 8) {
                  setMobileNumber(cleanedText.trim());
                }
              }}
              type="phone"
            />
          </View>

          <Text style={styles.numberText}>
            {t('securing_your_personal_info')}
          </Text>
        </View>

        <CustomButton
          buttonText={t("get_otp")}
          handleButtonPress={authenticateUser}
          position="absolute"
          bottom={0.125}
          Width={"91.11%"}
          Height={"6%"}
          Radius={15}
          fontSize={14}
          type="normal"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginWithOutBackgroundImage;
