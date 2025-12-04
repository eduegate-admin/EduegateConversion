import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

const homeHeaderStyles = StyleSheet.create({
    mainView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      flex: 1,
      width: wp("100%"),
      height: 380,
      marginTop: -25,
    },
    imageBackground: {
      borderBottomLeftRadius: 50,
      borderBottomRightRadius: 50,
      overflow: "hidden",
    },
    image: {
      flex: 1,
      justifyContent: "center",
      overflow: "hidden",
    },
    headerContainer: {
      paddingHorizontal: 15,
      marginBottom: -70,
    },
    bannerCnt: {
      justifyContent: "space-between",
      flexWrap: "wrap",
      flexDirection: "row",
      paddingTop: 30,
      paddingBottom: 20,
    },
    bannerSearch: {
      paddingBottom: 120,
    },
    bannerCntLeft: {
      flexBasis: wp("60%"),
    },
    bannerCntRight: {
      flexDirection: "row",
    },
    welcomeText: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
      marginBottom: 5,
    },
    center: {
      alignItems: "center",
      justifyContent: "center",
    },
    tinyLogo: {
      marginHorizontal: 10,
      width: 25,
      height: 25,
    },
    welcomeLogo: {
      width: 50,
      height: 50,
      borderRadius: 50,
      borderColor: "white",
      borderWidth: 2,
    },
    deliveryPoint: {
      fontSize: 14,
      fontWeight: "bold",
      color: "white",
      marginBottom: 5,
    },
    searchContainer: {
      alignSelf: "center",
      height: 45,
      width: "100%",
      backgroundColor: " rgba(149,175,192,0.53)",
      borderRadius: 15,
      flexDirection: "row",
      alignItems: "center",
    },
    searchIconContainer: {
      marginLeft: 20,
    },
    textInputContainer: {
      marginLeft: 10,
      width: "80%",
    },
    deliveryPointConatiner: {
      flexDirection: "row",
      alignItems: "center",
      maxWidth: wp("50%"),
    },
  });

export default homeHeaderStyles;
