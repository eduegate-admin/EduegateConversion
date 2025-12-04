import { View, TouchableOpacity, Text } from "react-native";
import { Image } from "react-native";
import colors from "../../../config/colors";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";


import footer from "../clients/footer";
import { useCart } from "../../../AppContext/CartContext";
import appSettings from "../../../../Client/appSettings";

const client = process.env.CLIENT;
const footerContent = footer[client];
// console.log("footerContent", footerContent);
const NormalTabBar = ({ state, navigation }) => {
  const { cartSummary } = useCart();
  const cartCount = cartSummary.TotalQuantity || 0;
  const hideFooter = appSettings[client].hideFooter;

  const [styles, setStyle] = useState(ClientStyles(client, "TabBar"));
  const { t } = useTranslation();

  useEffect(() => {
    const clientStyle = ClientStyles(client, "TabBar");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, []);

  if (!state || !state.routes) {
    console.warn("State or routes are undefined. Check navigator setup.");
    return null;
  }

  // Hide footer on Category screen for client 'almadinadot'
  const activeRouteName = state.routes[state.index]?.name;
  if (hideFooter && activeRouteName === 'Category') {
    return null;
  }

  return (
    <View>
      <View style={styles.container}>
        {footerContent.map((item, index) => {
          // console.log(item)
          const isFocused = state.routes[state.index]?.name === item.navigateTo;
          // const nav =
          //   client === "benchmarkfoods" && item.navigateTo === "Cart"
          //     ? useNavigation()
          //     : navigation;
          // console.log("isFocused",isFocused)
          const color = isFocused ? "#FFFFFF" : "#949494";
          const icon = isFocused ? item.activeIcon : item.inActiveIcon;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                item.navigateTo === "Drawer"
                  ? navigation.openDrawer()
                  : item.navigateTo === "Offers"
                    ? navigation.navigate("Offers", {
                      title: "Offer Products",
                      searchVal: "skutags:PROMOTIONS",
                      searchText: `${""}`,
                      searchBy: "skutags",
                      sortBy: `${"relevance"}`,
                      isCategory: `${false}`,
                      pageType: `${"Recommended"}`,
                    })
                    : navigation.navigate(item.navigateTo);
              }}
              style={styles.TouchableOpacity}
            >
              <View
                style={[
                  styles.IconView,
                  {
                    backgroundColor: isFocused
                      ? item?.backgroundColor
                      : colors.transparent,
                    borderRadius: isFocused ? 50 : 0,
                  },
                ]}
              >
                {item.itemName === "cart" && cartCount > 0 && (
                  <View style={styles.cartCount}>
                    <Text style={styles.count}>{cartCount}</Text>
                  </View>
                )}

                <Image source={icon} style={styles.Icon} />
              </View>
              <Text
                style={[
                  styles.Text,
                  { color: isFocused ? item?.color : item?.unFocusedColor || "#525252" },
                ]}
              >
                {t(item.itemName)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};


export default NormalTabBar;
