import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import CustomHeader from "../../component/CustomHeader";
import CommonHeaderLeft from "../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../component/CommonHeaderRight";
import { CommonActions, useNavigation } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import CustomTextInput from "../../component/CustomTextInput";
import appSettings from "../../../Client/appSettings";
import { RFValue } from "react-native-responsive-fontsize";
import CustomButton from "../../component/CustomButton";
import UserService from "../../services/UserService";
import AuthService from "../../services/AuthService";
import { useAppContext } from "../../AppContext/AppContext";
import { useCallContext } from "../../AppContext/CallContext";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";

const client = process.env.CLIENT;

const ChangeNumber = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [currentMobile, setCurrentMobile] = useState("");
  const { setCallContext, callContext, clearCallContext } = useCallContext();
  const [newMobile, setNewMobile] = useState("");
  const { logout } = useAppContext();
  const [otp, setOtp] = useState("");
  const TextInputType = appSettings[client].screens.CustomTextInput;
  const conditionalHeaderProps = appSettings[client]?.conditionalHeaderProps;
  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        conditionalHeaderProps ? (
          <CustomHeader
            title={t("change_your_number_title")}
            leftComponent={<CommonHeaderLeft type="back" />}
            elevation={0}
            borderBottomLeftRadius={0}
            borderBottomRightRadius={0}
            backgroundColor="#12a14f"
            showCustomIcons={true}
            hideicon={true}
            color="#FFFFFF"
          />
        ) : <CustomHeader
          title={t("change_your_number_title")}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
    });
    GetUser();
  }, [t]);

  const GetUser = async () => {
    try {
      const respUser = await UserService.getUserDetails();

      if (!respUser.data) {
        console.error("Error", "Failed to get user data.");
      }
      setCurrentMobile(respUser.data.Customer.TelephoneNumber);
    } catch (error) {
      if (!respUser.data) {
        console.error("Error", "Failed to Get user data.");
      } else {
        console.error("profile_url failed:", error);
      }
    }
  };
  const formatPhoneNumber = (text) => {
    // Remove all non-numeric characters
    const numericValue = text.replace(/[^0-9]/g, '');
    
    // Limit to 10 digits
    const limitedValue = numericValue.slice(0, 10);
    
    // Format as 050 000 0000
    if (limitedValue.length <= 3) {
      return limitedValue;
    } else if (limitedValue.length <= 6) {
      return `${limitedValue.slice(0, 3)} ${limitedValue.slice(3)}`;
    } else {
      return `${limitedValue.slice(0, 3)} ${limitedValue.slice(3, 6)} ${limitedValue.slice(6)}`;
    }
  };

  const handleNewMobileChange = (text) => {
    const formatted = formatPhoneNumber(text);
    setNewMobile(formatted);
  };

  const handleSendOtp = async () => {
    const cleanMobile = newMobile.replace(/\s/g, '');
    console.log("Send OTP to:", cleanMobile);
    
    if (cleanMobile.length !== 10) {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("please_enter_valid_10_digit_phone_number"),
        position: "top",
      });
      return;
    }

    try {
      const resp = await AuthService.sendOtp(cleanMobile);

      if (!resp.data) return;

      Toast.show({
        type: "success",
        text1: t("otp_sent_success"),
        text2: t("otp_check_message"),
        position: "top",
      });
    } catch (error) {
      console.error("Failed to send OTP:", error);
      Toast.show({
        type: t("error"),
        text1: t("otp_failed"),
        text2: `${t("otp_not_generated")} ${cleanMobile}`,
        position: "top",
      });
    }
  };
  const handleLogout = async () => {
    try {
      try {
        console.log(
          "👋 User logging out - unregistering push notification token..."
        );
        const PushNotificationIntegration =
          require("../../../utils/pushNotificationIntegration").default;
        await PushNotificationIntegration.onUserLogout();
        console.log("✅ Push notification token unregistration completed");
      } catch (pushError) {
        console.error("❌ Push notification unregistration failed:", pushError);
        // Don't block logout flow if push notification unregistration fails
      }
      const response = await UserService.Logout();
      await clearCallContext();
      await AsyncStorage.setItem("userData", JSON.stringify(response.data));

      setCallContext(null);
      if (!response.data) {
        console.error("Error in logout", "Failed to get response data.");
      } else {
        await AsyncStorage.multiRemove([
          "authToken",
          "userData",
          "@CallContext",
        ]);

        const targetScreen = appSettings[client]?.screens?.Welcome_screen
          ? "Welcome"
          : "Login";
        console.log("log", targetScreen);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: targetScreen }],
          })
        );
        await logout();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleChangeNumber = async () => {
    const cleanMobile = newMobile.replace(/\s/g, '');
    console.log("Change number with OTP:", otp);

    if (cleanMobile.length !== 10) {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("please_enter_valid_10_digit_phone_number"),
        position: "top",
      });
      return;
    }

    try {
      const response = await AuthService.verifyOtp(cleanMobile, otp);
      const token = response.data;
      await AsyncStorage.setItem("authToken", JSON.stringify(token));

      const syncResp = await AuthService.GetSyncSettings();
      const newMobResp = await AuthService.ChangeMobilerNumber(cleanMobile);
      await handleLogout();
    } catch (error) {
      console.error("OTP Verification Error:", error);
      Toast.show({
        type: "error",
        text1: t("otp_verification_failed"),
        text2: t("regenerate_otp_continue"),
        position: "top",
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.label}>
          {t("label_telephone_mobile")} <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.commonViewInput}>
          <CustomTextInput
            placeholder={t("placeholder_phone")}
            label={t("label_telephone_mobile")}
            fontSize={RFValue(12)}
            handleText={(text) => setCurrentMobile(text.trim())}
            value={currentMobile}
            borderRadius={12}
            editable={false}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.label}>
          {t("label_new_telephone")} <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.commonViewInput}>
          <CustomTextInput
            placeholder={t("placeholder_new_phone")}
            label={t("label_new_telephone")}
            fontSize={RFValue(12)}
            handleText={handleNewMobileChange}
            value={newMobile}
            borderRadius={12}
            keyboardType="phone-pad"
            maxLength={12}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            width: wp("91.11%"),
          }}
        >
          <CustomButton
            buttonText={t("send_otp")}
            buttonColor={"#28A745"}
            buttonTextColor={"#fff"}
            handleButtonPress={handleSendOtp}
            Radius={15}
            Width={"30%"}
            Height={"5%"}
            fontSize={RFValue(12)}
            type="normal"
          />
        </View>

        <Text style={styles.label}>{t("label_new_otp")}</Text>
        <View style={styles.commonViewInput}>
          <CustomTextInput
            placeholder={t("placeholder_otp")}
            label={t("label_new_otp")}
            fontSize={RFValue(12)}
            handleText={(text) => {
              const numericValue = text.replace(/[^0-9]/g, '');
              setOtp(numericValue);
            }}
            value={otp}
            borderRadius={12}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            width: wp("91.11%"),
          }}
        >
          <CustomButton
            buttonText={t("change_your_number_button")}
            buttonColor={"#28A745"}
            buttonTextColor={"#fff"}
            handleButtonPress={handleChangeNumber}
            Radius={15}
            Width={"55%"}
            Height={"5.5%"}
            fontSize={RFValue(12)}
            type="normal"
          />
        </View>
      </ScrollView>
    </View>
  );
};
export default ChangeNumber;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  commonViewInput: {
    marginTop: hp("1.2%"),
    marginBottom: hp("3.5%"),
    // backgroundColor: "#000",
  },
  body: {
    padding: wp("4.44%"),
  },
  inputLabel: {
    position: "absolute",
    top: -hp("1.3%"),
    left: wp("2.5%"),
    backgroundColor: "#FFFFFF",
    paddingHorizontal: wp("1.5%"),
    fontSize: RFValue(12),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    // paddingTop: hp("2.5%"),
    color: "#525252",
    zIndex: 1,
  },

  label: {
    fontSize: RFValue(14, 800),
    fontFamily: "Poppins-Medium",
    fontWeight: "500",
    color: "#525252",
  },
  required: { color: "red" },
});
