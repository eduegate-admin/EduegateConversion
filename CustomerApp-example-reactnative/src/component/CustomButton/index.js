import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useDimensionContext } from "../../AppContext/DimensionContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";


const {width,height} = Dimensions.get('screen');

const CustomButton = (props) => {
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );
  
  const {
    buttonColor,
    buttonText,
    buttonTextColor,
    handleButtonPress,
    onPress,
    icon,
    position,
    bottom,
    Width,
    width: widthProp,
    Height,
    height: heightProp,
    Radius,
    radius,
    // fontSizeW,
    // fontSizeH,
    fontSize,
    type,
    borderColor,
    borderWidth,
    disabled,
    opacity,
    loading,
    style,
    containerStyle,
    ...restProps
  } = props;

  const handlePress = handleButtonPress || onPress;
  
  const buttonWidth = widthProp || (Width ? wp(Width): wp("100%"));
  
  const buttonHeight = heightProp || (Height ? hp(Height) : 50);
  
  const buttonRadius = radius || Radius || 20;
  
  // const getFontSize = () => {
  //   if (fontSize) return fontSize;
  //   if (fontSizeW && fontSizeH) return width * fontSizeW && height * fontSizeH;
  //   return 20;
  // };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        responsiveStyle.ButtonView,
        {
          backgroundColor: buttonColor ? buttonColor : "#58BB47",
          position: position ? position : null,
          bottom: bottom ? height * bottom : null,
          width: buttonWidth,
          height: buttonHeight,
          borderRadius: buttonRadius,
          borderColor: borderColor ? borderColor : null,
          borderWidth: borderWidth ? borderWidth : null,
          ...(buttonColor === "#FFFFFF" ? { elevation: 8 } : {}),
          opacity: opacity ? opacity : null,
        },
        style,
        containerStyle,
      ]}
      disabled={disabled ? disabled : false}
      {...restProps}
    >
      {type === 'normal' ? null : <Image style={responsiveStyle.icon} source={icon} />}
      
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text
          style={[
            responsiveStyle.buttonText,
            {
              color: buttonTextColor ? buttonTextColor : "#FFFFFF",
              fontSize: fontSize,
            },
          ]}
        >
          {buttonText}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = (width, height) => StyleSheet.create({
  ButtonView: {
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "500",
    fontFamily:"Poppins-Regular"
  },
  icon: {
    width: 25,
    height: 25,
    resizeMode: "contain",
    right: 10,
  },
});

export default CustomButton;
