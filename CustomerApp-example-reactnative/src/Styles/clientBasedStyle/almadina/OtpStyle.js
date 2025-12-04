import { Dimensions, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
const {width,height} = Dimensions.get('screen');

const OtpStyle = StyleSheet.create({
  container: {
      flex: 1,
      alignItems: "center",
      width: "100%",
      // justifyContent: "center",
      backgroundColor: "#FFFFFF",
      // paddingHorizontal:80
    },
    title: {
      fontSize: width * 0.06,
      fontWeight: "600",
      marginTop: width * 0.26,
      color: "#133051",
    },
    subText: {
      fontSize: width * 0.037,
      fontWeight: "500",
      color: "#212121",
    },
    otpContainer: {
      flexDirection: "row",
      justifyContent: "center",
    },
    otpBox: {
      width: width * 0.2,
      height: width * 0.14,
      borderWidth: 1,
      textAlign: "center",
      justifyContent: "center",
      fontSize: width * 0.086,
      fontWeight: "600",
      color: "#68B054",
      marginHorizontal: 5,
      borderRadius: 15,
      borderColor: "#68B054",
    },
    resendButton: {
      marginTop: width * 0.007,
      // padding: 10,
    },
    resendButtonText: {
      color: "#68B054",
      fontSize: width * 0.043,
      fontWeight: "600",
    },
    disabledButton: {
      opacity: 0.5,
    },
     buttonTouch: {
    width: wp("80%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor:"red",
    marginTop: hp("3%"),
  },
  gradientButton: {
    width: wp("80%"),
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
  ResendText:{
color: "#525252",
    fontSize: RFValue(16),
    fontWeight: "500",
    textAlign: "center",
    marginTop:40,
  },
ResendText2 :{
color: "#68B054",
    fontSize: RFValue(16),
    fontWeight: "500",
    textAlign: "center",
    marginTop:40,
},
});

export default OtpStyle;
