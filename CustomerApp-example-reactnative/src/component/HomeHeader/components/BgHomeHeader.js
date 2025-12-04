import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import appSettings from "../../../../Client/appSettings";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";
import AddressService from "../../../services/addressService";
import callContextCache from "../../../utils/callContextCache";
import CustomSearchBar from "../../CustomSearchBar";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const client = process.env.CLIENT;

// Responsive helper functions
const isTablet = () => SCREEN_WIDTH >= 768;
const isSmallScreen = () => SCREEN_WIDTH < 360;

const BgHomeHeader = ({ navigation }) => {
  const AppSettings = appSettings[client];
  const IsShippingAddress = AppSettings?.IsShippingAddress;
  const customhide = appSettings[client]?.customhideHeader;
  //console.log("customhide", customhide);

  const [address, setAddress] = useState("");
  const [lastShippingAddress, setLastShippingAddress] = useState("");
  const [styles, setStyle] = useState(ClientStyles(client, "bgHomeHeader"));
  const [loading, setLoading] = useState(true);
  const { navigate } = useNavigation();
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      fetchAddress();
      fetchCurrentLocation();
    }, [])
  );

  useEffect(() => {
    const clientStyle = ClientStyles(client, "bgHomeHeader");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, []);

  const fetchAddress = async () => {
    try {
      const authToken = callContextCache.getAuthToken();
      const response = await AddressService.getShippingAddress(authToken);
      if (response.data) {
        setLastShippingAddress(response.data);
      } else {
        setLastShippingAddress("");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching LastShippingAddress:", error);
      setLoading(false);
    }
  };

  const fetchCurrentLocation = async () => {
    try {
      const cached = await AsyncStorage.getItem("@cachedAddress");
      if (cached) setAddress(cached);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setAddress("Location permission denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            latlng: `${latitude},${longitude}`,
            key: AppSettings.apiKey,
          },
        }
      );

      const formatted = res.data.results[0]?.formatted_address;
      if (formatted) {
        setAddress(formatted);
        await AsyncStorage.setItem("@cachedAddress", formatted);
      } else {
        setAddress("Unable to determine address");
      }
    } catch (err) {
      console.error("Geolocation error:", err);
    }
  };
  //  console.log("lastShippingAddress", lastShippingAddress.ContactID);
  return (
    <View style={styles.mainView}>
      <StatusBar
        translucent={false}
        barStyle="light-content"
        backgroundColor={customhide ? "#580269ff" : "#34B067"}
      />
      <View style={styles.container}>
        <ImageBackground
          imageStyle={[
            styles.imageBackground,
            { tintColor: customhide ? "#580269ff" : null },
          ]}
          source={require(`../../../assets/images/client/${client}/bg.png`)}
          resizeMode="cover"
          style={styles.image}
        >
          <View style={styles.headerContainer}>
            <View style={styles.bannerCnt}>
              {!customhide ? (
                <View style={styles.bannerCntLeft}>
                  <Text style={styles.welcomeText} numberOfLines={1}>
                    {t("welcome")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      navigate("AddressSwitch", {
                        Currentaddress: `${lastShippingAddress.ContactID}`,
                      });
                    }}
                    style={styles.deliveryPointContainer}
                  >
                    <Image
                      style={styles.locationIcon}
                      source={require(
                        `../../../assets/images/client/${client}/header-location.png`
                      )}
                    />
                    {loading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#fff" />
                      </View>
                    ) : (
                      <Text style={styles.deliveryPoint} numberOfLines={1}>
                        {IsShippingAddress && lastShippingAddress
                          ? `${lastShippingAddress.AddressLine1}`
                          : address
                            ? `${address}`
                            : ""}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.bannerCntLeft}>
                  {/* <Image
                    style={[
                      styles.contactIcon,
                      { marginHorizontal: wp("4.44%") },
                    ]}
                    source={require(
                      `../../../assets/images/client/${client}/notifyMe.png`
                    )}
                  /> */}

                  {/* <Image
                    style={[
                      styles.contactIcon,
                      { marginHorizontal: wp("4.44%") },
                    ]}
                    source={require(
                      `../../../assets/images/client/${client}/logo.png`
                    )}
                  /> */}
                </View>
              )}
              <View style={styles.bannerCntRight}>
                <TouchableOpacity
                  onPress={() => {
                    navigate("Notification");
                  }}
                >
                  <Image
                    style={[
                      styles.contactIcon,
                      { marginHorizontal: wp("4.44%") },
                    ]}
                    source={require(
                      `../../../assets/images/client/${client}/notifyMe.png`
                    )}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => navigate("Account")}
                >
                  <Image
                    style={styles.contactIcon}
                    source={require(
                      `../../../assets/images/client/${client}/contact_icon_hd.png`
                    )}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.bannerSearch}>
              <CustomSearchBar
                placeholder={t("Search_for_products")}
                editable={false}
                onChangeText={() => {}}
                handleClick={() => {
                  navigate("Search");
                }}
              />
            </View>
            <TouchableOpacity style={styles.banner}>
              <Image
                style={styles.banner}
                source={{
                  uri: "http://portalv2.almadinahypermarket.ae/UploadImages/Banners//d93550f1-5b78-4f3b-a73c-1b79bef7f0c9.jpg",
                }}
              />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: "#FFFFFF",
  },
  container: {
    // backgroundColor: "#c72121ff",
    width: wp("100%"),
    height: hp("18%"),
  },
  imageBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  imageBackgroundImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  image: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  headerContainer: {
    // backgroundColor: "#ad2727ff",
    paddingHorizontal: wp("4.44%"),
    paddingTop: wp("4.44%"),
  },
  bannerCnt: {
    // backgroundColor: "#35d14fff",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  bannerCntLeft: {
    width: wp("62.24%"),
    flexDirection: "row",
    // backgroundColor: "#171807ff",
  },
  welcomeText: {
    fontSize: RFValue(16, 800),
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#ffffff",
  },
  deliveryPointContainer: {
    // backgroundColor: "#ffffffff",
    width: wp("62.24%"),
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: {
    width: wp("5%"),
    height: wp("5%"),
    resizeMode: "contain",
  },
  deliveryPoint: {
    fontSize: RFValue(12, 800),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    color: "#FFFFFF",
  },
  bannerSearch: {
    alignItems: "center",
    marginBottom: hp("2.22"),
  },
  bannerCntRight: {
    // backgroundColor: "#2c29e6ff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: wp("4.44%"),
  },
  contactIcon: {
    width: wp("6.67%"),
    height: wp("6.67%"),
    resizeMode: "contain",
  },
  iconButton: {
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    width: wp("13.33%"),
    height: wp("13.33%"),
    backgroundColor: "#EEF4EE66",
  },
  banner: {
    width: "100%",
    aspectRatio: 3.5, // Increased to make it even shorter
    borderRadius: 15,
    resizeMode: "cover",
    alignSelf: "center",
    marginTop: -3,
  },
});

export default BgHomeHeader;
