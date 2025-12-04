import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: hp("1%"),
    backgroundColor: "#fff",
  },

  /* ---------- TITLE + VIEW ALL ---------- */
  dshMenuTitle: {
    paddingHorizontal: wp("4%"),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp("1%"),
  },

  widgetTitle: {
    fontSize: RFValue(18),
    fontFamily: "Poppins-SemiBold",
    color: "#000",
  },

  viewAll: {
    fontSize: RFValue(13),
    fontFamily: "Poppins-Medium",
    color: "#1F8D49",
  },

  /* ---------- CATEGORY CARD GRID ---------- */
  flatList: {
    paddingHorizontal: wp("2%"),
    alignItems: "center",        // ✅ Center items horizontally
    justifyContent: "center",    // ✅ Center last row items
  },

  TouchableOpacity: {
    width: wp("30%"),             // ✅ Make 3-column layout
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: hp("1.5%"),
    alignItems: "center",
    marginHorizontal: wp("1.5%"), // ✅ Horizontal spacing
    marginVertical: hp("1.8%"),   // ✅ Vertical spacing
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  /* ---------- IMAGE ---------- */
  image: {
    width: wp("22%"),
    height: hp("12%"),
    borderRadius: 10,
    resizeMode: "cover",
  },

  /* ---------- TEXT UNDER IMAGE ---------- */
  itemName: {
    fontSize: RFValue(12),
    marginTop: hp("0.8%"),
    color: "#000",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
});

export default styles;
