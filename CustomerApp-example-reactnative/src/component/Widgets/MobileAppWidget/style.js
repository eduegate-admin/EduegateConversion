import { StyleSheet } from "react-native";
import colors from "../../../config/colors";

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-around",
    flexDirection: "row",
    // width:'100%',
    alignItems: "Center",
    flexDirection: "row",
    backgroundColor: colors.lightWhite,
  },
  commonView: {
    marginVertical: 15,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginHorizontal: 2,
    width: 115,
    aspectRatio: 1.25, // 115/90 = ~1.28 to maintain similar proportions
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },
  Text: {
    textAlign: 'center',
    bottom:-5
  },
  imageView: {
    justifyContent: 'center',
    alignItems: "center",
    // backgroundColor:'blue',
    width: 60,
    height: 50,
    bottom:-5
  },
  imageWish: {
    width: 45,
    height: 45,
    resizeMode: "contain",
    alignItems:'baseline',
  },
  imagePlus: {
    width: 48,
    height: 48,
    resizeMode: "contain",
    alignItems:'baseline',
  },
  imageBooklet: {
    width: 46,
    height: 46,
    resizeMode: "contain",
    alignItems:'baseline',
  },
});

export default styles;
