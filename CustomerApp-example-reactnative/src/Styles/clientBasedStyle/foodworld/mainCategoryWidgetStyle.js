import { StyleSheet } from "react-native";



const mainCategoryWidgetStyle = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: "white",
  },
  subContainer: {
    margin: 10,
    // backgroundColor: "red",
  },
   dshMenuTitle: {
    paddingHorizontal: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  widgetTitle: {
    fontSize: 20,
    fontWeight: "medium",
    color: "black",
  },
  imageContainer: {
    backgroundColor: "#d0e9d9",
    borderRadius: 10,
    marginVertical: 10,
  },
  flatList: {
    // backgroundColor: colors.lightGrey,
    margin: 5,
    height: 220,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  TouchableOpacity: {
    alignItems: "center",
    // justifyContent:'center',
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: "white",
    width: 90,
    height: 93,
    borderRadius: 20,
    overflow: "hidden",
  },
  imageView: {
    alignItems: "center",
    justifyContent: "space-around",
    // marginHorizontal: 10,
    // marginVertical: 5,
    // backgroundColor: colors.green,

    // borderRadius: 5,
  },
  image: {
    marginTop: 7,
    height: 55,
    width: 80,
    resizeMode: "cover",
    backgroundColor: "#fff",
    borderRadius: 15,
    backgroundColor: "red",
  },
  itemName: {
    fontSize: 11,
    color: "green",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
  },
  viewAll: {
    color: "black",
    fontSize: 15,
  },
  arrow: {
    resizeMode: "contain",
    width: 30,
    height: 30,
    elevation: 5,
    borderRadius: 50,
    backgroundColor: "white",
  },
  });

export default mainCategoryWidgetStyle;
