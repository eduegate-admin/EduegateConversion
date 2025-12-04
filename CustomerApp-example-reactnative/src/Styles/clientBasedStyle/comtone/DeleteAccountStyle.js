import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from "../../../config/colors";
import { RFValue } from "react-native-responsive-fontsize";

const DeleteAccountStyle = StyleSheet.create({
    inputContainer: {
    width: wp("82.77%"),
    alignItems: "center",
    marginTop: hp("3.375%"),
    height: hp("14.75%"),
  },
  label: {
    position: "absolute",
    top: -hp("1.5%"),
    left: wp("10%"),
    backgroundColor: "#FFFFFF",
    paddingHorizontal: wp("1.5%"),
    fontSize: RFValue(14),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    color: "#525252",
    zIndex: 1,
  },
  ButtonContainer: {
    width: 300, // Fixed width in points
    maxWidth: wp("90%"), // Maximum width as percentage of screen width
    minWidth: 250, // Minimum width to prevent it from getting too small
    height: hp("6%"),
    minHeight: 44, // Minimum touch target size for better accessibility
    alignSelf: 'center', // Center the button in its container
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp("1%"),
    borderRadius: 10,
    borderColor: colors.green,
    borderWidth: 1,
    backgroundColor: colors.green,
    paddingHorizontal: 16, // Add some horizontal padding
  },
  Button1: {
    color: "#FFFFFF",
    fontSize: RFValue(14),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  Button2: {
    color: "#FFFFFF",
    fontSize: RFValue(14),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  input: {
    width: wp("91.11%"),
    height: hp("14.75%"),
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    fontSize: RFValue(14),
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  deleteButon: {
    width: wp("82.72%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp("36.875%"),
    borderRadius: 10,
  },
  });

export default DeleteAccountStyle;
