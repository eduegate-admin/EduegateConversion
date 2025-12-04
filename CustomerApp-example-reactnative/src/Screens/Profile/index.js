import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import appSettings from "../../../Client/appSettings";
import NormalProfile from "./components/NormalProfile";
import SimpleProfile from "./components/SimpleProfile";
import UnderConstruction from "../UnderConstruction";


const client = process.env.CLIENT;

const Profile = (props) => {
   const AppSettings = appSettings[client];
  const Screen = AppSettings.screens.Profile_screen;
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );
    const title = "Order Details"

  const renderComponent = (Screen) => {
    
    switch (Screen) {
      case "NormalProfile":
        return <NormalProfile {...props}/>;
        case "SimpleProfile":
        return <SimpleProfile {...props}/>;
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
    
export default Profile;
