import { StyleSheet } from "react-native";



const SearchBarStyle = StyleSheet.create({
 container: {
    alignItems: "center",
    width: '100%',
    paddingBottom: 10,
    padding: 10,

  },
  newContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: '100%',
    paddingBottom: 20,
    paddingHorizontal: 15,



  },
  search: {
    borderWidth: 0,
    borderColor: "transparent",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 13,
    marginBottom: -2,
    paddingHorizontal: 15,
    width: "100%",
    height: 40,


    backgroundColor: "#dddddd"
  },
  newStyle: {
    borderWidth: 0,
    borderColor: "transparent",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 16,
    paddingHorizontal: 15,

    width: "80%",
    height: 46,
  },
  innerView: {
    flexDirection: "row",
    alignItems: "center",

  },
  searchIcon: {
    width: 26,
    height: 26,
    marginLeft: 15,
    resizeMode: "contain",
    tintColor: "#797979",

  },
  FilterIcon: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: 300,
    // width: 60,
    marginLeft: 10,
    paddingBottom: 8,
    color: "#000",

  },
  placeholderText: {
    flex: 1,
    fontSize: 13,
    fontWeight: 300,
    marginLeft: 3,
    // color: "#133051",
    color: "#797979",
    fontFamily: "Mulish-Regular",
  },
  scanIcon: {
    width: 45,
    height: 45,
    resizeMode: "contain",
    marginLeft: 15,
  },
  Scan: {
    fontSize: 18,
    color: "black",
  },
  });

export default SearchBarStyle;
