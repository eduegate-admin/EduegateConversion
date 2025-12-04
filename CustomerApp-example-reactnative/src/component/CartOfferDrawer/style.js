import { Dimensions, Platform, StyleSheet } from "react-native";
const { width, height } = Dimensions.get("screen");
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp("4.44%"),
    backgroundColor: "#fff",
  },
  heading: {
    fontSize:RFValue(18, 800),
    fontWeight: "500",
    fontFamily: "Poppins-SemiBold",
    marginBottom: hp("4%"),
    color: "#525252",
    alignSelf:"center"
  },
  ListOuterView: {
    // backgroundColor: "#e71111ff",
    width: wp("80.11%"),
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopColor: "#EFEFEF",
    borderTopWidth: 1,
    alignSelf: "center",
    paddingVertical: wp("4.44%"),
  },
  ImageView: {
    // backgroundColor: "#000",
    width: wp("20.67%"),
    height: hp("10.625%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: wp("3.33%"),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E9E9E9",
    marginHorizontal: wp("2.22%"),
  },
  image: {
    width: wp("20.67%"),
    height: hp("10.625%"),
    resizeMode: "contain",
    borderRadius: 20,
  },
  DetailsView: {
    // backgroundColor: "red",
    width: wp("59%"),
    flexDirection: "column",
    justifyContent: "space-between",
  },
  NameView: {
    backgroundColor: "#fff",
    justifyContent: "space-between",
    // backgroundColor: "red",
    width: "86%",
    height: hp("12.1%"),
  },
  nameText: {
    fontSize: RFValue(14, 800),
    fontWeight: "500",
    color: "#525252",
    fontFamily: "Poppins-Regular",
  },
  badge: {
    backgroundColor: "#E8F5E9", 
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C8E6C9", // matching light green border
    alignSelf: "flex-start",
    marginTop: 6,
  },
  badgeText: {
    color: "#2E7D32", // fresh green text (not gray)
    fontSize: RFValue(13, 800),
    fontWeight: "600",
  },
  PriceCommonView: {
    // backgroundColor: "#000",
    width: wp("50.56%"),
    // height: hp("6%"),
    // bottom:0,
    // borderRadius: 20,
    flexDirection: "row",
    // justifyContent: "center",
    // paddingLeft: 15,
    alignItems: "center",
  },
  PriceView: {
    backgroundColor: "#FFFFFF",
    width: wp("25.28%"),
    // height: "80%",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  rateText: {
    fontSize: RFValue(14, 800),
    fontWeight: "600",
    color: "#525252",
    bottom: 0,
    fontFamily: "Poppins-SemiBold",
  },
  ProductQuantityView: {
    // backgroundColor: "yellow",
    width: wp("25%"),
    height: hp("3.875%"),
    paddingHorizontal: wp("1%"),
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1D9ADC",
  },
  QuantityChanger: {
    textAlign: "center",
    color: "#1D9ADC",
    fontSize: RFValue(18, 800),
    lineHeight: Platform.OS === "android" ? 18 : 0,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  quantity: {
    textAlign: "center",
    color: "#1D9ADC",
    fontSize: RFValue(14, 800),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    alignItems: "end",
    lineHeight: Platform.OS === "android" ? 14 : 0,
  },
  gradientButton: {
    width: wp("61.11%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    // marginTop: 20,
    overflow: "hidden",
  },
  addToCartButton: {
    width: wp("61.11%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
    // paddingHorizontal: 26,
    // marginBottom: 7,
    borderRadius: 10,
    // backgroundColor: "#000",
    alignSelf:"center"
  },
  addToCartText: {
    color: "#ffffff",
    fontSize: RFValue(14),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
});

export default styles;
