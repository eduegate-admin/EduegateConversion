import { StyleSheet } from "react-native";
import {
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const homeScreenStyles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: 'white',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
  },
  flatListContent: {
    paddingBottom: hp("10%"),
    // marginTop:-100,
    // position:'absolute'
  },
  headerContainer: {
    // backgroundColor: "#000",
    // padding: hp("3%"),
    alignItems: "center",
  },
});

export default homeScreenStyles;
