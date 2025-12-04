import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";


const mainCategoryWidgetStyle = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical:hp("2.5%"),
    // backgroundColor: "#000",
  },
  subContainer: {
    margin: wp("1.8%"),
    // backgroundColor: "red",
  },
   dshMenuTitle: {
    paddingHorizontal: wp("3%"),
    // marginBottom: hp("0.5%"),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  widgetTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
    color: "#525252",
    fontFamily:"Poppins-SemiBold"
  },
  imageContainer: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    // marginVertical: 10,
  },
  flatList: {
    // backgroundColor: colors.lightGrey,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  TouchableOpacity: {
    alignItems: "center",
    // justifyContent:'space-between',
    marginHorizontal:  wp('1.2%'),
    // marginVertical:  hp('1.375%'),
    width: wp("21%"),
    height: hp("13.5%"),
    // backgroundColor:"#000"
  },
  imageView: {
    alignItems: "center",
    justifyContent: "space-around",
  },
  image: {
    width:  wp('18.61%'),
    height:  hp('8.25%'),
    resizeMode: "contain",
    backgroundColor: "#DEECFA80",
    borderRadius: 15,
  },
  itemName: {
    fontSize: RFValue(12, 800),
    color: "#525252",
    fontWeight: "400",
    textAlign: "center",
    marginTop: hp('0.54%'),
    fontFamily:"Poppins-Regular"
  },
  viewAll: {
    color: "black",
    fontSize: 15,
  },
  arrow: {
     resizeMode: "contain",
    width:  wp('6.67%'), 
    height: wp('6.67%'),
    elevation: 5,
    borderRadius: 50,
    backgroundColor: "white",
  },
  });

export default mainCategoryWidgetStyle;
