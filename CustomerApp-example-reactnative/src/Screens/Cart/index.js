import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import CartWithHorizontalSlideProductsList from "./component/CartWithHorizontalSlideProductsList";
import appSettings from "../../../Client/appSettings";
import CartWithSummaryCardAndWidget from "./component/CartWithSummaryCardAndWidget";
import CartWithSummaryCard from "./component/CartWithSummaryCard";


const client = process.env.CLIENT;
const Cart = (props) => {
  const AppSettings = appSettings[client];
  const Screen = AppSettings.screens.Cart_screen;
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );

  const renderComponent = (Screen) => {
    switch (Screen) {
      case "CartWithHorizontalSlideProductsList":
        return <CartWithHorizontalSlideProductsList {...props}/>;
      case "CartWithSummaryCard":
        return <CartWithSummaryCard {...props}/>;
        case "CartWithSummaryCardAndWidget":
        return <CartWithSummaryCardAndWidget {...props}/>;
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
export default Cart;
