import { Dimensions, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
const { width, height } = Dimensions.get("screen");

const WishlistStyle = StyleSheet.create({
  container: {
    flex: 1,
    width: wp("100%"),
    // marginTop: 20,
    // paddingTop: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 10,
    paddingBottom: hp("10%"),
  },
  widget: {
    backgroundColor: "#ffffffff",
    marginHorizontal: wp("0.625%"),
    marginVertical: hp("0.625%"),
    height: hp("38%"),
    width: wp("45%"),
    borderRadius: 12,
    elevation: 5,
    alignItems: "center",
    // justifyContent: "center",
    shadowColor: "#A3A3A3",
  },
  imageTouchView: {
    // backgroundColor: "blue",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    height: hp("22%"),
    width: wp("45%"),
    resizeMode: "contain",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  images: {
    height: hp("23.5%"),
    width: wp("45%"),
    resizeMode: "contain",
  },
  ProductNametextView: {
    // backgroundColor: "green",
    height: hp('6%'),
    width: "100%",
  },
  textView: {
    // backgroundColor: "green",
    height: hp('10%'),
    width: "100%",
    paddingHorizontal: wp('4.44%'),
  },
  ProductNameView: {
    // height: 50,
    justifyContent: "center",
  },
  PriceCommonView: {
    // backgroundColor:"#000",
    flexDirection: "row",
    height: hp('4%'),
    width: "100%",
    // alignItems: "center",
    // bottom: 5,
  },
  ProductPrice: {
    fontSize: RFValue(14),
    textAlign: "left",
    fontWeight: "600",
    color: "#525252",
    fontFamily: "Poppins-SemiBold",
    marginRight: wp('1.5%')

  },
  CurrencyText: {
    fontSize: RFValue(14),
    textAlign: "left",
    fontWeight: "600",
    color: "#525252",
    fontFamily: "Poppins-SemiBold"
  },
  ProductName: {
    alignItems: "center",
    textAlign: "left",
    fontSize: RFValue(14),
    fontWeight: "500",
    color: "#525252",
    fontFamily: "Poppins-Medium"
  },
  quantitySelector: {
    position: "absolute",
    bottom: 15,
    right: 10,
  },
  quantityTouchable: {
    height: hp('4.8%'),
    width: wp("45%"),
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
    width: "85%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    // backgroundColor: colors.green,
  },
  addToCartText: {
    color: "white",
    fontSize: RFValue(12),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  EmptyContainer: {
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      borderRadius: 15,
      width: wp("91.11%"),
      height: hp("79.11%"),
      padding: wp("2"),
      marginTop: hp("1.2"),
      shadowColor: "#A9A9A9",
      elevation: 3,
      paddingHorizontal: wp("5%"),
      marginBottom: hp("8.5%"),
  },
  emptyText: {
    fontSize: RFValue(14),
    fontWeight: "600",
    // lineHeight: 50,
    // left: 14,
    color: "#3D3D3D99",
    fontFamily: "Poppins-Regular",
  },
  emptyText2: {
    fontSize: RFValue(11),
    fontWeight: "600",
    bottom: hp("0.5"),
    // left: 14,
    color: "#B2B2B2",
    fontFamily: "Poppins-Regular",
  },
});

export default WishlistStyle;
