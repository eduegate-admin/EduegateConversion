import { Platform, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";


const PaymentMethodStyle = StyleSheet.create({
   contentHeader: {
    width: wp("91.11%"),
    marginHorizontal: wp("4.445%"),
    // marginVertical: 15,
  },
  contentHeaderText: {
    fontSize: RFValue(16),
    fontWeight: "600",
    color: "#525252",
    fontFamily: "Poppins-SemiBold",
  },
  paymentMethod: {
    // backgroundColor: "#000",
    // marginVertical: 10,
    marginVertical: hp("2.88%"),
    width: wp("91.11%"),
    alignSelf: "center",
    borderRadius: 15,
    flexDirection: "column",
  },
  AddressView: {
    width: wp("91.11%"),
    // height:  hp('7.25%'),
    overflow: "hidden",
    // paddingHorizontal: 15,
    // backgroundColor: "red",
    // paddingVertical: 5,
  },
  AddressTextView: {
    width: wp("91.11%"),
    height: hp("7.25%"),
    backgroundColor: "#DEECFA",
    justifyContent: "space-around",
    flexDirection: "row",
    marginBottom: hp("1.875%"),
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#B3B3B340",
  },
  paymentTypeText: {
    fontSize: RFValue(14),
    fontWeight: "600",
    textAlign: "left",
    color: "#525252",
    fontFamily: "Poppins-Medium",
    lineHeight: Platform.OS === "android" ? 14 : 0,
  },
  buttonImage: { resizeMode: "contain", width: wp("6.67%"), height: hp("3%") },
  iconImage: { resizeMode: "contain", width: wp("6.67%"), height: hp("3%") },
  ButtonImageView: {
    width: wp("13.6665%"),
   height: hp("7.25%"),
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  iconView: {
    width: wp("13.6665%"),
   height: hp("7.25%"),
    borderRadius: 15,
    justifyContent: "center",
  },
  payTextView: {
    width: wp("63.777%"),
   height: hp("7.25%"),
    borderRadius: 15,
    justifyContent: "center",
    //    backgroundColor: "red",
  },
});

export default PaymentMethodStyle;
