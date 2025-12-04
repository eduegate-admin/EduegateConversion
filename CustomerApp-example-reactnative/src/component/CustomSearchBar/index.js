import React from "react";
import appSettings from "../../../Client/appSettings";
import Search_with_without_scan from "./components/search_with_without_scan";
import Search_with_cam from "./components/search_with_cam";


const client = process.env.CLIENT;
const CustomSearchBar = (props) => {
const AppSettings = appSettings[client];
   const Screen = AppSettings.screens.search_bar;

  const renderComponent = (Screen) => {
    switch (Screen) {
      case "Search_with_without_scan":
        return <Search_with_without_scan {...props}/>;
      case "Search_with_cam":
        return <Search_with_cam {...props}/>;
      default:
        return null;
    }
  };

  return (
    <>{renderComponent(Screen)}</>
  );
};
export default CustomSearchBar;
