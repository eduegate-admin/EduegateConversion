import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomDrawerOrderDetails from '../component/CustomDrawerOrderDetails';
import Order from '../Screens/Orders';
import OrderDetails from '../Screens/OrderDetails';
import CustomHeader from '../component/CustomHeader';
import { StyleSheet, Platform } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const Drawer = createDrawerNavigator();

const OrderDetailsStack = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      initialRouteName="Order"
      screenOptions={{
        header: ({ navigation, route, options }) => (
          <CustomHeader title={options.title || route.name} />
        ),
        animation: "slide_from_right",
        headerShown: true,
      }}
    >
      <Stack.Screen name="Order" component={Order} />
      <Stack.Screen name="OrderDetails" component={OrderDetails} />
      {/* <Stack.Screen name="EditOrder" component={EditOrder} /> */}
    </Stack.Navigator>
  );
};

const OrderDetailsDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerOrderDetails {...props} />}
      screenOptions={{
        drawerPosition: 'right',
        drawerType: 'front',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        swipeEnabled: false,
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name="OrderDetailsStack"
        component={OrderDetailsStack}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: RFValue(16),
    fontWeight: '500',
    textAlign: 'center',
    color: '#525252',
    fontFamily: 'Poppins-Medium',
    marginTop: Platform.OS === 'android' ? -hp('3.5%') : -hp('7%'),
  },
  header: {
    height: hp('7%'),
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: '#FFFFFF',
  },
});

export default OrderDetailsDrawer;
