import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import appSettings from "../../../Client/appSettings";
import NormalOrderSuccess from "./components/NormalOrderSuccess";


const client = process.env.CLIENT;

const OrderSuccessScreen = (props) => {
   const AppSettings = appSettings[client];
  const Screen = AppSettings.screens.OrderSuccessScreen_screen;
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );

  const renderComponent = (Screen) => {
    
    switch (Screen) {
      case "NormalOrderSuccess":
        return <NormalOrderSuccess {...props}/>;
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
    
export default OrderSuccessScreen;
