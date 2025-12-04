import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Image } from "react-native";
import { useDimensionContext } from "../../../AppContext/DimensionContext";
import colors from "../../../config/colors";

const FloatingTabBar = ({ state , navigation}) => {
  const dimensions = useDimensionContext();
  const responsiveStyle = styles(
    dimensions.windowWidth,
    dimensions.windowHeight,
    dimensions.isPortrait
  );
  // const navigation = useNavigation();

  if (!state || !state.routes) {
    console.warn("State or routes are undefined. Check navigator setup.");
    return null;
  }

  const footerContent = [
    {
      itemName: "Home",
      navigateTo: "Home",
      activeIcon: require("../../../assets/images/client/foodworld/home-2.png"),
      inActiveIcon: require("../../../assets/images/client/foodworld/home-2-1.png"),
    },
    {
      itemName: "Categories",
      navigateTo: "Category",
      activeIcon: require("../../../assets/images/client/foodworld/category-2.png"),
      inActiveIcon: require("../../../assets/images/client/foodworld/category-2-1.png"),
    },

    {
      itemName: "Cart",
      navigateTo: "Cart",
      activeIcon: require("../../../assets/images/client/foodworld/shop.png"),
      inActiveIcon: require("../../../assets/images/client/foodworld/shop-1.png"),
    },
    {
      itemName: "Orders",
      navigateTo: "OrderDetailsDrawer",
      activeIcon: require("../../../assets/images/client/foodworld/percentage-square.png"),
      inActiveIcon: require("../../../assets/images/client/foodworld/percentage-square-1.png"),
    },
    {
      itemName: "More",
      navigateTo: "Account",
      activeIcon: require("../../../assets/images/client/foodworld/user-square-1.png"),
      inActiveIcon: require("../../../assets/images/client/foodworld/user-square.png"),
    },
  ];

  return (
    <View>
      <View style={responsiveStyle.container}>
        {footerContent.map((item, index) => {
          const isFocused = state.routes[state.index]?.name === item.navigateTo;
          const color = isFocused ? "#FFFFFF" : "#949494";
          const icon = isFocused ? item.activeIcon : item.inActiveIcon;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                item.navigateTo === "Account"
                  ? navigation.openDrawer()
                  : navigation.navigate(item.navigateTo);
              }}
              style={responsiveStyle.TouchableOpacity}
            >
              <View
                style={[
                  responsiveStyle.IconView,
                  { backgroundColor: isFocused ? "#68B054" : colors.transparent , borderRadius: isFocused ? 50 : 0,},
                ]}
              >
                <Image source={icon} style={responsiveStyle.Icon} />
              </View>
              <Text
                style={[
                  responsiveStyle.Text,
                  { color: isFocused ? "#68B054" : "#949494" , },
                ]}
              >
                {item.itemName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = (width, height) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      width: width * 0.95,
      height: height * 0.08,
      backgroundColor: "#FFFFFF",
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      elevation: 3,
      position: "absolute",
      // left: 0,
      // right: 0,
      bottom: 8,
    },
    TouchableOpacity: {
      flex: 1,
      alignItems: "center",
      backgroundColor: colors.transparent,
    },
    IconView: {
      width: width * 0.1,
      height: width * 0.1,
      justifyContent: "center",
      alignItems: "center",
    },
    Icon: {
      width: width * 0.065,
      height: width * 0.065,
      resizeMode: "contain",
    },
    Text: {
      backgroundColor: colors.transparent,
      fontSize: width * 0.03,
      fontWeight: 500,
    },
  });

export default FloatingTabBar;
