import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
    
const MapModalStyle = StyleSheet.create({
  container: {
     flex: 1,
     backgroundColor: "#fff",
    //  marginTop: Platform.OS === "android" ? StatusBar.currentHeight || 24 : 44,
   },
  ModalInnerView: { flex: 1 },
  modalHeader: {
    height: hp("6%"),
    width: wp("100%"),
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#f8f8f8",
    paddingHorizontal: wp("4.44%"),
  },
  headerLeft: { right: wp("4.44%") },
  modalHeaderTitle: {
    fontSize: RFValue(16),
    color: "#133051",
    fontFamily: "Poppins-Regular",
    // left: wp("15%"),
  },

  mapSearchIcon: { resizeMode: "contain", width: wp("6%"), height: wp("6%") },
  input: {
    margin: wp("2%"),
    marginHorizontal: wp("4.44%"),
    paddingLeft: wp("5%"),
    backgroundColor: "#fff",
    borderRadius: wp("2%"),
    fontSize: RFValue(14),
    borderWidth: 1,
    borderColor: "#B2B2B2",
    fontFamily: "Poppins-Regular",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  error: {
    textAlign: "center",
    color: "red",
    padding: wp("1.5%"),
    fontFamily: "Poppins-Regular",
  },
  prediction: {
    padding: wp("3.5%"),
    borderBottomColor: "#B2B2B2",
    borderBottomWidth: 1,
    backgroundColor: "#fff",
  },
  IndicatorView: {
    backgroundColor: "#fff",
    height: wp("100%"),
    width: hp("100%"),
    justifyContent: "center",
    alignItems: "center",
  },
  AddressBox: {
    width: wp("100%"),
    height: hp("35%"),
    backgroundColor: "#133051",
    alignItems: "center",
    borderTopLeftRadius: wp("15%"),
    borderTopRightRadius: wp("15%"),
  },
  AddressBoxText: {
    color: "#fff",
    fontSize: wp("6.5%"),
    fontFamily: "Poppins-Regular",
    lineHeight: hp("8%"),
  },
 mapListScrollView: { paddingTop: 20 },
 addressItem: {
    flexDirection: "row",
    width: wp("100%"),
    paddingVertical: hp("2%"),
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF",
  },
   addressSelectionBox: {
    width: "70%",
    marginLeft: 20,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  addressText: {
    fontSize: wp("3.8%"),
    color: "#ffffff",
    fontFamily: "Poppins-Regular",
  },
   pickButton: {
    flexDirection: "row",
    backgroundColor: "#58BB47",
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("2.5%"),
    borderRadius: wp("1.5%"),
    marginRight: wp("3.5%"),
    alignItems: "center",
    justifyContent: "center",
  },
 pickButtonText: {
    fontSize: wp("3.8%"),
    color: "white",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
  arrow: {
    fontSize: wp("3.8%"),
    color: "#ffffff",
    transform: [{ rotate: "-30deg" }],
    marginRight: wp("2.5%"),
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
  });

export default MapModalStyle;
