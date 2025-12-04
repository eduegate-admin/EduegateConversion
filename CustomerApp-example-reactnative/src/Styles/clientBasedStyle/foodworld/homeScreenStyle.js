import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from "../../../config/colors";

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
    fontWeight: "bold",
  },
  flatListContent: {
    paddingBottom: 100,
  },
  headerContainer: {
    backgroundColor: colors.lightWhite,
    width: wp("100%"),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  images: {
    margin: 4,
    flexWrap: "wrap",
    flexBasis: 1,
    height: 100,
    width: 100,
    resizeMode: "cover",
    backgroundColor: colors.green,
  },
  Images: {
    marginLeft: 15,
    marginBottom: 10,
    flexWrap: "wrap",
    flexBasis: 1,
    height: hp("14%"),
    width: wp("100%") - 60,
    resizeMode: "contain",
    borderRadius: 10,
    backgroundColor: "#fefefef1",
  },
});

export default homeScreenStyles;
