import { StyleSheet } from "react-native";



const OrderStyle = StyleSheet.create({
  MainContainer: {
    flex: 1,
    // backgroundColor: "#FFFFFF",
    width: "100%",
    // marginBottom: 30,
  },
  container: {
    width: "100%",
    height: 146,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 10,
    marginTop: 15,
  },
  Image: {
    width: "30%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "contain",
    backgroundColor: "#FFFFFF",
  },
  contentView: {
    width: "70%",
    height: "100%",
    // backgroundColor: "lightblue",
    // justifyContent: "space-between",
    // alignItems: "center",
    // flexDirection: "row",
    borderRadius: 10,
  },
  detailsView: {
    width: "100%",
    height: "63%",
    // backgroundColor: "orange",
    // justifyContent: "space-between",
    // alignItems: "center",
    // flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 10,
  },
  orderId: {
    fontSize: 21,
    fontWeight: 500,
    color: "#133051",
  },
  dateText: {
    fontSize: 16,
    fontWeight: 500,
    color: "#B5B5B5",
  },
  Amount: {
    fontSize: 22,
    fontWeight: 500,
    color: "#133051",
  },
  buttonCommonView: {
    width: "100%",
    height: "26%",
    // backgroundColor: "blue",
    justifyContent: "space-between",
    // alignItems: "center",
    flexDirection: "row",
    borderRadius: 10,
    paddingHorizontal: 16,
  },
});

export default OrderStyle;
