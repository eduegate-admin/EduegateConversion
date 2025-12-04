import React, { useCallback, useEffect, useState } from "react";
import {
  Text,
  Image,
  View,
  TouchableOpacity,
  Linking,
  FlatList,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as Location from "expo-location";
import { useTranslation } from "react-i18next";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";
import AddressService from "../../../services/addressService";
import callContextCache from "../../../utils/callContextCache";
import appSettings from "../../../../Client/appSettings";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import CustomSearchBar from "../../CustomSearchBar";
import SearchService from "../../../services/SearchService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const client = process.env.CLIENT;

const NormalHomeHeader = () => {
  const navigation = useNavigation();
  const AppSettings = appSettings[client];
  const IsShippingAddress = AppSettings?.IsShippingAddress;
  const Side_menu_App_icon = AppSettings?.Side_menu_App_icon;
  const searchFirstLayout = AppSettings?.SearchFirstLayout;
  // console.log("searchFirstLayout value:", searchFirstLayout);
  const [styles, setStyle] = useState(ClientStyles(client, "homeHeader"));
  const [address, setAddress] = useState("");
  const [lastShippingAddress, setLastShippingAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const whatsapp = appSettings[client].whatsapp;
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState([]);
  // const [modalVisible, setModalVisible] = useState(false);
  const { navigate } = useNavigation();
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      fetchAddress();
      fetchCurrentLocation();
    }, [])
  );

  useEffect(() => {
    const clientStyle = ClientStyles(client, "homeHeader");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchText.trim() !== "") {
        fetchProducts(searchText);
        // setModalVisible(true); // show modal when typing
      } else {
        setProducts([]);
        // setModalVisible(false);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchText]);

  const fetchProducts = async (searchText) => {
    try {
      const response = await SearchService.GetFacetSearch(searchText);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
    }
  };

  const fetchAddress = async () => {
    try {
      const authToken = callContextCache.getAuthToken();
      const response = await AddressService.getShippingAddress(authToken);
      if (response.data) {
        setLoading(false);
        setLastShippingAddress(response.data);
      }
    } catch (error) {
      console.error("Error fetching LastShippingAddress:", error);
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

      const apiKey = "AIzaSyBydkwfwPoHXX-LXzpffMRhRotJhvXwLHg";
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            latlng: `${latitude},${longitude}`,
            key: apiKey,
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

  return (
    <>
      {/* <StatusBar backgroundColor="white" barStyle="dark-content" /> */}
      {Side_menu_App_icon && (
        <View style={styles.SideMenuView}>
          <TouchableOpacity
            onPress={() => {
              navigation.toggleDrawer();
            }}
          >
            <Image
              style={styles.SideMenuIcon}
              source={require(
                `../../../assets/images/client/${client}/menu.png`
              )}
            />
          </TouchableOpacity>
          <Image
            style={styles.appIcon}
            source={require(
              `../../../assets/images/client/${client}/Logo_home_header.png`
            )}
          />
        </View>
      )}
      <View style={styles.mainView}>
        <View style={styles.headerContainer}>
          {/* almadinadot searchbar */}

          {searchFirstLayout ? (
            <>
              <CustomSearchBar
                placeholder={"Hi,  what you are looking.."}
                editable={false}
                onChangeText={() => { }}
                handleClick={() => {
                  navigation.navigate("Search");
                }}
              />

              <View style={styles.bannerCnt}>
                <TouchableOpacity
                  onPress={() => {
                    navigate("AddressSwitch");
                  }}
                  style={styles.bannerCntLeft}
                >
                  <View style={styles.deliveryPointContainer}>
                    <Image
                      style={styles.mapIcon}
                      source={require(
                        `../../../assets/images/client/${client}/header-location.png`
                      )}
                    />
                    <Text style={styles.welcomeText} numberOfLines={1}>
                      {!IsShippingAddress
                        ? `${address}`
                        : lastShippingAddress?.BranchName
                          ? `${lastShippingAddress?.BranchName}`
                          : `${lastShippingAddress?.AddressLine1}`}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={
                    client === "benchmarkfoods"
                      ? shareOnWhatsApp
                      : () => {
                        navigate("AddressSwitch");
                      }
                  }
                  style={styles.center}
                >
                  <Text style={styles.welcomeText} numberOfLines={1}>
                    Change
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.bannerCnt}>
                <TouchableOpacity
                  onPress={() => {
                    navigate("AddressSwitch");
                  }}
                  style={styles.bannerCntLeft}
                >
                  <View style={styles.deliveryPointContainer}>
                    <Image
                      style={styles.mapIcon}
                      source={require(
                        `../../../assets/images/client/${client}/header-location.png`
                      )}
                    />
                    <Text style={styles.welcomeText} numberOfLines={1}>
                      {!IsShippingAddress
                        ? `${address}`
                        : lastShippingAddress?.BranchName
                          ? `${lastShippingAddress?.BranchName}`
                          : `${lastShippingAddress?.AddressLine1}`}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={
                    client === "benchmarkfoods"
                      ? shareOnWhatsApp
                      : () => {
                        navigate("AddressSwitch");
                      }
                  }
                  style={styles.center}
                >
                  <Image
                    style={styles.tinyLogo}
                    source={require(
                      `../../../assets/images/client/${client}/Header_info.png`
                    )}
                  />
                </TouchableOpacity>
              </View>
              <CustomSearchBar
                placeholder={"Search for products"}
                editable={false}
                onChangeText={() => { }}
                handleClick={() => {
                  navigation.navigate("Search");
                }}
              />
            </>
          )}
          {searchText.length > 0 && (
            <View
              style={{
                position: "absolute",
                // top: 60,
                left: 0,
                right: 0,
                backgroundColor: "#fff",
                zIndex: 99,
                height: hp("50%"),
              }}
            >
              <FlatList
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                data={products[0]?.FaceItems || []}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View
                    style={{
                      // flex: 1,
                      width: wp("81.5%"),
                      // height: hp("50%"),
                      // top: -10,
                      justifyContent: "center",
                      alignSelf: "center",
                      paddingHorizontal: wp("4.44%"),
                      backgroundColor: "#fff",
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        // padding: 8,
                        borderBottomWidth: 1,
                        borderBottomColor: "#eee",
                        backgroundColor: "#000",
                      }}
                      onPress={() => {
                        // setModalVisible(false);
                        navigation.navigate("ProductListing", {
                          title: `${item.key}`,
                          searchVal: `${"Category:" + item.id}`,
                          searchText: `${searchText}`,
                          searchBy: `${""}`,
                          sortBy: `${"relevance"}`,
                          isCategory: `${false}`,
                          pageType: `${""}`,
                        });
                      }}
                    >
                      <Image
                        source={{ uri: item.ItemImage }}
                        style={{
                          width: 40,
                          height: 40,
                          resizeMode: "contain",
                          borderRadius: 5,
                          marginRight: 10,
                        }}
                      />
                      <Text>
                        {searchText} {"   "} in {"  "}
                        {item.key}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}
        </View>
      </View>
    </>
  );
};

export default NormalHomeHeader;
