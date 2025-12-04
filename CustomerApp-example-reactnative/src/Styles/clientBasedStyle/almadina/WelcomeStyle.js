import { Dimensions, StyleSheet } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
const { width, height } = Dimensions.get("screen");
const WelcomeStyle = StyleSheet.create({
 Image: {
    width: '100%',
    height: height * 0.5, // Half of screen height
    resizeMode: 'cover',
  },
  commonView: {
    width: width,
    height: height * 0.5, // Half of screen height
    // flexDirection: "column",
    // justifyContent: "space-between",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#F4F5F9",
    marginTop: 0,
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
    width: '100%',
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  WelcomeText: {
    fontSize: height*0.065 && width* 0.085,lineHeight:45
 },
  welcomeMessage: {
    fontSize: RFValue(16, 812),
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  clientName: {
    fontSize: RFValue(18, 812),
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
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
    // marginBottom: -20,
    paddingHorizontal: width * 0.07,
  },
  Text: { fontSize: width * 0.043 && height*0.02,color: "#000",lineHeight:28, fontWeight: "600" },
});

export default WelcomeStyle;
