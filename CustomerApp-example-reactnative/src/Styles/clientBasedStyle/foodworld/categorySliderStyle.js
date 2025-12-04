import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import colors from "../../../config/colors";

const categorySliderStyle = StyleSheet.create({
  container: {
    flex: 1,
    width: wp("100%"),
    // paddingHorizontal: 10,
    paddingBottom: 10,
    marginTop: -22,
    // backgroundColor: colors.darkGrey,
  },
  dshMenuCnt: {
    paddingTop: 15,
    paddingHorizontal: 3,
    backgroundColor: "white",
    // borderRadius: 15,
  },
  dshMenuTitle: {
    paddingHorizontal: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  widgetTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.darkGrey,
    left: 10,
  },
  viewAll: {
    color: 'black',
    fontSize: 15,
  },
  touch: {
    // backgroundColor: 'green',
    marginHorizontal: 1,
    height: 125,
    width: 95,
  },
  imageView: {
    // elevation: 35,
    // backgroundColor: "red",
    borderRadius: 10,
    height: 80,
    width: 80,
    resizeMode: "contain",
    margin: 4,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  images: {
    margin: 4,
    // flexWrap: "wrap",
    // flexBasis: 1,
    height: 75,
    width: 75,
    resizeMode: "cover",
    // padding: 10,
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 3,
  },
  Text: {
    alignItems: "center",
    textAlign: "center",
    bottom: -5,
    fontSize: 14,
    fontWeight: "bold",
    color: "DarkGreen",
    overflow: "hidden",
  },
});

export default categorySliderStyle;
