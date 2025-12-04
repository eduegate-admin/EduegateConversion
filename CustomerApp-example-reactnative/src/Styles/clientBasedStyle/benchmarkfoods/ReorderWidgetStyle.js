import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const ReorderWidgetStyle = StyleSheet.create({
   container: {
    flex: 1,
    width: wp("100%"),
    // paddingHorizontal: 10,
    // paddingBottom: 10,
    paddingTop: hp("1%"),
    // backgroundColor: "#000",
    marginBottom: hp("2%"),
  },
  arrow: {
    resizeMode: "contain",
    width: wp("6.67%"),
    height: wp("6.67%"),
    elevation: 5,
    borderRadius: 50,
    backgroundColor: "white",
  },
  dshMenuCnt: {
    // paddingTop: 15,
    paddingHorizontal: wp("1.8%"),
    // backgroundColor: "white",
    // borderRadius: 15,
  },
  dshMenuTitle: {
    // width:wp("100%"),
    paddingHorizontal: wp("1.8%"),
    // marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  widgetTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
    color: "#525252",
    left: wp("1.5%"),
    fontFamily: "Poppins-SemiBold",
  },
  viewAll: {
    color: "black",
    fontSize: 15,
  },
  touch: {
    // backgroundColor: 'green',
    marginHorizontal: wp("0.5%"),
    width: wp("30%"),
    alignItems: "center",
    // gap: hp('0%')
    // backgroundColor: 'black',
  },
  imageView: {
    // elevation: 35,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    height: wp("28%"),
    width: wp("28%"),
    resizeMode: "contain",
    // margin: 4,
    alignItems: "center",
    justifyContent: "center",
    // marginHorizontal: 10,
  },
  images: {
    // margin: 4,
    // flexWrap: "wrap",
    // flexBasis: 1,
    height: wp("28%"),
    width: wp("28%"),
    resizeMode: "contain",
    // padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#ABE2FF",
  },
  Text: {
    // backgroundColor: "#1AD",
    alignItems: "center",
    textAlign: "center",
    width: wp("28.22%"),
    // bottom: -5,
    fontSize: RFValue(12, 800),
    fontWeight: "regular",
    color: "#525252",
    overflow: "hidden",
    fontFamily: "Poppins-Regular",
    // marginTop: hp('3%'),
  },
});

export default ReorderWidgetStyle;
