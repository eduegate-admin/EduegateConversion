import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

const BrandWidgetStyle = StyleSheet.create({
    container: {
      flex: 1,
      width: wp("100%"),
      paddingHorizontal: 10,
      paddingBottom: 5,
      // elevation:5,
      // marginTop: -100,
      // backgroundColor: colors.darkGrey,
    },
    dshMenuCnt: {
      paddingTop: 15,
      paddingHorizontal: 3,
      backgroundColor: "white",
      borderRadius: 15,
      height:180,
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
    widget: {
      // backgroundColor: 'red',
      marginHorizontal: 6,
      width: 100,
      // elevation:3,
      alignItems: "center",
      justifyContent: "flex-start",
    },
    imageTouchView: {
      // elevation: 35,
      // backgroundColor: "green",
      height: 100,
      width: 100,
      resizeMode: "contain",
      // margin: 4,
      alignItems: "center",
      justifyContent: "center",
      // marginHorizontal:10,
      overflow:'hidden',
    },
    images: {
      margin: 4,
      height: "100%",
      width: "100%",
      resizeMode: "contain",
      // backgroundColor: "blue",
      // elevation:3,
      
    },
  });

export default BrandWidgetStyle;
