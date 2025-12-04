import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  FlatList,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import QuantitySelector from "../../../component/QuantitySelector/Quantity";
import { useWishlist } from "../../../AppContext/WishlistContext";
import { useWishlistActions } from "../../../hooks/useWishlistActions";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import CustomHeader from "../../../component/CustomHeader";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import { WishlistSkeleton } from "../../../component/Skeleton/SkeletonComponents";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";
import { LinearGradient } from "expo-linear-gradient";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useCallContext } from "../../../AppContext/CallContext";
import { useCart } from "../../../AppContext/CartContext";
import CartService from "../../../services/cartService";
import appSettings from "../../../../Client/appSettings";

const client = process.env.CLIENT;

const NormalWishlist = (props) => {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [styles, setStyle] = useState(ClientStyles(client, "Wishlist"));
  const backgroundColor = appSettings[client]?.backgroundColor;
  
  const navigation = useNavigation();
  const { callContext } = useCallContext();
  const { updateCart, cart } = useCart();
  const { t } = useTranslation();
  const { wishlistData, isLoading: wishlistLoading } = useWishlist();
  const { removeFromSaveForLater } = useWishlistActions();
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const conditionalHeaderProps = appSettings[client]?.conditionalHeaderProps;
  useEffect(() => {
    const clientStyle = ClientStyles(client, "Wishlist");
    if (clientStyle) {
      setStyle(clientStyle);
    }
  }, [client]);

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        
         conditionalHeaderProps ? (
          <CustomHeader
            title={t("wishlist")}
            leftComponent={<CommonHeaderLeft type="back" />}
            elevation={0}
            borderBottomLeftRadius={0}
            borderBottomRightRadius={0}
            // dbgcolor="#12a14f"
            backgroundColor={backgroundColor}
            showCustomIcons={true}
            hideicon={true}
            color="#FFFFFF"
          />
        ) : <CustomHeader
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight type={["Cart"]} />}
        />
      ),
      title: t("wishlist"),
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProduct();
    }, [wishlistData])
  );

  // Update products when wishlist data changes
  useEffect(() => {
    setProducts(wishlistData || []);
  }, [wishlistData]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // Use data from wishlist context instead of API call
      setProducts(wishlistData || []);
    } catch (error) {
      // Error fetching wishlist data
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handlePress = useCallback(
    async (productId, currency) => {
      setIsLoading(true);

      const payload = {
        CartItemNote: "",
        Currency: currency,
        MaximumQuantityInCart: 1,
        ProductOptionID: "",
        Quantity: 1,
        SKUID: productId,
      };

      try {
        const response = await CartService.addToCart(payload, callContext);
        if (response.data.Message === "Cart updated successfully") {
          setQuantities((prev) => ({
            ...prev,
            [productId]: (prev[productId] || 0) + 1,
          }));
          await updateCart();
          Toast.show({
            type: "success",
            text1: t("product_added_to_cart"),
            text2: t("go_to_cart_for_checkout"),
            position: "top",
            visibilityTime: 1500,
          });
        } else {
          Toast.show({
            type: "error",
            text1: response.data.Message,
            text2: "",
            position: "top",
            visibilityTime: 1500,
          });
        }
      } catch (error) {
        console.error("Add to Cart error:", error);
        Toast.show({
          type: "error",
          text1: t("failed_to_add_to_cart"),
          text2: error.message || "",
          position: "top",
          visibilityTime: 1500,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [callContext, updateCart, t]
  );

  const setQuantity = useCallback(
    async (productId, newQuantity, currency) => {
      setIsLoading(true);
      const oldQuantity = quantities[productId] || 0;
      if (oldQuantity === newQuantity) {
        setIsLoading(false);
        return;
      }

      const payload = {
        CartItemNote: "",
        Currency: currency,
        MaximumQuantityInCart: 1,
        ProductOptionID: "",
        Quantity: newQuantity - oldQuantity,
        SKUID: productId,
      };

      try {
        const response = await CartService.addToCart(payload, callContext);
        if (
          response.data.Message === "Cart updated successfully" ||
          "Product Removed Successfully"
        ) {
          setQuantities((prev) => ({
            ...prev,
            [productId]: newQuantity,
          }));
          await updateCart();
          Toast.show({
            type: "success",
            text1:
              newQuantity > oldQuantity
                ? t("product_added_to_cart")
                : t("Product Removed from cart"),
            text2: t("go_to_cart_for_checkout"),
            position: "top",
            visibilityTime: 1500,
          });
        } else {
          Toast.show({
            type: "error",
            text1: response.data.Message,
            text2: "",
            position: "top",
            visibilityTime: 1500,
          });
        }
      } catch (error) {
        console.error("Update cart error:", error);
        Toast.show({
          type: "error",
          text1: t("failed_to_update_cart"),
          text2: error.message || "",
          position: "top",
          visibilityTime: 1500,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [callContext, quantities, updateCart, t]
  );

  const toggleWishList = async (productId) => {
    try {
      if (!productId) return;

      await removeFromSaveForLater(productId);
      Toast.show({
        type: "success",
        text1: t("removed_from_wishlist"),
        text2: "",
        position: "top",
        visibilityTime: 3000,
      });

      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.SKUID !== productId)
      );
    } catch (error) {
      // Error removing from wishlist
    }
  };

  return (
    <View style={styles.container}>
      <Modal transparent={true} animationType="fade" visible={isLoading}>
        <View
          style={{
            width: wp("100%"),
            height: hp("100%"),
            backgroundColor: "rgba(255, 255, 255, 0.3)",
          }}
        ></View>
      </Modal>
      {loading ? (
        <WishlistSkeleton itemCount={6} />
      ) : (
        <FlatList
          numColumns={2}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={{ padding: 5 }}
          keyExtractor={(item, index) => String(index)}
          ListEmptyComponent={() => {
            return (
              <View style={styles.EmptyContainer}>
                <Text style={styles.emptyText}>{t("empty_wishlist")}</Text>
                <Text style={styles.emptyText2}>
                  {t("add_products_to_continue")}
                </Text>
              </View>
            );
          }}
          data={products}
          renderItem={({ item, index }) => {
            const productId = item.SKUID;
            const quantity = quantities[productId] || 0;

            if (item.ProductListingImage !== null)
              return (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("ProductDetails", {
                      item,
                      WishListed: true,
                    })
                  }
                  style={styles.widget}
                >
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("ProductDetails", {
                        item,
                        WishListed: true,
                      })
                    }
                    style={styles.imageTouchView}
                  >
                    <Image
                      style={styles.images}
                      source={{ uri: item.ProductImageUrl }}
                    />
                    <TouchableOpacity
                      onPress={() => toggleWishList(productId)}
                      style={{ position: "absolute", right: 15, top: 10 }}
                    >
                      <Image
                        style={{
                          resizeMode: "contain",
                          width: 25,
                          height: 25,
                        }}
                        source={require("../../../assets/images/client/foodworld/wishActive.png")}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                  <View style={styles.textView}>
                    <View style={styles.ProductNametextView}>
                      <Text numberOfLines={2} style={styles.ProductName}>
                        {item.ProductName}
                      </Text>
                    </View>

                    <View style={styles.PriceCommonView}>
                      <Text style={styles.ProductPrice}>
                        {client === "almadina"
                          ? item.ProductPrice
                          : item.Currency}
                      </Text>
                      <Text style={styles.CurrencyText}>
                        {client === "almadina"
                          ? item.Currency
                          : item.ProductPrice}
                      </Text>
                    </View>
                  </View>
                  {client === "benchmarkfoods" ? (
                    <TouchableOpacity
                      style={styles.quantityTouchable}
                      onPress={() =>
                        navigation.navigate("ProductDetails", { item })
                      }
                    >
                      <View style={styles.addToCartButton}>
                        <LinearGradient
                          colors={["#1D9ADC", "#0B489A"]}
                          start={{ x: 1, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.gradientButton}
                        >
                          <Text style={styles.addToCartText}>
                            {t("select_option")}
                          </Text>
                        </LinearGradient>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.quantitySelector}>
                      <QuantitySelector
                        onPress={() => handlePress(productId, item.Currency)}
                        quantity={quantity}
                        setQuantity={(newQuantity) =>
                          setQuantity(productId, newQuantity, item.Currency)
                        }
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
          }}
        />
      )}
    </View>
  );
};

export default NormalWishlist;
