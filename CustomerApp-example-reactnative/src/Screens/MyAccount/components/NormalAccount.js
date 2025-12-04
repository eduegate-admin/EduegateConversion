import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  I18nManager,
} from "react-native";
import { View } from "react-native";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallContext } from "../../../AppContext/CallContext";
import UserService from "../../../services/UserService";
import { useAppContext } from "../../../AppContext/AppContext";
import { useTranslation } from "react-i18next";
import content from "../clients/content";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import { RFValue } from "react-native-responsive-fontsize";
import appSettings from "../../../../Client/appSettings";
import CustomHeader from "../../../component/CustomHeader";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import { Skeleton } from "moti/skeleton";
import CustomPop from "../../../component/CustomPop";

const client = process.env.CLIENT;
// const targetScreen = appSettings[client]?.screens?.Welcome_screen;

const NormalAccount = () => {
  const { t } = useTranslation();
  const { logout } = useAppContext();
  const navigation = useNavigation();
  const { setCallContext, callContext, clearCallContext } = useCallContext();
  // const [styles, setStyle] = useState(ClientStyles(client, "Account"));
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState("");
  const [profile, setProfile] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // const { setIsLoggedIn } = useAppContext();

  // useEffect(() => {
  //   const clientStyle = ClientStyles(client, "Account");
  //   if (clientStyle) {
  //     setStyle(clientStyle);
  //   } else {
  //     console.error("Client settings not found");
  //   }
  // }, [client]);

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        <CustomHeader
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
      title: client === "benchmarkfoods" ? "Account" : t("myAccount"),
    });
    GetUser();
  }, [navigation, t]);

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        const data = await AsyncStorage.getItem("userData");
        const token = await AsyncStorage.getItem("authToken");
        if (data && token) {
          setUserData(JSON.parse(data));
        }
      };
      loadUser();
    }, [])
  );

  const clientContent = content[client];

  // console.log(content)

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      setRefreshing(true);
      // console.log("Logging out...");

      // Unregister push notification token before logout
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
      // await AsyncStorage.clear();
      setCallContext(null);
      if (!response.data) {
        console.error("Error in logout", "Failed to get response data.");
      } else {
        // console.log(
        //   "resp logout userData",
        //   await AsyncStorage.getItem("userData")
        // );
        // console.log(
        //   "resp logout callcontext",
        //   await AsyncStorage.getItem("@CallContext")
        // );
        // console.log(
        //   "resp logout authtoken",
        //   await AsyncStorage.getItem("authToken")
        // );
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
      setTimeout(() => setLoading(false), 800); // Always run this after try/catch — success or fail
    }
  };
  // console.log("profile",profile);
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={GetUser} />
      }
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={styles.ScrollView}
    >
      {loading ? (
        <View style={{ padding: 16, width: "100%" }}>
          {/* Profile Header */}
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            {/* Profile Image */}
            <Skeleton height={80} width={80} radius={40} colorMode="light" />
            <View style={{ marginTop: 12 }}>
              {/* Name */}
              <Skeleton height={16} width={120} radius={4} colorMode="light" />
            </View>
            <View style={{ marginTop: 6 }}>
              {/* Email */}
              <Skeleton height={14} width={180} radius={4} colorMode="light" />
            </View>
          </View>

          {/* Menu Items */}
          {[1, 2, 3, 4, 5].map((_, i) => (
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
          <View style={styles.ProfileSection}>
            {client === "benchmarkfoods" ? (
              <LinearGradient
                colors={["#1D9ADC", "#0B489A"]}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Image
                  style={styles.profileImage}
                  source={
                    profile
                      ? { uri: profile }
                      : require("../../../assets/images/client/benchmarkfoods/profile_icon.png")
                  }
                />
                <View style={styles.NameView}>
                  <Text style={styles.Name}>{user?.UserName || ""}</Text>
                  {/* <Image
                  style={styles.editIcon}
                  source={require("../../../assets/images/client/foodworld/edit.png")}
                /> */}
                </View>
                <Text style={styles.phone}>{user?.LoginEmailID || ""}</Text>
              </LinearGradient>
            ) : (
              <>
                <Image
                  style={styles.profileImage}
                  source={
                    profile
                      ? { uri: profile }
                      : require("../../../assets/images/profile_icon.png")
                  }
                />
                <View style={styles.NameView}>
                  <Text style={styles.Name}>
                    {user?.UserName || t("guest_user") || "Guest"}
                  </Text>
                  <Image
                    style={styles.editIcon}
                    source={require(
                      `../../../assets/images/client/${client}/edit.png`
                    )}
                  />
                </View>
                <Text style={styles.phone}>
                  {user?.LoginEmailID || ""}
                </Text>
              </>
            )}
          </View>
          {/* content Section */}

          <View style={styles.ContentSection}>
            {clientContent?.map((item, index) => {
              // console.log(item);
              return (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate(item.navigateTo);
                  }}
                  key={item.itemId}
                  style={styles.ContentView}
                >
                  <View style={styles.IconView}>
                    <Image
                      style={styles.Icon}
                      source={item.icon ? item.icon : null}
                    />
                  </View>
                  <View style={styles.screenTextView}>
                    <Text style={styles.screenText}>{t(item.Name)}</Text>
                  </View>
                  <View style={styles.rightArrowView}>
                    <Image
                      style={styles.rightArrowIcon}
                      source={require("../../../assets/images/client/foodworld/arrow-right.png")}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              onPress={handleLogout}
              style={styles.LogOutCommon}
            >
              {client !== "benchmarkfoods" && (
                <View style={styles.LogOutIconView}>
                  <Image
                    style={styles.LogOutIcon}
                    source={require("../../../assets/images/client/foodworld/logout.png")}
                  />
                </View>
              )}

              <View style={styles.LogOutTextView}>
                <Text style={styles.LogOutText}>{t("logout")}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <CustomPop
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title={t("confirm_logout")}
        message={t("logout_confirmation_message")}
        confirmText={t("yes")}
        cancelText={t("cancel")}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  ScrollView: {
    backgroundColor: "#F6F6F6",
    // paddingBottom: 10,
    width: wp("100%"),
  },
  container: {
    flex: 1,
    width: wp("100%"),
  },
  gradientButton: {
    width: wp("89%"),
    height: hp("17.875%"),
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    // borderRadius: 10,
    // marginTop: 20,
    overflow: "hidden",
    alignItems: "center",

    // paddingTop: 15,
  },
  ProfileSection: {
    // backgroundColor: "red",
    marginTop: hp("2.5%"),
    width: wp("89%"),
    height: hp("17.875%"),
    alignSelf: "center",
    alignItems: "center",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    flexDirection: "column",
  },
  profileImage: {
    resizeMode: "contain",
    width: hp("7.5%"),
    height: hp("7.5%"),
    backgroundColor: "#ffff",
    borderRadius: 50,
    marginTop: hp("2.75%"),
  },
  NameView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#FFFFFF",
    marginTop: hp("1.25%"),
  },
  Name: {
    fontSize: RFValue(14),
    fontWeight: 600,
    // lineHeight: 30,
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
  editIcon: {
    resizeMode: "contain",
    width: 20,
    height: 20,
    alignItems: "center",
    left: 10,
  },
  phone: {
    fontSize: RFValue(12),
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: 400,
    fontFamily: "Poppins-Regular",
    top: -hp("0.8%"),
  },
  ContentSection: {
    backgroundColor: "#FFFFFF",
    width: wp("89%"),
    height: hp("61%"),
    alignSelf: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: "column",
    // paddingTop: 15,
    marginBottom: hp("8%"),
    paddingHorizontal: wp("3.5%"),
  },
  ContentView: {
    width: "100%",
    height: "10%",
    overflow: "hidden",
    justifyContent: "space-between",
    flexDirection: "row",
    // backgroundColor: "blue",
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
    marginBottom: 1,
  },
  IconView: {
    width: "0%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "green",
  },
  Icon: {
    resizeMode: "contain",
    width: 35,
    height: 35,
  },
  screenTextView: {
    width: "80%",
    height: "100%",
    justifyContent: "center",
    // backgroundColor: "yellow",
  },
  AddressTextView: {
    justifyContent: "space-around",
    flexDirection: "row",
  },
  screenText: {
    fontSize: RFValue(14),
    fontWeight: 400,
    textAlign: "left",
    color: "#525252",
  },
  rightArrowView: {
    width: "15%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  rightArrowIcon: {
    resizeMode: "contain",
    width: hp("2%"),
    height: hp("2%"),
  },
  LogOutCommon: {
    width: "100%",
    height: "10%",
    overflow: "hidden",
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    // marginTop: hp("23.75%"),
  },
  LogOutIconView: {
    width: "15%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  LogOutIcon: {
    resizeMode: "contain",
    width: 25,
    height: 25,
  },
  LogOutTextView: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
    paddingLeft: I18nManager.isRTL ? 0 : 10,
    paddingRight: I18nManager.isRTL ? 10 : 0,
  },
  LogOutText: {
    fontSize: RFValue(14),
    fontWeight: 400,
    textAlign: I18nManager.isRTL ? "right" : "left",
    color: "#525252",
    fontFamily: "Poppins-SemiBold",
  },
});

export default NormalAccount;
