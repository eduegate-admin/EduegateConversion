import React from "react";
import {
  StyleSheet,
} from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import appSettings from "../../../Client/appSettings";
import NormalProductDetails from "./components/NormalProductDetails";
import GradientProductDetails from "./components/GradientProductDetails";
import {
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

const client = process.env.CLIENT;

const ProductDetails = (props) => {
   const AppSettings = appSettings[client];
  const Screen = AppSettings.screens.ProductDetails_screen;
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );

  const renderComponent = (Screen) => {
    
    switch (Screen) {
      case "NormalProductDetails":
        return <NormalProductDetails {...props}/>;
        case "GradientProductDetails":
        return <GradientProductDetails {...props}/>;
      default:
        return null;
    }
  };

  return (
    <>{renderComponent(Screen)}</>
  );
};
const styles = (windowWidth, windowHeight, isPortrait) =>
    StyleSheet.create({
      container: {
        width: wp("100%"),
        height: "100%",
      },
    });
    
export default ProductDetails;
