import { Dimensions, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
const {width,height} = Dimensions.get('screen');

const OtpStyle = StyleSheet.create({
   header: {
    height: hp("7.5%"),
    backgroundColor: "#FFF",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    width: wp("100%"),
    backgroundColor: "#fff",
    paddingHorizontal: wp("4.44%"),
  },
  title: {
    fontSize: RFValue(22),
    fontWeight: "600",
    marginTop: hp("4.25%"),
    color: "#525252",
  },
  subText: {
    fontSize: RFValue(22),
    fontWeight: "600",
    color: "#525252",
  },
  otpContainer: {
    marginTop: hp("2.56%"),
    flexDirection: "row",
    justifyContent: "center",
  },
  otpBox: {
    width: wp("17.09%"),
    height: hp("7.69%"),
    borderWidth: 1,
    textAlign: "center",
    justifyContent: "space-between",
    fontSize: RFValue(30),
    fontWeight: "600",
    color: "#1D9ADC",
    marginHorizontal: wp("3.7%"),
    borderRadius: 9,
    elevation: 5,
    shadowColor: "#B5B5B540",
    borderColor: "#B5B5B540",
    backgroundColor: "#FFFFFF",
  },
  buttonTouch: {
    width: wp("91.11%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp("5%"),
  },
  gradientButton: {
    width: wp("91.11%"),
    height: hp("6%"),
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: RFValue(16),
    fontWeight: "500",
    textAlign: "center",
  },
  ResendText: {
    color: "#525252",
    fontSize: RFValue(14),
    fontWeight: "400",
    marginTop: hp("3.75%"),
    // backgroundColor:"#1A9",
    justifyContent:"center",
    alignItems:"center",
  },
  ResendText2: {
    color: "#1D9ADC",
    fontSize: RFValue(14),
    fontWeight: "400",
    marginTop: hp("3.75%"),
    left:wp("1%")
  },
});

export default OtpStyle;
