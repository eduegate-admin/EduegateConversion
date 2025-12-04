import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import NormalWishlist from "./components/NormalWishlist";
import appSettings from "../../../Client/appSettings";

const client = process.env.CLIENT;

const Wishlist = (props) => {
const AppSettings = appSettings[client];
   const Screen = AppSettings.screens.Wishlist_screen;
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );

  const renderComponent = (Screen) => {
    switch (Screen) {
      case "NormalWishlist":
        return <NormalWishlist {...props}/>;
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
        height:"100%",
      },
    });
    
export default Wishlist;
