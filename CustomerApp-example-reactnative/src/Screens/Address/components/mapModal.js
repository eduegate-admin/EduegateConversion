import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
 import MapView, { Marker } from "react-native-maps";
import CustomButton from "../../../component/CustomButton";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";
import { useEffect, useState } from "react";
import appSettings from "../../../../Client/appSettings";
import { LinearGradient } from "expo-linear-gradient";

const client = process.env.CLIENT;

const MapModal = ({
  modalVisible,
  handleButtonPress,
  handlePick,
  nearbyPlaces,
  title,
  setLocationSource,
  setRegion,
  setCurrentLocation,
  loading,
  setModalVisible,
  handlePlaceSelect,
  predictions,
  error,
  region,
  setSearchQuery,
  searchQuery,
  currentLocation,
  mapBar,
  handleToggleMapBar,
}) => {
  const [styles, setStyle] = useState(ClientStyles(client, "MapModal"));

  useEffect(() => {
    const clientStyle = ClientStyles(client, "MapModal");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, [client]);
  const AddressBox_ScrollList =
    appSettings[client].mapModal_AddressBox_ScrollList;
  const AddressBox_Normal = appSettings[client].mapModal_AddressBox_Normal;
  return (
    <View style={styles.container}>
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.ModalInnerView}>
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <CommonHeaderLeft
                type="back"
                // action={() => setModalVisible(false)}
              />
            </View>
            <Text style={styles.modalHeaderTitle}>Map</Text>
            <TouchableOpacity onPress={handleToggleMapBar}>
              <Image
                style={styles.mapSearchIcon}
                source={require("../../../assets/images/client/foodworld/searchlocation.png")}
              />
            </TouchableOpacity>
          </View>
          {!region || !currentLocation ? (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#F9FAFB',
            }}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={{
                marginTop: hp('2%'),
                fontSize: wp('4.5%'),
                fontFamily: 'Poppins-SemiBold',
                color: '#374151',
              }}>Preparing map...</Text>
              <Text style={{
                marginTop: hp('0.5%'),
                fontSize: wp('3.5%'),
                fontFamily: 'Poppins-Regular',
                color: '#6B7280',
              }}>Getting your location</Text>
            </View>
          ) : (
            <>
              <View>
                {mapBar && (
                  <TextInput
                    style={styles.input}
                    placeholder="Search Location"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                )}

                {error && <Text style={styles.error}>{error}</Text>}
                {mapBar && (
                  <FlatList
                    data={predictions}
                    keyExtractor={(item) => item.place_id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => handlePlaceSelect(item.place_id)}
                        style={styles.prediction}
                      >
                        <Text>{item.description}</Text>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
              {loading ? (
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(249, 250, 251, 0.9)',
                  zIndex: 999,
                }}>
                  <ActivityIndicator size="large" color="#10B981" />
                  <Text style={{
                    marginTop: hp('1.5%'),
                    fontSize: wp('4%'),
                    fontFamily: 'Poppins-Medium',
                    color: '#374151',
                  }}>Updating location...</Text>
                </View>
              ) : null}
              {!loading && region && currentLocation && (
                <>
                  <MapView
                    key={`map-${currentLocation.latitude}-${currentLocation.longitude}`}
                    style={{ flex: 1, width: wp("100%"), height: hp("100%") }}
                    region={region}
                    loadingEnabled={true}
                    loadingIndicatorColor="#10B981"
                    loadingBackgroundColor="#F9FAFB"
                    cacheEnabled={true}
                    pitchEnabled={false}
                    rotateEnabled={false}
                    toolbarEnabled={false}
                    zoomControlEnabled={false}
                    onPress={(e) => {
                      const { latitude, longitude } = e.nativeEvent.coordinate;
                      const coords = { latitude, longitude };
                      setCurrentLocation(coords);
                      setRegion({
                        ...coords,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      });
                    }}
                  >
                    {currentLocation && (
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
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                          });
                          setLocationSource("selected location");
                        }}
                        title={title}
                      />
                    )}
                  </MapView>
                  {AddressBox_Normal && nearbyPlaces.length > 0 && currentLocation && (
                    <View style={styles.AddressBox}>
                      <View style={styles.addressItem}>
                        <Text style={styles.addressText} numberOfLines={4}>
                          📍 {nearbyPlaces[0].address}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.quantityTouchable}
                        onPress={() => handlePick(nearbyPlaces[0])}
                      >
                        <View style={styles.addToCartButton}>
                          <LinearGradient
                            colors={["#1D9ADC", "#0B489A"]}
                            start={{ x: 1, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientButton2}
                          >
                            <Text style={styles.addToCartText}>
                              Confirm & Proceed
                            </Text>
                          </LinearGradient>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                  {AddressBox_ScrollList && (
                    <View style={styles.AddressBox}>
                      <Text style={styles.AddressBoxText}>
                        Enter Your Address
                      </Text>
                      <CustomButton
                        buttonText="Use Current Location"
                        handleButtonPress={handleButtonPress}
                        Radius={15}
                        Width={"80%"}
                        Height={"5%"}
                        fontSize={12}
                        icon={require("../../../assets/images/client/foodworld/gp.png")}
                      />
                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.mapListScrollView}
                      >
                        {nearbyPlaces.map((item, index) => (
                          <View key={index} style={styles.addressItem}>
                            <View style={styles.addressSelectionBox}>
                              <Text style={styles.addressText}>❖{"  "}</Text>
                              <Text
                                key={index}
                                style={styles.addressText}
                                numberOfLines={2}
                              >
                                {item.address}
                              </Text>
                            </View>

                            <TouchableOpacity
                              key={index}
                              style={styles.pickButton}
                              onPress={() => handlePick(item)}
                            >
                              <Text style={styles.arrow}>➤</Text>
                              <Text style={styles.pickButtonText}>Pick</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </>
              )}
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     marginTop: Platform.OS === "android" ? StatusBar.currentHeight || 24 : 44,
//   },
//   ModalInnerView: { flex: 1 },
//   modalHeader: {
//     width: wp("100%"),
//     backgroundColor: "#ffffff",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: wp("4%"),
//     paddingVertical: -20,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5E5E5",
//     elevation: 4, // better shadow on Android
//     shadowColor: "#000", // better shadow on iOS
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   headerLeft: {
//     width: 40,
//     height: 40,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalHeaderTitle: {
//     fontSize: RFValue(16),
//     color: "#133051",
//     fontFamily: "Poppins-Regular",
//     // left: wp("15%"),
//   },

//   mapSearchIcon: {
//     resizeMode: "contain",
//     width: 22,
//     height: 22,
//   },
//   input: {
//     margin: wp("2%"),
//     marginHorizontal: wp("4.44%"),
//     paddingLeft: wp("5%"),
//     backgroundColor: "#fff",
//     borderRadius: wp("2%"),
//     fontSize: RFValue(14),
//     borderWidth: 1,
//     borderColor: "#B2B2B2",
//     fontFamily: "Poppins-Regular",
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//   },
//   error: {
//     textAlign: "center",
//     color: "red",
//     padding: wp("1.5%"),
//     fontFamily: "Poppins-Regular",
//   },
//   prediction: {
//     padding: wp("3.5%"),
//     borderBottomColor: "#B2B2B2",
//     borderBottomWidth: 1,
//     backgroundColor: "#fff",
//   },
//   IndicatorView: {
//     backgroundColor: "#fff",
//     height: wp("100%"),
//     width: hp("100%"),
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   AddressBox: {
//     width: wp("100%"),
//     height: hp("35%"),
//     backgroundColor: "#133051",
//     alignItems: "center",
//     borderTopLeftRadius: wp("15%"),
//     borderTopRightRadius: wp("15%"),
//   },
//   AddressBoxText: {
//     color: "#fff",
//     fontSize: wp("6.5%"),
//     fontFamily: "Poppins-Regular",
//     lineHeight: hp("8%"),
//   },
//   mapListScrollView: { paddingTop: 20 },
//   addressItem: {
//     flexDirection: "row",
//     width: wp("100%"),
//     paddingVertical: hp("2%"),
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderBottomWidth: 1,
//     borderBottomColor: "#FFFFFF",
//   },
//   addressSelectionBox: {
//     width: "70%",
//     marginLeft: 20,
//     flexDirection: "row",
//     justifyContent: "flex-start",
//   },
//   addressText: {
//     fontSize: wp("3.8%"),
//     color: "#ffffff",
//     fontFamily: "Poppins-Regular",
//   },
//   pickButton: {
//     flexDirection: "row",
//     backgroundColor: "#58BB47",
//     paddingVertical: hp("1%"),
//     paddingHorizontal: wp("2.5%"),
//     borderRadius: wp("1.5%"),
//     marginRight: wp("3.5%"),
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   pickButtonText: {
//     fontSize: wp("3.8%"),
//     color: "white",
//     textAlign: "center",
//     fontFamily: "Poppins-Regular",
//   },
//   arrow: {
//     fontSize: wp("3.8%"),
//     color: "#ffffff",
//     transform: [{ rotate: "-30deg" }],
//     marginRight: wp("2.5%"),
//     textAlign: "center",
//     fontFamily: "Poppins-Regular",
//   },
// });

export default MapModal;
