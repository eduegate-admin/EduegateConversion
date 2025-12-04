import React from "react";
import { StyleSheet, View } from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import appSettings from "../../../Client/appSettings";
import NormalAccount from "./components/NormalAccount";
import SimpleAccount from "./components/SimpleAccount";

const client = process.env.CLIENT;
const Account = (props) => {
  const AppSettings = appSettings[client];
  const Screen = AppSettings.screens.Account_screen;
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );

  const renderComponent = (Screen) => {
    switch (Screen) {
      case "NormalAccount":
        return <NormalAccount {...props} />;
      case "SimpleAccount":
        return <SimpleAccount {...props} />;
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
export default Account;
