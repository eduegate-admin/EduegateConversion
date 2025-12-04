import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import colors from "../../../config/colors"; // Adjust path if needed

export default function FloatingLabelInputWithIcon({
  label,
  value,
  onChangeText,
  editIcon,
  keyboardType = "default",
  secureTextEntry = false,
  handleEdit,
  width,
  height,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused || value ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: "absolute",
    left: wp("3%"),
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [hp("1.8%"), hp("-1.5%")],
    }),
    // color: animatedValue.interpolate({
    //   inputRange: [0, 1],
    //   outputRange: ['red', 'black'], // color changes
    // }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [RFValue(14), RFValue(11)],
    }),
    color: isFocused ? colors.darkGrey : colors.darkSilver,
    backgroundColor: "#fff",
    paddingHorizontal: wp("1%"),
    fontFamily: "Poppins-Regular",
    fontSize: RFValue(14),
  };

  return (
    // <View style={[styles.container, style, isFocused && styles.focusedBorder]}>
    //   {icon && <Image source={icon} style={styles.icon} />}
    //   <Animated.Text style={labelStyle}>{label}</Animated.Text>
    //   <TextInput
    //     value={value}
    //     onChangeText={onChangeText}
    //     style={styles.input}
    //     keyboardType={keyboardType}
    //     secureTextEntry={secureTextEntry}
    //     onFocus={() => setIsFocused(true)}
    //     onBlur={() => setIsFocused(false)}
    //   />
    // </View>

    <View
      style={[
        styles.container,
        isFocused && styles.focusedBorder,
        {
          width: width ? width : wp("91.11%"),
          height: height ? height : hp("6.125%"),
        },
      ]}
    >
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {editIcon && (
        <TouchableOpacity onPress={handleEdit} style={{}}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: wp("91.11%"),
    height: hp("6.125%"),
    alignSelf: "center",
    borderColor: "#C5C5C5",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#",
  },

  input: {
    fontSize: RFValue(14),
    fontFamily: "Poppins-Regular",
    color: "#4B4B4B",
    width: "75%",
    left: wp("4.7222%"),
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  editText: {
    color: "#1E90FF",
    fontSize: RFValue(12),
    marginRight: wp("4.44%"),
    width: wp("10%"),
  },
});
