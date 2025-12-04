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
    // backgroundColor: "#b6acacff",
    alignItems: "center",
    // justifyContent:"center",
    height:hp("7%"),
    paddingTop:hp("1%"),
  },
  SideMenuIcon: {
    resizeMode: "contain",
    width: wp('6.67%'),
    height: hp('3%'),
    marginLeft:  wp('4%'),
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
    justifyContent: "space-between",
    width: wp("100%"),
    // height: 60,
    flexDirection: "row",
    alignItems:"center",
    paddingHorizontal: wp('4%'),
    // backgroundColor:"yellow"
  },
  bannerCntLeft: {
    flexDirection: "column",
    justifyContent: "space-between",
    // alignSelf: "center",
    // backgroundColor:"yellow",
    width: wp("75%"),
  },
  mapIcon: {
    width: wp('5%'),
    height: hp('2.25%'),
    resizeMode: "contain",
  },
  welcomeText: {
    fontSize: RFValue(12),
    fontWeight: "regular",
    color: "#525252",
    textAlign: "center",
    fontFamily: "Poppins-Regular"
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
