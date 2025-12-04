import { StyleSheet } from "react-native";


import colors from "../../../config/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: 19
  },
  subContainer: {
    paddingBottom: 10,
  },
  dshMenuTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  viewAll: {
    color: colors.primary,
    fontSize: 14,
  },
  flatList: {
    paddingLeft: 10,
  },
  widget: {
    backgroundColor: colors.background,
    marginHorizontal: 6,
    width: 160,
    borderRadius: 30,
    elevation: 3,
    alignItems: 'center',
    paddingBottom: 10,
  },
  imageTouchView: {
    width: '100%',
    aspectRatio:0.8,
    alignItems: 'center',
    marginBottom:-4,
    justifyContent: 'center',
    overflow: 'hidden',

    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: 'transparent',
  },
  images: {
    width: '100%',
    height: '100%',
    // aspectRatio:0.2,
    // height: 140,
    resizeMode: 'contain',
    // backgroundColor: 'red',
  },
  textView: {
    width: '85%',
    paddingTop: 10,
  },
  ProductNametextView: {
    width: '100%',
    aspectRatio: 2.9,
    backgroundColor:'red' 
  },
  PriceCommonView: {
    flexDirection: 'row',
    alignItems: 'flex-start',

    // backgroundColor:"blue"

  },
  ProductPrice: {
    fontSize: 30,
    fontWeight: 'bold',
    // backgroundColor:"red",

    color: colors.textPrimary,
  },
  AedText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  ProductName: {
    fontSize: 14,
    fontWeight: 500,
    color: colors.textPrimary,
    marginTop: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default styles;
