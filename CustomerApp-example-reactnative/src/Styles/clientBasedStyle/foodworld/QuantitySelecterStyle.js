import { StyleSheet } from "react-native";

const QuantitySelectorStyle = StyleSheet.create({
    root:{
        flexDirection: 'row',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor: '#F5F5F5',
        width: 90,
        height:35,
        borderRadius: 30,
        paddingHorizontal:10,
    },
    button:{
        // alignItems:'center',
        width:"60%",
        height:'150%',
        justifyContent:'center',
        // backgroundColor: colors.green,
        // elevation:5
    },
    buttonText:{
        fontSize:20,
        textAlign:"center",
        // lineHeight:35,
        color: '#68B054'
    },
    quantity:{
        fontSize: 18,
        fontWeight:'bold',
        color: 'black',
        textAlign:"center",
        width:"35%",
        // backgroundColor:'red'
    }
  })

export default QuantitySelectorStyle;
