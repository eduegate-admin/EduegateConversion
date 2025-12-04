import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AddressService from "../../../services/addressService";
import CustomHeader from "../../../component/CustomHeader";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../../component/CommonHeaderRight";



import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";
import appSettings from "../../../../Client/appSettings";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";

const client = process.env.CLIENT;

const NormalAddressSwitch = ({ route }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [address, setAddress] = useState([]);
  const {Currentaddress,fromCheckout} = route?.params || {};
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [styles, setStyle] = useState(ClientStyles(client, "AddressSwitch"));
  const AddAddressButton = appSettings[client].AddAddressButton;
   
  // console.log("Currentaddress", Currentaddress);

  useEffect(() => {
    const clientStyle = ClientStyles(client, "AddressSwitch");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, [client]);

  useEffect(() => {
    if (Currentaddress) {
      // Convert to number if it's a string to ensure proper comparison
      const addressId = typeof Currentaddress === 'string' ? parseInt(Currentaddress, 10) : Currentaddress;
      setSelectedAddress(addressId);
    }
  }, [Currentaddress]);

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        <CustomHeader
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
      title: "Address",
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAddress();
    }, [])
  );

  const fetchAddress = async () => {
    try {
      const response = await AddressService.GetShippingAddressContacts();
         
      setAddress(response.data);
      
      // Set the user's current address as selected when they login
    } catch (error) {
      console.error("Error fetching Address data:", error.message);
    }
  };

  const handleDelete = async (item) => {
    try {
      const contactID = item.ContactID;
      const response = await AddressService.RemoveContact(contactID);
      fetchAddress();
      // console.log(response.data?.Message);
    } catch (error) {
      console.error("Error fetching DeleteAddress data:", error.message);
    }
  };

  const handleEdit = async (item) => {
    try {
      const contactID = item.ContactID;
      // console.log(contactID);
      const response = await AddressService.GetAddressByContactID(contactID);
      const Details = response.data;
      // console.log("Details",Details);
      if (!Details && !Details.length > 0) {
        return;
      }
      navigation.navigate("Address", { Details });
      fetchAddress();
    } catch (error) {
      console.error(
        "Error fetching GetAddressByContactID data:",
        error.message
      );
    }
  };

  const handleSelectedAddress = async (item) => {
    // 1. Instantly update UI
    setSelectedAddress(item.ContactID);


    // 2. API call in background
    try {
      const payload = {
        Branch: item.BranchID,
        BranchID: item.BranchID,
        ContactID: item.ContactID,
        IsCartLevelBranch: true,
        SelectedShippingAddress: item.ContactID,
      };

      await AddressService.updateAddressInShoppingCart(payload);

      // ❌ Do NOT call fetchAddress() here
      // It makes UI slow
      //for Benchmark Client Only if you not  want it , remove the if condition
      if (AddAddressButton) {
        const response =
          await AddressService.updateAddressInShoppingCart(payload);
        setSelectedAddress(item.ContactID);
        if (response.data) {
          // console.log(response.data?.Message);
          fetchAddress();
          navigation.goBack();
        }
      }

    } catch (error) {
      console.error("updateAddressInShoppingCart error:", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.DeliverSection}>
        <View style={styles.AddressView}>
          {address.map((item, index) => {
            // Only the selected address should be active
            const isActive = selectedAddress === item.ContactID;
            
            return (
            <TouchableOpacity
              key={item.ContactID || index}
              style={[styles.AddressTextView]}
              onPress={() => handleSelectedAddress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.buttonView}>
                <Image
                  style={styles.buttonIcon}
                  source={
                    isActive
                      ? require(
                        `../../../assets/images/client/${client}/ActiveButton.png`
                      )
                      : require("../../../assets/images/client/foodworld/whitebutton.png")
                  }
                />
              </View>
             
              <View style={styles.addressView}>
                {item.FirstName || item.LastName ? (
                  <Text style={[styles.AddressTextHead, { marginBottom: 10 }]}>
                    {item.FirstName + item.LastName}
                  </Text>
                ) : null}
                {item.AddressLine1 || item.AddressLine2 ? (
                  <Text style={styles.AddressText}>
                    {item.AddressLine1 + " - " + item.AddressLine2}
                  </Text>
                ) : null}
                {item.landMark ? (
                  <Text style={styles.AddressText}>
                    Landmark : {item.LandMark}
                  </Text>
                ) : null}
                {item.MobileNo1 ? (
                  <Text style={styles.AddressText}>
                    Mobile No : {item.MobileNo1}
                  </Text>
                ) : null}
                {item.BuildingNo ? (
                  <Text style={styles.AddressText}>
                    House/Building No : {item.BuildingNo}
                  </Text>
                ) : null}
                {item.Block ? (
                  <Text style={styles.AddressText}>
                    Block/Road : {item.Block}
                  </Text>
                ) : null}
                 
              </View>
              {!AddAddressButton && (
                <View style={styles.EditDeleteView}>
                  <TouchableOpacity onPress={() => handleDelete(item)}>
                    <Image
                      style={[styles.dltBtn, { tintColor: "black" }]}
                      source={require(
                        `../../../assets/images/client/${client}/trash.png`
                      )}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleEdit(item)}>
                    <Image
                      style={styles.editBtn}
                      source={require(
                        `../../../assets/images/client/${client}/edit.png`
                      )}
                    />
                  </TouchableOpacity>
                </View>
              )}
               
            </TouchableOpacity>
            );
          })}
          {!AddAddressButton && (
            <View style={styles.addAddressView}>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.Buttoncotain}
                  onPress={() => {
                    if (selectedAddress) {
                      // Find the selected address item
                      const selectedItem = address.find(item => item.ContactID === selectedAddress);
                      if (selectedItem) {
                        handleSelectedAddress(selectedItem);
                      }
                      // Navigate based on fromCheckout
                      if (fromCheckout) {
                        navigation.goBack();
                      } else {
                        navigation.navigate("Drawer", {
                          screen: "Footer",
                          params: {
                            screen: "Home"
                          }
                        });
                      }
                    } else {
                      Toast.show({
                        type: "error",
                        text1: t('please_select_an_address_first'),
                        position: "top",
                        visibilityTime: 1500,
                      });
                    }
                  }}
                >
                  <Text style={styles.ButtoncotainText}>
                    {selectedAddress ? t('proceed') : t('select_address')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.addAddressButton}
                  onPress={() => navigation.navigate("Address")}
                >
                  <Text style={styles.plusElement}>+</Text>
                  <Text style={styles.addAddressText}>{t('add_address')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     width: wp("100%"),
//     backgroundColor: "#F8F8F8",
//     paddingBottom: hp("5%"),
//   },

//   DeliverSection: {
//     backgroundColor: "#fff",
//     width: wp("95%"),
//     alignSelf: "center",
//     borderRadius: 15,
//     marginVertical: hp("1%"),
//     paddingVertical: hp("2%"),
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 4,
//     marginBottom: hp("3%"),
//   },

//   AddressView: {
//     width: "100%",
//     borderRadius: 15,
//     overflow: "hidden",
//   },

//   AddressTextView: {
//     backgroundColor: "#fff",
//     // backgroundColor: "red",
//     width: wp("90%"),
//     alignSelf: "center",
//     borderRadius: 15,
//     marginVertical: hp("1%"),
//     padding: hp("2%"),
//     flexDirection: "row",
//     justifyContent: "flex-start",
//     alignItems: "flex-start",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },

//   buttonView: {
//     width: wp("10%"),
//     justifyContent: "flex-start",
//     alignItems: "center",
//     marginRight: wp("2%"),
//     marginTop: hp("0.4%"),
//   },

//   buttonIcon: {
//     resizeMode: "contain",
//     width: wp("6%"),
//     height: wp("6%"),
//   },

//   addressView: {
//     width: wp("65%"),
//     justifyContent: "flex-start",
//   },

//   AddressTextHead: {
//     fontSize: RFValue(16),
//     fontWeight: "700",
//     color: "#133051",
//     fontFamily: "Poppins-SemiBold",
//     marginBottom: 5,
//   },

//   AddressText: {
//     fontSize: RFValue(12),
//     color: "#333",
//     marginBottom: 2,
//   },

//   EditDeleteView: {
//     marginLeft: "auto",
//     width: wp("10%"),
//     flexDirection: "column",
//     justifyContent: "space-between",
//     // alignItems: "center",
//     height: hp("20%"),
//   },

//   addAddressView: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: hp("1.5%"),
//     width: "100%",
//     backgroundColor: "#fff",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   buttonRow: {
//     flexDirection: "row",

//     justifyContent: "space-between",
//     alignItems: "center",
//     width: "100%",
//     paddingHorizontal: wp("4%"),
//     backgroundColor: "#fff",
//     paddingVertical: hp("2%"),
//     borderTopWidth: StyleSheet.hairlineWidth,
//     borderTopColor: "#e0e0e0",
//   },
//   addAddressButton: {
//     flexDirection: "row",
//     // backgroundColor:"red",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#fff",
//     borderWidth: 1.5,
//     borderColor: "#58BB47",
//     borderRadius: 6,
//     paddingVertical: hp("1.6%"),
//     paddingHorizontal: wp("4%"),
//     flex: 0.5,
//     marginLeft: wp("3%"),
//     minHeight: hp("5.5%"),
//   },
//   plusElement: {
//     fontSize: RFValue(20),
//     color: "#58BB47",
//     marginRight: wp("1.5%"),
//     fontWeight: "600",
//     lineHeight: RFValue(20),
//   },

//   addAddressText: {
//     fontSize: RFValue(13.5),
//     color: "#58BB47",
//     fontWeight: "600",
//     letterSpacing: 0.2,
//   },
//   Buttoncotain: {
//     backgroundColor: "#58BB47",
//     paddingVertical: hp("1.2%"),
//     paddingHorizontal: wp("2.5%"),
//     borderRadius: 6,
//     flex: 0.7,  // Reduced from 1 to make it take less horizontal space
//     marginRight: wp("3%"),
//     minHeight: hp("6.3%"),
//     // width:wp("100%"),
//     justifyContent: "center",
//   },
//   ButtoncotainText: {
//     color: "#FFFFFF",
//     fontSize: RFValue(14.5),
//     fontWeight: "600",
//     textAlign: "center",
//     letterSpacing: 0.3,
//     includeFontPadding: false,
//     textAlignVertical: "center",
//   },
//   dltBtn: {
//     resizeMode: "contain",
//     width: wp("5%"),
//     height: wp("5%")
//   },
//   editBtn: {
//     resizeMode: "contain",
//     width: wp("5.5%"),
//     height: wp("5.5%"),
//   },
// });

export default NormalAddressSwitch;
