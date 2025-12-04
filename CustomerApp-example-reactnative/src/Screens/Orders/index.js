import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import appSettings from "../../../Client/appSettings";
import NormalOrder from "./components/NormalOrder";
import UnderConstruction from "../UnderConstruction";
import GroupingOrder from "./components/GroupingOrder";


const client = process.env.CLIENT;

const Order = (props) => {
   const AppSettings = appSettings[client];
  const Screen = AppSettings.screens.Order_screen;
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );
    const title = "Order"

  const renderComponent = (Screen) => {
    
    switch (Screen) {
      case "NormalOrder":
        return <NormalOrder {...props}/>;
        case "GroupingOrder":
        return <GroupingOrder {...props}/>;
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
    
export default Order;
