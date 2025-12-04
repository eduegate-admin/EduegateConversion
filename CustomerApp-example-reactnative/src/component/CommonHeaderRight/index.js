import { Image, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../AppContext/CartContext";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useEffect, useState } from "react";
import ClientStyles from "../../Styles/StyleLoader/ClientStyles";

const client = process.env.CLIENT;

const CommonHeaderRight = ({ setMapBar, handleSearch, type = [] }) => {
  const navigation = useNavigation();
  const { cartSummary } = useCart();
  // console.log("cartsummary",cartSummary);
  
  const cartCount = cartSummary.CartCount || 0;
  const [styles, setStyle] = useState(ClientStyles(client, "CommonHeaderRight"));

  useEffect(() => {
    const clientStyle = ClientStyles(client, "CommonHeaderRight");
    if (clientStyle) {
      setStyle(clientStyle);
    }
  }, [client]);
  const goToCart = () => {
    navigation.navigate("Cart");
  };

  return (
    <View style={styles.flexStyle}>
      {type.includes("search") && (
        <TouchableOpacity style={styles.padding} onPress={handleSearch}>
          <Image
            source={require(
              `../../assets/images/client/${client}/searchbar-icon.png`
            )}
            style={[styles.image, { width: wp("5.57%"), height: wp("5.57%") }]}
          />
        </TouchableOpacity>
      )}
      {type.includes("Cart") && (
        <TouchableOpacity style={styles.padding} onPress={goToCart}>
          <View style={styles.cartCount}>
            <Text style={styles.count}>{cartCount}</Text>
          </View>
          <Image
            source={require(`../../assets/images/client/${client}/shop.png`)}
            style={styles.image}
          />
        </TouchableOpacity>
      )}

      {type.includes("Map") && (
        <TouchableOpacity style={styles.padding} onPress={setMapBar}>
          <Image
            source={require(
              `../../assets/images/client/${client}/searchlocation.png`
            )}
            style={styles.image}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

// const styles = StyleSheet.create({
//   padding: {
//     marginLeft: wp("4.44%"),
//   },
//   image: {
//     width: wp("6.67%"),
//     height: wp("6.67%"),
//     resizeMode: "contain",
//   },
//   cartCount: {
//     width: wp("5%"),
//     height: wp("5%"),
//     // paddingHorizontal: wp("1.5%"),
//     // paddingVertical: wp("0.2%"),
//     position: "absolute",
//     left: wp("3.1%"),
//     bottom: wp("3.9%"),
//     backgroundColor: "#1D9ADC",
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 50,
//     overflow: "hidden",
//     zIndex: 9,
//   },
//   count: {
//     color: "white",
//     fontSize: RFValue(12, 800),
//     textAlign: "center",
//     fontFamily: "Poppins-SemiBold",
//     fontWeight: "600",
//     lineHeight: 20,
//   },
//   flexStyle: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     // backgroundColor: "#000",
//     paddingRight: wp("4.44%"),
//   },
// });

export default CommonHeaderRight;
