import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const WishlistStyle = StyleSheet.create({
    container: {
    flex: 1,
    // backgroundColor: "#db4545ff",
    alignItems: "center",
    width: wp("100%"),
    paddingBottom: hp("10%"),
  },
  widget: {
    backgroundColor: "#ffffffff",
    marginHorizontal: wp("1.625%"),
    marginVertical: hp("0.625%"),
    height: hp("36%"),
    width: wp("45%"),
    borderRadius: 8,
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D3D3D3",
    alignItems: "center",
    overflow: "hidden",
  },
  imageTouchView: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    height: hp("20%"),
    width: wp("44%"),
    resizeMode: "contain",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  images: {
    height: hp("20.5%"),
    width: wp("43%"),
    resizeMode: "contain",
    backgroundColor: "#fff",
  },
  textView: {
    paddingHorizontal: wp('2.22%'),
    // backgroundColor: "red",
    height: hp('10%'),
    width: "100%",
  },
  ProductNametextView: {
    // backgroundColor: "green",
     height: hp('6%'),
    width: "100%",
  },
  PriceCommonView: {
    flexDirection: "row",
    height: hp('4%'),
    // backgroundColor: "blue",
    width: "100%",
  },
  ProductPrice: {
   fontSize: RFValue(14),
    textAlign: "left",
    fontWeight: "600",
    color: "#34B067",
    fontFamily: "Poppins-SemiBold",
    marginRight: wp('1.5%')
  },
  CurrencyText: {
    fontSize: RFValue(14),
    textAlign: "left",
    fontWeight: "600",
    color: "#34B067",
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
    // backgroundColor:"gray",
    position: "absolute",
    bottom: hp("1.5%"),
    alignSelf: "center",
  },
  });

export default WishlistStyle;
