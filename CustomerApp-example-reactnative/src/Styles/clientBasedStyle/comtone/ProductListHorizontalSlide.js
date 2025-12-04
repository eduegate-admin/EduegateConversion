import { Dimensions, StyleSheet } from "react-native";
import colors from "../../../config/colors";
const {width,height} = Dimensions.get('screen');

const ProductListHorizontalSlideStyle = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 10,
    padding: 5,
    // elevation:5,
    // marginTop: -100,
    // backgroundColor: colors.darkGrey,
  },
  dshMenuCnt: {
    paddingTop: 15,
    paddingHorizontal: 3,
    backgroundColor: colors.background,
    borderRadius: 15,
    height: 360,
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
    // color: colors.darkGrey,
  },
  viewAll: {
    color: colors.primary,
    fontSize: 12,
  },
  wishlist: { position: "absolute", right: 15, top: 10 },
  wishlistIcon: {
    resizeMode: "contain",
    width: 25,
    height: 25,
  },
  widget: {
    backgroundColor: colors.background,
    marginHorizontal: 6,
    height: 295,
    width: 160,
    borderRadius: 30,
    elevation: 3,
    alignItems: "center",
    // justifyContent: "center",
  },
  imageTouchView: {
    // elevation: 35,
    // backgroundColor: "red",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: 150,
    width: 160,
    resizeMode: "contain",
    // margin: 4,
    alignItems: "center",
    justifyContent: "center",
    // marginHorizontal:10,
    overflow: 'hidden',
  },
  images: {
    margin: 4,
    height: 150,
    width: 160,
    resizeMode: "contain",
    // padding: 10,
    backgroundColor: colors.background,
    // borderRadius: 50,
    elevation: 3,

  },
  textView: {
    // backgroundColor:'red',
    height: 95,
    width: 135,
  },
  ProductNametextView: {
    // backgroundColor: "green",
    width: "100%",
    aspectRatio: 3.5,    
        // height: "44%",
  },
  PriceCommonView: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  ProductPrice: {
    alignItems: 'center',
    textAlign: 'left',
    top: 10,
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
    // top:-5,
    fontSize: 15,
    fontWeight: '500',
  },
  quantitySelector: {
    // backgroundColor:"green",
    position: "absolute",
    bottom: 20,
    // right:10,
  },
});

export default ProductListHorizontalSlideStyle;