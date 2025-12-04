import { Dimensions, StyleSheet } from "react-native";
import colors from "../../config/colors";
const { width, height } = Dimensions.get("screen");

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    marginTop: 25,
    padding: 5,
    overflow: "hidden",
    // backgroundColor: colors.green,
  },
  scrollView: {
    // justifyContent:"center",
    // alignItems:"center",
  },
  commonMargin: {
    marginTop:25,
    marginVertical: 10,
    // backgroundColor:'black'
  },
  buttonView: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingBottom: 5,
    // backgroundColor:'black'
  },
  NoteView: {
    backgroundColor: "lightyellow",
    width: width * 0.6,
    height: height * 0.062,
    overflow: "hidden",
    padding: 10,
    borderWidth: 2,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    borderRadius: 5,
    borderStyle: "dashed",
    borderColor: "brown",
  },
  NoteText: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.lightGrey,
  },
  SubProductView: {
    backgroundColor: "lightyellow",
    width: width * 0.6,
    height: height * 0.16,
    borderWidth: 2,
    alignSelf: "center",
    flexDirection: "column",
    justifyContent: "center",
    marginTop: 10,
    paddingTop: 10,
    borderRadius: 5,
    borderStyle: "dashed",
    borderColor: "brown",
  },
  SubProductDetailView: {
    width: "100%",
    height: "70%",
    // backgroundColor: "red",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    // overflow:"hidden"
  },
  image: {
    resizeMode: "contain",
    width: "22%",
    // backgroundColor: "blue",
    height: "45%",
    borderWidth: StyleSheet.hairlineWidth,
  },
  SubProductNameView: {
    width: "70%",
    height: "70%",
    // backgroundColor: "green",
  },
  ProductView: {
    width: width * 0.6,
    height: height * 0.2,
    borderWidth: 2,
    alignSelf: "center",
    flexDirection: "column",
    justifyContent: "center",
    marginTop: 5,
    borderRadius: 5,
    borderStyle: "dashed",
    borderColor: "gray",
  },
  ProductDetailView: {
    width: "100%",
    height: "100%",
    // backgroundColor: "red",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    // overflow:"hidden"
  },
  productNameView: {
    width: "65%",
    height: "100%",
    // backgroundColor: "lightblue",
    flexDirection: "column",
    justifyContent: "space-around",
  },
  NameView: {
    width: "100%",
    height: "60%",
  },
  quantityButton: {
    alignSelf: "flex-end",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "25%",
    // backgroundColor: "green",
  },
  NameText: {
    fontSize: 17,
    fontWeight: "500",
    // lineHeight:30,
    color: colors.lightGrey,
  },
  ADDText: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 35,
    color: colors.lightGrey,
  },
  PriceText: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 30,
    // color: colors.lightGrey,
  },
  dropDownMainView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems:"center",
    // width: width * 0.6,
    // height: height * 0.2,
    // backgroundColor: colors.lightGrey,
  },
  dropDownImg: {
    width:30,
    height: 30,
    resizeMode:"contain",
  }
});

export default styles;
