import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import CustomHeader from "../../../component/CustomHeader";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserService from "../../../services/UserService";
import AddressService from "../../../services/addressService";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
const client = process.env.CLIENT;

const SimpleAccount = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [profile, setProfile] = useState("");
  const [address, setAddress] = useState("");
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        <CustomHeader
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
      title: t("myAccount"),
    });
    GetUser();
  }, [navigation, t]);

  const GetUser = async () => {
    try {
      setLoading(true);
      const storedContext = await AsyncStorage.getItem("@CallContext");
      const parsedContext = JSON.parse(storedContext);
      const authToken = await AsyncStorage.getItem("authToken");

      const respUser = await UserService.getUserDetails(
        parsedContext,
        authToken
      );

      if (!respUser.data) {
        console.error("Error", "Failed to get user data.");
      }
      setUser(respUser.data);

      const respAddress = await AddressService.GetBillingAddress(
        parsedContext,
        authToken
      );
      if (!respAddress.data) {
        console.error("Error", "Failed to Get Billing Address.");
      }
      setAddress(respAddress.data);

      const UserID = respUser.data.UserID;
      const profile = await UserService.getUserProfile(
        parsedContext,
        authToken,
        UserID
      );
      setProfile(profile.request._url);
    } catch (error) {
      console.error("profile_url failed:", error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <Image
            source={
              profile
                ? { uri: profile }
                : require("../../../assets/images/profile_icon.png")
            }
            style={styles.profileImage}
          />
          <Text style={styles.detailsText}>{user?.UserName || ""}</Text>
          <Text style={styles.detailsText}>{user?.LoginEmailID || ""}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t("my_address")}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("AddressSwitch")}>
              <Image
                source={require(
                  `../../../assets/images/client/${client}/edit.png`
                )}
                style={styles.editIcon}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardText}>
              {address?.FirstName}
              {""}
              {address?.LastName}
            </Text>
            <Text style={[styles.cardText, { fontWeight: "bold" }]}>
              Mobile No:{address?.MobileNo1}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t("personal_settings")}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <Image
                source={require(
                  `../../../assets/images/client/${client}/edit.png`
                )}
                style={styles.editIcon}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardText}>
              {user?.Customer?.TelephoneNumber || ""}
            </Text>
            <Text style={styles.cardText}>{user?.LoginEmailID || ""}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FF",
  },
  content: {
    paddingVertical: wp("4.44%"),
    paddingHorizontal: wp("4.44%"),
  },
  profileSection: {
    alignItems: "center",
    marginBottom: hp("3.33%"),
  },
  profileImage: {
    width: wp("22%"),
    height: wp("22%"),
    borderRadius: 50,
    borderWidth: 2,
    backgroundColor: "#58BB47",
    borderColor: "#ddd",
    resizeMode: "contain",
    marginBottom: hp("1%"),
  },
  editIcon: {
    width: wp("5.55%"),
    height: wp("5.55%"),
    resizeMode: "contain",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  detailsText: {
    fontSize: RFValue(10, 800),
    fontWeight: "500",
    fontFamily: "Poppins-Regular",
    color: "#252525",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("4%"),
    marginBottom: hp("1%"),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp("1%"),
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    paddingBottom: hp("0.5%"),
  },
  cardTitle: {
    fontSize: RFValue(14, 800),
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#252525",
  },
  cardBody: {},
  cardText: {
    fontSize: RFValue(12, 800),
    fontWeight: "600",
    fontFamily: "Poppins-Regular",
    color: "#525252",
  },
});

export default SimpleAccount;
