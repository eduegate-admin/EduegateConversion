import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import colors from "../../../config/colors";

const DrawerStyle = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Profile Section
  accountTouch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("2.5%"),
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  welcomeView: {
    flex: 1,
    justifyContent: "center",
    paddingRight: wp("3%"),
  },

  welcomeText: {
    fontSize: RFValue(12, 800),
    fontFamily: "Poppins-Regular",
    color: colors.background,
    opacity: 0.95,
    marginBottom: hp("0.3%"),
  },

  Name: {
    fontSize: RFValue(16, 800),
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
    color: colors.background,
    numberOfLines: 1,
  },

  accountImgView: {
    width: wp("14%"),
    height: wp("14%"),
    borderRadius: wp("7%"),
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  image: {
    width: wp("13%"),
    height: wp("13%"),
    borderRadius: wp("6.5%"),
    resizeMode: "cover",
  },

  // Menu Items Section
  commonMargin: {
    paddingTop: hp("1.5%"),
    paddingBottom: hp("10%"),
    paddingHorizontal: wp("4%"),
  },

  drawerView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: hp("1.6%"),
    paddingHorizontal: wp("3%"),
    marginBottom: hp("0.5%"),
    borderRadius: 10,
    backgroundColor: colors.background,
  },

  drawerInnerView: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  icon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
    marginRight: wp("4%"),
    tintColor: colors.primary,
  },

  iconContainer: {
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("4%"),
  },

  drawerText: {
    fontSize: RFValue(14, 800),
    fontFamily: "Poppins-Regular",
    fontWeight: "400",
    color: colors.textPrimary,
    flex: 1,
  },

  chevronIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
    tintColor: colors.textTertiary,
    opacity: 0.5,
  },

  // Version and Social Section
  Version: {
    fontSize: RFValue(10, 800),
    fontFamily: "Poppins-Regular",
    color: colors.textTertiary,
    textAlign: "center",
    marginBottom: hp("1.5%"),
  },

  socialPlatform: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp("8%"),
    paddingVertical: hp("1.5%"),
    marginBottom: hp("2%"),
    gap: wp("8%"),
  },

  socialIcon: {
    width: wp("10%"),
    height: wp("10%"),
    resizeMode: "contain",
  },

  socialIconWrapper: {
    width: wp("11%"),
    height: wp("11%"),
    borderRadius: wp("5.5%"),
    backgroundColor: colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
});

export default DrawerStyle;
