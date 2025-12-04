import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    height: "auto",
    width: wp("100%"),
  },
});

export default styles;
