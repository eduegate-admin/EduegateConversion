import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const BgHomeHeaderStyle = StyleSheet.create({
   mainView: {
    backgroundColor: "#FFFFFF",
  },
  container: {
    // backgroundColor: "#c72121ff",
    width: wp("100%"),
    height: hp("47%"),
  },
  imageBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  imageBackgroundImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  image: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  headerContainer: {
    // backgroundColor: "#ad2727ff",
    paddingHorizontal: wp("4.44%"),
    paddingTop: wp("4.44%"),
  },
  bannerCnt: {
    // backgroundColor: "#35d14fff",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  bannerCntLeft: {
    width: wp("62.24%"),
    // backgroundColor: "#171807ff",
  },
  welcomeText: {
    fontSize: RFValue(16, 800),
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#ffffff",
  },
  deliveryPointContainer: {
    // backgroundColor: "#ffffffff",
    width: wp("62.24%"),
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: {
    width: wp("5%"),
    height: wp("5%"),
    resizeMode: "contain",
  },
  deliveryPoint: {
    fontSize: RFValue(12, 800),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    color: "#FFFFFF",
  },
  bannerSearch: {
    alignItems: "center",
    marginBottom: hp("2.22"),
  },
  bannerCntRight: {
    // backgroundColor: "#2c29e6ff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: wp("4.44%"),
  },
  contactIcon: {
    width: wp("6.67%"),
    height: wp("6.67%"),
    resizeMode: "contain",
  },
  iconButton: {
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    width: wp("13.33%"),
    height: wp("13.33%"),
    backgroundColor: "#EEF4EE66",
  },
  banner: {
    width: '100%',
    aspectRatio: 3.5, // Increased to make it even shorter
    borderRadius: 15,
    resizeMode: 'cover',
    alignSelf: 'center',
    marginTop:-3
  },
  });

export default BgHomeHeaderStyle;
