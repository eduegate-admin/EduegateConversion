import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";


const CommonHeaderRightStyle = StyleSheet.create({
   padding: {
    marginLeft: wp("4.44%"),
  },
  image: {
    width: wp("6.67%"),
    height: wp("6.67%"),
    resizeMode: "contain",
  },
  cartCount: {
    width: wp("5%"),
    height: wp("5%"),
    // paddingHorizontal: wp("1.5%"),
    // paddingVertical: wp("0.2%"),
    position: "absolute",
    left: wp("3.1%"),
    bottom: wp("3.9%"),
    backgroundColor: "#34B067",
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
  flexStyle: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    // backgroundColor: "#000",
    paddingRight: wp("4.44%"),
  },
});

export default CommonHeaderRightStyle;
