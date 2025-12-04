import { Dimensions, StyleSheet } from "react-native";

const {width,height} = Dimensions.get('screen');

const SplashStyle = StyleSheet.create({
   container: {
     flex: 1,
     backgroundColor: "white",
     justifyContent: "center",
     alignItems: "center",
   },
   icon: {
    height: "10%",
    width: "80%",
    alignSelf: "center",
  },
   logo: {
     height: "10%",
     width: "80%",
     alignSelf: "center",
   },
})

export default SplashStyle;
