import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import appSettings from "../../../Client/appSettings";
import NormalCheckout from "./components/NormalCheckout";



const client = process.env.CLIENT;
const Checkout = (props) => {
  const AppSettings = appSettings[client];
  const Screen = AppSettings.screens.Checkout_screen;
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait,
  );

  const renderComponent = (Screen) => {
    switch (Screen) {
      case "NormalCheckout":
        return <NormalCheckout {...props}/>;
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
export default Checkout;
