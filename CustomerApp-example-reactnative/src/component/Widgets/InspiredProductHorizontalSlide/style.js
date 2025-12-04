import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import colors from "../../../config/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: wp("100%"),
    paddingHorizontal: 10,
    padding: 5,
    // elevation:5,
    // marginTop: -100,
    // backgroundColor: colors.darkGrey,
  },
  dshMenuCnt: {
    paddingTop: 15,
    paddingHorizontal: 3,
    backgroundColor: "white",
    borderRadius: 15,
    height:360,
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
  viewAll: {
    color: colors.green,
    fontSize: 12,
  },
  widget: {
    backgroundColor: 'white',
    marginHorizontal: 6,
    height: 295,
    width: 160,
    borderRadius:30,
    elevation:3,
    alignItems: "center",
    // justifyContent: "center",
  },
  imageTouchView: {
    // elevation: 35,
    // backgroundColor: "red",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: 150,
    width: 160,
    resizeMode: "contain",
    // margin: 4,
    alignItems: "center",
    justifyContent: "center",
    // marginHorizontal:10,
    overflow:'hidden',
  },
  images: {
    margin: 4,
    height: 150,
    width: 160,
    resizeMode: "contain",
    // padding: 10,
    backgroundColor: "#fff",
    // borderRadius: 50,
    elevation:3,
    
  },
  textView: {
    // backgroundColor:'red',
    height:95,
    width:135,
  },
  PriceCommonView: {
    flexDirection:'row',
    alignItems:'baseline',
    
  },
  ProductPrice: {
    alignItems:'center',
    textAlign:'left',
    bottom:-5,
    fontSize:30,
    fontWeight:'900',
  },
  AedText: {
    fontSize:13,
    textAlign:'left',
    left:2,
  },
  ProductName: {
    alignItems:'center',
    textAlign:'left',
    bottom:-5,
    fontSize:15,
    fontWeight:'500',
  },
});

export default styles;
