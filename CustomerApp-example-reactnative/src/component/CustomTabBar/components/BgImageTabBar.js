import { useNavigation } from "@react-navigation/native";
import { View,
    TouchableOpacity,
    Text,
    ImageBackground,
    Dimensions,
    StyleSheet, } from "react-native";
import { Feather,AntDesign,Octicons,Ionicons } from "@expo/vector-icons";


const BgImageTabBar = ({state}) => {
  // console.log('toggleDrawerType', toggleDrawerType)
    const navigation = useNavigation();
  const footerContent = [
    {
      id: 0,
      itemName: "Home",
      navigateTo: "Home",
    },
    {
      id: 1,
      itemName: "Category",
      navigateTo: "Order",
    },
    {
      id: 2,
      itemName: "Cart",
      navigateTo: "Cart",
    },
    {
      id: 3,
      itemName: "Offers",
      navigateTo: "Offers",
    },
    {
      id: 4,
      itemName: "More",
      navigateTo: "Account",
    },
  ];
  return (
    <View
      style={{
        position: "absolute",
        bottom: -16,
        alignItems: "center",
        width: Dimensions.get("window").width,
      }}
    >
      <ImageBackground
        source={require("../../../assets/footer-menu.png")}
        resizeMode="contain"
        style={styles.image}
      >
        <View
          style={{
            flexDirection: "row",
            height: 120,
            backgroundColor: "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {footerContent.map((item, index) => {
            const isFocused =  state.routes[state.index]?.name === item.navigateTo;

            const icon =
              item.itemName === "Home" ? (
                <AntDesign name="home" size={30} color= {isFocused ? "white" : "#FFF9"} />
              ) : item.itemName === "Category" ? (
                <Octicons name="apps" size={30} color= {isFocused ? "white" : "#FFF9"} />
              ) : item.itemName === "Offers" ? (
                <Feather name="gift" size={30} color= {isFocused ? "white" : "#FFF9"} />
              ) : item.itemName === "More" ? (
                <Ionicons name="options-outline" size={30} color= {isFocused ? "white" : "#FFF9"} />
              ) : item.itemName === "Cart" ? (
                <Octicons name="dot" size={30} color="transparent" />
              ) : null;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  if (item.itemName === "More") {
                    navigation.toggleDrawer();
                  } else {
                    navigation.navigate(item.navigateTo);
                  }
                }}
                style={{
                  flex: 1,
                  alignItems: "center",
                  backgroundColor: "transparent",
                  bottom: item.name === "Cart" ? 10 : -20,
                  marginLeft: 15,
                  marginRight: 15,
                }}
              >
                <View>{icon}</View>
                <Text
                  style={{
                    backgroundColor: "transparent",
                    color: isFocused ? "white" : "#FFF9",
                    // padding:2,
                  }}
                >
                  {item.itemName !== "Cart" ? item.itemName : null}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
    image: {
      width:451,
      height:136,
    },
  });
export default BgImageTabBar;
