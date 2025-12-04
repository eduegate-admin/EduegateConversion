import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import NormalCategory from "./component/NormalCategory";
import appSettings from "../../../Client/appSettings";
import SimpleCategory from "./component/simpleCategory";
import LeftSIdeCategory from "./component/LeftSIdeCategory";


const client = process.env.CLIENT;

const Category = (props) => {
  const AppSettings = appSettings[client];
  const Screen = AppSettings.screens.Category_screen;
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );

  const renderComponent = (Screen) => {
    switch (Screen) {
      case "NormalCategory":
        return <NormalCategory {...props}/>;
        case "SimpleCategory":
        return <SimpleCategory {...props}/>;
        case "LeftSIdeCategory":
        return <LeftSIdeCategory {...props}/>;
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
    
export default Category;
