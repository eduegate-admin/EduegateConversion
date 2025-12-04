import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const mainCategoryWidgetStyle = StyleSheet.create({
    container: {
    flex: 1,
    marginVertical: hp("5.0%"),
    backgroundColor: "#ffffffff",
    // backgroundColor: "red",
    borderRadius: 20,
  },
  subContainer: {
    marginTop: hp("-3%"),
   

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
    fontFamily: "Poppins-SemiBold"
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
    marginHorizontal: wp('1.5%'),
    marginVertical: hp('1.8%'),
    width: wp("30%"),
    // backgroundColor:"#000"
  },
  imageView: {
    alignItems: "center",
    justifyContent: "space-around",
  },
  image: {
    width: wp('27%'),
    aspectRatio: 1,
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
    fontFamily: "Poppins-Regular"
  },
  viewAll: {
    color: "black",
    fontSize: RFValue(12, 800),
    color: "#23b36bff",
  },
  arrow: {
    resizeMode: "contain",
    width: wp('6.67%'),
    height: wp('6.67%'),
    elevation: 5,
    borderRadius: 50,
    backgroundColor: "white",
  },
});

export default mainCategoryWidgetStyle;
