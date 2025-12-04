import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import appSettings from "../../../Client/appSettings";
import AddressWithMapModal from "./components/AddressWithMapModal";
import UnderConstruction from "../UnderConstruction";

const client = process.env.CLIENT;
const Address = (props) => {
  const AppSettings = appSettings[client];
  const Screen = AppSettings.screens.Address_screen;
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait,
  );
    const title = "Address"

  const renderComponent = (Screen) => {
    switch (Screen) {
      case "AddressWithMapModal":
        return <AddressWithMapModal {...props}/>;
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
        width: "100%",
        height: "100%",
      },
    });
export default Address;
