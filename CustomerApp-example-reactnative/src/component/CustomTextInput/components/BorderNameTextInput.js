import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../../../config/colors";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const { width, height } = Dimensions.get("screen");
const BorderNameTextInput = (props) => {
  const {
    label,
    handleEdit,
    type,
    handleText,
    placeholder,
    value,
    Apply = false,
    multiline = false,
    Width,
    Height,
    fontSize,
    borderWidth,
    borderColor,
    editable,
    borderRadius,
    maxLength,
    editIcon,
  } = props;
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
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["gray", "#525252"],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [RFValue(13), RFValue(11)],
    }),
    // color: isFocused ? colors.darkGrey : colors.darkSilver,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: wp("1.5%"),
    fontFamily: "Poppins-Regular",
    // fontSize: RFValue(14),
  };

  const [show, setShow] = useState(false);
  const keyboardType =
    type === "email"
      ? "email-address"
      : type === "password"
      ? "default"
      : type === "phone"
      ? "phone-pad"
      : "default";

  const secureTextEntry = type === "password" ? (show ? false : true) : false;
  const icon =
    type === "email"
      ? null
      : type === "password"
      ? show
        ? require("../../../assets/images/client/foodworld/card.png")
        : require("../../../assets/images/client/foodworld/card.png")
      : false;

  const handlePassword = () => {
    setShow(!show);
  };
  const handlePromoCode = () => {};
  return (
    <View
      style={[
        styles.container,
        isFocused && styles.focusedBorder,
        {
          width: Width ? wp(Width) : wp("91.11%"),
          height: Height ? hp(Height) : hp("6.125%"),
          borderWidth: borderWidth ? borderWidth : 1,
          borderColor: borderColor ? borderColor : "#DBDBDB",
          borderRadius: borderRadius ? borderRadius : 8,
        },
      ]}
    >
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        style={[
          styles.input,
          {
            height: multiline ? "100%" : "100%",
            fontSize: fontSize ? fontSize : 12,
            textAlignVertical: multiline ? "top" : "center",
          },
        ]}
        maxLength={maxLength}
        placeholderTextColor={"gray"}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        selectionColor={colors.green}
        onChangeText={handleText}
        value={value}
        multiline={multiline}
        editable={editable}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {Apply ? (
        <TouchableOpacity onPress={handlePromoCode} style={styles.ApplyView}>
          <Text style={styles.ApplyText}>Apply</Text>
        </TouchableOpacity>
      ) : null}
      {editIcon && (
        <TouchableOpacity onPress={handleEdit} style={{}}>
          <Text style={[styles.editText, editable ? { opacity: 0.3 } : '']}>Edit</Text>
        </TouchableOpacity>
      )}
      {!icon ? null : (
        <TouchableOpacity
          onPress={handlePassword}
          disabled={type !== "password" ? true : false}
        >
          <Image style={styles.icon} source={icon} />
        </TouchableOpacity>
      )}
    </View>
  );
};
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
  ApplyView: {
    backgroundColor: "#68B054",
    width: width * 0.2,
    height: height * 0.048,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
  },
  ApplyText: {
    color: "white",
    fontSize: width * 0.037,
  },
  icon: {
    width: width * 0.075,
    height: height * 0.025,
    resizeMode: "contain",
  },
});

export default BorderNameTextInput;
