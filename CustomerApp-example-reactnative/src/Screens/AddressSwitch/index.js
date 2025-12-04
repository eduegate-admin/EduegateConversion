import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import appSettings from "../../../Client/appSettings";
import NormalAddressSwitch from "./components/NormalAddressSwitch";
import UnderConstruction from "../UnderConstruction";
import {
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

const client = process.env.CLIENT;

const AddressSwitch = (props) => {
  const AppSettings = appSettings[client];
  const Screen = AppSettings.screens.AddressSwitch_screen;
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait,
  );
    const title = "Address Switch"

  const renderComponent = (Screen) => {
    switch (Screen) {
      case "NormalAddressSwitch":
        return <NormalAddressSwitch {...props}/>;
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
        width: wp("100%"),
        height: "100%",
        backgroundColor:"#FFF"
      },
    });
export default AddressSwitch;
