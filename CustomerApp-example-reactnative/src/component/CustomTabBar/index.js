
import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import BgImageTabBar from "./components/BgImageTabBar";
import NormalTabBar from "./components/NormalTabBar";
import FloatingTabBar from "./components/FloatingTabBar";
import appSettings from "../../../Client/appSettings";


const client = process.env.CLIENT;
const CustomTabBar = (props) => {
const AppSettings = appSettings[client];
   const Screen = AppSettings.screens.CustomTabBar;
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );

  const renderComponent = (Screen) => {
    switch (Screen) {
      case "FloatingTabBar":
        return <FloatingTabBar {...props}/>;
      case "NormalTabBar":
        return <NormalTabBar {...props}/>;
      case "BgImageTabBar":
        return <BgImageTabBar {...props}/>;
      default:
        return null;
    }
  };

  return (
    <View style={{ backgroundColor: "white", }}>{renderComponent(Screen)}</View>
  );
};
const styles = (windowWidth, windowHeight, isPortrait) =>
    StyleSheet.create({
      container: {
        width: windowWidth,
        height: 0,
      },
    });
export default CustomTabBar;
