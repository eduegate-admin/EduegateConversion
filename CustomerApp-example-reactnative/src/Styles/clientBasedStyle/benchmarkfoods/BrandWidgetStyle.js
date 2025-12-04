import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const BrandWidgetStyle = StyleSheet.create({
  container: {
    flex: 1,
    width: wp("100%"),
  },
  dshMenuCnt: {},
  dshMenuTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  widgetTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
    color: "#525252",
    fontFamily: "Poppins-SemiBold",
    paddingLeft: wp("4.44%"),
  },
  widget: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: wp("4.44%"),
  },
  imageTouchView: {
    width: wp("28.89%"),
    height: hp("8.125%"),
    resizeMode: "contain",
    marginRight: wp("2.22%"),
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ababab59",
    borderRadius: 15,
  },
  images: {
    width: wp("28.89%"),
    height: hp("8.125%"),
    resizeMode: "contain",
  },
  });

export default BrandWidgetStyle;
