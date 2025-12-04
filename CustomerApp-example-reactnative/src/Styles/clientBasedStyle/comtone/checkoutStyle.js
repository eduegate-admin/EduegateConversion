import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from "../../../config/colors";
import { RFValue } from "react-native-responsive-fontsize";

const CheckoutStyle = StyleSheet.create({
   Container: {
    justifyContent: "flex-start",
    width: wp("100%"),
  },
  ScrollView: {
    width: "100%",
    paddingTop: hp("3.5%"),
    paddingBottom: hp("12%"),
  },
  sectionHeader: {
    fontSize: RFValue(12, 800),
    fontWeight: "600",
    color: colors.textSecondary,
    fontFamily: "Poppins-SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: hp("0.8%"),
    marginTop: hp("1.2%"),
    paddingHorizontal: wp("3.5%"),
  },
  deliveryOptionsCard: {
    backgroundColor: "transparent",
    marginHorizontal: wp("3.5%"),
    marginBottom: -2,
    borderRadius: 10,
    padding: wp("2.5%"),
  },
  deliveryOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: wp("-2%"),
    paddingVertical: hp("1.8%"),
    paddingHorizontal: wp("2%"),
    borderRadius: 12,
    marginBottom: hp("0.8%"),
    borderWidth: 1.5,
    borderColor: colors.border || '#E0E0E0',
    backgroundColor: "#FFFFFF",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 0.6,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  deliveryOptionItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
    elevation: 1,
  },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.borderMedium,
    marginRight: wp("2%"),
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.primary,
  },
  deliveryOptionText: {
    fontSize: RFValue(12, 800),
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: colors.textSecondary,
    flex: 1,
  },
  deliveryOptionTextSelected: {
    color: colors.textHeading,
    fontWeight: "600",
  },
});

export default CheckoutStyle;
