import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
 import MapView, { Marker } from "react-native-maps";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useTranslation } from "react-i18next";
import { RFValue } from "react-native-responsive-fontsize";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import appSettings from "../../../../Client/appSettings";
import clientSettings from "../../../../Client/clientSettings";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import CustomButton from "../../../component/CustomButton";
import CustomHeader from "../../../component/CustomHeader";
import CustomTextInput from "../../../component/CustomTextInput";
import AddressService from "../../../services/addressService";
import UserService from "../../../services/UserService";
import MapModal from "./mapModal";

const client = process.env.CLIENT;
const GOOGLE_MAPS_APIKEY = clientSettings[client]?.GoogleAPIKey;

export default function AddressWithMapModal(props) {
  const { t } = useTranslation();
  const data = props?.route?.params?.Details;
  const navigation = useNavigation();
  const [region, setRegion] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapBar, setMapBar] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationSource, setLocationSource] = useState("Your location");
  const [modalVisible, setModalVisible] = useState(true);
  const [firstName, setFirstName] = useState(data?.FirstName || "");
  const [lastName, setLastName] = useState(data?.LastName || "");
  const [landMark, setLandMark] = useState(data?.LandMark || "");
  const [telephone, setTelephone] = useState(data?.MobileNo1 || "");
  const [telephone2, setTelephone2] = useState(data?.MobileNo2 || "");
  const [buildingNo, setBuildingNo] = useState(data?.BuildingNo || "");
  const [road, setRoad] = useState(data?.Block || "");
  const [address, setAddress] = useState(data?.AddressLine2 || "");
  const [location, setLocation] = useState(data?.AddressLine1 || "");
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [user, setUser] = useState("");
  const [isFetchingNearby, setIsFetchingNearby] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const lastFetchedLocation = useRef(null);
  const scrollViewRef = useRef(null);
  const ShortMap = appSettings[client].ShortMap;
  const AutoTag = appSettings[client].AutoTag;
  const TextInput = appSettings[client].screens.CustomTextInput;
  const sessionToken = useRef(Date.now().toString()).current;

  // Refs for input field positions
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const landMarkRef = useRef(null);
  const telephoneRef = useRef(null);
  const telephone2Ref = useRef(null);
  const buildingNoRef = useRef(null);
  const roadRef = useRef(null);
  const locationRef = useRef(null);
  const addressRef = useRef(null);

  useEffect(() => {
    if (Platform.OS !== "web") {
      import("react-native-maps").then(({ default: MapView, Marker }) => {
        setMapComponent(() => ({ MapView, Marker }));
      });
    }
  }, []);

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        <CustomHeader
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
      title: t("add_address_title"),
    });
    if (data) {
      setFirstName(data.FirstName || "");
      setLastName(data.LastName || "");
      setLandMark(data.LandMark || "");
      setTelephone(data.MobileNo1 || "");
      setTelephone2(data.MobileNo2 || "");
      setBuildingNo(data.BuildingNo || "");
      setRoad(data.Block || "");
      setAddress(data.AddressLine2 || "");
      setLocation(data?.AddressLine1 || "");
    }
    GetUser();
  }, [data]);

  // Prefill fields with user data when no existing address data
  useEffect(() => {
    if (user && user.length > 0 && !data) {
      const userData = user[0];
      setFirstName(userData.FirstName || "");
      setLastName(userData.LastName || "");
      setTelephone(userData.MobileNo1 || "");
    }
  }, [user, data]);

  const handleToggleMapBar = () => {
    setMapBar((prev) => !prev);
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setLoading(true);

      const getLocation = async () => {
        const startTime = Date.now();

        try {
          // Check if location services are enabled
          const servicesEnabled = await Location.hasServicesEnabledAsync();
          if (!servicesEnabled) {
            setError(
              "Please enable Location services in your device settings."
            );
            setLoading(false);
            return;
          }

          // Get detailed location provider info (silent check)
          try {
            await Location.getProviderStatusAsync();
          } catch (providerError) {
            // Silent fail
          }

          // Try to get last known location as fallback (silent)
          try {
            await Location.getLastKnownPositionAsync({
              maxAge: 60000, // 1 minute
            });
          } catch (cacheError) {
            // Silent fail
          }

          const { status } = await Location.requestForegroundPermissionsAsync();

          if (status !== "granted") {
            setError("Permission to access location was denied.");
            return;
          }

          try {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Highest,
              maximumAge: 10000,
              timeout: 10000,
            });

            const coords = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };

            if (isActive) {
              setRegion({
                ...coords,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
              setCurrentLocation(coords);
              setLocationSource("Your location");
              setIsMapLoading(false);

              // Delay modal open to allow state to update
              setTimeout(() => {
                setModalVisible(true);
              }, 100);
            }
          } catch (gpsError) {
            // Try to get last known location as fallback
            try {
              const fallback = await Location.getLastKnownPositionAsync({
                maxAge: 300000,
              });
              if (fallback && isActive) {
                const coords = {
                  latitude: fallback.coords.latitude,
                  longitude: fallback.coords.longitude,
                };
                setRegion({
                  ...coords,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                });
                setCurrentLocation(coords);
                setLocationSource("Cached location");
                setIsMapLoading(false);
                setTimeout(() => {
                  setModalVisible(true);
                }, 100);
                return;
              }
            } catch (fallbackError) {
              // No cached location available
            }

            setError("Unable to get current location. Please try again.");
          }
        } catch (err) {
          let userMessage = "Location error: " + err.message;

          // Provide user-friendly error messages
          if (
            err.code === "E_LOCATION_TIMEOUT" ||
            err.message.includes("timeout")
          ) {
            userMessage =
              "Unable to get GPS location. Please ensure you're outdoors with clear sky view, or try again later.";
          } else if (err.code === "E_LOCATION_UNAVAILABLE") {
            userMessage =
              "GPS is unavailable. Please check your device settings.";
          } else if (err.code === "E_LOCATION_SETTINGS_UNSATISFIED") {
            userMessage =
              "Please enable high accuracy GPS in your device settings.";
          }

          if (isActive) {
            setError(userMessage);
          }
        } finally {
          setLoading(false);
          // Ensure map loading state is reset even if location fetch fails
          if (!currentLocation) {
            setIsMapLoading(false);
          }
        }
      };
      getLocation();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const fetchCurrentLocation = async () => {
    try {
      setLoading(true);

      // Check if GPS is enabled
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setError("Please enable Location services in your device settings.");
        setLoading(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permission to access location was denied.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        maximumAge: 10000,
        timeout: 10000,
      });
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            latlng: `${coords.latitude},${coords.longitude}`,
            key: GOOGLE_MAPS_APIKEY,
          },
        }
      );
      const formatted = res.data.results[0]?.formatted_address;
      setLocation(formatted);
    } catch (err) {
      let userMessage = "Location error: " + err.message;
      if (
        err.code === "E_LOCATION_TIMEOUT" ||
        err.message.includes("timeout")
      ) {
        userMessage =
          "GPS timeout. Please ensure you're in an open area with clear sky view.";
      }

      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.length < 3) return setPredictions([]);

    const timer = setTimeout(fetchPredictions, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchPredictions = async () => {
    try {
      const { data } = await axios.get(
        "https://maps.googleapis.com/maps/api/place/autocomplete/json",
        {
          params: {
            input: searchQuery,
            key: GOOGLE_MAPS_APIKEY,
            sessiontoken: sessionToken,
            location: region
              ? `${region.latitude},${region.longitude}`
              : undefined,
            radius: region ? 10000 : undefined,
          },
        }
      );

      setPredictions(data.predictions || []);
      setError(null);
    } catch (err) {
      setError("Prediction error: " + err.message);
    }
  };

  const handlePlaceSelect = async (placeId) => {
    try {
      const { data } = await axios.get(
        "https://maps.googleapis.com/maps/api/place/details/json",
        {
          params: {
            place_id: placeId,
            key: GOOGLE_MAPS_APIKEY,
            sessiontoken: sessionToken,
            fields: "name,geometry",
          },
        }
      );
      const { lat, lng } = data.result.geometry.location;
      const coords = { latitude: lat, longitude: lng };
      setRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      setCurrentLocation(coords);
      setSearchQuery(data.result.name);
      setPredictions([]);
      setLocationSource("selected location");
    } catch (err) {
      setError("Details error: " + err.message);
    }
  };

  const fetchSelectedLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permission to access location was denied.");
        return;
      }
      console.log("📍 Calling Geocoding API (fetchSelectedLocation)...");
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            latlng: `${currentLocation.latitude},${currentLocation.longitude}`,
            key: GOOGLE_MAPS_APIKEY,
          },
        }
      );
      console.log("✅ Geocoding API Success:", res.data.status);
      console.log("Address found:", res.data.results[0]?.formatted_address);
      const formatted = res.data.results[0]?.formatted_address;
      setLocation(formatted);
    } catch (err) {
      setError("Location error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (Platform.OS === "web") {
    return (
      <View style={styles.centeredView}>
        <Text>This screen is not supported on web.</Text>
      </View>
    );
  }

  useEffect(() => {
    if (currentLocation && !loading) {
      const timer = setTimeout(() => {
        fetchNearbyPlaces();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentLocation]);

  const fetchNearbyPlaces = async () => {
    if (!currentLocation) {
      console.log("⏭️ Skipping fetchNearbyPlaces - no location yet");
      return;
    }

    // Check if we already fetched for this location (within 50 meters)
    if (lastFetchedLocation.current) {
      const distance =
        Math.sqrt(
          Math.pow(
            currentLocation.latitude - lastFetchedLocation.current.latitude,
            2
          ) +
            Math.pow(
              currentLocation.longitude - lastFetchedLocation.current.longitude,
              2
            )
        ) * 111000; // Convert to meters

      if (distance < 50) {
        console.log("⚡ Using cached nearby places (location change <50m)");
        return;
      }
    }

    if (isFetchingNearby) {
      console.log("⏭️ Skipping fetchNearbyPlaces - already fetching");
      return;
    }

    setIsFetchingNearby(true);
    const latitude = currentLocation.latitude;
    const longitude = currentLocation.longitude;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_APIKEY}`;

    const apiStart = Date.now();
    console.log("\n📍 === Calling Geocoding API (fetchNearbyPlaces) ===");
    console.log("📊 Coordinates:", latitude, longitude);

    try {
      const fetchStart = Date.now();
      const response = await fetch(url);
      const fetchTime = Date.now() - fetchStart;
      console.log(`⏱️ Network request completed in ${fetchTime}ms`);

      const parseStart = Date.now();
      const data = await response.json();
      const parseTime = Date.now() - parseStart;
      console.log(`⏱️ JSON parsing completed in ${parseTime}ms`);

      console.log("✅ Geocoding API Success:", data.status);
      console.log("📊 Nearby places count:", data.results?.length || 0);

      const totalApiTime = Date.now() - apiStart;
      console.log(`⏱️ Total API call time: ${totalApiTime}ms`);

      if (totalApiTime > 2000) {
        console.warn("⚠️ WARNING: API call took more than 2 seconds!");
        console.warn(
          "💡 Possible causes: Slow internet, API quota issues, or server problems"
        );
      }

      if (data.status === "OVER_QUERY_LIMIT") {
        console.error("❌ Google Maps API: OVER_QUERY_LIMIT");
        console.error("💡 API key has exceeded quota or rate limit");
      } else if (data.status === "REQUEST_DENIED") {
        console.error("❌ Google Maps API: REQUEST_DENIED");
        console.error(
          "💡 API key is invalid or not authorized for Geocoding API"
        );
      }
      if (data.status === "OK") {
        const placesWithCoordinates = data.results.map((item) => ({
          address: item.formatted_address,
          latitude: item.geometry.location.lat,
          longitude: item.geometry.location.lng,
        }));
        setNearbyPlaces(placesWithCoordinates);
        lastFetchedLocation.current = { latitude, longitude };
        console.log("💾 Cached location for future requests");
        // console.log("Nearby places:", placesWithCoordinates);
      }
    } catch (error) {
      console.error("Error fetching nearby places:", error);
    } finally {
      setIsFetchingNearby(false);
    }
  };

  const handlePick = (item) => {
    setModalVisible(false);
    // console.log("Picked:", item);
    const coords = {
      latitude: item.latitude,
      longitude: item.longitude,
    };
    setLocation(item.address);
    setCurrentLocation(coords);
  };

  const handleAddress = async () => {
    const requiredFields = appSettings[client].AddressFields;

    const fieldValues = {
      firstName,
      lastName,
      landMark,
      telephone,
      telephone2,
      buildingNo,
      road,
      location,
      address,
    };

    const fieldMessage = appSettings[client].fieldMessage;

    // Map field names to refs for focusing
    const fieldRefs = {
      firstName: firstNameRef,
      lastName: lastNameRef,
      landMark: landMarkRef,
      telephone: telephoneRef,
      telephone2: telephone2Ref,
      buildingNo: buildingNoRef,
      road: roadRef,
      location: locationRef,
      address: addressRef,
    };

    // Validate all required fields including address
    for (const field of requiredFields) {
      if (!fieldValues[field]) {
        Toast.show({
          type: "error",
          text1: fieldMessage[field] || "This field is required",
          position: "top",
          visibilityTime: 3000,
        });

        // Focus on the missing field to open keyboard
        setTimeout(() => {
          if (fieldRefs[field]?.current) {
            fieldRefs[field].current.focus();
          }
        }, 500);

        return;
      }
    }
    try {
      const payload = data
        ? {
            ContactID: data.ContactID,
            TitleID: data.TitleID,
            SupplierID: data.SupplierID,
            CustomerID: data.CustomerID,
            Title: data.Title,
            FirstName: firstName,
            MiddleName: data.MiddleName,
            LastName: lastName ? lastName : null,
            LoginID: data.LoginID,
            Description: data.ContactID,
            CountryID: data.CountryID,
            OtherCountry: data.OtherCountry,
            CountryName: data.CountryName,
            TwoLetterCountryCode: data.TwoLetterCountryCode,
            Block: road ? road : null,
            Street: data.Street,
            BuildingNo: buildingNo ? buildingNo : null,
            Floor: data.Floor,
            Flat: data.Flat,
            MobileNo1: telephone,
            MobileNo2: telephone2 ? telephone2 : null,
            PhoneNo1: telephone ? telephone : null,
            PhoneNo2: data.PhoneNo2,
            OfficePhoneNo: data.OfficePhoneNo,
            AddressName: data.AddressName,
            AddressLine1: location,
            AddressLine2: address ? address : null,
            State: data.State,
            City: data.City,
            PostalCode: data.PostalCode,
            PassportNumber: data.PassportNumber,
            CivilIDNumber: data.CivilIDNumber,
            PassportIssueCountryID: data.PassportIssueCountryID,
            TelephoneCode: data.TelephoneCode,
            AlternateEmailID1: data.AlternateEmailID1,
            AlternateEmailID2: data.AlternateEmailID2,
            WebsiteURL1: data.WebsiteURL1,
            WebsiteURL2: data.WebsiteURL2,
            TelephoneNumber: telephone,
            IsBillingAddress: data.IsBillingAddress,
            IsShippingAddress: data.IsShippingAddress,
            Country: data.Country,
            AreaID: data.AreaID,
            Avenue: data.Avenue,
            Phones: data.Phones,
            Emails: data.Emails,
            Faxs: data.Faxs,
            BranchName: data.BranchName,
            Areas: data.Areas,
            AreaName: data.AreaName,
            CityID: data.CityID,
            District: data.District,
            LandMark: landMark ? landMark : null,
            Cities: data.Cities,
            IntlCity: data.IntlCity,
            IntlArea: data.IntlArea,
            StatusID: data.StatusID,
            Status: data.Status,
            Latitude: currentLocation.latitude,
            Longitude: currentLocation.longitude,
            LocationID: data.LocationID,
            Location: data.Location,
            BranchID: data.BranchID,
            IndustryID: data.IndustryID,
            Industry: data.Industry,
            DealerName: data.DealerName,
            CreatedBy: data.CreatedBy,
            UpdatedBy: data.UpdatedBy,
            CreatedDate: data.CreatedDate,
            UpdatedDate: data.UpdatedDate,
            TimeStamps: data.TimeStamps,
          }
        : {
            AddressLine1: location,
            AddressLine2: address ? address : "",
            AreaID: user[0].AreaID,
            Block: road ? road : "",
            BranchID: user[0].AreaID,
            BuildingNo: buildingNo ? buildingNo : "",
            CityID: null,
            FirstName: firstName,
            IsShippingAddress: true,
            LandMark: landMark ? landMark : "",
            LastName: lastName ? lastName : "",
            Latitude: currentLocation.latitude,
            LocationID: null,
            Longitude: currentLocation.longitude,
            MobileNo1: telephone,
            MobileNo2: telephone2 ? telephone2 : "",
            PostalCode: null,
          };

      // console.log("=== Save Address Button Clicked ===");
      // console.log("Payload being sent to API:", JSON.stringify(payload, null, 2));

      const response = await AddressService.AddContact(payload);
      //  console.log("API Response:", response);

      if (response.data?.Message) {
        Toast.show({
          type: "error",
          text1: response.data?.Message,
          text2: "",
          position: "top",
          visibilityTime: 2000,
        });
        return;
      }
      // console.log("Address saved successfully");
      navigation.navigate("AddressSwitch");
    } catch (error) {
      console.error("Error fetching LastShippingAddress:", error);
    }
  };

  const GetUser = async () => {
    try {
      const respUser = await UserService.getUserDetails();
      setUser(respUser.data?.Contacts);
    } catch (error) {
      console.error("Error", "Failed to Get user data.", error);
    }
  };
  // console.log("currentLocation", nearbyPlaces);
  const requiredFields = appSettings[client].AddressFields;
  const shouldShowField = (fieldName) => requiredFields.includes(fieldName);
  return (
    <ScrollView
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.MainScroll}
    >
      <>
        <MapModal
          modalVisible={modalVisible}
          handleToggleMapBar={handleToggleMapBar}
          setModalVisible={setModalVisible}
          region={region}
          currentLocation={currentLocation}
          mapBar={mapBar}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          error={error}
          predictions={predictions}
          handlePlaceSelect={handlePlaceSelect}
          loading={loading}
          setCurrentLocation={setCurrentLocation}
          setRegion={setRegion}
          setLocationSource={setLocationSource}
          title={locationSource}
          nearbyPlaces={nearbyPlaces}
          handlePick={handlePick}
          handleButtonPress={() => {
            (fetchSelectedLocation(), setModalVisible(false));
          }}
        />

        <View style={styles.formContainer}>
          {ShortMap && (
            <View style={styles.mapContainer}>
              {!region || !currentLocation ? (
                <View style={styles.mapLoadingContainer}>
                  <ActivityIndicator size="large" color="#10B981" />
                  <Text style={styles.mapLoadingText}>
                    {loading ? "Getting your location..." : "Preparing map..."}
                  </Text>
                </View>
              ) : (
                <>
                  <MapView
                    style={{ flex: 1 }}
                    region={region}
                    loadingEnabled={true}
                    loadingIndicatorColor="#10B981"
                    loadingBackgroundColor="#F9FAFB"
                    moveOnMarkerPress={false}
                    showsUserLocation={false}
                    showsMyLocationButton={false}
                    rotateEnabled={false}
                    pitchEnabled={false}
                    toolbarEnabled={false}
                    cacheEnabled={true}
                    onMapReady={() => {
                      setIsMapLoading(false);
                    }}
                    onPress={(e) => {
                      const { latitude, longitude } = e.nativeEvent.coordinate;
                      const coords = { latitude, longitude };
                      setCurrentLocation(coords);
                      setRegion({
                        ...coords,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                      });
                    }}
                  >
                    <Marker
                      coordinate={currentLocation}
                      draggable
                      onDrag={(e) => {
                        const { latitude, longitude } =
                          e.nativeEvent.coordinate;
                        setCurrentLocation({ latitude, longitude });
                        setLocationSource("selected location");
                      }}
                      onDragEnd={(e) => {
                        const { latitude, longitude } =
                          e.nativeEvent.coordinate;
                        setCurrentLocation({ latitude, longitude });
                        setRegion({
                          latitude,
                          longitude,
                          latitudeDelta: 0.005,
                          longitudeDelta: 0.005,
                        });
                        setLocationSource("selected location");
                      }}
                      title={locationSource}
                    />
                  </MapView>
                </>
              )}
            </View>
          )}

          {/* Form Inputs */}
          <View style={styles.inputCommonView}>
            {appSettings[client].AddressFields.map((field) => {
              if (!shouldShowField(field)) return null;

              switch (field) {
                case "firstName":
                  return (
                    <View key={field} style={styles.commonViewInput}>
                      {TextInput === "IconWithTextInput" && (
                        <Text style={styles.inputLabel}>First Name</Text>
                      )}
                      <CustomTextInput
                        ref={firstNameRef}
                        placeholder={t("first_name_placeholder")}
                        label={t("restaurant_name")}
                        fontSize={RFValue(12)}
                        handleText={(text) => setFirstName(text.trim())}
                        value={firstName}
                        borderRadius={12}
                      />
                    </View>
                  );
                case "lastName":
                  return (
                    <View key={field} style={styles.commonViewInput}>
                      {TextInput === "IconWithTextInput" && (
                        <Text style={styles.inputLabel}>Last name</Text>
                      )}
                      <CustomTextInput
                        ref={lastNameRef}
                        placeholder={t("last_name_placeholder")}
                        fontSize={RFValue(12)}
                        handleText={(text) => setLastName(text.trim())}
                        value={lastName}
                        borderRadius={12}
                      />
                    </View>
                  );
                case "landMark":
                  return (
                    <View key={field} style={styles.commonViewInput}>
                      {TextInput === "IconWithTextInput" && (
                        <Text style={styles.inputLabel}>
                          {t("landmark_placeholder")}
                        </Text>
                      )}
                      <CustomTextInput
                        ref={landMarkRef}
                        placeholder={t("landmark_placeholder")}
                        fontSize={RFValue(12)}
                        handleText={(text) => setLandMark(text.trim())}
                        value={landMark}
                        borderRadius={8}
                        borderColor={"lightgray"}
                      />
                    </View>
                  );
                case "telephone":
                  return (
                    <View key={field} style={styles.commonViewInput}>
                      {TextInput === "IconWithTextInput" && (
                        <Text style={styles.inputLabel}>Phone</Text>
                      )}
                      <CustomTextInput
                        ref={telephoneRef}
                        placeholder={""}
                        label="Phone"
                        fontSize={RFValue(12)}
                        handleText={(text) => {
                          const trimmed = text.replace(/\D/g, "");
                          setTelephone(trimmed.slice(0, 10));
                        }}
                        value={telephone}
                        borderRadius={12}
                        type="phone"
                        maxLength={10}
                      />
                    </View>
                  );
                case "telephone2":
                  return (
                    <View key={field} style={styles.commonViewInput}>
                      {TextInput === "IconWithTextInput" && (
                        <Text style={styles.inputLabel}>
                          {t("telephone2_mobile2")}
                        </Text>
                      )}
                      <CustomTextInput
                        ref={telephone2Ref}
                        placeholder={t("telephone2_mobile2")}
                        fontSize={RFValue(12)}
                        handleText={(text) => {
                          const trimmed = text.replace(/\D/g, "");
                          setTelephone2(trimmed.slice(0, 10));
                        }}
                        value={telephone2}
                        borderRadius={12}
                        type="phone"
                        maxLength={10}
                      />
                    </View>
                  );
                case "buildingNo":
                  return null; // Rendered inside location box
                case "road":
                  return null; // Rendered inside location box
                case "address":
                  return null; // Rendered inside location box
                case "location":
                  return AutoTag ? (
                    <View key={field} style={styles.commonViewInput}>
                      {/* Address Card Container */}
                      <View style={styles.modernAddressCard}>
                        {/* Title Row */}
                        <View style={styles.cardTitleRow}>
                          <Text style={styles.cardTitle}>Delivery Address</Text>
                          <View style={styles.buttonGroup}>
                            <TouchableOpacity
                              onPress={() => fetchCurrentLocation()}
                              style={[styles.actionBtn, loading && styles.actionBtnDisabled]}
                              activeOpacity={0.8}
                              disabled={loading}
                            >
                              {loading ? (
                                <ActivityIndicator size="small" color="#6B7280" />
                              ) : (
                                <Text style={styles.actionBtnText}>
                                  Auto tag your address
                                </Text>
                              )}
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => {
                                (fetchNearbyPlaces(), setModalVisible(true));
                              }}
                              style={styles.pickBtn}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.arrow}>➤</Text>
                              <Text style={styles.pickBtnText}>pick</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Address Display Area */}
                        <View style={styles.addressContentArea}>
                          {loading || isFetchingNearby ? (
                            <View style={styles.centerContent}>
                              <ActivityIndicator size="small" color="#10B981" />
                              <Text style={styles.loadingMessage}>
                                {loading ? "Detecting location..." : "Fetching address details..."}
                              </Text>
                            </View>
                          ) : (
                            <Text style={styles.addressDisplayText}>
                              {location ||
                                "Use Auto tag or Pick to set your location"}
                            </Text>
                          )}
                        </View>

                        {/* All Address Detail Fields Inside Box */}
                        <View style={styles.addressDetailsContainer}>
                          {/* Apartment/Room Field */}
                          <View style={styles.addressFieldWrapper}>
                            <CustomTextInput
                              ref={addressRef}
                              placeholder="Apartment No, Room No"
                              label="Apartment/Room"
                              fontSize={RFValue(12)}
                              handleText={(text) => setAddress(text.trim())}
                              value={address}
                              borderRadius={12}
                            />
                          </View>

                          {/* Building Field */}
                          <View style={styles.addressFieldWrapper}>
                            <CustomTextInput
                              ref={buildingNoRef}
                              placeholder="Building/Villa Number"
                              label="Building/Villa"
                              fontSize={RFValue(12)}
                              handleText={(text) => setBuildingNo(text.trim())}
                              value={buildingNo}
                              borderRadius={12}
                            />
                          </View>

                          {/* Road Field */}
                          <View style={styles.addressFieldWrapper}>
                            <CustomTextInput
                              ref={roadRef}
                              placeholder="Road/Block/Street"
                              label="Road/Block"
                              fontSize={RFValue(12)}
                              handleText={(text) => setRoad(text.trim())}
                              value={road}
                              borderRadius={12}
                            />
                          </View>
                        </View>

                        {/* Footer Status */}
                        {location && (
                          <View style={styles.statusFooter}>
                            <Text style={styles.statusText}>
                              ✓ Location Tagged
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ) : (
                    <View key={field} style={styles.commonViewInput}>
                      {TextInput === "IconWithTextInput" && (
                        <Text style={styles.inputLabel}>Address</Text>
                      )}
                      <CustomTextInput
                        label="Address"
                        Width={"91.11%"}
                        Height={"15%"}
                        placeholder={""}
                        fontSize={RFValue(12)}
                        handleText={(text) => setLocation(text.trim())}
                        value={location}
                        borderRadius={12}
                        multiline={true}
                        maxLength={200}
                      />
                    </View>
                  );
                default:
                  return null;
              }
            })}
          </View>
        </View>
        {client === "benchmarkfoods" ? (
          <TouchableOpacity
            style={styles.quantityTouchable}
            onPress={() => handleAddress()}
          >
            <View style={styles.addToCartButton}>
              <LinearGradient
                colors={["#1D9ADC", "#0B489A"]}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton2}
              >
                <Text style={styles.addToCartText}> Submit</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        ) : (
          <CustomButton
            buttonText={t("save_address_button")}
            handleButtonPress={() => handleAddress()}
            // position="absolute"
            // bottom={0.05}
            Radius={15}
            Width={"89%"}
            Height={"6%"}
            fontSize={RFValue(14)}
            type="normal"
          />
        )}
      </>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  MainScroll: {
    flexGrow: 1,
    width: wp("100%"),
    backgroundColor: "#FFF",
    paddingBottom: hp("25%"),
  },
  formContainer: {
    backgroundColor: "#ffffff",
    width: wp("100%"),
    alignSelf: "center",
  },
  mapContainer: {
    width: wp("90%"),
    height: hp("30%"),
    alignSelf: "center",
    borderRadius: wp("5%"),
    overflow: "hidden",
    marginTop: hp("1%"),
    backgroundColor: "#F9FAFB",
  },
  mapLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  mapLoadingText: {
    marginTop: hp("1.5%"),
    fontSize: RFValue(12, 800),
    fontFamily: "Poppins-Medium",
    color: "#6B7280",
  },
  inputCommonView: { paddingBottom: 30 },
  commonViewInput: {
    marginTop: hp("5%"),
    // backgroundColor: "#000",
  },
  inputLabel: {
    position: "absolute",
    top: -hp("1.3%"),
    left: wp("10%"),
    backgroundColor: "#FFFFFF",
    paddingHorizontal: wp("1.5%"),
    fontSize: RFValue(12),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    // paddingTop: hp("2.5%"),
    color: "#525252",
    zIndex: 1,
  },
  inputLabel2: {
    // position: "absolute",
    top: hp("3.3%"),
    justifyContent: "center",
    alignSelf: "flex-end",
    alignItems: "center",
    right: wp("4.44%"),
    // width:wp("50%"),
    borderColor: "#DBDBDB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: wp("1.5%"),
    fontSize: RFValue(12),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 15,
    // paddingTop: hp("2.5%"),
    color: "#525252",
    zIndex: 1,
  },
  AddressBoxWithAutoTag: {
    margin: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    elevation: 3,
    borderWidth: 1,
    marginTop: 20,
  },
  ContentLine: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  AddressLineText: {
    fontSize: wp("4.5%"),
    color: "#525252",
    paddingTop: hp("1.5%"),
    fontFamily: "Poppins-Regular",
  },
  // Modern Redesigned Address Styles
  modernAddressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: wp("3%"),
    marginTop: hp("1.5%"),
    marginHorizontal: wp("2%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitleRow: {
    marginBottom: hp("1.5%"),
  },
  cardTitle: {
    fontSize: RFValue(14, 800),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#111827",
    marginBottom: hp("1%"),
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("2.5%"),
    borderRadius: 8,
    marginRight: wp("2%"),
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  actionBtnText: {
    fontSize: RFValue(11, 800),
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#374151",
    textAlign: "center",
  },
  pickBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#58BB47",
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("3.5%"),
    borderRadius: 8,
    gap: wp("1.5%"),
  },
  locationIcon: {
    width: 18,
    height: 18,
  },
  pickBtnText: {
    fontSize: RFValue(11, 800),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#FFFFFF",
  },
  addressContentArea: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: wp("3%"),
    minHeight: hp("8%"),
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: hp("2%"),
  },
  centerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp("2%"),
  },
  loadingMessage: {
    fontSize: RFValue(12, 800),
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
  },
  addressDisplayText: {
    fontSize: RFValue(13, 800),
    fontFamily: "Poppins-Regular",
    color: "#374151",
    lineHeight: RFValue(20, 800),
  },
  addressDetailsContainer: {
    marginTop: hp("1%"),
  },
  addressFieldWrapper: {
    marginBottom: hp("1.5%"),
  },
  additionalFieldWrapper: {
    marginTop: hp("1.5%"),
  },
  statusFooter: {
    marginTop: hp("2%"),
    paddingTop: hp("1.5%"),
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    alignItems: "center",
  },
  statusText: {
    fontSize: RFValue(12, 800),
    fontFamily: "Poppins-SemiBold",
    color: "#10B981",
  },
  arrow: {
    fontSize: wp("3.8%"),
    color: "#ffffff",
    transform: [{ rotate: "-30deg" }],
    marginRight: wp("0.5%"),
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
  quantityTouchable: {
    width: wp("91.11%"),
    height: hp("5.75%"),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  gradientButton2: {
    width: wp("91.11%"),
    height: hp("5.75%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
  },
  addToCartButton: {
    width: wp("91.11%"),
    height: hp("5.75%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
  },
  addToCartText: {
    color: "white",
    fontSize: RFValue(14, 800),
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
  },
});
