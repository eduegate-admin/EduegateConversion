import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const AddressSwitchStyle = StyleSheet.create({
 container: {
    width: wp("100%"),
    backgroundColor: "#F8F8F8",
    paddingBottom: hp("5%"),
  },

  DeliverSection: {
    backgroundColor: "#fff",
    width: wp("95%"),
    alignSelf: "center",
    borderRadius: 15,
    marginVertical: hp("1%"),
    paddingVertical: hp("2%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
     marginBottom:  hp("3%"),
  },

  AddressView: {
    width: "100%",
    borderRadius: 15,
    overflow: "hidden",
  },

  AddressTextView: {
    backgroundColor: "#fff",
    width: wp("90%"),
    alignSelf: "center",
    borderRadius: 15,
    marginVertical: hp("1%"),
    padding: hp("2%"),
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  buttonView: {
    width: wp("10%"),
    justifyContent: "flex-start",
    alignItems: "center",
    marginRight: wp("2%"),
    marginTop: hp("0.4%")
  },

  buttonIcon: {
    resizeMode: "contain",
    width: wp("6%"),
    height: wp("6%"),
  },

  addressView: {
    width: wp("65%"),
    justifyContent: "flex-start",
  },

  AddressTextHead: {
    fontSize: RFValue(16),
    fontWeight: "700",
    color: "#133051",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 5,
  },

  AddressText: {
    fontSize: RFValue(12),
    color: "#333",
    marginBottom: 2,
  },

  EditDeleteView: {
    marginLeft:"auto",
    width: wp("10%"),
    flexDirection: "column",
    justifyContent: "space-between",
    // alignItems: "center",
    height: hp("20%"),
  },

  addAddressView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("2%"),
   
  },

  plusElement: {
    fontSize: RFValue(28),
    color: "#58BB47",
    marginRight: 5,
    fontWeight: "500",
  },

  addAddressText: {
    fontSize: RFValue(14),
    color: "#58BB47",
    fontWeight: "500",
  },
  dltBtn: { resizeMode: "contain", width: wp("5%"), height: wp("5%") },
  editBtn: {
    resizeMode: "contain",
    width: wp("5.5%"),
    height: wp("5.5%"),
  },
  });

export default AddressSwitchStyle;
