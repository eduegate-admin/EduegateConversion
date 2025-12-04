import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
// import QuantitySelector from "../../QuantitySelector/Quantity";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import appSettings from "../../../../Client/appSettings";
import { useCart } from "../../../AppContext/CartContext";
import CartService from "../../../services/cartService";
import UserService from "../../../services/UserService";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";
import callContextCache from "../../../utils/callContextCache";
import styles from "./style";
const client = process.env.CLIENT;

const CartSuggestion = ({ setLoading }) => {
  const [products, setProducts] = useState([]);
  const [styles, setStyle] = useState(ClientStyles(client, "cartSuggestion"));
  const hideProductName = appSettings[client]?.hideProductName;
  const SuggestionProducts = appSettings[client]?.SuggestionProducts;

  const { updateCart } = useCart();
  const { t } = useTranslation();
  const navigation = useNavigation();
  useEffect(() => {
    const clientStyle = ClientStyles(client, "cartSuggestion");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, [client]);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const payload = {};
      const response = await CartService.getCartSuggestions(payload);
      console.log("response", response);

      // Extract rows safely
      const rows = response?.data?.BoilerPlateResultSetList?.[0]?.Rows || [];

      // Map DataCells to proper product objects
      const productList = rows.map((row) => {
        const [
          SKUID,
          ,
          ProductName,
          ProductDescription,
          ProductThumbnail,
          ProductLargeImage,
        ] = row.DataCells;
        return {
          SKUID,
          ProductName,
          ProductDescription,
          ProductThumbnail,
          ProductLargeImage,
        };
      });
      if (SuggestionProducts) {
        setProducts(response.data.Datas[0]);
      } else {
        setProducts(productList);
      }
      //  setProducts(productList);
    } catch (error) {
      console.error("Error fetching getCartSuggestions API data:", error);
    }
  };
  // console.log("products", products);

  const handlePress = async (productId) => {
    setLoading(true);
    try {
      const [user, callContext] = await Promise.all([
        UserService.getUserDetails(),
        callContextCache.get(),
      ]);
      const BranchID = user?.data?.Branch?.BranchIID;
      const currency = callContext?.CurrencyCode;

      const payload = {
        BranchID,
        CartItemNote: "",
        Currency: currency,
        MaximumQuantityInCart: productId,
        ProductOptionID: "",
        Quantity: 1,
        SKUID: productId,
      };

      const response = await CartService.addToCart(payload);

      if (response.status !== 200) {
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Failed to update cart.",
        });
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const data = await response.data;
      if (data?.Message === "Cart updated successfully") {
        await updateCart();
        Toast.show({
          type: "success",
          text1: data?.Message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: data?.Message,
        });
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.dshMenuCnt}>
        <View style={styles.dshMenuTitle}>
          <Text style={styles.widgetTitle}>{t("youMightLike")}</Text>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={{ padding: 5 }}
          keyExtractor={(item) => String(item.SKUID)}
          data={products}
          renderItem={({ item }) => {
            if (!item.ProductThumbnail) return null;
            return (
              <View style={styles.widget}>
                <TouchableOpacity
                  style={styles.imageTouchView}
                  onPress={() =>
                    navigation.navigate("ProductDetails", { item })
                  }
                >
                  <Image
                    style={styles.images}
                    source={{ uri: item.ProductThumbnail }}
                    // contentFit="contain"
                    transition={200}
                    cachePolicy="memory-disk"
                  />
                </TouchableOpacity>
                {!hideProductName && (
                  <View style={styles.textView}>
                    <Text numberOfLines={1} style={styles.ProductName}>
                      {item.ProductName}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.AddButtonView}
                  onPress={() => handlePress(item.SKUID)}
                >
                  <Text style={styles.AddText}>{t("addToCart")} +</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
};

export default CartSuggestion;
