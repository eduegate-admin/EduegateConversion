import React from "react";
import { StyleSheet, View } from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import appSettings from "../../../Client/appSettings";
import NormalTrackOrder from "./components/NormalTrackOrder";
import UnderConstruction from "../UnderConstruction";

const client = process.env.CLIENT;

const TrackOrder = (props) => {
  const AppSettings = appSettings[client];
  const Screen = AppSettings.screens.TrackOrder_screen;
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );
  const title = "Track Order"

  const renderComponent = (Screen) => {
    switch (Screen) {
      case "NormalTrackOrder":
        return <NormalTrackOrder {...props} />;
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
      width: windowWidth,
      height: windowHeight,
    },
  });

export default TrackOrder;
