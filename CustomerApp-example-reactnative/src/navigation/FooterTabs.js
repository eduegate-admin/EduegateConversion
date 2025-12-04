import React from "react";
import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import HomeScreen from "../Screens/Home";
import Category from "../Screens/Category";
import Order from "../Screens/Orders";
import Cart from "../Screens/Cart";
import Account from "../Screens/MyAccount";
import Wishlist from "../Screens/Wishlist";
import CustomTabBar from "../component/CustomTabBar";
import { Platform, StyleSheet } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import {
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ProductListing from "../Screens/ProductListing";
import PaginationProductWithBrand from "../Screens/ProductListing/components/PaginationProductWithBrand";

const Footer = createBottomTabNavigator();
const client = process.env.CLIENT;

const AppFooter = (props) => {
  return (
    <Footer.Navigator
      initialRouteName="Home"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        gestureEnabled: true,
        gestureDirection: "horizontal",
        headerTitleAlign: "center",
        headerTitleStyle: styles.title,
        headerStyle: styles.header,
      }}
    >
      <Footer.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Footer.Screen
        name="Category"
        component={Category}
        // options={{ headerShown: false }}
      />
      <Footer.Screen
        name="Order"
        component={Order}
        // options={{ headerShown: false }}
      />
         <Footer.Screen
        name="Offers"
        component={ProductListing}
        // options={{ headerShown: false }}
      />
      <Footer.Screen
        name="Brands"
        component={PaginationProductWithBrand}
        // options={{ headerShown: false }}
      />
      <Footer.Screen
        name="Cart"
        component={Cart}
        // options={{ headerShown: false }}
      />
      <Footer.Screen
        name="Account"
        component={Account}
        // options={{ headerShown: false }}
        drawerPosition="right"
      />
      <Footer.Screen
        name="Wishlist"
        component={Wishlist}
        // options={{ headerShown: false }}
      />
    </Footer.Navigator>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: RFValue(16),
    fontWeight: "500",
    textAlign: "center",
    color: "#525252",
    fontFamily: "Poppins-Medium",
    marginTop: Platform.OS === "android" ? -hp("3.5%") : -hp("7%"),
  },
  // header: {
  //    height: Platform.OS === "android" ? hp("7%") : hp("7%"),
  //   borderBottomLeftRadius: 20,
  //   borderBottomRightRadius: 20,
  //   backgroundColor:"#FFFFFF",
  // },
});

export default AppFooter;
