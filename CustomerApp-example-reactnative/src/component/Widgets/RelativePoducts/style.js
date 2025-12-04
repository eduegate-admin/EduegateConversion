import { Dimensions, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const { width, height } = Dimensions.get("screen");
const styles = StyleSheet.create({
  container: {
    width: wp("100%"),
    // marginHorizontal: 15,
    marginVertical: hp('0.625%'),
    // backgroundColor: "red",
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#787878",
    // marginBottom: 10,
  },
  gradientButton: {
    width: wp("100%"),
    borderRadius: 20,
  },
  gradientButton2: {
    width: wp("36%"),
    height:  hp("4.8"),
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  commonView: {
    // marginLeft: wp('7.05%'),
    marginTop: hp('3.5%'),
    marginBottom: hp('2.375%'),
    // backgroundColor:"#000"
  },
  widgetTitleView: {
    // paddingHorizontal: 15,
    marginBottom: hp('1.5%'),
    // marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  arrowImage: {
   resizeMode: "contain",
    width:  wp('6.67%'), 
    height: hp('3%'),
    elevation: 5,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: "#9A9A9A",
    // borderWidth:1,
    // borderColor:"#525252"
    // padding:5,
  },
  widgetTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
    color: "#525252",
    fontFamily:"Poppins-SemiBold",
    left: wp('7.05%'),
  },
  widget: {
    backgroundColor: "#FFFFFF",
    // backgroundColor: 'red',
    // marginRight:  wp('4.22%'),
    marginLeft: wp('7.05%'),
    height:hp("32%"),
    width:wp('44%'),
    borderRadius: 15,
    elevation: 3,
    alignItems: "center",
    shadowColor: "##9B9B9B40",
    // justifyContent: "center",
  },
  imageTouchView: {
    // backgroundColor: "#000",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    height:hp("16%"),
    width:wp('44%'),
    resizeMode: "contain",
    // margin: 4,
    alignItems: "center",
    justifyContent: "center",
    // marginHorizontal:10,
    overflow: "hidden",
  },
  images: {
    borderRadius: 15,
    // margin: 4,
    height: hp('16%'),
    width: wp('44%'),
    resizeMode: "contain",
    // padding: 10,
    backgroundColor: "#fff",
    // borderRadius: 50,
    // elevation:1,
  },
  textView: {
    // paddingHorizontal: 15,
    // backgroundColor:'#1D9A',
    height: hp('9.7%'),
    width: wp('36%'),
    justifyContent:"center"
  },
  ProductName: {
    alignItems: "center",
    textAlign: "left",
    marginVertical: hp("0.5%"),
    // paddingVertical: 2,
    fontSize: RFValue(12),
    fontWeight: "500",
    color: "#525252",
    fontFamily:"Poppins-Medium",

  },
  rateText: {
    alignItems: "center",
    textAlign: "left",
    // paddingVertical: 2,
    fontSize: RFValue(14),
    fontWeight: "600",
    color: "#525252",
    fontFamily:"Poppins-SemiBold",

  },
  AddButtonView: {
    backgroundColor: "#1D9ADC",
    width: wp('36%'),
    height: hp('4.8%'),
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    // overflow:"hidden",
    // paddingRight: 15,
    borderRadius: 5,
  },
  AddText: {
    color: "#FFFFFF",
    fontSize: RFValue(12),
    fontWeight: "600",
    fontFamily:"Poppins-SemiBold",
  },
});

export default styles;
