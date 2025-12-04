import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

const MobileHomePageBannerStyle = StyleSheet.create({
  container : {
    backgroundColor: 'white',
  },
  images: {
    alignItems: "center",
    alignSelf:'center',
    // margin: 4,
    // marginLeft: 25,
    // marginHorizontal:25,
    // flexWrap: "wrap",
    // flexBasis: 1,
    height: wp('33%'),
    width: wp('95%'),
    resizeMode: "cover",
    // backgroundColor: colors.green,
    borderRadius: 20,
    // marginTop:10,
  },
});

export default MobileHomePageBannerStyle;