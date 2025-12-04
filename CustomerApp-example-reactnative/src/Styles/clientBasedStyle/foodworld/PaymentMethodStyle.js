import { StyleSheet } from "react-native";
import {
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const PaymentMethodStyle = StyleSheet.create({
 contentHeader: {
    marginHorizontal: 10,
    marginTop: 8,
  },
  contentHeaderText: {
    fontSize: 22,
    fontWeight: 500,
    left: 11,
    color: "#133051",
  },
  paymentMethod: {
    backgroundColor: "#FFFFFF",
    marginVertical: 7,
    width: "90%",
    // height: 208,
    paddingHorizontal:10,
    alignSelf: "center",
    borderRadius: 15,
    flexDirection: "column",
  },
  AddressView: {
    width: "100%",
    // height: "100%",
    borderRadius: 15,
    overflow: "hidden",
    paddingHorizontal:10,

  },
  AddressTextView: {
    width: "100%",
    height: hp("7%"),
    // backgroundColor: 'blue',
    justifyContent: "space-around",
    flexDirection: "row",
    backgroundColor: "white",
    // paddingHorizontal:10,
  },
  AddressTextHead: {
    fontSize: 20,
    fontWeight: 700,
    textAlign: "left",
    color: "#133051",
  },
  AddressText: {
    fontSize: 16,
    fontWeight: 700,
    textAlign: "left",
    color: "#133051",
  },
  paymentTypeText: {
    fontSize: 18,
    fontWeight: 600,
    textAlign: "left",
    color: "#252525",
  },
  buttonImage: { resizeMode: "contain", width: 22, height: 22 },
  iconImage: { resizeMode: "contain", width: 25, height: 25 },
  ButtonImageView: {
    width: "15%",
    height: "100%",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  iconView: {
    width: "15%",
    height: "100%",
    borderRadius: 15,
    justifyContent: "center",
  },
  payTextView: {
    width: "70%",
    height: "100%",
    borderRadius: 15,
    justifyContent: "center",
    //    backgroundColor: "red",
  }, 
});

export default PaymentMethodStyle;
