import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const AddressSwitchStyle = StyleSheet.create({
container: {
    width: wp("100%"),
    backgroundColor: "#FFFFFF",
    // height:"100%"
  },

  DeliverSection: {
    backgroundColor: "#FFFFFF",
    width: wp("100%"),
    alignSelf: "center",
    justifyContent: "center",
  },

  AddressView: {
    width: wp("100%"),
    // borderRadius: 15,
    marginVertical: 10,
    backgroundColor: "#FFF",
    overflow: "hidden",
    paddingBottom: hp("10%"),
  },

  AddressTextView: {
    backgroundColor: "#FFFFFF",
    paddingVertical: hp("2%"),
    width: wp("91.11%"),
    alignSelf: "center",
    borderRadius: 12,
    marginVertical: hp("0.5%"),
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  buttonView: {
    width: wp("12%"),
    // backgroundColor: "#1AD",
    justifyContent: "flex-start",
    alignItems: "center",
  },

  buttonIcon: {
    resizeMode: "contain",
    width: wp("6%"),
    height: wp("6%"),
    marginTop: hp("0.3%")
  },
  dltBtn: { resizeMode: "contain", width: wp("5%"), height: wp("5%") },
  editBtn: {
    resizeMode: "contain",
    width: wp("5.5%"),
    height: wp("5.5%"),
    position: "absolute",
    top:-20,
    left:-40,
    zIndex:1
  },
  addressView: {
    // backgroundColor: "#FFFF",
    width: wp("69.11%"),
    justifyContent: "flex-start",
  },

  AddressTextHead: {
    fontSize: RFValue(16),
    fontWeight: "700",
    color: "#525252",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 5,
  },

  AddressText: {
    fontSize: RFValue(12),
    color: "#525252",
    marginBottom: 2,
  },

  EditDeleteView: {
    // backgroundColor: "#1AD",
    // marginLeft:"auto",
    width: wp("10%"),
    flexDirection: "column",
    // justifyContent: "space-between",
    // alignItems: "center",
    height: wp("10%"),
  },

  addAddressView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("2%"),
  },

  plusElement: {
    fontSize: RFValue(28),
    color: "#1D9ADC",
    marginRight: 5,
    fontWeight: "500",
  },

  addAddressText: {
    fontSize: RFValue(14),
    color: "#1D9ADC",
    fontWeight: "500",
  },
  });

export default AddressSwitchStyle;
