import { StyleSheet } from "react-native";
import {
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Dimensions } from "react-native";
const { height, width } = Dimensions.get("screen");

const CartSuggestionStyle = StyleSheet.create({
     container: {
    flex: 1,
    width: width,
    marginVertical: 5,
    marginBottom: 20,
  },
  dshMenuCnt: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
  },
  dshMenuTitle: {
    paddingHorizontal: 10,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  widgetTitle: {
    fontSize: 21,
    fontWeight: "600",
    // backgroundColor:"red",
    // color: colors.darkGrey,
  },
  // viewAll: {
  //   color: colors.green,
  //   fontSize: 12,
  // },
  widget: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 8,
    height: height * 0.28,
    width: width * 0.38,
    borderRadius: 16,
    elevation: 4,
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  imageTouchView: {
    backgroundColor: "#F8F9FA",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: "56%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: 'hidden',
  },
  images: {
    borderRadius: 12,
    height: "80%",
    width: "80%",
    resizeMode: "contain",
    backgroundColor: "#FFFFFF",
  },
  textView: {
    backgroundColor: '#FFFFFF',
    width: "100%",
    minHeight: hp("8%"),
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  ProductName: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#252525',
  },
  AddButtonView: {
    backgroundColor: "#68B054",
    width: "100%",
    height: hp("5%"),
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  buttonImage: {
    resizeMode: "contain",
    width: 25,
    height: 25,
  },
  // QuantityChanger: {
  //   textAlign: "center",
  //   color: "#68B054",
  //   fontSize: 30,
  // },
  // quantity: {
  //   textAlign: "center",
  //   color: "#000000",
  //   fontSize: 20,
  //   fontWeight: 700,
  // },
  AddText:{
    color: "#FFF",
    fontSize: 16,
    fontWeight: 700,
  },
  });

export default CartSuggestionStyle;
