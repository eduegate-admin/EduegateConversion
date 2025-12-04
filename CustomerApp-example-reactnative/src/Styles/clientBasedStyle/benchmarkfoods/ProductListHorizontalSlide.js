import { Dimensions, StyleSheet } from "react-native";
import colors from "../../../config/colors";
const { width, height } = Dimensions.get('screen');
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const ProductListHorizontalSlideStyle = StyleSheet.create({
  container: {
    flex: 1,
    width: wp("100%"),
    // paddingHorizontal: 10,
    // padding: 10,
    // elevation:5,
    marginBottom: hp('4.5%'),
    // backgroundColor: colors.darkGrey,
  },
  dshMenuCnt: {
    // backgroundColor: "green",
    // borderRadius: 5,
  },
  arrow: {
    resizeMode: "contain",
    width: wp('6.67%'),
    height: wp('6.67%'),
    elevation: 5,
    borderRadius: 50,
    backgroundColor: "white",
  },
  dshMenuTitle: {
    paddingHorizontal: wp('4.44%'),
    marginBottom: hp('1.25%'),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  widgetTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
    color: "#525252",
    fontFamily: "Poppins-SemiBold"
  },
  viewAll: {
    color: colors.green,
    fontSize: 14,
  },
  widget: {
    // backgroundColor: "red",
    // marginHorizontal: 5,
    width: wp("43.33%"),
    // borderRadius: 5,
    // elevation:2,
    // borderWidth: StyleSheet.hairlineWidth,
    // borderColor: "#D3D3D3",
    alignItems: "center",
    // justifyContent: "center",
  },
  wishlist: { position: "absolute", right: wp("2.5"), top: hp("1") },
  wishlistIcon: {
    resizeMode: "contain",
    width: wp("6%"),
    height: wp("6%"),
  },
  imageTouchView: {
    // elevation: 35,
    // backgroundColor: "white",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    width: wp("43.33%"),
    height: wp("28.33%"),
    resizeMode: "contain",
    // margin: 4,
    alignItems: "center",
    justifyContent: "center",
    // marginHorizontal:10,
    overflow: "hidden",
  },
  images: {
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    width: wp("28.33%"),
    height: wp("28.33%"),
    resizeMode: "contain",
    // padding: 10,
    // borderRadius: 50,
    // elevation:3,
    backgroundColor: "#fff",
  },
  textView: {
    // backgroundColor:'#000',
    width: wp("32.5%"),

    height: hp("9.25%"),
  },
  ProductNametextView: {
    // backgroundColor: "green",
    width: wp("32.5%"),
    height: hp("5.25%"),
  },
  PriceCommonView: {
    flexDirection: "row",
    alignItems: "baseline",
    // backgroundColor:'blue',
    top: hp("0.5%"),
  },
  ProductPrice: {
    alignItems: "center",
    textAlign: "left",
    fontSize: RFValue(15,800),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#525252",
  },
  CurrencyText: {
    textAlign: "left",
    fontSize: RFValue(15,800),
    left: 2,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#525252",
  },
  ProductName: {
    alignItems: "center",
    textAlign: "left",
    fontSize: RFValue(13,800),
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#525252",
  },
  quantityTouchable: {
    backgroundColor: "white",
    width: wp("32.5%"),
    height: hp("4%"),
    alignItems: "center",
    justifyContent: "center",
  },
  gradientButton: {
    width: wp("32.5%"),
    height: hp("4"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    overflow: "hidden",
  },
  addToCartButton: {
    width: wp("32.5%"),
    height: hp("4"),
    alignItems: "center",
    justifyContent: "center",
    // paddingHorizontal: 26,
    // marginBottom: 7,
    borderRadius: 10,
    // backgroundColor: colors.green,
  },
  addToCartText: {
    color: "white",
    fontSize: RFValue(14,800),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  quantitySelector: {
    // backgroundColor:"green",
    position: "absolute",
    bottom: 15,
    right: 10,
  },
});

export default ProductListHorizontalSlideStyle;