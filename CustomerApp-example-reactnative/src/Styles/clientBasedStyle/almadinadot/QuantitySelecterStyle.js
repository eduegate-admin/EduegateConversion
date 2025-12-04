import { StyleSheet } from "react-native";
import colors from "../../../config/colors";

const QuantitySelectorStyle = StyleSheet.create({
    root: {
    marginTop: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    // backgroundColor: 'yellow',
    marginRight:-9,
    borderRadius: 15,
    paddingVertical: 4,
    paddingLeft:4,
    zIndex: 1,
  },
  button: {
    aspectRatio: 1,
    minWidth: 27,
    borderRadius: 15,
    marginHorizontal: 4,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    includeFontPadding: false,
  },
  quantity: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.green,
    minWidth: 20,
    textAlign: 'center',
  }
})

export default QuantitySelectorStyle;
