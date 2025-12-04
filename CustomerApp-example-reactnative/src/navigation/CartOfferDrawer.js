import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StyleSheet, Platform } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import CartOfferDrawerDetails from '../component/CartOfferDrawer';
import Cart from '../Screens/Cart';

const Drawer = createDrawerNavigator();

const CartOfferDrawer = ({ route, navigation }) => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CartOfferDrawerDetails {...props} route={route} />}
      screenOptions={{
        drawerPosition: 'right',
        drawerType: 'front',
        drawerStyle: {
          width: wp("85%"),
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }, 
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        swipeEnabled: false,
        headerShown: false,
      }}
    >
     <Drawer.Screen 
        name="CartOffer" 
        component={Cart} 
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

export default CartOfferDrawer;
