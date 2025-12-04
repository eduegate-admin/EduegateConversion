import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import CustomFAQs from "./components/CustomFAQs";
import NormalFAQs from "./components/NormalFAQs";
import appSettings from "../../../Client/appSettings";


const client = process.env.CLIENT;

const FAQs = (props) => {
  const AppSettings = appSettings[client];
  const Screen = AppSettings.screens.FAQs_screen;
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );

  const renderComponent = (Screen) => {
    switch (Screen) {
      case "CustomFAQs":
        return <CustomFAQs {...props}/>;
        case "NormalFAQs":
        return <NormalFAQs {...props}/>;
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
    
export default FAQs;
