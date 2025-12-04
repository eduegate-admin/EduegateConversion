import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
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
    width: wp("78.72%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp("1%"),
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: wp("1.8%"),
    borderColor: "#1D9ADC",
  },
  Button1: {
    color: "black",
    fontSize: RFValue(14),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  Button2: {
    color: "#1D9ADC",
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
