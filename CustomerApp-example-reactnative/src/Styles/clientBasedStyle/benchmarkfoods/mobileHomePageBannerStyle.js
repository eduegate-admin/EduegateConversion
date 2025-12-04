import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const MobileHomePageBannerStyle = StyleSheet.create({
    container: {
    backgroundColor: "white",
     height: hp("18%"),
    width: wp("100%"),
    // marginHorizontal: wp("20%"),
  },
  images: {
    alignItems: "center",
    alignSelf: "center",
    height: hp("18%"),
    width: wp("91.11%"),
    resizeMode: "stretch",
    borderRadius: 20,
  },
});

export default MobileHomePageBannerStyle;