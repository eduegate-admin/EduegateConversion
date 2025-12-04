import React from "react";
import { StyleSheet, View } from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import NormalOtp from "./component/NormalOtp";
import BgImageWithOtp from "./component/BgImageWithOtp";
import appSettings from "../../../Client/appSettings";

const client = process.env.CLIENT;
const OtpScreen = (props) => {
  const AppSettings = appSettings[client];
  const Screen = AppSettings.screens.Otp_screen;
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );

  const renderComponent = (Screen) => {
    switch (Screen) {
      case "BgImageWithOtp":
        return <BgImageWithOtp {...props} />;
      case "NormalOtp":
        return <NormalOtp {...props} />;
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
export default OtpScreen;
