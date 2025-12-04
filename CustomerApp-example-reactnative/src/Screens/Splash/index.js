import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import ImageSplash from "./component/ImageSplash";
import VideoSplash from "./component/VideoSplash";
import appSettings from "../../../Client/appSettings";
import {
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

const client = process.env.CLIENT;

const Splash = ({ onFinish }) => {
  const navigation = useNavigation();
  const AppSettings = appSettings[client];
  const targetScreen = AppSettings?.screens?.Welcome_screen;
  const Screen = AppSettings.screens.Splash_screen;

  if (!Screen) {
    // No splash → render nothing, AppStack will load Login/Drawer directly
    return null;
  }

  const renderComponent = (Screen) => {
    switch (Screen) {
      case "ImageSplash":
        return <ImageSplash onFinish={onFinish} />;
      case "VideoSplash":
        return <VideoSplash onFinish={onFinish} />;
      default:
        return null;
    }
  };

  return <View style={styles.container}>{renderComponent(Screen)}</View>;
};
const styles = StyleSheet.create({
  container: {
    width: wp("100%"),
    height: "100%",
  },
});
export default Splash;
