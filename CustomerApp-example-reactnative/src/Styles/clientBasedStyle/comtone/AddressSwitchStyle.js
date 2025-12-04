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
    marginBottom: hp("3%"),
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
    marginTop: hp("0.4%"),
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
    marginLeft: "auto",
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
    paddingVertical: hp("1.5%"),
    width: "100%",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonRow: {
    flexDirection: "row",

    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: wp("4%"),
    backgroundColor: "#fff",
    paddingVertical: hp("2%"),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e0e0e0",
  },
  addAddressButton: {
    flexDirection: "row",
    // backgroundColor:"red",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#58BB47",
    borderRadius: 6,
    paddingVertical: hp("1.6%"),
    paddingHorizontal: wp("4%"),
    flex: 0.5,
    marginLeft: wp("3%"),
    minHeight: hp("5.5%"),
  },
  plusElement: {
    fontSize: RFValue(20),
    color: "#58BB47",
    marginRight: wp("1.5%"),
    fontWeight: "600",
    lineHeight: RFValue(20),
  },

  addAddressText: {
    fontSize: RFValue(13.5),
    color: "#58BB47",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  Buttoncotain: {
    backgroundColor: "#58BB47",
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("2.5%"),
    borderRadius: 6,
    flex: 0.7,  // Reduced from 1 to make it take less horizontal space
    marginRight: wp("3%"),
    minHeight: hp("6.3%"),
    // width:wp("100%"),
    justifyContent: "center",
  },
  ButtoncotainText: {
    color: "#FFFFFF",
    fontSize: RFValue(14.5),
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.3,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  dltBtn: { resizeMode: "contain", width: wp("5%"), height: wp("5%") },
  editBtn: {
    resizeMode: "contain",
    width: wp("5.5%"),
    height: wp("5.5%"),
  },
});

export default AddressSwitchStyle;
