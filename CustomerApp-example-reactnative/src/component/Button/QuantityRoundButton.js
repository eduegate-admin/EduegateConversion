import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';

import colors from "../../config/colors";


const QuantityRoundButton = ({ quantity, setQuantity }) => {

  const onMinus = () => {
    setQuantity(Math.max(0, quantity - 1));
  };
  const onPlus = () => {
    setQuantity(quantity + 1);
  };
return (
    <View style={styles.root}>
      <TouchableOpacity onPress={onMinus} style={styles.button}>
        <Text
          style={[
            styles.buttonText,
            {
              fontWeight: "800",
              fontSize: 25,
              bottom:8,
            },
          ]}
        >
          _
        </Text>
      </TouchableOpacity>
      <Text style={styles.quantity}>{quantity}</Text>
      <TouchableOpacity onPress={onPlus} style={styles.button}>
        <Text
          style={[
            styles.buttonText,
            { lineHeight: 26, fontWeight: "600", fontSize: 23,},
          ]}
        >
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  root:{
      flexDirection: 'row',
      alignItems:'center',
      justifyContent:'space-between',
      // backgroundColor: 'red',
      width: 120
  },
  button:{
      width:35,
      height:35,
      borderRadius:100,
      alignItems:'center',
      justifyContent:'center',
      backgroundColor: colors.green,
      elevation:5
  },
  buttonText:{
      fontSize:25,
      lineHeight:35,
      color: 'white'
  },
  quantity:{
      fontSize: 18,
      fontWeight:'bold',
      color:colors.green
  }
})

export default QuantityRoundButton;