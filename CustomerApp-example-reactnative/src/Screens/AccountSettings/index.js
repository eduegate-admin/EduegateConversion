import React, { useEffect, useState } from "react";
import {
  CommonActions,
  useNavigation,
} from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  I18nManager,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Skeleton } from "moti/skeleton";
import CustomHeader from "../../component/CustomHeader";
import CommonHeaderLeft from "../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../component/CommonHeaderRight";
import { useAppContext } from "../../AppContext/AppContext";
import UserService from "../../services/UserService";
import appSettings from "../../../Client/appSettings";

const client = process.env.CLIENT;

const AccountSettings = () => {
  const { t } = useTranslation();
  const { logout } = useAppContext();
  const navigation = useNavigation();
  const [user, setUser] = useState("");
  const [profile, setProfile] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          title={t("account_settings")}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
    });
    GetUser();
  }, [navigation, t]);

  const GetUser = async () => {
    try {
      setLoading(true);
      const respUser = await UserService.getUserDetails();
      if (!respUser.data) {
        console.error("Error", "Failed to get user data.");
      }
      setUser(respUser.data);
      const UserID = respUser.data.UserID;
      const profile = await UserService.getUserProfile(UserID);
      setProfile(profile.request._url);
    } catch (error) {
      console.error("profile_url failed:", error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handleLogout = async () => {
    try {
      setRefreshing(true);

      // Unregister push notification token before logout
      try {
        console.log(
          "User logging out - unregistering push notification token..."
        );
        const PushNotificationIntegration =
          require("../../utils/pushNotificationIntegration").default;
        await PushNotificationIntegration.onUserLogout();
        console.log("Push notification token unregistration completed");
      } catch (pushError) {
        console.error("Push notification unregistration failed:", pushError);
      }

      const response = await UserService.Logout();
      await AsyncStorage.setItem("userData", JSON.stringify(response.data));

      if (!response.data) {
        console.error("Error in logout", "Failed to get response data.");
      } else {
        await AsyncStorage.multiRemove([
          "authToken",
          "userData",
          "@CallContext",
        ]);

        const AppSettings = appSettings[client];
        const targetScreen = AppSettings?.screens?.Welcome_screen
          ? "Welcome"
          : "Login";

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
    } finally {
      setRefreshing(false);
    }
  };

  // Menu items for Account Settings
  const menuItems = [
    {
      id: 0,
      name: "my_profile",
      navigateTo: "Profile",
      icon: require(`../../assets/images/client/${client}/profile.png`),
    },
    {
      id: 1,
      name: "about_us",
      navigateTo: "AboutUs",
      icon: require(`../../assets/images/client/${client}/help&support.png`),
    },
    {
      id: 2,
      name: "faqs",
      navigateTo: "FAQs",
      icon: require(`../../assets/images/client/${client}/help&support.png`),
    },
    {
      id: 3,
      name: "contact_us",
      navigateTo: "ContactUs",
      icon: require(`../../assets/images/client/${client}/message.png`),
    },
    {
      id: 4,
      name: "language",
      navigateTo: "LanguageSettings",
      icon: require(`../../assets/images/client/${client}/language.png`),
    },
    {
      id: 5,
      name: "delete_account",
      navigateTo: "DeleteAccount",
      icon: require(`../../assets/images/client/${client}/trash.png`),
    },
  ];

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={GetUser} />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollView}
    >
      {loading ? (
        <View style={{ padding: 16, width: "100%" }}>
          {/* Profile Header */}
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Skeleton height={80} width={80} radius={40} colorMode="light" />
            <View style={{ marginTop: 12 }}>
              <Skeleton height={16} width={120} radius={4} colorMode="light" />
            </View>
            <View style={{ marginTop: 6 }}>
              <Skeleton height={14} width={180} radius={4} colorMode="light" />
            </View>
          </View>

          {/* Menu Items */}
          {[1, 2, 3, 4, 5, 6].map((_, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Skeleton
                height={14}
                width={"70%"}
                radius={4}
                colorMode="light"
              />
              <Skeleton height={14} width={14} radius={4} colorMode="light" />
            </View>
          ))}

          {/* Logout */}
          <View style={{ marginTop: 30 }}>
            <Skeleton height={30} width={"40%"} radius={4} colorMode="light" />
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          {/* Profile Section */}
          <LinearGradient
            colors={["#1D9ADC", "#0B489A"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileSection}
          >
            <Image
              style={styles.profileImage}
              source={
                profile
                  ? { uri: profile }
                  : require("../../assets/images/profile_icon.png")
              }
            />
            <View style={styles.nameView}>
              <Text style={styles.name}>
                {user?.UserName || t("guest_user") || "Guest"}
              </Text>
            </View>
            <Text style={styles.email}>
              {user?.LoginEmailID || ""}
            </Text>
          </LinearGradient>

          {/* Content Section */}
          <View style={styles.contentSection}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigation.navigate(item.navigateTo)}
                style={styles.menuItem}
              >
                <View style={styles.menuTextView}>
                  <Text style={styles.menuText}>{t(item.name)}</Text>
                </View>
                <View style={styles.arrowView}>
                  <Image
                    style={styles.arrowIcon}
                    source={require("../../assets/images/client/foodworld/arrow-right.png")}
                  />
                </View>
              </TouchableOpacity>
            ))}

            {/* Logout */}
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <View style={styles.logoutTextView}>
                <Text style={styles.logoutText}>{t("logout")}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: "#F6F6F6",
    width: wp("100%"),
  },
  container: {
    flex: 1,
    width: wp("100%"),
  },
  profileSection: {
    marginTop: hp("2.5%"),
    width: wp("89%"),
    height: hp("17.875%"),
    alignSelf: "center",
    alignItems: "center",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    overflow: "hidden",
  },
  profileImage: {
    resizeMode: "contain",
    width: hp("7.5%"),
    height: hp("7.5%"),
    backgroundColor: "#ffff",
    borderRadius: 50,
    marginTop: hp("2.75%"),
  },
  nameView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp("1.25%"),
  },
  name: {
    fontSize: RFValue(14),
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    writingDirection: I18nManager.isRTL ? "rtl" : "ltr",
  },
  email: {
    fontSize: RFValue(12),
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    top: -hp("0.8%"),
    writingDirection: I18nManager.isRTL ? "rtl" : "ltr",
  },
  contentSection: {
    backgroundColor: "#FFFFFF",
    width: wp("89%"),
    minHeight: hp("55%"),
    alignSelf: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: "column",
    marginBottom: hp("12%"),
    paddingHorizontal: wp("5%"),
    paddingTop: hp("1%"),
    paddingBottom: hp("2%"),
  },
  menuItem: {
    width: "100%",
    height: hp("6.5%"),
    overflow: "hidden",
    justifyContent: "space-between",
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
    alignItems: "center",
  },
  menuTextView: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
  },
  menuText: {
    fontSize: RFValue(14),
    fontWeight: "400",
    textAlign: I18nManager.isRTL ? "right" : "left",
    color: "#525252",
    fontFamily: "Poppins-Regular",
  },
  arrowView: {
    width: "15%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowIcon: {
    resizeMode: "contain",
    width: hp("2%"),
    height: hp("2%"),
    transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
  },
  logoutButton: {
    width: "100%",
    height: hp("6.5%"),
    overflow: "hidden",
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    marginTop: hp("2%"),
    marginBottom: hp("0.5%"),
  },
  logoutTextView: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
    alignItems: I18nManager.isRTL ? "flex-end" : "flex-start",
  },
  logoutText: {
    fontSize: RFValue(14),
    fontWeight: "600",
    textAlign: I18nManager.isRTL ? "right" : "left",
    color: "#525252",
    fontFamily: "Poppins-SemiBold",
    writingDirection: I18nManager.isRTL ? "rtl" : "ltr",
  },
});

export default AccountSettings;
