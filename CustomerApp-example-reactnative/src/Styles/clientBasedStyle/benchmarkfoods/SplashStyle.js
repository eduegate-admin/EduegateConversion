import { Dimensions, Platform, StyleSheet } from "react-native";

const {width,height} = Dimensions.get('screen');

const SplashStyle = StyleSheet.create({
  container: {
    marginTop: Platform.OS === "android" ? 30 : 0,
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    width: width,
    height: height,
  },
  video: {
    width: '100%',
    height: '100%',
    resizeMode:'contain',
  },
})

export default SplashStyle;