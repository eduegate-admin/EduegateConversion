import React, { useState } from "react";
import { Dimensions, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import colors from "../../../config/colors";
import { useDimensionContext } from "../../../AppContext/DimensionContext";


const {width,height} = Dimensions.get('screen');
const NormalTextInput = (props) => {
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
        multiline= false,
        Width,
        Height,
        fontSize,
        borderWidth,
        borderColor,
        editable,
        borderRadius
      } = props;
      
      const [show, setShow] = useState(false);
      const keyboardType =
        type === 'email'
          ? 'email-address'
          : type === 'password'
          ? 'default'
          : type === 'phone'
          ? 'phone-pad'
          : 'default';
    
      const secureTextEntry = type === 'password' ? (show ? false : true) : false;
      const icon =
        type === 'email'
          ? null
          : type === 'password'
          ? show
            ? require('../../../assets/images/client/foodworld/card.png')
            : require('../../../assets/images/client/foodworld/card.png')
          : false;
    
      const handlePassword = () => {
        setShow(!show);
      };
      const handlePromoCode = () => {}
      return (
        <View style={[responsiveStyle.container,{
          width: Width ? width*Width : width*0.81,
          height: Height ? height*Height : height*0.048,
          borderWidth: borderWidth ? borderWidth : null,
          borderColor: borderColor ? borderColor : null,
          borderRadius: borderRadius ? borderRadius : 15
          }]}>
          <TextInput
          style={[
            responsiveStyle.textInput,
              {height: Platform.OS === 'android' 
                ? multiline 
                  ? dimensions.windowHeight * 0.1
                  : dimensions.windowHeight * 0.049
                :multiline
                ? dimensions.windowHeight *0.1
                : dimensions.windowHeight *0.049,
                fontSize: fontSize ? width*fontSize : width*0.03,
              },
            ]}
            placeholder={placeholder}
            placeholderTextColor={'gray'}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            selectionColor={colors.green}
            onChangeText={handleText}
            value={value}
            multiline={multiline}
            editable={editable}
          />
          {Apply ? <TouchableOpacity 
          onPress={handlePromoCode}
          style={responsiveStyle.ApplyView}><Text style={responsiveStyle.ApplyText}>Apply</Text></TouchableOpacity> : null }
          {!icon ? null : (
            <TouchableOpacity
              onPress={handlePassword}
              disabled={type !== 'password' ? true : false}>
              <Image style={responsiveStyle.icon} source={icon} />
            </TouchableOpacity>
          )}
        </View>
      );
    };
    const styles =(width,height) => StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignSelf:'center',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor:'#F6F6F6',
            // borderRadius: 15,
            overflow:'hidden'
            // marginVertical: width * 0.025,
        },
        textInput: {
            flex: 1,
            borderRadius: 20,
            paddingLeft:20
        },
        ApplyView: {
            backgroundColor:'#68B054',
            width:width*0.2,
            height:height*0.048,
            alignItems:'center',
            justifyContent:'center',
            borderRadius:15
        },
        ApplyText: { 
            color:'white',
            fontSize: width*0.037,
        },
        icon: {
            width: width * 0.075,
            height: height * 0.025,
            resizeMode: 'contain',
        }
    });

export default NormalTextInput;
