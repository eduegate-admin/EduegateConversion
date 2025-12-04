import { Dimensions, StyleSheet, I18nManager } from "react-native";
const { width, height } = Dimensions.get('screen');

const LoginStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 30,
    width: width,
    height: height,
  },
  headerContent: {
    marginTop: height * 0.07,
    width: width * 0.76,
  },
  WelcomeText: {
    color: "#133051",
    textAlign: I18nManager.isRTL ? "right" : "left",
    fontSize: width * 0.085,
    fontWeight: "700",
  },
  createText: {
    color: "#252525",
    textAlign: I18nManager.isRTL ? "right" : "left",
    fontSize: width * 0.05,
    fontWeight: "600",
    lineHeight: 40,
  },
  numberText: {
    color: "#29333E",
    textAlign: I18nManager.isRTL ? "right" : "left",
    fontSize: width * 0.035,
    fontWeight: "600",
  },
  middleView: {
    marginTop: height * 0.078,
    width: width * 0.88,
  },
  InputView: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
})

export default LoginStyle;