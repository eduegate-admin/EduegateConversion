import { Platform, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
 
const AccountStyle = StyleSheet.create({
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
  gradientButton: {
    width: wp("89%"),
    height: hp('17.875%'),
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    // borderRadius: 10,
    // marginTop: 20,
    overflow: "hidden",
    alignItems: "center",
    // paddingTop: 15,
  },
  ProfileSection: {
    // backgroundColor: "red",
    marginTop: hp('2.5%'),
    width: wp("89%"),
    height: hp('17.875%'),
    alignSelf: "center",
    alignItems: "center",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    flexDirection: "column",
  },
  profileImage: {
    resizeMode: "contain",
    width: hp('7.5%'),
    height: hp('7.5%'),
    backgroundColor: "#ffff",
    borderRadius: 50,
    marginTop: hp('2.75%')
  },
  NameView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#FFFFFF",
    marginTop: hp('1.25%'),
  },
  Name: {
    fontSize: RFValue(14),
    fontWeight: 600,
    // lineHeight: 30,
    color: "#FFFFFF",
    fontFamily: 'Poppins-SemiBold'
  },
  editIcon: {
    resizeMode: "contain",
    width: 20,
    height: 20,
    alignItems: "center",
    left: 10,
  },
  phone: {
    fontSize: RFValue(12),
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: 400,
    fontFamily: 'Poppins-Regular',
    top: -hp('0.8%'),
  },
  ContentSection: {
    backgroundColor: "#ffffff",
    width: wp("89%"),
    // height: hp("61%"),
    alignSelf: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: "column",
    // paddingTop: 15,
    // marginBottom: hp("8%"),
    paddingHorizontal: wp("3.5%"),
  },
  ContentView: {
    width: "100%",
    height: hp("6%"),
    overflow: "hidden",
    justifyContent: "space-between",
    flexDirection: "row",
    // backgroundColor: "blue",
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
    marginBottom: 1,
  },
  IconView: {
    width: "0%",
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
    width: "80%",
    height: "100%",
    justifyContent: "center",
    // backgroundColor: "yellow",
  },
  AddressTextView: {
    justifyContent: "space-around",
    flexDirection: "row",
  },
  screenText: {
    fontSize: RFValue(14),
    fontWeight: 400,
    textAlign: "left",
    color: "#525252",
  },
  rightArrowView: {
    width: "15%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  rightArrowIcon: {
    resizeMode: "contain",
    width: hp('2%'),
    height: hp('2%'),
  },
  LogOutCommon: {
    backgroundColor:"#FFF",
    width: "100%",
    height:  hp("6%"),
    overflow: "hidden",
    flexDirection: "row",
   marginTop: Platform.OS === "android" ? hp('23.75%') : hp('15.75%')
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
    width: "100%",
    height: "100%",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
    // backgroundColor:"#000",
    paddingLeft: 10,
  },
  LogOutText: {
    fontSize: RFValue(14),
    fontWeight: 400,
    textAlign: "left",
    color: "#525252",
    fontFamily: 'Poppins-SemiBold',
  },
});
 
export default AccountStyle;