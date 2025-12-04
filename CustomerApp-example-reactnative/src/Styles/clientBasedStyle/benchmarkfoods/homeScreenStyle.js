import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const homeScreenStyles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flatListContent: {
    paddingBottom: hp("10%"),
  },

  headerContainer: {
    alignItems: "center",
    paddingVertical: hp("1%"),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  errorView: {
    width: wp("100%"),
    height: hp("100%"),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: wp("75%"),
    height: hp("15%"),
    borderColor: "#E0E0E080",
    borderWidth: 1,
    elevation: 5,
    shadowColor: "#CFCFCF40",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  errorText: {
    fontSize: RFValue(14, 800),
    color: "#D9534F",
    textAlign: "center",
    marginBottom: hp("1%"),
    fontWeight: "600",
    fontFamily: "Poppins-Regular",
  },
  retryText: {
    fontSize: RFValue(13, 800),
    color: "#007AFF",
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    textDecorationLine: "underline",
  },
  noDataContainer: {
    width: wp("80%"),
    height: hp("20%"),
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#E0E0E080",
    borderWidth: 1,
    elevation: 5,
    shadowColor: "#CFCFCF40",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  noDataText: {
    fontSize: RFValue(16, 800),
    fontWeight: "600",
    textAlign: "center",
    color: "#525252",
    marginBottom: hp("1.5%"),
    fontFamily: "Poppins-Medium",
  },
  noDataSubtext: {
    fontSize: RFValue(14, 800),
    color: "#888",
    textAlign: "center",
    fontFamily: "Poppins-Regular",

    marginBottom: hp("2%"),
  },
  retryIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp("2%"),
    gap: 10,
  },
  retryingText: {
    fontSize: hp("1.7%"),
    color: "#28A745",
    marginLeft: wp("1%"),
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp("10%"),
  },
  emptyText: {
    fontSize: hp("2%"),
    fontWeight: "600",
    color: "#333",
    marginBottom: hp("0.5%"),
  },
  emptySubtext: {
    fontSize: hp("1.7%"),
    color: "#888",
    textAlign: "center",
    marginBottom: hp("2%"),
  },
  text: {
    fontSize: hp("2%"),
    fontWeight: "500",
    color: "#333",
  },
});

export default homeScreenStyles;
