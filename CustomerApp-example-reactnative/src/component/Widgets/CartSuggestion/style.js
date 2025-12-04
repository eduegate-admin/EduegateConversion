import { Dimensions, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from "../../../config/colors";

const { width, height } = Dimensions.get("screen");
const styles = StyleSheet.create({
   container: {
    // flex: 1,
    width: width,
    backgroundColor: "transparent",
    paddingHorizontal: 1,
    alignSelf: "center",
    marginBottom: 0,
  },

  dshMenuCnt: {
    backgroundColor: "transparent",
    width: "100%",
    paddingTop: 0,
    borderBottomColor: colors.textSecondary,
    borderBottomWidth: 1,
    backgroundColor: "red",
    marginLeft: wp("2%"),
  },

  dshMenuTitle: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
  },

  widgetTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },

  widget: {
    backgroundColor: "#FFFFFF",
    // backgroundColor: "red",
    borderRadius: 20,
    marginLeft: -5,
    marginRight: 12,
    // width accounts for: container paddingHorizontal (20) + FlatList horizontal padding (10) + four 5px gaps between 5 items (20)
    width: width * 0.2,
    aspectRatio: 0.7,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: "hidden",
  },

  imageTouchView: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "#FFFFFF",
    
  },

  images: {
    width: "100%",
    // backgroundColor: "red",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "100%",
    resizeMode: "cover",
    backgroundColor: "white",
  },

  textView: {
    width: "100%",
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    minHeight: hp("3%"),
  },

  ProductName: {
    fontSize: 9.5,
    textAlign: "center",
    color: "#333333",
    fontWeight: "500",
    lineHeight: 11,
  },

  AddButtonView: {
    backgroundColor: colors.buttonPrimary,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  AddText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  });

export default styles;
