import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import appSettings from "../../Client/appSettings";
import { Platform, StyleSheet, View } from "react-native";
import { DimensionContextProvider } from "../AppContext/DimensionContext";
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef } from "./NavigationService";
import Splash from "../Screens/Splash";
import Welcome from "../Screens/Welcome";
import Login from "../Screens/Login";
import OtpScreen from "../Screens/OtpScreen";
import SignUp from "../Screens/SignUp";
import AppDrawer from "./AppDrawer";
import * as SystemUI from "expo-system-ui";
import { useAppContext } from "../AppContext/AppContext";
import * as Linking from "expo-linking";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RFValue } from "react-native-responsive-fontsize";
import {
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Address from "../Screens/Address";
import AddressSwitch from "../Screens/AddressSwitch";
import Checkout from "../Screens/Checkout";
import ProductListing from "../Screens/ProductListing";
import ProductDetails from "../Screens/ProductDetails";
import Filter from "../Screens/Filter";
import Profile from "../Screens/Profile";
import Search from "../Screens/Search";
import Cart from "../Screens/Cart";
import PlusRewardsScreen from "../Screens/PlusReward";
import AccountSettings from "../Screens/AccountSettings";
import DeleteAccount from "../Screens/DeleteAccount";
import AboutUs from "../Screens/AboutUs/NormalAboutUs";
import FAQs from "../Screens/FAQs";
import ContactUs from "../Screens/ContactUs/NormalContactUs";
import LanguageSettings from "../Screens/LanguageSettings";
import { useCart } from "../AppContext/CartContext";
import NavigationAnalytics from "./NavigationAnalytics";
import ForceUpdate from "../Screens/ForceUpdate";
import ChangeNumber from "../Screens/ChangeNumber";
import Complaints from "../Screens/Complaints/Complaints";
import ProductSuggestions from "../Screens/ProductSuggestions/ProductSuggestions";
import Referral from "../Screens/Referral/Referral";
import Promotions from "../Screens/Promotions/Promotions";
import TermsAndConditions from "../Screens/TermsAndConditions/TermsAndConditions";
import NormalWallet from "../Screens/MyWallet/normalWallet";

// Deep linking configuration
const linking = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      Splash: "splash",
      Welcome: "welcome",
      Login: "login",
      OtpScreen: "otp",
      SignUp: "signup",
      Address: "address",
      AddressSwitch: "address-switch",
      Checkout: "checkout",
      Profile: "profile",
      ProductListing: "product-listing",
      ProductDetails: "product-details/:productId?",
      Filter: "filter",
      PlusRewardsScreen: "plus-rewards",
      Search: "search",
      Drawer: {
        path: "drawer",
        screens: {
          Footer: {
            path: "footer",
            screens: {
              Home: "home",
              Category: "category",
              Order: "order",
              Cart: "cart",
              Account: "account",
              Wishlist: "wishlist",
            },
          },
          ReOrder: "reorder",
          Booklets: "booklets",
          Notification: "notification",
          OrderDetailsDrawer: {
            path: "order-details-drawer",
            screens: {
              OrderDetailsStack: {
                path: "order-stack",
                screens: {
                  Order: "order-screen",
                  OrderDetails: "order-details/:orderId?",
                },
              },
            },
          },
          OrderSuccessScreen: "order-success",
          TrackOrder: "track-order",
          UnderConstruction: "under-construction",
        },
      },
      Cart: "cart",
      Promotions: "promotions",
    },
  },
};

const client = process.env.CLIENT;
const Stack = createNativeStackNavigator();

