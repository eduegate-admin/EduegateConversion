import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from "../../../config/colors";
import { Dimensions } from "react-native";
const { height, width } = Dimensions.get("screen");

const CartSuggestionStyle = StyleSheet.create({
container: {
  // flex: 1,
   width: width,
  backgroundColor: "transparent",
  paddingVertical: 12,
  paddingHorizontal:11,
  alignSelf: "center",
  marginBottom: 0,
  },

  dshMenuCnt: {
    backgroundColor: "transparent",
    width: "100%",
    paddingTop: 8,
    borderBottomColor:colors.textSecondary,
    borderBottomWidth:1,
    marginLeft:wp("2%"),
  },

  dshMenuTitle: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  widgetTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },

  widget: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginLeft: -5,
    marginRight: 12,
    // width accounts for: container paddingHorizontal (20) + FlatList horizontal padding (10) + four 5px gaps between 5 items (20)
    width: width * 0.3,
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    borderColor: "#E0E0E0",
    borderWidth: 1,
  },

  imageTouchView: {
    width: "100%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  images: {
    width: "80%",
    aspectRatio: 1,
    resizeMode: "contain",
  },

  textView: {
    width: "100%",
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    minHeight: hp("3%"),
  },

  ProductName: {
    fontSize: 10.5,
    textAlign: "center",
    color: "#333333",
    fontWeight: "500",
    lineHeight: 13,
  },

  AddButtonView: {
    backgroundColor:"#009900",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
  },

  AddText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  });

export default CartSuggestionStyle;
