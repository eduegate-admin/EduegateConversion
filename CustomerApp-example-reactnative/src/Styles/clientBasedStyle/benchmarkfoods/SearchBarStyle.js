import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const SearchBarStyle = StyleSheet.create({
    container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: wp("100%"),
    marginVertical: hp("1.8%"),
    paddingHorizontal: wp("4.44%"),
    height: hp("6%"),
    // backgroundColor: "green",
  },
  Container: {
    borderWidth: 0.5,
    borderColor: "#FFF",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 16,
    paddingLeft: wp("4.44%"),
    // width: wp("72.5%"), if cam needed
    width: wp("91.11%"), //if cam not needed

    height: hp("6.25%"),
    backgroundColor: "#FFF",
    shadowColor: "#8E8E9E",
    elevation: 5,
  },
  camView: {
    borderWidth: 0.5,
    borderColor: "#FFF",
    // justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 16,
    // paddingHorizontal: 15,
    width: wp("13.89%"),
    height: hp("6.25%"),
    justifyContent: "center",
    backgroundColor: "#FFF",
    shadowColor: "#8E8E9E",
    elevation: 5,
  },
  Icon: {
    width: wp("5.56%"),
    height: hp("2.5%"),
    resizeMode: "contain",
  },
  FilterIcon: {
    width: wp("6.67%"),
    height: hp("3%"),
    resizeMode: "contain",
    // backgroundColor:"#000"
  },
  innerView: {
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    fontSize: RFValue(14),
    fontWeight: "regular",
    left: wp("1.39%"),
    color: "#525252",
  },
  });

export default SearchBarStyle;
