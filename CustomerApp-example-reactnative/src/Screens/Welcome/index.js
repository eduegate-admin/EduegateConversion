import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import IconWithOutBackground from "./components/iconWithOutBackground";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import IconWithBackground from "./components/iconWithBackground";
import appSettings from "../../../Client/appSettings";


const client = process.env.CLIENT;
const Welcome = () => {
const AppSettings = appSettings[client];
   const Screen = AppSettings.screens.Welcome_screen;

  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );

  const renderComponent = (Screen) => {
    switch (Screen) {
      case "IconWithBackground":
        return <IconWithBackground/>;
      case "IconWithOutBackground":
        return <IconWithOutBackground />;
      default:
        return null;
    }
  };

  return (
    <View style={responsiveStyle.container}>{renderComponent(Screen)}</View>
  );
};
const styles = (windowWidth, windowHeight, isPortrait) =>
    StyleSheet.create({
      container: {
        width: windowWidth,
        height: "100%",
      },
    });
export default Welcome;
