import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const homeHeaderStyles = StyleSheet.create({
  SideMenuView: {
    width: wp("100%"),
    // marginTop: 10,
    flexDirection: "row",
    // backgroundColor: "#000",
    alignItems: "center",
    // justifyContent:"center",
    height: hp("7%"),
    paddingTop: hp("1%"),
  },
  SideMenuIcon: {
    resizeMode: "contain",
    width: wp('6.67%'),
    height: hp('3%'),
    marginLeft: wp('4%'),
  },
  appIcon: {
    resizeMode: "contain",
    width: wp('25.56%'),
    height: hp('3.88%'),
    marginLeft: wp('1.39%'),
  },
  mainView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "red",
    width: wp("100%"),
    // height: hp("15%"),
    overflow: "hidden",
  },
  deliveryPointContainer: {
    flexDirection: "row",
    alignItems: "center",
    // left:5,
    // marginBottom: 10,
    // backgroundColor:"red"
  },
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    // marginTop:-20,
  },
  bannerCnt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: wp("100%"),
    paddingHorizontal: wp("4%"),
    fontFamily: "Mulish-Regular",
    paddingVertical: hp("1.2%"),
    backgroundColor: "#12a14f",
    marginBottom: hp("1%"),
    overflow: "hidden",
  },
  bannerCntLeft: {
    flexDirection: "row", // was column → changed to row for proper alignment
    alignItems: "center",
    flexShrink: 1, // allows content to wrap/fit within parent width
    flex: 1,
  },
  mapIcon: {
    width: wp('5%'),
    height: hp('2.25%'),
    resizeMode: "contain",
  },
  welcomeText: {
    fontSize: RFValue(12),
    fontWeight: "regular",
    color:"#cee9ca",
    textAlign: "center",
    // fontFamily: "Poppins-Regular"
  },
  center: {
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
  },
  tinyLogo: {
    width: wp('10.28%'),
    height: hp('4.625%'),
    resizeMode: "contain",
    // color: colors.green,
  },
  deliveryPoint: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    // width: '50%',
  },
});

export default homeHeaderStyles;
