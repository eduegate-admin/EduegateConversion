import React from "react";
import NormalHomeHeader from "./components/normalHomeHeader";
import BgHomeHeader from "./components/BgHomeHeader";
import appSettings from "../../../Client/appSettings";


const client = process.env.CLIENT;
const HomeHeader = (props) => {
const AppSettings = appSettings[client];
   const Screen = AppSettings.screens.Home_Header;

  const renderComponent = (Screen) => {
    switch (Screen) {
      case "NormalHomeHeader":
        return <NormalHomeHeader {...props}/>;
      case "BgHomeHeader":
        return <BgHomeHeader {...props}/>;
      default:
        return null;
    }
  };

  return (
    <>{renderComponent(Screen)}</>
  );
};
export default HomeHeader;
