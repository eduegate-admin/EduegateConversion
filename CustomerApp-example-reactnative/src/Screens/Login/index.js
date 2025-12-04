import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import LoginWithBackgroundImage from "./component/LoginWithBackgroundImage";
import LoginWithOutBackgroundImage from "./component/LoginWithOutBackgroundImage";
import appSettings from "../../../Client/appSettings";
import LoginWithEmailAndPassword from "./component/LoginwithEmailandpassword";

const client = process.env.CLIENT;

    // console.log("client", client);

const Login = (props) => {

  const AppSettings = appSettings[client];
   const Screen = AppSettings.screens.Login_screen;
  
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );

  const renderComponent = (Screen) => {
    switch (Screen) {
      case "LoginWithBackgroundImage":
        return <LoginWithBackgroundImage/>;
      case "LoginWithOutBackgroundImage":
        return <LoginWithOutBackgroundImage />;
        case "LoginWithEmailAndPassword":
        return <LoginWithEmailAndPassword {...props}/>;
      default:
        return null;
    }
  };

  return (
    
    <View style={[responsiveStyle.container]}>{renderComponent(Screen)}</View>
  );
};

const styles = (windowWidth, windowHeight, isPortrait) =>
    StyleSheet.create({
      container: {
        width: windowWidth,
        height:"100%",
        // backgroundColor:"#FFFFFF",
      },
    });
export default Login;
