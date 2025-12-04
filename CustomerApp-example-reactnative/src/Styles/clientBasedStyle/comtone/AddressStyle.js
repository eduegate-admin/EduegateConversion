import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const AddressStyle = StyleSheet.create({
  MainScroll: { paddingBottom: 100 },
  formContainer: {
    backgroundColor: "#ffffff",
    width: wp("95%"),
    alignSelf: "center",
    borderRadius: wp("2.5%"),
    elevation: 10,
    marginTop: hp("1.5%"),
  },
  mapContainer: {
    width: wp("90%"),
    height: hp("30%"),
    alignSelf: "center",
    borderRadius: wp("5%"),
    overflow: "hidden",
    marginTop: hp("1%"),
  },
  inputCommonView: { paddingBottom: 30 },

  inputLabel: {
    fontSize: wp("4.5%"),
    color: "#000",
    paddingLeft: wp("5%"),
    lineHeight: hp("5%"),
    paddingTop: hp("2.5%"),
    fontFamily: "Poppins-Regular",
  },
  AddressBoxWithAutoTag: {
    margin: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    elevation: 3,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 20,
  },
  ContentLine: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  AddressLineText: {
    fontSize: wp("4.5%"),
    color: "#000",
    paddingTop: hp("1.5%"),
    fontFamily: "Poppins-Regular",
  },
  });

export default AddressStyle;
