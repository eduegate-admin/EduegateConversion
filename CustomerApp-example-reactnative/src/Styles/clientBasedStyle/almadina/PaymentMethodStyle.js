import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import colors from "../../../config/colors";

const PaymentMethodStyle = StyleSheet.create({
 contentHeader: {
    paddingHorizontal: wp("3.5%"),
    marginTop: hp("1.2%"),
    marginBottom: hp("0.8%"),
  },
  contentHeaderText: {
    marginBottom: hp("0.5%"),
    fontSize: RFValue(12, 800),
    fontWeight: "600",
    color: colors.textSecondary,
    fontFamily: "Poppins-SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  paymentMethod: {
    // backgroundColor: colors.background,
         backgroundColor:"transparent",

    // backgroundColor: "red",
    marginHorizontal: wp("3.5%"),
    marginBottom: hp("1.2%"),
    borderRadius: 12,
    overflow: "hidden",
    // elevation: 2,
    // shadowColor: colors.shadow,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.08,
    // shadowRadius: 6,
  },
  AddressView: {
    width: "100%",
  },
AddressTextView: {
  paddingVertical: hp("2.5%"),
  paddingHorizontal: wp("4%"),
  flexDirection: "row",
  alignItems: "center",
  borderRadius: 12,
    padding: wp("2.5%"),
  // Subtle shadow for that floating white card effect
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2, // slightly more lift for Android

  // Optional smoothness (light border to blend with shadow)
  borderWidth: 0.2,
  borderColor: 'rgba(0,0,0,0.05)',

  backgroundColor: "#fff",

  marginVertical: hp("0.3%"),
  borderBottomWidth: 0.5,
  borderBottomColor: colors.border,
},

  lastPaymentItem: {
    borderBottomWidth: 0,
  },
  selectedPaymentItem: {
    backgroundColor: colors.primaryLight || "#F0F7FF",
  },
  AddressTextHead: {
    fontSize: RFValue(14, 800),
    fontWeight: "700",
    textAlign: "left",
    color: colors.textHeading,
    fontFamily: "Poppins-Bold",
  },
  AddressText: {
    fontSize: RFValue(13, 800),
    fontWeight: "600",
    textAlign: "left",
    color: colors.textHeading,
    fontFamily: "Poppins-SemiBold",
  },
  paymentTypeText: {
    fontSize: RFValue(14, 800),
    fontWeight: "500",
    color: colors.textPrimary,
    fontFamily: "Poppins-Medium",
  },
  buttonImage: {
    resizeMode: "contain",
    width: 20,
    height: 20,
    tintColor: colors.primary,
  },
  iconImage: {
    resizeMode: "contain",
    width: 22,
    height: 22,
  },
  ButtonImageView: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "auto",
  },
  iconView: {
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("3%"),
  },
  payTextView: {
    flex: 1,
    justifyContent: "center",
  },
});

export default PaymentMethodStyle;
