import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from "../../../config/colors";
import { RFValue } from "react-native-responsive-fontsize";

const MobileHomePageCategoryProductsStyle = StyleSheet.create({
 container: {
    flex: 1,
    width: wp("100%"),
    // paddingHorizontal: wp('4.44%'),
    // backgroundColor:"#000"
  },
  dshMenuCnt: {
    // paddingHorizontal: wp('4.44%'),
    overflow: "hidden",
  },
  flatList: {
    alignItems: "center",
    overflow: "hidden",
    paddingBottom: hp("1%"),
  },
  dshMenuTitle: {
    paddingHorizontal: wp('4.44%'),
    // marginTop: 10,
    // marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // backgroundColor: 'green',
    paddingBottom: hp("0.5%"),
  },
  widgetTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
    color: "#525252",
    fontFamily:"Poppins-SemiBold",
    left: wp("2.1%"),
  },
   arrow :{
    resizeMode: "contain",
    width: 30, 
    height: 30,
    elevation: 5,
    borderRadius: 50,
    backgroundColor: "white",
  },
  viewAll: {
    color: colors.green,
    fontSize: 15,
  },
  widget: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: wp("1%"),
    marginVertical: hp("0.5%"),
    height: hp("32%"),
    width:wp('44%'),
    borderRadius: 20,
    shadowColor:"#9B9B99",
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  imageTouchView: {
    // backgroundColor: "blue",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: hp("16%"),
    width:  wp('44%'),
    resizeMode: "contain",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  images: {
    // margin: 4,
    height: hp("16%"),
    width:wp("44%"),
    resizeMode: "contain",
    // backgroundColor: "#000",
  },
  textView: {
    // backgroundColor: "green",
    height: hp("9%"),
    width: wp("36%"),
  },
  PriceCommonView: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  ProductPrice: {
    alignItems: "center",
    textAlign: "left",
    color: "#525252",
    fontSize: RFValue(14),
    fontWeight: "600",
    left: 5,
    fontFamily:"Poppins-SemiBold",
  },
  AedText: {
    fontSize: RFValue(14),
    textAlign: "left",
    fontWeight: "600",
    color: "#525252",
    fontFamily:"Poppins-SemiBold",
  },
  ProductName: {
    alignItems: "center",
    textAlign: "left",
    marginVertical: hp("0.5%"),
    fontSize: RFValue(12),
    fontWeight: "500",
    color: "#525252",
    fontFamily:"Poppins-Medium",
  },
  quantityTouchable: {
    // backgroundColor: "white",
    width: wp("44%"),
    height: hp("7%"),
    alignItems: "center",
    justifyContent: "center",
  },
  gradientButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    overflow: "hidden",
  },
  addToCartButton: {
    width: wp("36%"),
    height: hp("4.8"),
    alignItems: "center",
    justifyContent: "center",
    // paddingHorizontal: 26,
    // marginBottom: 7,
    borderRadius: 10,
    // backgroundColor: colors.green,
  },
  addToCartText: {
    color: "white",
    fontSize: RFValue(12),
    fontWeight: "600",
    fontFamily:"Poppins-SemiBold",
  },
});

export default MobileHomePageCategoryProductsStyle;
