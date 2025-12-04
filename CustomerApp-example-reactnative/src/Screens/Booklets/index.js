import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import appSettings from "../../../Client/appSettings";
import NormalBooklets from "./components/NormalBooklet";
import UnderConstruction from "../UnderConstruction";

const client = process.env.CLIENT;
const Booklets = (props) => {
  const AppSettings = appSettings[client];
  const Screen = AppSettings.screens.Booklets_screen;
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait,
  );
    const title = "Booklets"

  const renderComponent = (Screen) => {
    switch (Screen) {
      case "NormalBooklets":
        return <NormalBooklets {...props}/>;
        case "UnderConstruction":
        return <UnderConstruction title={title} />;
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
        width: "100%",
        height: "100%",
      },
    });
export default Booklets;
