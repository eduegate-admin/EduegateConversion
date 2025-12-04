import { StyleSheet } from "react-native";
import colors from "../../config/colors";




const styles = StyleSheet.create({
  Container: {
    flex: 1,
    marginVertical: 5,
    padding: 5,
    overflow: "hidden",
    // backgroundColor:"red",
    // width:'100',
    // backgroundColor: colors.lightWhite,
    // marginLeft:100
  },

  accountTouch: {
    flexDirection: "column",       // stack items vertically
    alignItems: "center",          // center items horizontally
    justifyContent: "center",      // center vertically
    // paddingVertical: 15,
    borderBottomWidth: 0.24,
    borderBottomColor: colors.lightWhite,
    // height: 160,                   // increased height for vertical layout
    width: '100%',
  },

  accountImgView: {
    width: 50,
    height: 50,
    borderRadius: 50.,              // fully round
    backgroundColor: colors.green,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,               // spacing below the image
  },

  image: {
    width: 46,
    height: 46,
     
    resizeMode: "contain",
    borderRadius: 50,
  },

  welcomeView: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // welcomeText: {
  //   fontSize: 15,
  //   color: colors.black,
  //   fontFamily: 'mulish_Regular',
  // },

  Name: {
    fontSize: 14,
    color: colors.black_lvl_2,
    fontFamily: 'poppins_Regular',
    fontWeight: 'bold',
  },

  commonMargin: {
    marginVertical: 8,
    
    // backgroundColor:'black'
  },

  drawerView: {
    flexDirection: "row",
    alignItems: "center",
    // paddingVertical: 5,
    justifyContent: "space-between",
    // backgroundColor:'blue'
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'gray',
  },

  drawerInnerView: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 8,
    // backgroundColor: "blue",
  },

  iconContainer: {
    width: "25",
    marginHorizontal: 14,
    marginVertical: 5,
    

  },

  icon: {
    // width: 25

    resizeMode: "contain",
    marginLeft: 12,
    marginRight: 14,
  },

  drawerText: {
    fontSize: 15,
    fontFamily: 'poppins_Regular',
    color:"#666666",
    fontWeight: '500'
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
    textAlign: 'center',
  },

  socialPlatform: {
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
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

export default styles;
