import { Dimensions, StyleSheet } from "react-native";
const { width, height } = Dimensions.get("screen");

const WelcomeStyle = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: width,
    height: height,
    backgroundColor: "#fff",
  },
  content: {
    // justifyContent: "center",
    alignItems: "center",

    width: width * 0.81,
    height: height * 0.9,
    zIndex: 1,
  },
  imageView: {
    // width: width*0.8,
    //  height: height*0.12,
  },
  image: {
    overflow: "hidden",
    width: width * 0.8,
    height: height * 0.12,
    alignSelf: "center",
    justifyContent: "center",
    backgroundColor: "red",
    alignItems: "center",
    top: width * 0.46,
    resizeMode:"contain"
  },
  ButtonContainer: {
    flexDirection: "column",
    alignItems: "center",
    position: "absolute",
    bottom: height * 0.052,
    // backgroundColor:'#000',
    width: width * 0.8,
  },
  Text: { fontSize: width * 0.045, lineHeight: 70, fontWeight: "600" },
  ButtonView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: width * 0.78,
  },
  button: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#58BB47",
    width: width * 0.375,
    height: width * 0.1,
    justifyContent: "center",
  },
  ButtonText: {
    fontWeight: 500,
    fontSize: width * 0.04,
    textAlign: "center",
  },
});

export default WelcomeStyle;
