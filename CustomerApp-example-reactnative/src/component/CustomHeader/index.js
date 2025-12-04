// components/CustomHeader.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import { useCart } from "../../AppContext/CartContext";
const client = process.env.CLIENT;
const CustomHeader = ({
  title,
  leftComponent,
  rightComponent,
  elevation,
  borderBottomLeftRadius,
  borderBottomRightRadius,
  backgroundColor,
  showCustomIcons,
  hideicon,
  dbgcolor,
  color,
}) => {
const {cartSummary} = useCart();
const cartCount = cartSummary.TotalQuantity || 0;
  const navigation = useNavigation();

  return (
    <View
      style={[
        styles.header,
        {
          borderBottomLeftRadius: borderBottomLeftRadius ?? 20,
          borderBottomRightRadius: borderBottomRightRadius ?? 20,
          elevation: elevation ?? 5,
          backgroundColor: (dbgcolor ?? backgroundColor) || "#FFFFFF",
          
        },
      ]}
    >
      
  <View style={[styles.side,{ backgroundColor: (dbgcolor ?? backgroundColor) || 'transparent' }]}>{leftComponent}</View>
  <Text style={[styles.title, { color: color ?? styles.title.color }]}>{title}</Text>
      <View style={styles.side}>
        <View style={[styles.Image, { backgroundColor: (dbgcolor ?? backgroundColor) || 'transparent' }]}>
          {rightComponent}
          {showCustomIcons && (
            <>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate("Drawer", {
                    screen: "Footer",
                    params: { screen: "Home" },
                  })
                }
                style={{ marginLeft: 12 }}
              >
                <Image
                  source={require(`../../assets/images/client/${client}/home-2.png`)}
                  style={{ width: 25, height: 25, resizeMode: "contain"}}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate("Drawer", {
                    screen: "Footer",
                    params: { screen: "Wishlist" },
                  })
                }
                style={{ marginLeft: 12 }}
              >
                <Image
                  source={require(`../../assets/images/client/${client}/heart.png`)}
                  style={{ width: 24, height: 24, resizeMode: "contain" }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate("Drawer", {
                    screen: "Footer",
                    params: { screen: "Cart" },
                  })
                }
                style={{ marginLeft: 12 }}
              >
                {hideicon ? null : (
                <View style={styles.iconWrap}>
                  <Image
                    source={require(`../../assets/images/client/${client}/shop.png`)}
                    style={{ width: 24, height: 24, resizeMode: "contain", marginRight: 8 }}
                  />
                  {cartCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{cartCount > 99 ? "99+" : String(cartCount)}</Text>
                    </View>
                  )}
                </View>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: wp("100%"),
    height: Platform.OS === "android" ? hp("7%") : hp("7%"),
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderColor: "#ddd",
  },
  title: {
    fontSize: RFValue(16),
    fontWeight: "500",
    textAlignVertical:"center",
    color: "#525252",
    fontFamily: "Poppins-Medium",
  },
  side: {
    justifyContent: "center",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  Image:{
    flexDirection:"row",
    alignItems:"center",
  },
  iconWrap: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: 2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: "#34B067",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    includeFontPadding: false,
    textAlignVertical: "center",
  }
})
;

export default CustomHeader;
