import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import appSettings from "../../../Client/appSettings";
import { useCallContext } from "../../AppContext/CallContext";
import colors from "../../config/colors";
import CategoryService from "../../services/categoryService";
import ProductService from "../../services/productService";
import UserService from "../../services/UserService";
import ClientStyles from "../../Styles/StyleLoader/ClientStyles";
import callContextCache from "../../utils/callContextCache";
import CustomPop from "../CustomPop";
import drawer from "./clients/drawer";

const client = process.env.CLIENT;
const Envirnment = process.env.ENVIRONMENT;

// Helper function to render vector icons
const renderIcon = (iconType, iconName, size = 22, color = colors.primary) => {
  const IconComponent = {
    MaterialIcons,
    FontAwesome5,
    Ionicons,
  }[iconType];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent name={iconName} size={size} color={color} />;
};

const CustomDrawer = (props) => {
  // const navigation = useNavigation();
  const navigation = props.navigation;
  const { setCallContext, callContext } = useCallContext();
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState("");
  const [profile, setProfile] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [dropDownBrand, setDropDownBrand] = useState(false);
  const instagram = appSettings[client].instagram;
  const whatsapp = appSettings[client].whatsapp;
  const facebook = appSettings[client].facebook;
  const AppVersion = appSettings[client].AppVersion;
  const profileSectionDrawer = appSettings[client].profileSectionDrawer;
  const profileSectionDrawerImage =
    appSettings[client].profileSectionDrawerImage;
  const [category, setCategory] = useState("");
  const [brands, setBrands] = useState("");
  const [styles, setStyle] = useState(ClientStyles(client, "Drawer"));
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  // console.log("Envirnment", Envirnment);

  // const { setIsLoggedIn } = useAppContext();
  const { t } = useTranslation();

  useEffect(() => {
    const clientStyle = ClientStyles(client, "Drawer");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, [client]);

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        const data = await AsyncStorage.getItem("userData");
        const token = await callContextCache.getAuthToken();
        if (data && token) {
          setUserData(JSON.parse(data));
        }
      };
      loadUser();
      GetUser();
      GetCategory();
    }, [])
  );
  const contents = drawer[client] || [];

  const GetCategory = async () => {
    try {
      const response = await CategoryService.getAllCategories();
      const resp = await ProductService.getBrands();
      setBrands(resp.data);
      if (Array.isArray(response.data) && response.data.length > 0) {
        setCategory(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching getAllCategories data:", error);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      setRefreshing(true);
      setShowLogoutConfirm(false);

      const response = await UserService.Logout();
      await AsyncStorage.setItem("userData", JSON.stringify(response.data));
      await callContextCache.clearAll();
      await AsyncStorage.removeItem("userData");
      setCallContext(null);

      if (!response.data) {
        console.error("Error in logout", "Failed to get response data.");
        return;
      }

      console.log(
        "resp logout userData",
        await AsyncStorage.getItem("userData")
      );
      console.log("resp logout callcontext", await callContextCache.get());
      console.log(
        "resp logout authtoken",
        await callContextCache.getAuthToken()
      );

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Welcome" }],
        })
      );
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const GetUser = async () => {
    try {
      const respUser = await UserService.getUserDetails();

      if (!respUser.data) {
        console.error("Error", "Failed to get user data.");
      }
      setUser(respUser.data);
      const UserID = respUser.data.UserID;
      const profile_url = await UserService.getUserProfile(UserID);
      setProfile(profile_url.request._url);
    } catch (error) {
      if (!respUser.data) {
        console.error("Error", "Failed to Get user data.");
      } else {
        console.error("profile_url failed:", error);
      }
    }
  };

  const shareOnInstagram = () => {
    const message =
      "https://play.google.com/store/apps/details?id=com.example.app";
    const url = `https://${instagram}`;
    Linking.openURL(url).catch(() => {
      alert(t("instagram_not_installed"));
    });
  };

  const shareOnFacebook = () => {
    const url = "https://play.google.com/store/apps/details?id=com.example.app";
    const fbUrl = `https://${facebook}`;
    Linking.openURL(fbUrl).catch(() => {
      alert(t("facebook_not_available"));
    });
  };

  const shareOnWhatsApp = () => {
    const message = "Hello! I would like to know more about your app.";
    const url = `https://wa.me/${whatsapp.replace(
      "+",
      ""
    )}?text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() => {
      alert(t("whatsapp_not_installed"));
    });
  };
  const footerScreens = [
    "Home",
    "Category",
    "Order",
    "Cart",
    "Account",
    "Wishlist",
  ];
  return (
    <View style={styles.Container}>
      {profileSectionDrawer && (
        <TouchableOpacity
          style={styles.accountTouch}
          onPress={() => navigation.navigate("MyAccount")}
        >
          {profileSectionDrawerImage ? (
            // IMAGE FIRST layout
            <>
              <View style={styles.accountImgView}>
                <Image
                  source={
                    profile
                      ? { uri: profile }
                      : require("../../assets/images/profile_icon.png")
                  }
                  style={styles.image}
                />
              </View>
              <View style={styles.welcomeView}>
                <Text style={styles.Name}>
                  {t("welcome")} {user?.UserName}
                </Text>
              </View>
            </>
          ) : (
            // TEXT FIRST layout
            <>
              <View style={styles.welcomeView}>
                <Text style={styles.welcomeText}>{t("welcome")}</Text>
                <Text style={styles.Name}>{user?.UserName}</Text>
              </View>
              <View style={styles.accountImgView}>
                <Image
                  source={
                    profile
                      ? { uri: profile }
                      : require("../../assets/images/profile_icon.png")
                  }
                  style={styles.image}
                />
              </View>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* drawer  contents */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.commonMargin}
      >
        <View>
          {contents.length > 0 ? (
            contents.map((item, index) => {
              return (
                <TouchableOpacity
                  key={item.itemId}
                  onPress={
                    item.itemName === "signing_out"
                      ? handleLogout
                      : footerScreens.includes(item.navigateTo)
                        ? () =>
                            navigation.navigate("Footer", {
                              screen: item.navigateTo,
                            })
                        : () => navigation.navigate(item.navigateTo)
                  }
                  style={styles.drawerView}
                  activeOpacity={0.7}
                >
                  <View style={styles.drawerInnerView}>
                    {(client === "almadina" || client === "almadinadot") &&
                    item.iconType &&
                    item.iconName ? (
                      <View style={styles.iconContainer}>
                        {/* I change the icon size from 22 to 20 */}

                        {renderIcon(
                          item.iconType,
                          item.iconName,
                          20,
                          colors.primary
                        )}
                      </View>
                    ) : (
                      <Image source={item.icon} style={styles.icon} />
                    )}
                    <Text style={styles.drawerText}>{t(item.itemName)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setDropDown(!dropDown)}
                style={[
                  styles.headerCommon,
                  {
                    paddingTop: hp("3.75%"),
                  },
                ]}
              >
                <Text style={styles.headText}>{category.Name}</Text>
                <Image
                  source={require("../../assets/images/client/benchmarkfoods/dropDownArrow.png")}
                  style={[
                    styles.dropdownIcon,
                    { transform: dropDown ? [{ rotate: "180deg" }] : "" },
                  ]}
                />
              </TouchableOpacity>

              {dropDown &&
                Array.isArray(category?.FaceItems) &&
                category.FaceItems.map((item, index) => {
                  return (
                    <TouchableOpacity
                      key={`category-${item.value}-${index}`}
                      onPress={() =>
                        navigation.navigate("ProductListing", {
                          title: item.key,
                          searchVal: "Category:" + item.value,
                          searchText: "",
                          searchBy: "",
                          sortBy: "relevance",
                          isCategory: false,
                          pageType: "",
                        })
                      }
                      style={styles.drawerView}
                    >
                      <View style={styles.drawerInnerView}>
                        <Text style={styles.drawerText}>{item.key}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}

              <TouchableOpacity
                onPress={() => setDropDownBrand(!dropDownBrand)}
                style={styles.headerCommon}
              >
                <Text style={styles.headText}>Brands</Text>
                <Image
                  source={require("../../assets/images/client/benchmarkfoods/dropDownArrow.png")}
                  style={[
                    styles.dropdownIcon,
                    { transform: dropDownBrand ? [{ rotate: "180deg" }] : "" },
                  ]}
                />
              </TouchableOpacity>
              {dropDownBrand &&
                Array.isArray(brands) &&
                brands.map((item, index) => {
                  return (
                    <TouchableOpacity
                      key={`brand-${item.BrandIID}-${index}`}
                      onPress={() =>
                        navigation.navigate("ProductListing", {
                          title: item.BrandName,
                          searchVal: `Brand:${item.BrandIID}`,
                          searchText: "",
                          searchBy: "",
                          sortBy: "relevance",
                          isCategory: false,
                          pageType: "",
                        })
                      }
                      style={styles.drawerView}
                    >
                      <View style={styles.drawerInnerView}>
                        <Text style={styles.drawerText}>
                          {t(item.BrandName)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </>
          )}
        </View>
      </ScrollView>
      <CustomPop
        visible={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title={t("confirm_logout")}
        message={t("logout_confirmation_message")}
        confirmText={t("yes")}
        cancelText={t("cancel")}
        GradientColor={false}
      />
      <Text style={styles.Version}>Version {AppVersion}</Text>
      {Envirnment === "test" && <Text style={styles.Version}>Test Apk</Text>}

      {/*contact support*/}
      <View style={styles.socialPlatform}>
        <TouchableOpacity
          onPress={shareOnFacebook}
          style={styles.socialIconWrapper}
          activeOpacity={0.7}
        >
          {client === "almadina" || client === "almadinadot" ? (
            <FontAwesome5 name="facebook" size={24} color={colors.primary} />
          ) : (
            <Image
              source={require("../../assets/images/facebook.png")}
              style={styles.socialIcon}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={shareOnInstagram}
          style={styles.socialIconWrapper}
          activeOpacity={0.7}
        >
          {client === "almadina" || client === "almadinadot" ? (
            <FontAwesome5 name="instagram" size={24} color={colors.primary} />
          ) : (
            <Image
              source={require("../../assets/images/instagram.png")}
              style={styles.socialIcon}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={shareOnWhatsApp}
          style={styles.socialIconWrapper}
          activeOpacity={0.7}
        >
          {client === "almadina" || client === "almadinadot" ? (
            <FontAwesome5 name="whatsapp" size={24} color={colors.primary} />
          ) : (
            <Image
              source={require("../../assets/images/watsapp.png")}
              style={styles.socialIcon}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default CustomDrawer;
