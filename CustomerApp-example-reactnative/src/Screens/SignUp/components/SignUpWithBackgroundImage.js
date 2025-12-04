import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
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
import CustomButton from "../../../component/CustomButton";
import CustomTextInput from "../../../component/CustomTextInput";

import AuthService from "../../../services/AuthService";
import SquareCheckbox from "../../../component/checkbox/checkbox";
import UserService from "../../../services/UserService";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";

const client = process.env.CLIENT;
const { width, height } = Dimensions.get("screen");

const SignUpWithBackgroundImage = ({ route }) => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const { setIsLoggedIn } = useAppContext();

  const navigation = useNavigation();
  const { mobileNumber } = route.params || {};

  // console.log(mobileNumber);
  const Register = async () => {
    setIsLoading(true);
    if (!firstName || !lastName || !email || !agree) {
      setIsLoading(false); // 👈
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
      setIsLoading(false); // 👈
      return;
    }

    try {
      const respUser = await UserService.getUserDetails();
      // console.log(respUser.data);

      const payload = {
        AddressLatitude: 24.4761244498926,
        AddressLongitude: 54.37070179038887,
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
        LoginID: respUser.data.LoginID || null,
        MobileNumber: mobileNumber,
        NationalityID: null,
      };

      const response = await AuthService.Register(payload);
      // console.log("register", response)
      if (response.data) {
        // console.log("resp signup", response.data);
        // setIsLoggedIn(true);
        Toast.show({
          type: "success",
          text1: t("successfully_registered"),
          text2: t("redirecting_to_home"),
          position: "top",
          visibilityTime: 3000,
        });

        navigation.navigate("Drawer");
      }
    } catch (error) {
      console.error("Error during registration:", error);
    } finally {
      setIsLoading(false); // 👈 always stop loading
    }
  };
  // console.log(email);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.ProfileSection}>
            <Image
              style={styles.profileImage}
              source={require("../../../assets/images/profile_icon.png")}
            />
          </View>
          <View style={{ paddingBottom: 30 }}>
            <Text style={styles.inputLabel}>{t("first_name")}</Text>
            <CustomTextInput
              name="firstName"
              borderWidth={2}
              borderColor={"lightgray"}
              Width={0.87}
              Height={0.06}
              placeholder={t("first_name")}
              handleText={(text) => setFirstName(text.trim())}
            />

            <Text style={styles.inputLabel}>{t("last_name")}</Text>
            <CustomTextInput
              name="lastName"
              borderWidth={2}
              borderColor={"lightgray"}
              Width={0.87}
              Height={0.06}
              placeholder={t("last_name")}
              handleText={(text) => setLastName(text.trim())}
            />

            <Text style={styles.inputLabel}>{t("email")}</Text>
            <CustomTextInput
              name="email"
              type="email"
              value={email}
              borderWidth={2}
              borderColor={"lightgray"}
              Width={0.87}
              Height={0.06}
              placeholder={t("enter_email")}
              handleText={(text) => setEmail(text.toLowerCase().trim())}
            />

            <Text style={styles.inputLabel}>{t("telephone_mobile")}</Text>
            <CustomTextInput
              name="mobileNumber"
              borderWidth={2}
              borderColor={"lightgray"}
              Width={0.87}
              Height={0.06}
              value={mobileNumber}
              placeholder={mobileNumber}
              type="phone"
              editable={false}
            />
            <View style={styles.CheckboxView}>
              <SquareCheckbox
                checked={agree}
                onChange={() => setAgree(!agree)}
              />
              <Text style={styles.AgreeText}>
                {t("i_agree_to")}{" "}
                <Text
                  style={[
                    styles.AgreeText,
                    { color: "#133051", fontWeight: "900" },
                  ]}
                >
                  {t("terms_and_conditions")}
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <CustomButton
        buttonText={t("continue")}
        loading={isLoading} // 👈 add this
        disabled={isLoading}
        buttonColor={"#133051"}
        buttonTextColor={"#fff"}
        handleButtonPress={Register}
        Width={"100%"}
        Height={50}
        Radius={8}
        fontSize={18}
        type="normal"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: 51,
          width: "93%",
          marginBottom: 10,
          marginLeft: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 30,
    width: width,
    height: height,
  },
  ProfileSection: {
    backgroundColor: "#FFFFFF",
    marginVertical: height * 0.012,
    width: width * 0.27,
    height: height * 0.12,
    alignSelf: "center",
    alignItems: "center",
    borderRadius: 30,
    flexDirection: "column",
    borderWidth: 3,
    borderStyle: "dotted",
  },
  profileImage: {
    resizeMode: "contain",
    width: width * 0.26,
    height: height * 0.115,
    backgroundColor: "#252525",
    borderRadius: 30,
  },
  inputLabel: {
    fontSize: 16,
    color: "#000",
    paddingLeft: 20,
    lineHeight: 40,
    paddingTop: 20,
    fontWeight: "500",
  },
  CheckboxView: {
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
});
export default SignUpWithBackgroundImage;
