import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from "../../../config/colors";
import { RFValue } from "react-native-responsive-fontsize";

const DrawerStyle = StyleSheet.create({
  Container: {
    flex: 1,
    overflow: "hidden",
    // backgroundColor: "#000",
  },
  accountTouch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    // borderBottomWidth: 1.1,
    paddingVertical: 15,
    // backgroundColor: colors.orange,
    borderBottomWidth: 0.24,
    borderBottomColor: colors.lightWhite,
    height: 110,
    width: "100%",
  },
  accountImgView: {
    width: 60,
    height: 60,
    borderRadius: 75 / 2,
    backgroundColor: colors.green,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    borderRadius: 10,
  },
  dropdownIcon: {
    resizeMode: "contain",
    // backgroundColor: "#000",
    width: wp("6.67%"),
    height: wp("6.67%"),
  },
  welcomeView: {
    // flexDirection:'row',
    alignItems: "center",
    justifyContent: "space-around",
    marginLeft: 4,
    width: "69%",
    // backgroundColor: "red",
    overflow: "hidden",
  },
  welcomeText: {
    fontSize: 15,
    color: colors.black,
  },
  Name: {
    fontSize: 20,
    color: colors.black_lvl_2,
  },
  commonMargin: {
    marginBottom: hp("3.75%"),
    // backgroundColor:'blue',
    paddingHorizontal: wp("4.44%"),
    borderBottomColor: "#F4F4F4",
    borderBottomWidth: 1,
  },
  headerCommon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // paddingHorizontal: wp("4.44%"),
    // paddingVertical: hp("1.5%"),
    // borderBottomColor: "#F4F4F4",
    // backgroundColor:'blue'
    // borderBottomWidth: 1,
  },
  headText: {
    // marginTop: hp("3.75%"),
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
    fontSize: RFValue(16, 800),
    color: "#525252",
    marginBottom: hp("0.7%"),
    // backgroundColor:'black'
  },
  drawerView: {
    flexDirection: "row",
    alignItems: "center",
    height: hp("5%"),
    justifyContent: "space-between",
    // backgroundColor:'blue'
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F4",
  },
  drawerInnerView: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 8,
    // backgroundColor: "blue",
  },
  icon: {
    width: 25,
    height: 25,
    resizeMode: "contain",
    marginRight: 14,
  },
  drawerText: {
    fontFamily: "Poppins-Regular",
    fontSize: RFValue(14, 800),
    color: "#525252",
    fontWeight: "400",
  },
  iconSecond: {
    width: 25,
    height: 25,
    resizeMode: "contain",
    backgroundColor: colors.lightWhite,
    overflow: "hidden",
    borderRadius: 25 / 2,
  },

  Version: {
    fontFamily: "Poppins-Regular",
    fontSize: RFValue(10),
    color: "#525252",
    textAlign: "center",
    bottom: hp("0.8%"),
  },
  socialPlatform: {
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    // backgroundColor: colors.green,
    padding: wp("4.44%"),
    marginHorizontal: wp("8%"),
    bottom: hp("1.5%"),
  },
  socialIcon: {
    width: wp("9%"),
    height: wp("9%"),
    resizeMode: "contain",
  },
});

export default DrawerStyle;
