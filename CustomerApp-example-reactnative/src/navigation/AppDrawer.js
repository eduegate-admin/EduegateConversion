import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import CustomDrawer from "../component/CustomDrawer";
import ReOrder from "../Screens/ReOrder";
import Booklets from "../Screens/Booklets";
import Notification from "../Screens/Notifications";
import Order from "../Screens/Orders";
import OrderDetails from "../Screens/OrderDetails";
import OrderSuccessScreen from "../Screens/OrderSuccessScreen";
import TrackOrder from "../Screens/TrackOrder";
import AppFooter from "./FooterTabs";
import OrderDetailsDrawer from "./OrderDetailsDrawer";
import { Platform, StyleSheet } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import UnderConstruction from "../Screens/UnderConstruction";
import appSettings from "../../Client/appSettings";
import EditOrder from "../Screens/EditOrder/editOrder";
import CartOfferDrawer from "./CartOfferDrawer";

const client = process.env.CLIENT;

const AppDrawer = (props) => {
  const Drawer = createDrawerNavigator();
  const drawerPosition = appSettings[client].drawerPosition;
  const drawerType = appSettings[client].drawerType;
  const DrawerLeftRadius = appSettings[client].DrawerLeftRadius;
  return (

    // newly add a flag for drawertopbottomradius in appsettings for almadinadot
    <Drawer.Navigator
      initialRouteName="Footer"
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        gestureEnabled: true,
        gestureDirection: "horizontal",
        drawerPosition: drawerPosition,
        drawerType: drawerType,
        drawerStyle: {
          width: wp(appSettings[client].DrawerWidth),
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          borderTopLeftRadius: DrawerLeftRadius && 0,
          borderBottomLeftRadius: DrawerLeftRadius && 0,
        },
      }}
    >
      <Drawer.Screen
        name="Footer"
        component={AppFooter}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="ReOrder"
        component={ReOrder}
        options={{
          animation: "slide_from_right",
          headerRight: () => null,
          swipeEnabled: false,
        }}
      />
      <Drawer.Screen
        name="Booklets"
        component={Booklets}
        options={{
          headerRight: () => null,
          swipeEnabled: false,
        }}
      />

      <Drawer.Screen
        name="Notification"
        component={Notification}
        options={{
          headerRight: () => null,
          swipeEnabled: false,
        }}
      />
      <Drawer.Screen
        name="OrderDetailsDrawer"
        component={OrderDetailsDrawer}
        options={{
          headerRight: () => null,
          swipeEnabled: false,
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
      <Drawer.Screen
        name="CartOfferDrawer"
        component={CartOfferDrawer}
        options={{
          headerRight: () => null,
          swipeEnabled: false,
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
      <Drawer.Screen
        name="Order"
        component={Order}
        options={{
          headerRight: () => null,
          swipeEnabled: false,
          animation: "slide_from_right",
        }}
      />
      <Drawer.Screen
        name="OrderDetails"
        component={OrderDetails}
        options={{
          headerRight: () => null,
          animation: "slide_from_right"
        }}
      />
      <Drawer.Screen
        name="EditOrder"
        component={EditOrder}
        options={{
          headerRight: () => null,
          swipeEnabled: false,
          animation: "slide_from_right",
        }}
      />
      <Drawer.Screen
        name="OrderSuccessScreen"
        component={OrderSuccessScreen}
        options={{ headerShown: false, headerRight: () => null }}
      />

      <Drawer.Screen
        name="TrackOrder"
        component={TrackOrder}
        options={{
          headerRight: () => null,
          swipeEnabled: false,
        }}
      />

      <Drawer.Screen
        name="UnderConstruction"
        component={UnderConstruction}
        options={{
          animation: "slide_from_right",
          headerRight: () => null,
          swipeEnabled: false,
          // headerShown: true,
        }}
      />
    </Drawer.Navigator>
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
  header: {
    height: Platform.OS === "android" ? hp("7%") : hp("7%"),
    // alignItems:"center",
    // justifyContent:"center",
    // alignContent:"center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: "#FFFFFF",
  },
});

export default AppDrawer;
