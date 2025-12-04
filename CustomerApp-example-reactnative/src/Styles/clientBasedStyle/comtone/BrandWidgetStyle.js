import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const BrandWidgetStyle = StyleSheet.create({
    container: {
      flex: 1,
      width: wp("100%"),
      paddingHorizontal: wp("4%"),
      paddingTop: hp("2.5%"),
      paddingBottom: hp("10%"),
      backgroundColor: "#F5F7F8",
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
      marginHorizontal: wp("3%"),
      marginVertical: hp("1.8%"),
      width: wp("24%"),
      alignItems: "center",
      justifyContent: "flex-start",
      backgroundColor: "#FFFFFF",
      elevation: 2,
      shadowColor: "#00000020",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
    },
    imageTouchView: {
      height: wp("24%"),
      width: wp("24%"),
      alignItems: "center",
      justifyContent: "center",
      overflow:'hidden',
    },
    images: {
      height: "100%",
      width: "100%",
      resizeMode: "contain",
    },
  });

export default BrandWidgetStyle;
