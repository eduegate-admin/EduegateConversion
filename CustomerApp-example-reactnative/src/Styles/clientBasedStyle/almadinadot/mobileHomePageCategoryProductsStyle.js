import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import colors from "../../../config/colors";

const MobileHomePageCategoryProductsStyle = StyleSheet.create({
  container: {
    flex: 1,
    width: wp("100%"),
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  dshMenuCnt: {
    paddingTop: 15,
    paddingHorizontal: 3,
    backgroundColor: "white",
    borderRadius: 15,
    overflow: 'hidden',
    // height:360,
  },
  flatList: {
    alignItems: 'center',
    overflow: 'hidden',
    paddingBottom: 15,
  },
  dshMenuTitle: {
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 30,
  },
  widgetTitle: {
    fontSize: 21,
    fontWeight: "600",
  },
  viewAll: {
    color: colors.green,
    fontSize: 15,
  },
  widget: {
    margin: 1,
    height: 270,
    width: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  imageTouchView: {
    height: 150,
    width: 160,
    resizeMode: "contain",
    // margin: 4,
    alignItems: "center",
    justifyContent: "center",
    overflow: 'hidden',
  },
  images: {
    margin: 4,
    height: 150,
    width: 160,
    resizeMode: "contain",
    backgroundColor: "#fff",
  },
  textView: {
    height: 80,
    width: 195,
  },
  PriceCommonView: {
    flexDirection: 'row',
    alignItems: 'baseline',

  },
  ProductPrice: {
    alignItems: 'center',
    textAlign: 'left',
    bottom: -5,
    fontSize: 30,
    fontWeight: '900',
  },
  AedText: {
    fontSize: 13,
    textAlign: 'left',
    left: 2,
  },
  ProductName: {
    alignItems: 'center',
    textAlign: 'left',
    bottom: -5,
    fontSize: 15,
    fontWeight: '500',
  },
  quantityTouchable: {
    backgroundColor: "white",
    height: "15%",
    alignItems: "center",
    justifyContent: "center",
  },
  addToCartButton: {
    paddingHorizontal: 26,
    paddingVertical: 7,
    borderRadius: 30,
    backgroundColor: colors.green,
  },
  addToCartText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
});

export default MobileHomePageCategoryProductsStyle;
