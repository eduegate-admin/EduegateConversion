import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from "../../../config/colors";

const tabBarStyle = StyleSheet.create({
      container: {
      flexDirection: "row",
      width: wp("100%"),
      height:hp("9%"),
      backgroundColor: "#FFFFFF",
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      elevation: 10,
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
    },
    TouchableOpacity: {
      flex: 1,
      alignItems: "center",
      backgroundColor: colors.transparent,

    },
    IconView: {
      width: 45,
      height: 45,
      justifyContent: "center",
      alignItems: "center",
    },
    Icon: {
      width: 30,
      height: 30,
      resizeMode: "contain",
    },
    Text: {
      backgroundColor: colors.transparent,
      fontSize: 14,
      fontWeight: 500,
    },
});

export default tabBarStyle;
