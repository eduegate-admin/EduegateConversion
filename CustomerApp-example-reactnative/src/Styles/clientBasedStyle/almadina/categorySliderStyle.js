import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
// import colors from "../../../../config/colors";

const categorySliderStyle = StyleSheet.create({
  container: {
    flex: 1,
    width: wp("100%"),
    marginTop: hp("0.75%"),
    backgroundColor: "#FFFFFF",
  },
  dshMenuCnt: {
    backgroundColor: "#FFFFFF",
  },
  dshMenuTitle: {
    width: wp("91.11%"),
    marginHorizontal: wp("4.44%"),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom:hp('1.25%'),
  },
  widgetTitle: {
    fontSize: RFValue(18, 800),
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#525252",
  },
  viewAll: {
    color: "#34B067",
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    fontSize: RFValue(12, 800),
  },
  touch: {
    backgroundColor: "#ffffffff",
    marginRight: 1,
    width: wp("22.78%"),
    alignItems:"center",
  },
  imageView: {
    backgroundColor: "#EEF4EE",
    borderRadius: 50,
    borderWidth: wp("0.5%"),
    borderColor: "#01AC67",
    height: wp('18.61%'),
    width: wp('18.61%'),
    resizeMode: "contain",
    alignItems: "center",
    justifyContent: "center",
  },
  images: {
   height: wp("16.62%"),
    width: wp("16.62%"),
    resizeMode: "cover",
    backgroundColor: "#EEF4EE",
    borderRadius: 50,
  },
  Text: {
    textAlign:"center",
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    fontSize: RFValue(12, 800),
    color: "#252525",
  },
});

export default categorySliderStyle;
