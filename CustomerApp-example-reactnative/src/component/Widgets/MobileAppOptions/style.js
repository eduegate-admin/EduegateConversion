import { Dimensions, StyleSheet } from "react-native";
const { width, height } = Dimensions.get("screen");

const styles = StyleSheet.create({
  container: {
    width: width,
    justifyContent: "space-around",
    flexDirection: "row",
    alignItems: "Center",
    flexDirection: "row",
    // backgroundColor: colors.lightWhite,
  },
  commonView: {
    marginVertical: 15,
    // marginHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#fff",
    // marginHorizontal: 5,
    width: width* 0.31,
    height: height* 0.11,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    elevation:15,
  },
  Text: {
    textAlign: 'center',
    // bottom:-5
    fontSize: 17,
    fontWeight: "700"
  },
  imageView: {
    justifyContent: 'center',
    alignItems: "center",
    // backgroundColor:'blue',
    width: width* 0.25,
    height: height* 0.08,
    // bottom:-5
  },
  imageWish: {
    width: width* 0.2,
    height:  height* 0.075,
    resizeMode: "contain",
    alignItems:'baseline',
  },
  imagePlus: {
    width: width* 0.2,
    height:  height* 0.075,
    resizeMode: "contain",
    alignItems:'baseline',
  },
  imageBooklet: {
    width: width* 0.2,
    height:  height* 0.075,
    resizeMode: "contain",
    alignItems:'baseline',
  },
});

export default styles;
