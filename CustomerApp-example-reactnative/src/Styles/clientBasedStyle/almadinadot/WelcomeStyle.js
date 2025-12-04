import { Dimensions, StyleSheet } from "react-native";
const { width, height } = Dimensions.get("screen");
const WelcomeStyle = StyleSheet.create({
  Image: {
    width: width,
    height: height*0.69,
    resizeMode: "cover",
  },
  commonView: {
    width: width,
    height:height*0.31,
    // flexDirection: "column",
    // justifyContent: "space-between",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#F4F5F9",
    marginTop: height* - 0.09,
  },
  logoView: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: width,
    height: height * 0.25,
    alignItems: "center",
    // backgroundColor:"red",
    paddingHorizontal: width * 0.07,
  },
  logo: {
    // backgroundColor:"green",
    width: width * 0.66,
    height: height * 0.25,
    resizeMode: "contain",
  },
  TextView : {
    // backgroundColor: "green",
    width: width,
    height: height * 0.20,
    flexDirection: "column",
    paddingVertical: 40,
    paddingHorizontal:25,
    // marginRight:width*0.02
  },
  WelcomeText: {
    fontSize: height*0.065 && width* 0.085,lineHeight:45
 },
  ButtonView: {
    // backgroundColor: "#cddc39",
    width: width,
    height: height * 0.20,
    flexDirection: "column",
    justifyContent: "center",
    alignItems:"center",
    // paddingHorizontal: width * 0.07,
    // paddingTop: 100,
  },

  ButtonContainer: {
    width: width,
    flexDirection: "row",
    paddingTop: 25,
    // backgroundColor: "blue",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.07,
  },
  Text: { fontSize: width * 0.043 && height*0.02,color: "#000",lineHeight:28, fontWeight: "600" },
});

export default WelcomeStyle;
