import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../AppContext/AppContext";
import { DimensionContextProvider } from "../../AppContext/DimensionContext";
import OtpScreen from "../OtpScreen";
import Welcome from "../Welcome";
import Splash from "../Splash";
import Login from "../Login";
import SignUp from "../SignUp";
import { NavigationContainer } from "@react-navigation/native";
import Notification from "../Notifications";
import Booklets from "../Booklets";
import AddressSwitch from "../AddressSwitch/addressSwitch";
import Category from "../Category";
import Wishlist from "../Wishlist";
import OrderSuccessFoodWorld from "../OrderSuccessScreen/client/foodworldOrderSuccess";
import Address from "../Address/Address";
import TrackOrder from "../TrackOrder/TrackOrder";
import Cart from "../Cart";
import Checkout from "../Screens/Checkout/Checkout";
import Account from "../Screens/MyAccount/Account";
import CustomTabBar from "../../component/CustomTabBar/CustomTabBar";
import ProductListing from "../ProductListing/productListing";
import ProductDetails from "../ProductDetails/ProductDetails";
import CustomDrawer from "../../component/CustomDrawer";
import HomeScreen from "../Home";
import CustomDrawerOrderDetails from "../../component/CustomDrawerOrderDetails";
import Order from "../Orders/Order";
import OrderDetails from "../OrderDetails/OrderDetails";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";

const Stack = createNativeStackNavigator();
const Footer = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const OrderDetailsDrawer = (props) => (
  <Drawer.Navigator
    drawerContent={(props) => <CustomDrawerOrderDetails {...props} />}
    screenOptions={{
      drawerPosition: "right",
      drawerType: "front",
      headerTitleAlign: "center",
      headerTitleStyle: styles.title,
      headerStyle: styles.header,
      headerShown: false,
    }}
  >
    <Drawer.Screen
      name="Order"
      component={Order}
      options={{ headerShown: false }}
    />
    <Drawer.Screen
      name="OrderDetails"
      component={OrderDetails}
      options={{ headerShown: false }}
    />
  </Drawer.Navigator>
);

const AppDrawer = (props) => {
  return (
    <Drawer.Navigator
      initialRouteName="Footer"
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        drawerPosition: "right",
        drawerType: "front",
        headerTitleAlign: "center",
        headerTitleStyle: styles.title,
        headerStyle: styles.header,
        swipeEnabled: false,
      }}
    >
      <Drawer.Screen
        name="Footer"
        component={AppFooter}
        options={{ headerShown: false }}
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
        name="AddressSwitch"
        component={AddressSwitch}
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
        name="Checkout"
        component={Checkout}
        options={{
          headerRight: () => null,
          swipeEnabled: false,
        }}
      />
      <Drawer.Screen
        name="ProductListing"
        component={ProductListing}
        options={{
          headerRight: () => null,
          swipeEnabled: false,
        }}
      />
      <Drawer.Screen
        name="ProductDetails"
        component={ProductDetails}
        options={{
          headerRight: () => null,
          swipeEnabled: false,
        }}
      />
      <Drawer.Screen
        name="OrderDetailsDrawer"
        component={OrderDetailsDrawer}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="Order"
        component={Order}
        options={{
          headerRight: () => null,
          swipeEnabled: false,
        }}
      />
      <Drawer.Screen name="OrderDetails" component={OrderDetails} />
      <Drawer.Screen
        name="OrderSuccessFoodWorld"
        component={OrderSuccessFoodWorld}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="Address"
        component={Address}
        options={{
          headerRight: () => null,
          swipeEnabled: false,
        }}
      />
      <Drawer.Screen
        name="TrackOrder"
        component={TrackOrder}
        options={{
          headerRight: () => null,
          swipeEnabled: false,
        }}
      />
    </Drawer.Navigator>
  );
};

const AppFooter = (props) => {
  return (
    <Footer.Navigator
      initialRouteName="Home"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
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
        name="Cart"
        component={Cart}
        // options={{ headerShown: false }}
      />
      <Footer.Screen
        name="Offers"
        component={ProductListing}
        // options={{ headerShown: false }}
      />
      <Footer.Screen
        name="Account"
        component={Account}
        // options={{ headerShown: false }}
        drawerPosition="right"
      />
      <Footer.Screen
        name="ProductListing"
        component={ProductListing}
        // options={{ headerShown: false }}
      />
      <Footer.Screen
        name="Wishlist"
        component={Wishlist}
        // options={{ headerShown: false }}
      />
    </Footer.Navigator>
  );
};

const AppStack = () => {
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAppContext();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [isLoggedIn]);

  return (
    <DimensionContextProvider>
      <NavigationContainer>
        <Stack.Navigator
          // initialRouteName="Splash"
          screenOptions={{
            detachInactiveScreens: true,
            headerShown: false,
          }}
        >
          {loading ? (
            <Stack.Screen
              name="Splash"
              component={Splash}
              // options={{ headerShown: false }}
            />
          ) : isLoggedIn ? (
            <Stack.Screen
              name="AppDrawer"
              component={AppDrawer}
              options={{ headerShown: false }}
            />
          ) : (
            <>
              {/* <Stack.Screen
            name="OnboardingScreen"
            component={OnboardingScreen}
            // options={{ headerShown: false }}
          /> */}
              <Stack.Screen
                name="Welcome"
                component={Welcome}
                // options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Login"
                component={Login}
                // options={{ headerShown: false }}
              />
              <Stack.Screen
                name="OtpScreen"
                component={OtpScreen}
                // options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SignUp"
                component={SignUp}
                options={{
                  headerShown: true,
                  title: "Register",
                  headerTitleAlign: "center",
                  headerTitleStyle: {
                    fontSize: 25,
                    fontWeight: "bold",
                    color: "#133051",
                  },
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </DimensionContextProvider>
  );
};

export default AppStack;
