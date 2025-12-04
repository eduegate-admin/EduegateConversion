import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const AddressStyle = StyleSheet.create({
  MainScroll: {
    width: wp("100%"),
    height: hp("100%"),
    backgroundColor: "#FFF",
  },
  formContainer: {
    backgroundColor: "#ffffff",
    width: wp("100%"),
    alignSelf: "center",
  },
  mapContainer: {
    width: wp("90%"),
    height: hp("30%"),
    alignSelf: "center",
    borderRadius: wp("5%"),
    overflow: "hidden",
    marginTop: hp("1%"),
    backgroundColor: "#000",
  },
  inputCommonView: { paddingBottom: 30 },
  commonViewInput: {
    marginTop: hp("5%"),
  },
  inputLabel: {
    position: "absolute",
    top: -hp("1.3%"),
    left: wp("10%"),
    backgroundColor: "#FFFFFF",
    paddingHorizontal: wp("1.5%"),
    fontSize: RFValue(12),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    // paddingTop: hp("2.5%"),
    color: "#525252",
    zIndex: 1,
  },
  inputLabel2: {
    // position: "absolute",
    top: hp("3.3%"),
    justifyContent:"center",
    alignSelf:"flex-end",
    alignItems:"center",
    right: wp("4.44%"),
    // width:wp("50%"),
    borderColor:"#DBDBDB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: wp("1.5%"),
    fontSize: RFValue(12),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    borderWidth:1,
    borderRadius:12,
    paddingVertical:5,
    paddingHorizontal:15,
    // paddingTop: hp("2.5%"),
    color: "#525252",
    zIndex: 1,
  },
  AddressBoxWithAutoTag: {
    margin: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    elevation: 3,
    borderWidth: 1,
    marginTop: 20,
  },
  ContentLine: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  AddressLineText: {
    fontSize: wp("4.5%"),
    color: "#525252",
    paddingTop: hp("1.5%"),
    fontFamily: "Poppins-Regular",
  },
  quantityTouchable: {
    width: wp("91.11%"),
    height: hp("5.75%"),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  gradientButton2: {
    width: wp("91.11%"),
    height: hp("5.75%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
  },
  addToCartButton: {
    width: wp("91.11%"),
    height: hp("5.75%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
  },
  addToCartText: {
    color: "white",
    fontSize: RFValue(14, 800),
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
  },
  });

export default AddressStyle;
