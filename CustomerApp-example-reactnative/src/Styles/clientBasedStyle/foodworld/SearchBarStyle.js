import { StyleSheet } from "react-native";



const SearchBarStyle = StyleSheet.create({
    container: {
    alignItems: "center",
    width : '100%',
    paddingBottom:10,
    
  },
  newContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width : '100%',
    paddingBottom:20,
    paddingHorizontal:15,
  },
  search: {
    borderWidth: 1,
    borderColor: "#58BB47",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 16,
    paddingHorizontal: 15,
    width: "90%",
    height: 46,
    // backgroundColor:"#000000"
  },
  newStyle: {
    borderWidth: 1,
    borderColor: "#58BB47",
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
    width: 19,
    height: 19,
    resizeMode: "contain",
  },
  FilterIcon: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: 300,
    // width: 60,
    marginLeft: 10,
    paddingBottom: 8,
    color: "#000",
    //   backgroundColor: "transparent",
  },
  placeholderText: {
    flex: 1,
    fontSize: 17,
    fontWeight: 300,
    marginLeft: 10,
    color: "#133051",
  },
  scanIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
    marginLeft: 10,
  },
  Scan: {
    fontSize: 18,
    color: "black",
  },
  });

export default SearchBarStyle;
