import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import appSettings from "../../../Client/appSettings";
import PaginationProductListing from "./components/PaginationProductListing";
import PaginationProductWithBrand from "./components/PaginationProductWithBrand";


const client = process.env.CLIENT;

const ProductListing = (props) => {
   const AppSettings = appSettings[client];
  const Screen = AppSettings.screens.ProductListing_screen;
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );

  const renderComponent = (Screen) => {
    
    switch (Screen) {
      case "PaginationProductListing":
        return <PaginationProductListing {...props}/>;
      case "PaginationProductWithBrand":
        return <PaginationProductWithBrand {...props}/>;

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
    
export default ProductListing;

