import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import colors from "../../../config/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: wp("100%"),
    paddingHorizontal: 10,
    paddingBottom: 10,
    marginTop: -100,
    // backgroundColor: colors.darkGrey,
  },
  dshMenuCnt: {
    paddingTop: 15,
    paddingHorizontal: 3,
    backgroundColor: "white",
    borderRadius: 15,
  },
  dshMenuTitle: {
    paddingHorizontal: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  widgetTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: colors.darkGrey,
  },
  viewAll: {
    color: colors.green,
    fontSize: 12,
  },
  touch: {
    backgroundColor: "white",
    marginHorizontal: 1,
    height: 150,
    width: 122,
  },
  imageView: {
    // elevation: 35,
    // backgroundColor: "red",
    borderRadius: 10,
    height: 100,
    width: 100,
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
    height: 100,
    width: 100,
    resizeMode: "contain",
    // padding: 10,
    backgroundColor: "#fff",
    // borderRadius: 50,
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

export default styles;
