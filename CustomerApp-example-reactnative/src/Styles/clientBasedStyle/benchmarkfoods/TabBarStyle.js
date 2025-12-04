import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from "../../../config/colors";
import { RFValue } from "react-native-responsive-fontsize";

const tabBarStyle = StyleSheet.create({
 container: {
    flex: 1,
    flexDirection: "row",
    width: wp("100%"),
    height: hp("7%"),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    borderColor: "#000",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  TouchableOpacity: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.transparent,
  },
  cartCount: {
    width: wp("5%"),
    height: wp("5%"),
    // paddingHorizontal: wp("1.5%"),
    // paddingVertical: wp("0.2%"),

    position: "absolute",
    left: wp("3.1%"),
    bottom: wp("3.1%"),
    backgroundColor: "#1D9ADC", //#34B067
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    overflow: "hidden",
    zIndex: 9,
  },
  count: {
    color: "white",
    fontSize: RFValue(12, 800),
    textAlign: "center",
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
    lineHeight: 20,
  },
  IconView: {
    width: wp("5.55%"),
    height: wp("5.55%"),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  Icon: {
    width: wp("5.55%"),
    height: wp("5.55%"),
    resizeMode: "contain",
  },
  Text: {
    backgroundColor: colors.transparent,
    fontSize: RFValue(12, 800),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
  },
});

export default tabBarStyle;
