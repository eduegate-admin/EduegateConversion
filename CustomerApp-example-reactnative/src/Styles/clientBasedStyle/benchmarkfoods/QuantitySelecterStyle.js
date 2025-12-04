import { Platform, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const QuantitySelectorStyle = StyleSheet.create({
  root:{
         flexDirection: 'row',
         alignItems:'center',
         justifyContent:'center',
         // backgroundColor: '#000',
         width: wp('25%'),
         height: hp('3.875%'),
         borderRadius: 10,
         paddingHorizontal:wp("3%"),
         borderWidth:1,
         borderColor:"#1D9ADC"
     },
     button:{
         alignItems:'center',
         width: wp('10%'),
         height:hp('5%'),
         justifyContent:'center',
         // backgroundColor: colors.green,
         // elevation:5
     },
     buttonText:{
         fontSize:RFValue(18),
         textAlign:"center",
         fontWeight:'600',
         fontFamily:"Poppins-SemiBold",
         alignItems:"center",
        lineHeight: Platform.OS === "android" ? 14 : 0,
         color: '#1D9ADC',
         // backgroundColor:'red',
     },
     quantity:{
         fontSize: RFValue(14),
         fontWeight:'600',
         fontFamily:"Poppins-SemiBold",
         color: '#1D9ADC',
         textAlign:"center",
         // backgroundColor:'red',
         width:wp("6%"),
         lineHeight: Platform.OS === "android" ? 14 : 0,
     }
  })

export default QuantitySelectorStyle;
