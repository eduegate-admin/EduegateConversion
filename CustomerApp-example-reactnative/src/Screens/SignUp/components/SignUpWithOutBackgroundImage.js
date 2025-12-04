import {
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import CustomButton from "../../../component/CustomButton";
import CustomTextInput from "../../../component/CustomTextInput";
import callContextCache from "../../../utils/callContextCache";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthService from "../../../services/AuthService";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import SquareCheckbox from "../../../component/checkbox/checkbox";
import UserService from "../../../services/UserService";
import Toast from "react-native-toast-message";
import { useCallContext } from "../../../AppContext/CallContext";
import { RFValue } from "react-native-responsive-fontsize";
import CustomHeader from "../../../component/CustomHeader";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import { useTranslation } from "react-i18next";

const client = process.env.CLIENT;
const { width, height } = Dimensions.get("screen");

const SignUpWithOutBackgroundImage = ({ route }) => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const {
    callContext,
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
  // console.log("callContext", callContext);
  const navigation = useNavigation();
  const { mobileNumber } = route.params || {};

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        <CustomHeader
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
    });
  }, []);
  // useEffect(() => {
  //   UserData();
  // }, []);

  // const UserData = async () => {
  //   try {
  //     const storedContext = await AsyncStorage.getItem("@CallContext");
  //     const parsedContext = JSON.parse(storedContext);
  //     const authToken = await AsyncStorage.getItem("authToken");
  //     const respUser = await UserService.getUserDetails(
  //       parsedContext,
  //       authToken
  //     );
  //     console.log("Signup.......", respUser.data);
  //     setLoginID(respUser.data);
  //   } catch (error) {
  //     console.error("Error fetching userData:", error);
  //   }
  // };

  const Register = async () => {
    setIsLoading(true);
    if (!firstName || !lastName || !email || !agree) {
      !agree
        ? Toast.show({
            type: "error",
            text1: t("please_agree_terms"),
            text2: "",
            position: "top",
            visibilityTime: 3000,
          })
        : !firstName
          ? Toast.show({
              type: "error",
              text1: t("enter_first_name"),
              text2: "",
              position: "top",
              visibilityTime: 3000,
            })
          : !lastName
            ? Toast.show({
                type: "error",
                text1: t("enter_last_name"),
                text2: "",
                position: "top",
                visibilityTime: 3000,
              })
            : !email
              ? Toast.show({
                  type: "error",
                  text1: t("enter_email"),
                  text2: "",
                  position: "top",
                  visibilityTime: 3000,
                })
              : Toast.show({
                  type: "error",
                  text1: t("enter_all_fields"),
                  text2: "",
                  position: "top",
                  visibilityTime: 3000,
                });

      return;
    }

    const validateEmail = (email) =>
      /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email);
    if (!validateEmail(email)) {
      Toast.show({
        type: "error",
        text1: t("enter_valid_email"),
        text2: "",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      const parsedContext = await callContextCache.get();
      const loginId = parsedContext?.LoginID;
      const payload = {
        AreaID: null,
        Branch: { BranchIID: 0 },
        Contacts: null,
        CountryID: null,
        Customer: {
          CountryID: null,
          DealerName: null,
          FirstName: firstName,
          GenderID: 1,
          HowKnowOptionID: null,
          HowKnowText: "",
          IsSubscribeOurNewsLetter: true,
          IsTermsAndConditions: true,
          LastName: lastName,
          PostalCode: null,
          TelephoneNumber: mobileNumber,
        },
        CustomerAddress: null,
        CustomerCardNumber: null,
        DateOfBirth: null,
        DesignationID: null,
        IsPrivacyPolicy: true,
        Landmark: null,
        LoginEmailID: email,
        LoginID: loginId || null,
        MobileNumber: mobileNumber,
        NationalityID: null,
      };

      // console.log("payload", payload);

      const response = await AuthService.Register(payload);

      if (response.data) {
        const respUser = await UserService.getUserDetails();
        await AsyncStorage.setItem("userData", JSON.stringify(respUser.data));
        // await loadUserData();
        await fetchIPAddress();
        // await createCallContextObject();
        await storeCallContext();
        // console.log("resp signup user", respUser.data);
        // setIsLoggedIn(true);
        Toast.show({
          type: "success",
          text1: t("successfully_registered"),
          text2: t("redirecting_to_home"),
          position: "top",
          visibilityTime: 3000,
        });
        setIsLoading(false);
        navigation.replace("Drawer");
      }
    } catch (error) {
      setIsLoading(false);

      console.error("Error during registration:", error);
    }
  };
  // console.log(email);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.mainContainer}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <View style={styles.ProfileSection}>
            <Image
              style={styles.profileImage}
              source={require("../../../assets/images/profile_icon.png")}
            />
          </View>
          <View style={styles.commonViewInput}>
            <CustomTextInput
              name="firstName"
              placeholder={t("first_name_placeholder")}
              label={t("first_name_label")}
              handleText={(text) => setFirstName(text.trim())}
              value={firstName}
              borderRadius={12}
            />
          </View>
          <View style={styles.commonViewInput}>
            <CustomTextInput
              name="lastName"
              placeholder={t("last_name_placeholder")}
              label={t("last_name_label")}
              handleText={(text) => setLastName(text.trim())}
              value={lastName}
              borderRadius={12}
            />
          </View>
          <View style={styles.commonViewInput}>
            <CustomTextInput
              name="email"
              placeholder={t("email_label")}
              label={t("email_label")}
              handleText={(text) => setEmail(text.toLowerCase().trim())}
              value={email}
              borderRadius={12}
              type="email"
            />
          </View>
          <View style={styles.commonViewInput}>
            <CustomTextInput
              name="mobileNumber"
              placeholder={""}
              label={t("phone_label_signup")}
              value={mobileNumber}
              borderRadius={12}
              type="phone"
              maxLength={10}
              editable={false}
            />
          </View>
          <View style={styles.CheckboxView}>
            <SquareCheckbox checked={agree} onChange={() => setAgree(!agree)} />
            <Text style={styles.AgreeText}>
              I agree to the{" "}
              <Text
                style={[
                  styles.AgreeText,
                  { color: "#133051", fontWeight: "900" },
                ]}
              >
                {t("terms_and_conditions_text")}
              </Text>
            </Text>
          </View>
          <CustomButton
            buttonColor={"#133051"}
            buttonTextColor={"#fff"}
            buttonText={t("continue")}
            handleButtonPress={Register}
            Radius={8}
            Width={"89%"}
            Height={"6%"}
            fontSize={RFValue(14)}
            type="normal"
            loading={isLoading}
            disabled={isLoading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#FFFFFF" },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: hp("2%"),
    width: wp("100%"),
  },
  ProfileSection: {
    backgroundColor: "#FFFFFF",
    marginVertical: hp("1.5%"),
    width: wp("27%"),
    height: hp("12%"),
    alignSelf: "center",
    alignItems: "center",
    borderRadius: 30,
    flexDirection: "column",
    borderWidth: 3,
    borderStyle: "dotted",
  },
  profileImage: {
    resizeMode: "contain",
    width: wp("26%"),
    height: hp("11%"),
    backgroundColor: "#252525",
    borderRadius: 30,
  },
  CheckboxView: {
    margin: wp("4.44%"),
    paddingBottom: hp("6%"),
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  AgreeText: {
    fontSize: 16,
    color: "#000",
    paddingLeft: 10,
    fontWeight: "500",
  },
  commonViewInput: {
    marginTop: hp("5%"),
  },
});

export default SignUpWithOutBackgroundImage;
