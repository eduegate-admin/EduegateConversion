import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from "../../../config/colors";
import { RFValue } from "react-native-responsive-fontsize";

const LocationAndAddressCardStyle = StyleSheet.create({
  container: {
    backgroundColor: colors.background || '#FFFFFF',
    marginHorizontal: wp('4%'),
    marginVertical: hp('1.2%'),
    borderRadius: 16,
    paddingVertical: hp('2.2%'),
    paddingHorizontal: wp('4.5%'),
    // Subtle shadow for that floating white card effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4, // slightly more lift for Android

    // Optional smoothness
    borderWidth: 0.6,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  LocationContain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp('1.5%'),
  },
  locationTextAndIcon: {
    marginTop: -6,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationTextView: {
    flex: 1,
    flexDirection: "column",
  },
  locationIcon: {
    width: 22,
    height: 22,
    tintColor: colors.primary || '#4A90E2',
    marginRight: wp('2.5%'),
    marginTop: 2,
  },
  locationText: {
    fontSize: RFValue(15, 800),
    fontWeight: '600',
    color: colors.textHeading || '#1A1A1A',
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  locationText2: {
    fontSize: RFValue(13, 800),
    fontWeight: '400',
    color: colors.textSecondary || '#666666',
    fontFamily: 'Poppins-Regular',
    lineHeight: RFValue(20, 800),
    letterSpacing: 0.1,
  },
  editIconView: {
    padding: 8,
    margin: -8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    width: 20,
    height: 20,
    tintColor: colors.primary || '#4A90E2',
  },
  AddAddressViewContainer: {
    marginTop: hp('2%'),
    alignItems: 'center',
  },
  AddAddressView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('5%'),
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primary || '#4A90E2',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(74, 144, 226, 0.05)',
    width: '100%',
  },
  AddressText: {
    fontSize: RFValue(14, 800),
    fontWeight: '600',
    color: colors.primary || '#4A90E2',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  contentHeader: {
    marginHorizontal: 7,
    marginTop: 7,
    marginBottom: -7,
    borderRadius: 15,
  },
  contentHeaderText: {
    fontSize: RFValue(14, 800),
    fontWeight: "600",
    color: colors.textSecondary,
    fontFamily: "Poppins-SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    left: 11,
    color: colors.textSecondary,
    marginBottom: hp("0.8%"),
  },
  DeliverSection: {
    width: '100%',
    marginTop: hp('-1%'),
    backgroundColor: 'transparent',
  },
  AddressView: {
    width: "100%",
    // height: "100%",
    borderRadius: 15,
    overflow: "hidden",
  },
  AddressTextView: {
    // backgroundColor: 'blue',
    justifyContent: "space-around",
    flexDirection: "row",
    backgroundColor: "white",
  },
  AddressTextHead: {
    fontSize: 20,
    fontWeight: 700,
    textAlign: "left",
    color: "#133051",
  },
  AddressText: {
    fontSize: RFValue(13, 800),
    fontWeight: "600",
    textAlign: "center",
    // color: colors.primary,
    fontFamily: "Poppins-SemiBold",
  },
});
export default LocationAndAddressCardStyle;
