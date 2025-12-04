import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import SubstitutionOrderDetails from "./components/SubstitutionOrderDetails";
import appSettings from "../../../Client/appSettings";
import NormalOrderDetails from "./components/NormalOrderDetails";
import SimpleOrderDetails from "./components/SimpleOrderDetails";
import UnderConstruction from "../UnderConstruction";


const client = process.env.CLIENT;

const OrderDetails = (props) => {
   const AppSettings = appSettings[client];
  const Screen = AppSettings.screens.OrderDetails_screen;
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );
    const title = "Order Details"

  const renderComponent = (Screen) => {
    
    switch (Screen) {
      case "SubstitutionOrderDetails":
        return <SubstitutionOrderDetails {...props}/>;
      case "NormalOrderDetails":
        return <NormalOrderDetails {...props}/>;
      case "SimpleOrderDetails":
        return <SimpleOrderDetails {...props}/>;
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
    
export default OrderDetails;
