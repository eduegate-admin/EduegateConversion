import React, { useState, forwardRef } from "react";
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../../../config/colors";
import { useDimensionContext } from "../../../AppContext/DimensionContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const { width, height } = Dimensions.get("screen");
const IconWithTextInput = forwardRef((props, ref) => {
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );
  const {
    type,
    handleText,
    placeholder,
    value,
    Apply = false,
    multiline = false,
    Width,
    Height,
    fontSize,
    borderRadius,
    borderWidth,
    borderColor,
    editable,
    onSubmitEditing,
    returnKeyType,
  } = props;

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
      ? require("../../../assets/images/client/foodworld/card.png")
      : type === "phone"
      ? require("../../../assets/images/client/almadina/Icon-Phone.jpg")
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
        responsiveStyle.container,
        {
          width: Width ? width * Width : wp("91.11%"),
          height: Height ? height * Height : hp("6.125%"),
          borderRadius: borderRadius ? borderRadius : 8,
          borderWidth: borderWidth ? borderWidth : 1,
          borderColor: borderColor ? borderColor : "#DBDBDB",
          backgroundColor: editable === false ? "#DBDBDB" : null,
        },
      ]}
    >
      {!icon
        ? null
        : type === "phone"
        ? ((
            <TouchableOpacity
            // onPress={handlePassword}
            // disabled={type !== 'password' ? true : false}
            >
              <Image style={responsiveStyle.icon} source={icon} />
            </TouchableOpacity>
          ))
        : null}
      <TextInput
        ref={ref}
        style={[
          responsiveStyle.textInput,
          {
            height:
              Platform.OS === "android"
                ? multiline
                  ? dimensions.windowHeight * Height
                  : dimensions.windowHeight * Height
                : multiline
                ? dimensions.windowHeight * 0.1
                : dimensions.windowHeight * 0.049,
            fontSize: fontSize ? fontSize : 12,
            textAlignVertical: multiline ? "top" : "center",
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={"gray"}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        selectionColor={colors.green}
        onChangeText={handleText}
        value={value}
        editable={editable}
        multiline={multiline}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
      />
      {Apply ? (
        <TouchableOpacity
          onPress={handlePromoCode}
          style={[responsiveStyle.ApplyView,{borderRadius: borderRadius ? borderRadius : 15}]}
        >
          <Text style={responsiveStyle.ApplyText}>Apply</Text>
        </TouchableOpacity>
      ) : null}
      {!icon ? null :  type === "password" ? (
        <TouchableOpacity
          onPress={handlePassword}
          disabled={type !== "password" ? true : false}
        >
          <Image style={responsiveStyle.icon} source={icon} />
        </TouchableOpacity>
      ): null}
    </View>
  );
});
const styles = (width, height) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "space-between",
      // backgroundColor: "#F6F6F6",
      borderRadius: 15,
      overflow: "hidden",
      // marginVertical: width * 0.025,
    },
    textInput: {
      flex: 1,
      // borderRadius: 20,
      marginHorizontal: 10,
      // backgroundColor: "#68B054",
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
      paddingHorizontal: width*0.05,
    },
  });

export default IconWithTextInput;
