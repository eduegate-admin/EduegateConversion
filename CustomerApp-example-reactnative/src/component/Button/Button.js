import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from "../../config/colors";


const Button = ({text, onPress}) => {
  return (
    <Pressable onPress={onPress} style= {styles.root}>
      <Text style= {styles.text}>{text}</Text>
    </Pressable>
  );
};


const styles = StyleSheet.create({
    root:{
      width: wp("50%"),
      height: hp("8%"),
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.green,
    },
    text:{
        fontSize:16,
        fontWeight: "400",
        color: "white",

    },
})
export default Button;