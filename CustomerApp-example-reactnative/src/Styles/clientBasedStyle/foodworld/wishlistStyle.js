import { Dimensions, StyleSheet } from "react-native";


const { width, height } = Dimensions.get("screen");

const WishlistStyle = StyleSheet.create({
    container: {
    flex: 1,
    // backgroundColor: "#fff",
    backgroundColor: "#F5F5F5",
    width: width,
    paddingBottom: height * 0.1,
    // zIndex: 1,
    alignItems: "center",
  },
  widget: {
    backgroundColor: "#fff",
    margin: 5,
    height: height * 0.255,
    width: width * 0.46,
    borderRadius: 5,
    // elevation:2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D3D3D3",
    alignItems: "center",
    // justifyContent: "center",
  },
  imageTouchView: {
    // elevation: 35,
    // backgroundColor: "white",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    height: height * 0.155,
    width: width * 0.44,
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
    height: height * 0.155,
    width: width * 0.43,
    resizeMode: "contain",
    // padding: 10,
    backgroundColor: "#fff",
    // borderRadius: 50,
    // elevation:3,
  },
  textView: {
    // backgroundColor: "red",
    height: height * 0.1,
    width: width * 0.4,
  },
  ProductNametextView: {
    // backgroundColor: "green",
    width: "100%",
    height: "35%",
  },
  PriceCommonView: {
    flexDirection: "row",
    alignItems: "baseline",
    // backgroundColor: "blue",
    top: 25,
  },
  ProductPrice: {
    alignItems: "center",
    textAlign: "left",
    fontSize: 17,
    fontWeight: "800",
    color: "#133051",
  },
  CurrencyText: {
    fontSize: 17,
    textAlign: "left",
    left: 2,
    fontWeight: "900",
    color: "#133051",
  },
  ProductName: {
    alignItems: "center",
    textAlign: "left",
    top: 5,
    fontSize: 14,
    fontWeight: "400",
    color: "#404040",
  },
  quantitySelector: {
    // backgroundColor:"green",
    position: "absolute",
    bottom: 15,
    right: 10,
  },
  });

export default WishlistStyle;
