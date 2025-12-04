import { Dimensions, StyleSheet, I18nManager } from "react-native";
const {width,height} = Dimensions.get('screen');

const LoginStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    width: width,
    height: height,
  },
  ImageBackground: {
    width: width,
    height: height * 0.44,
    resizeMode: "cover",
  },
  headerContent: {
    marginTop: height * 0.12,
    width: width,
    height: height * 0.32,
    paddingHorizontal: width * 0.07,
    justifyContent: "center",
  },
  mobile: {
    color: "#000",
    textAlign: I18nManager.isRTL ? "right" : "left",
    fontSize: width * 0.04,
    fontWeight: "600",
    marginTop: height * 0.015,
  },
  Image: {
    width: width * 0.18,
    height: width * 0.18,
    resizeMode: "cover",
  },
  WelcomeText: {
    color: "#97999D",
    textAlign: I18nManager.isRTL ? "right" : "left",
    fontSize: width * 0.04,
    fontWeight: "600",
    marginTop: height * 0.015,
  },
  LoginText: {
    color: "#000",
    textAlign: I18nManager.isRTL ? "right" : "left",
    fontSize: width * 0.085,
    fontWeight: "600",
  },
  TabBox: {
    backgroundColor: "#EFF0F6",
    width: width * 0.85,
    height: height * 0.05,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    marginTop: height * 0.015,
     borderWidth:1,
    borderColor:"#fff"
  },
  TabView: {
    backgroundColor: "#EFF0F6",
    width: "50%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
   
  },
  TabViewActive: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#fff",
  },
  TabLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#97999D",
  },
  TabLabelActive: {
    color: "#000",
  },
  middleView: {
    backgroundColor: "#fff",
    // marginTop: height * 0.02,
    width: width ,
    height:height*0.56,
    paddingHorizontal: width * 0.07,
    // alignItems: "center",
  },
  innerView: {
    backgroundColor: "#fff",
  },
  InputView: {
    paddingVertical: height * 0.02,
  },
})

export default LoginStyle;