const AppStack = () => {
  const insets = useSafeAreaInsets();
  const [cartLoaded, setCartLoaded] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const { updateCartCount } = useCart();
  const AppSettings = appSettings[client];
  const targetScreen = AppSettings?.screens?.Welcome_screen;
  const Screen = AppSettings.screens.Splash_screen;
  const { isLoading, token, appUpdate } = useAppContext();

  useEffect(() => {
    if (Platform.OS === "android") {
      SystemUI.setBackgroundColorAsync("#FFF");
    }
  }, []);

  useEffect(() => {
    if (token && !cartLoaded) {
      updateCartCount();
      setCartLoaded(true);
    }
    setCartLoaded(false);
  }, [token, cartLoaded, isLoading]);

  if (!splashDone && Screen) {
    return (
      <NavigationContainer ref={navigationRef}>
        {Platform.OS !== "web" && <NavigationAnalytics />}
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash">
            {(props) => (
              <Splash {...props} onFinish={() => setSplashDone(true)} />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
  if (!isLoading) {
    const initialRouteName =
      appUpdate?.updated === false
        ? "ForceUpdate"
        : token
          ? "Drawer"
          : targetScreen
            ? "Welcome"
            : "Login";
    console.log("initialRouteName", initialRouteName);
    return (
      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <DimensionContextProvider>
          <NavigationContainer ref={navigationRef} linking={linking}>
            {Platform.OS !== "web" && <NavigationAnalytics />}
            <Stack.Navigator
              initialRouteName={initialRouteName}
              screenOptions={{
                statusBarStyle: "dark",
                detachInactiveScreens: true,
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: "horizontal",
                headerTitleAlign: "center",
                headerTitleStyle: styles.title,
                headerStyle: styles.header,
                animationTypeForReplace: "push",
                animation: "default",

                freezeOnBlur: true,
                lazy: true,
              }}
            >
              <Stack.Screen
                name="Login"
                component={Login}
                options={{ headerShown: false }}
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
              <Stack.Screen
                name="Drawer"
                component={AppDrawer}
                options={{ headerShown: false }}
              />
              <Stack.Screen name="OtpScreen" component={OtpScreen} />
              {targetScreen && (
                <Stack.Screen name="Welcome" component={Welcome} />
              )}
              <Stack.Screen
                name="Address"
                component={Address}
                options={{
                  headerShown: true,
                  animation: "default",
                }}
              />
              <Stack.Screen
                name="AddressSwitch"
                component={AddressSwitch}
                options={{
                  headerShown: true,
                  animation: "default",
                }}
              />
              <Stack.Screen
                name="Checkout"
                component={Checkout}
                options={{
                  headerShown: true,
                  animation: "default",
                }}
              />
              <Stack.Screen
                name="Profile"
                component={Profile}
                options={{
                  headerShown: true,
                  animation: "default",
                }}
              />
              <Stack.Screen
                name="AccountSettings"
                component={AccountSettings}
                options={{
                  headerShown: true,
                  animation: "default",
                }}
              />
              <Stack.Screen
                name="DeleteAccount"
                component={DeleteAccount}
                options={{
                  headerShown: true,
                  animation: "default",
                }}
              />
              <Stack.Screen
                name="LanguageSettings"
                component={LanguageSettings}
                options={{
                  headerShown: true,
                  animation: "default",
                }}
              />
              <Stack.Screen
                name="ProductListing"
                component={ProductListing}
                options={{
                  headerShown: true,
                  animation: "default",
                  title: "Product Listing",
                }}
              />
              <Stack.Screen
                name="ProductDetails"
                component={ProductDetails}
                options={{
                  headerShown: true,
                  animation: "default",
                  title: "Product Details",
                }}
              />
              <Stack.Screen
                name="Filter"
                component={Filter}
                options={{
                  headerShown: true,
                  animation: "default",
                }}
              />
              <Stack.Screen
                name="Cart"
                component={Cart}
                options={{
                  headerShown: true,
                  animation: "default",
                }}
              />
              <Stack.Screen
                name="PlusRewardsScreen"
                component={PlusRewardsScreen}
                options={{
                  headerShown: true,
                  title: "Plus Reward",
                  animation: "default",
                }}
              />
              <Stack.Screen
                name="AboutUs"
                component={AboutUs}
                options={{
                  headerShown: true,
                  animation: "default",
                }}
              />
              <Stack.Screen
                name="ForceUpdate"
                component={ForceUpdate}
                options={{
                  headerShown: false,
                  animation: "default",
                }}
              />
              <Stack.Screen
                name="FAQs"
                component={FAQs}
                options={{
                  headerShown: true,
                  animation: "default",
                }}
              />
             
              <Stack.Screen
                name="Complaints"
                component={Complaints}
                options={{
                  headerShown: true,
                  animation: "default",
                }}
              />
              <Stack.Screen
                name="ChangeNumber"
                component={ChangeNumber}
                options={{
                  headerShown: true,
                  animation: "default",
                }}
              />
              <Stack.Screen
                name="ProductSuggestions"
                component={ProductSuggestions}
                options={{
                  headerShown: true,
                  animation: "default",
                }}  
              />
              <Stack.Screen
                name="Referral"
                component={Referral}
                options={{
                  headerShown: true,
                  animation: "default",
                }}
              />
               <Stack.Screen
                name="MyWallet"
                component={NormalWallet}
                options={{
                  headerShown: true,
                  animation: "default",
                }}
              />
              <Stack.Screen
                name="ContactUs"
                component={ContactUs}
                options={{
                  headerShown: true,
                  animation: "default",
                }}
              />
              <Stack.Screen
                name="Promotions"
                component={Promotions}
                options={{
                  headerShown: true,
                  animation: "default",
                  title: "Promotions",
                }}
              />
              <Stack.Screen
                name="TermsAndConditions"
                component={TermsAndConditions}
                options={{
                  headerShown: true,
                  animation: "default",
                  title: "Terms and Conditions",
                }}  
              />
              <Stack.Screen
                name="Search"
                component={Search}
                options={{
                  headerShown: true,
                  animation: "slide_from_right",
                  presentation: "transparentModal",
                  animation: "fade",
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </DimensionContextProvider>
      </View>
    );
  }
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
    height: Platform.OS === "android" ? hp("5%") : hp("7%"),
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: "#FFFFFF",
  },
});

export default AppStack;
