import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import NormalNotification from "./components/normalNotification";
import appSettings from "../../../Client/appSettings";
import UnderConstruction from "../UnderConstruction";


const client = process.env.CLIENT;

const Notification = (props) => {
 const AppSettings = appSettings[client];
  const Screen = AppSettings.screens.Notification_screen;
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );
    const title = "Notifications"

  const renderComponent = (Screen) => {
    switch (Screen) {
      case "NormalNotification":
        return <NormalNotification {...props} />;
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
        height:"100%",
      },
    });
export default Notification;
