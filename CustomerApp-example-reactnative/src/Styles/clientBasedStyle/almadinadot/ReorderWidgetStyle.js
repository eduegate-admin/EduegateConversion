import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const ReorderWidgetStyle = StyleSheet.create({
  container: {
    flex: 1,
    width: wp("100%"),
    // paddingHorizontal: 10,
    // paddingBottom: 10,
    paddingTop: hp("1%"),
    // backgroundColor: "#000",
  },
  arrow :{
    resizeMode: "contain",
    width:  wp('6.67%'), 
    height: wp('6.67%'),
    elevation: 5,
    borderRadius: 50,
    backgroundColor: "white",
  },
  dshMenuCnt: {
    // paddingTop: 15,
    paddingHorizontal: wp('1.8%'),
    // backgroundColor: "white",
    // borderRadius: 15,
  },
  dshMenuTitle: {
    // width:wp("100%"),
    paddingHorizontal:  wp('1.8%'),
    // marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  widgetTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
    color: "#525252",
    left: wp("1.5%"),
    fontFamily:"Poppins-SemiBold",
  },
  viewAll: {
    color: 'black',
    fontSize: 15,
  },
  touch: {
    // backgroundColor: 'green',
    marginHorizontal:wp("0.5%"),
    height: hp('14%'),
    width:  wp('24%'),
    alignItems:"center",
  },
  imageView: {
    // elevation: 35,
    // backgroundColor: "red",
    borderRadius: 10,
    height: hp('10%'),
    width: wp('22.22%'),
    resizeMode: "contain",
    // margin: 4,
    alignItems: "center",
    justifyContent: "center",
    // marginHorizontal: 10,
  },
  images: {
    margin: 4,
    // flexWrap: "wrap",
    // flexBasis: 1,
    height: hp('9.4%'),
    width: wp('20.83%'),
    resizeMode: "contain",
    // padding: 10,
    backgroundColor: "#DEECFA80",
    borderRadius: 15,
    // elevation: 3,
  },
  Text: {
    alignItems: "center",
    textAlign: "center",
    // bottom: -5,
    fontSize: RFValue(12,800),
    fontWeight: "regular",
    color: "#525252",
    overflow: "hidden",
    fontFamily:"Poppins-Regular"
  },
});

export default ReorderWidgetStyle;
