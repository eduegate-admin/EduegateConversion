import { useTranslation } from "react-i18next";
import { Image, Text, TouchableOpacity, View } from "react-native";


import { useNavigation } from "@react-navigation/native";
import { Skeleton } from "moti/skeleton";
import ClientStyles from "../../Styles/StyleLoader/ClientStyles";
import { useState, useEffect } from "react";
import appSettings from "../../../Client/appSettings";

const client = process.env.CLIENT;

const LocationAndAddressCard = (props) => {
  const navigation = useNavigation();
  const address = props.address || "";
  const loading = props.loading || "";
  // console.log("address000",props)
  const { t } = useTranslation();
  const AddAddressButton = appSettings[client].AddAddressButton
  const [styles, setStyle] = useState( ClientStyles(client, "LocationAndAddressCard") );

  useEffect(() => {
    const clientStyle = ClientStyles(client, "LocationAndAddressCard");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, [client]);

  return loading ? (
    <View
      style={{
        width: "100%",
        height: "15%",
        flexDirection: "row",
        marginBottom: 5,
      }}
    >
      <Skeleton height={24} width={24} radius={12} colorMode="light" />
      <View style={{ marginLeft: 12, width: "100%" }}>
        <View style={{ width: "100%" }}>
          <Skeleton height={14} width={"50%"} radius={4} colorMode="light" />
          <View style={{ marginTop: 6 }}>
            <Skeleton height={12} width={"80%"} radius={4} colorMode="light" />
          </View>
        </View>
        <View
          style={{ width: "100%", marginTop: 10, alignItems: "flex-start" }}
        >
          <Skeleton height={36} width={140} radius={8} colorMode="light" />
        </View>
      </View>
    </View>
  ) : (
    <View style={styles.DeliverSection}>
      {client !== "benchmarkfoods" ? (
        <View style={styles.contentHeader}>
          <Text style={styles.contentHeaderText}>{t("delivered_to")}</Text>
        </View>
      ) : null}
      <View style={styles.container}>
        <View style={styles.LocationContain}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("AddressSwitch");
            }}
            style={styles.locationTextAndIcon}
          >
            <Image
              source={require("../../assets/images/client/benchmarkfoods/location_icon.png")}
              style={styles.locationIcon}
            />
            {/* <View style={styles.locationTextView}> */}
            <Text style={styles.locationText}>
              {(address?.FirstName ?? "") + " " + (address?.LastName ?? "")}
            </Text>

            {/* </View> */}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("AddressSwitch");
            }}
            style={styles.editIconView}
          >
            <Image
              source={require("../../assets/images/client/benchmarkfoods/edit.png")}
              style={styles.editIcon}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("AddressSwitch");
          }}
        >
          <Text numberOfLines={2} style={styles.locationText2}>
            {(address?.AddressLine1 ?? "") +
              "  " +              
              (address?.AddressLine2 ?? "")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Address")}
          style={styles.AddAddressViewContainer}
        >
          {loading ? (
            <View
              style={{
                width: "100%",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <Skeleton height={36} width={140} radius={8} colorMode="light" />
            </View>
          ) : (!AddAddressButton &&
            <View style={styles.AddAddressView}>
              <Text style={styles.AddressText}>+ Add New Address</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: colors.background || '#FFFFFF',
//     marginHorizontal: wp('4%'),
//     marginVertical: hp('1.2%'),
//     borderRadius: 16,
//     paddingVertical: hp('2.2%'),
//     paddingHorizontal: wp('4.5%'),
//     // Subtle shadow for that floating white card effect
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.08,
//     shadowRadius: 6,
//     elevation: 4, // slightly more lift for Android

//     // Optional smoothness
//     borderWidth: 0.6,
//     borderColor: 'rgba(0,0,0,0.05)',
//   },
//   LocationContain: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: hp('1.5%'),
//   },
//   locationTextAndIcon: {
//     marginTop: -6,
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   locationTextView: {
//     flex: 1,
//     flexDirection: "column",
//   },
//   locationIcon: {
//     width: 22,
//     height: 22,
//     tintColor: colors.primary || '#4A90E2',
//     marginRight: wp('2.5%'),
//     marginTop: 2,
//   },
//   locationText: {
//     fontSize: RFValue(15, 800),
//     fontWeight: '600',
//     color: colors.textHeading || '#1A1A1A',
//     fontFamily: 'Poppins-SemiBold',
//     lineHeight: 22,
//     letterSpacing: 0.2,
//   },
//   locationText2: {
//     fontSize: RFValue(13, 800),
//     fontWeight: '400',
//     color: colors.textSecondary || '#666666',
//     fontFamily: 'Poppins-Regular',
//     lineHeight: RFValue(20, 800),
//     letterSpacing: 0.1,
//   },
//   editIconView: {
//     padding: 8,
//     margin: -8,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   editIcon: {
//     width: 20,
//     height: 20,
//     tintColor: colors.primary || '#4A90E2',
//   },
//   AddAddressViewContainer: {
//     marginTop: hp('2%'),
//     alignItems: 'center',
//   },
//   AddAddressView: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: hp('1.5%'),
//     paddingHorizontal: wp('5%'),
//     borderRadius: 10,
//     borderWidth: 1.5,
//     borderColor: colors.primary || '#4A90E2',
//     borderStyle: 'dashed',
//     backgroundColor: 'rgba(74, 144, 226, 0.05)',
//     width: '100%',
//   },
//   AddressText: {
//     fontSize: RFValue(14, 800),
//     fontWeight: '600',
//     color: colors.primary || '#4A90E2',
//     fontFamily: 'Poppins-SemiBold',
//     textAlign: 'center',
//   },
//   contentHeader: {
//     marginHorizontal: 7,
//     marginTop: 7,
//     marginBottom: -7,
//     borderRadius: 15,
//   },
//   contentHeaderText: {
//     fontSize: RFValue(14, 800),
//     fontWeight: "600",
//     color: colors.textSecondary,
//     fontFamily: "Poppins-SemiBold",
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//     left: 11,
//     color: colors.textSecondary,
//     marginBottom: hp("0.8%"),
//   },
//   DeliverSection: {
//     width: '100%',
//     marginTop: hp('-1%'),
//     backgroundColor: 'transparent',
//   },
//   AddressView: {
//     width: "100%",
//     // height: "100%",
//     borderRadius: 15,
//     overflow: "hidden",
//   },
//   AddressTextView: {
//     // backgroundColor: 'blue',
//     justifyContent: "space-around",
//     flexDirection: "row",
//     backgroundColor: "white",
//   },
//   AddressTextHead: {
//     fontSize: 20,
//     fontWeight: 700,
//     textAlign: "left",
//     color: "#133051",
//   },
//   AddressText: {
//     fontSize: RFValue(13, 800),
//     fontWeight: "600",
//     textAlign: "center",
//     // color: colors.primary,
//     fontFamily: "Poppins-SemiBold",
//   },
// });

export default LocationAndAddressCard;
