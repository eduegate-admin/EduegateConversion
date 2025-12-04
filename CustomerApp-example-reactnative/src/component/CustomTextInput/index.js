import React, { forwardRef } from "react";
import {
  View,
} from "react-native";
import appSettings from "../../../Client/appSettings";
import NormalTextInput from "./components/NormalTextInput";
import IconWithTextInput from "./components/iconWithTextInput";
import BorderNameTextInput from "./components/BorderNameTextInput";
import FloatingLabelInputWithIcon from "./components/FloatingLabelInputWithIcon";


const client = process.env.CLIENT;
const CustomTextInput = forwardRef((props, ref) => {
  const AppSettings = appSettings[client];
  const Screen = AppSettings.screens.CustomTextInput;

  const renderComponent = (Screen) => {
    switch (Screen) {
      case "IconWithTextInput":
        return <IconWithTextInput {...props} ref={ref} />;
      case "FloatingLabelInputWithIcon":
        return <FloatingLabelInputWithIcon {...props} ref={ref} />;
      case "NormalTextInput":
        return <NormalTextInput {...props} ref={ref} />;
      case "BorderNameTextInput":
        return <BorderNameTextInput {...props} ref={ref} />;
      default:
        return null;
    }
  };

  return (
    <View>{renderComponent(Screen)}</View>
  );
});
export default CustomTextInput;
