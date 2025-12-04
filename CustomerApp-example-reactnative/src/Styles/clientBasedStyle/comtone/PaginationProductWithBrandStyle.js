import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const PaginationProductWithBrandStyle = StyleSheet.create({
    ScrollView: {
      backgroundColor: "#F6F6F6",
      // paddingBottom: 10,
      width: wp("100%"),
    },
    container: {
      flex: 1,
      width: wp("100%"),
      // backgroundColor:"red",
    },
    ProfileSection: {
      backgroundColor: "#FFFFFF",
      marginVertical: 10,
      width: wp("89%"),
      height: hp("19%"),
      alignSelf: "center",
      alignItems: "center",
      borderRadius: 20,
      flexDirection: "column",
      paddingTop: 15,
    },
    profileImage: {
      resizeMode: "contain",
      width: 100,
      height: 100,
      backgroundColor: "#ffff",
      borderRadius: 30,
    },
    NameView: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    Name: {
      fontSize: 20,
      fontWeight: 700,
      lineHeight: 30,
      color: "#133051",
    },
    editIcon: {
      resizeMode: "contain",
      width: 20,
      height: 20,
      alignItems: "center",
      left: 10,
    },
    phone: {
      fontSize: 18,
      color: "#888888",
      textAlign: "center",
      fontWeight: 500,
    },
    ContentSection: {
      backgroundColor: "#FFFFFF",
      width: wp("89%"),
      height: hp("65%"),
      alignSelf: "center",
      borderRadius: 20,
      flexDirection: "column",
      paddingTop: 15,
      marginBottom:100,
    },
    ContentView: {
      width: "100%",
      height: "7.5%",
      overflow: "hidden",
      justifyContent: "space-between",
      flexDirection: "row",
      // backgroundColor: "blue",
      marginBottom:1,

    },
    IconView: {
      width: "15%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      // backgroundColor: "green",

    },
    Icon: {
      resizeMode: "contain",
      width: 35,
      height: 35,
    },
    screenTextView: {
      width: "70%",
      height: "100%",
      justifyContent: "center",
      // backgroundColor: "yellow",

    },
    AddressTextView: {
      justifyContent: "space-around",
      flexDirection: "row",
    },
    screenText: {
      fontSize: 18,
      fontWeight: 500,
      textAlign: "left",
      color: "#133051",
    },
    rightArrowView: {
      width: "15%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    rightArrowIcon: {
      resizeMode: "contain",
      width: 20,
      height: 20,
    },
    LogOutCommon: {
      width: "100%",
      height: "6%",
      overflow: "hidden",
      flexDirection: "row",
    },
    LogOutIconView: {
      width: "15%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    LogOutIcon: {
      resizeMode: "contain",
      width: 25,
      height: 25,
    },
    LogOutTextView: {
      width: "85%",
      height: "100%",
      justifyContent: "center",
    },
    LogOutText: {
      fontSize: 18,
      fontWeight: 600,
      textAlign: "left",
      color: "#68B059",
    },
  });

export default PaginationProductWithBrandStyle;
