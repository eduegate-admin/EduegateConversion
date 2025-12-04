import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import CustomHeader from "../../../component/CustomHeader";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import { RFValue } from "react-native-responsive-fontsize";
import CustomTextInput from "../../../component/CustomTextInput";
import UserService from "../../../services/UserService";
import AddressService from "../../../services/addressService";
import { useTranslation } from "react-i18next";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [user, setUser] = useState({});
  const [edit, setEdit] = useState({
    firstName: false,
    lastName: false,
    email: false,
  });
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        <CustomHeader
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
      title: t("my_profile"),
    });
    GetUser();
  }, [t]);

  const GetUser = async () => {
    try {
      const respUser = await UserService.getUserDetails();

      // console.log("user data", respUser?.data);
      setUser(respUser?.data);
      setFirstName(respUser?.data?.Customer?.FirstName || "");
      setLastName(respUser?.data?.Customer?.LastName || "");
      setPhone(respUser?.data?.Customer?.TelephoneNumber || "");
      setEmail(respUser?.data?.LoginEmailID || "");
      // setName(firstName);
    } catch (error) {
      console.error("Error", "Failed to Get user data.", error);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const payload = {
        ...user,
        LoginEmailID: email,
        MobileNumber: phone,
        Customer: {
          FirstName: firstName,
          LastName: lastName,
        },
      };
      // console.log("Payload before update:", payload);

      if (!validateEmail(email)) {
        Toast.show({
          type: "error",
          text1: t("invalid_email"),
          text2: t("enter_valid_email"),
        });
        setIsLoading(false);
        return;
      }

      if (!edit?.firstName && !edit?.lastName && !edit?.email) {
        Toast.show({
          type: "error",
          text1: t("enable_edit_mode"),
          text2: "",
        });
        setIsLoading(false);
        return;
      }

      const response = await AddressService.SavePersonalSettings(payload);

      if (response?.status === 200) {
        // Optionally, you can show a success message or update the UI
        // navigation.navigate("Drawer", { screen: "Footer" });
        navigation.goBack();
        setIsLoading(false);
      } else {
        console.error("Failed to update profile", response);
      }
    } catch (error) {
      console.error("Error saving personal settings:", error);
    }
  };

  const validateEmail = (email) =>
    /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email);

  return (
    <View style={styles.container}>
      <View style={styles.innerView}>
        <View style={styles.firstview}>
          {/* Profile Image */}
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            }}
            style={styles.avatar}
          />
          <TouchableOpacity>
            <Text style={styles.changePhotoText}>Change photo</Text>
          </TouchableOpacity>
        </View>
        {/* Name Input */}
        <View style={styles.inputRow}>
          <CustomTextInput
            label={t("first_name_label")}
            Width={"82.223%"}
            value={firstName}
            editable={edit?.firstName}
            //   containerStyle={styles.inputBox}
            editIcon={true}
            handleEdit={() => {
              setEdit((prevData) => ({ ...prevData, firstName: true }));
            }}
            handleText={setFirstName}
          />
        </View>

        <View style={styles.inputRow}>
          <CustomTextInput
            label={t("last_name_label")}
            Width={"82.223%"}
            value={lastName}
            editable={edit?.lastName}
            //   containerStyle={styles.inputBox}
            editIcon={true}
            handleEdit={() => {
              setEdit((prevData) => ({ ...prevData, lastName: true }));
            }}
            handleText={setLastName}
          />
        </View>

        {/* Phone Input */}
        <View style={styles.inputRow}>
          <CustomTextInput
            label={t("phone_label")}
            value={phone}
            editIcon={false}
            type="phone"
            Width={"82.223%"}
            maxLength={10}
            editable={false}
            handleText={setPhone}
            handleEdit={() => {
              setEdit((prevData) => ({ ...prevData, phone: true }));
            }}
            //   containerStyle={styles.inputBox}
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputRow}>
          <CustomTextInput
            label={t("email_label")}
            editIcon={true}
            value={email}
            Width={"82.223%"}
            editable={edit?.email}
            handleText={setEmail}
            handleEdit={() => {
              setEdit((prevData) => ({ ...prevData, email: true }));
            }}

            //   containerStyle={styles.inputBox}
          />
        </View>

        {/* Save Button */}

        <TouchableOpacity
          onPress={() => handleSave()}
          style={styles.addToCartButton}
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
              <Text style={styles.addToCartText}>Save</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: wp("100%"),
    backgroundColor: "#ffffff",
    // padding: 20,
    paddingHorizontal: wp("4.44%"),
    paddingTop: hp("1.88%"),
    alignItems: "center",
  },
  innerView: {
    // flex: 1,
    alignItems: "center",
    shadowColor: "#A5A5A5",
    elevation: 5,
    height: hp("74.63%"),
    paddingHorizontal: wp("4.44%"),
    backgroundColor: "#ffffff",
    borderRadius: 20,
  },
  gradientButton: {
    width: wp("79.72%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    // marginTop: 20,
    overflow: "hidden",
  },
  addToCartButton: {
    width: wp("79.72%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
    // paddingHorizontal: 26,
    marginTop: hp("8%"),
    // marginBottom: 7,
    borderRadius: 10,
    // backgroundColor: colors.green,
  },
  addToCartText: {
    color: "#ffffff",
    fontSize: RFValue(14),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  firstview: {
    // backgroundColor: '#1Ad9AD',
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp("4%"),
  },
  avatar: {
    width: wp("18.06%"),
    height: wp("18.06%"),
    borderRadius: 40,
    marginTop: hp("2.75%"),
    marginBottom: hp("1.5%"),
  },
  changePhotoText: {
    color: "#1E90FF",
    fontSize: RFValue(14, 800),
    fontFamily: "Poppins-Regular",
    fontWeight: "400",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("2%"),
    width: "100%",
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    height: 45,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  editText: {
    color: "#1E90FF",
    marginLeft: -10,
    width: wp("10%"),
  },
  saveButton: {
    marginTop: 20,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  inputBox: {
    width: "100%",
    marginBottom: hp("2%"),
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: wp("3%"),
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("1%"),
    backgroundColor: "#fff",
  },
});
