import { StyleSheet } from "react-native";


import colors from "../../../config/colors";

const DrawerStyle = StyleSheet.create({
    Container: {
    flex: 1,
    marginVertical: 5,
    padding: 5,
    overflow: "hidden",
    // backgroundColor: colors.lightWhite,
    // marginLeft:100
  },
  accountTouch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:'space-around',
    // borderBottomWidth: 1.1,
    paddingVertical: 15,
    // backgroundColor: colors.orange,
     borderBottomWidth:0.24,
    borderBottomColor:colors.lightWhite,
    height:110,
    width:'100%',
  },
  accountImgView: {
    width: 60,
    height: 60,
    borderRadius: 75 / 2,
    backgroundColor: colors.green,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    borderRadius: 10,
  },
  welcomeView: {
    // flexDirection:'row',
    alignItems: 'center',
    justifyContent:'space-around',
    marginLeft: 4,
    width: "69%",
    // backgroundColor: "red",
    overflow:'hidden',
  },
  welcomeText: {
    
    fontSize: 15,
    color: colors.black,
  },
  Name: {
    
    fontSize: 20,
    color: colors.black_lvl_2,
  },
  commonMargin: {
    marginVertical: 10,
    // backgroundColor:'black'
  },
  drawerView: {
    flexDirection: "row",
    alignItems: "center",
    // paddingVertical: 5,
    justifyContent: "space-between",
    // backgroundColor:'blue'
    borderBottomWidth:StyleSheet.hairlineWidth,
    borderBottomColor: 'gray'
  },
  drawerInnerView: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical:8,
    // backgroundColor: "blue",
  },
  icon: {
    width: 25,
    height: 25,
    resizeMode: "contain",
    marginRight: 14,
  },
  drawerText: {
    fontSize: 15,
    color: colors.darkGrey,
  },
  iconSecond: {
    width: 25,
    height: 25,
    resizeMode: "contain",
    backgroundColor: colors.lightWhite,
    overflow: "hidden",
    borderRadius: 25 / 2,
  },
  
  Version: {
    fontSize: 12,
    // padding: 2,
    color: colors.darkGrey,
    textAlign:'center',
  },
  socialPlatform: {
    justifyContent:'space-around',
    alignItems:'center',
    flexDirection:'row',
    // backgroundColor: colors.green,
    padding: 20,
    marginHorizontal: 35,
  },
  socialIcon: {
    width: 35,
    height: 35,
    resizeMode: "contain",
  },
  });

export default DrawerStyle;
