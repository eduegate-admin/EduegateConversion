import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useCallContext } from "../../AppContext/CallContext";
import { useCart } from "../../AppContext/CartContext";
import CartService from "../../services/cartService";
import QuantitySelector from "../QuantitySelector/Quantity";
import styles from "./style";

const CartOfferDrawerDetails = ({ route, navigation }) => {
  const [suggestion, setSuggestion] = useState([]); // array of products
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [eligibleQuantity, setEligibleQuantity] = useState(0); // max total allowed
  const { callContext } = useCallContext();
  const { updateCart } = useCart();
  const { cartItemId } = route.params;

  useEffect(() => {
    FOCProducts();
  }, []);

  const FOCProducts = async () => {
    try {
      const response = await CartService.GetFOCCartItems(cartItemId);

      const items = response.data?.Items || [];
      setSuggestion(items);

      // Set eligible total quantity
      setEligibleQuantity(response.data?.EligibleQuantity || 0);

      // Initialize quantities to 0
      const initialQuantities = {};
      items.forEach((item) => {
        initialQuantities[item.ProductID] = 0;
      });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error("Error fetching FOC products:", error);
    }
  };

  // Update quantity respecting total EligibleQuantity
  const setQuantityHandler = (productId, newQuantity) => {
    const totalExcludingCurrent = Object.entries(quantities).reduce(
      (sum, [id, qty]) => (id !== String(productId) ? sum + qty : sum),
      0
    );

    if (totalExcludingCurrent + newQuantity > eligibleQuantity) {
      Toast.show({
        type: "error",
        text1: `Total quantity cannot exceed ${eligibleQuantity}`,
        position: "top",
        visibilityTime: 1500,
      });
      return;
    }

    setQuantities((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));
  };

  // Add all products at once
  const handleAddAllToCart = useCallback(async () => {
    const selectedProducts = suggestion.filter(
      (item) => (quantities[item.ProductID] || 0) > 0
    );

    if (selectedProducts.length === 0) {
      Toast.show({
        type: "error",
        text1: "Please select quantity for at least one item",
        position: "top",
        visibilityTime: 1500,
      });
      return;
    }

    setLoading(true);

    try {
      const requests = selectedProducts.map((item) => {
        const payload = {
          CartItemNote: "",
          Currency: item.Currency,
          MaximumQuantityInCart: 1,
          ProductOptionID: "",
          Quantity: quantities[item.ProductID],
          SKUID: item.ProductID,
          ProductUnitID: item.UnitID,
          IsFoc: true,
        };
        return CartService.addToCart(payload, callContext);
      });

      const responses = await Promise.allSettled(requests);

      let successCount = 0;
      responses.forEach((res) => {
        if (
          res.status === "fulfilled" &&
          res.value?.data?.operationResult === 1
        ) {
          successCount++;
        }
      });

      if (successCount > 0) {
        await updateCart();
        Toast.show({
          type: "success",
          text1: `${successCount} item(s) added to cart`,
          position: "top",
          visibilityTime: 1500,
        });

        // Reset quantities to 0 after successful add
        const resetQuantities = {};
        suggestion.forEach((item) => {
          resetQuantities[item.ProductID] = 0;
        });
        setQuantities(resetQuantities);
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to add items",
          position: "top",
          visibilityTime: 1500,
        });
      }
    } catch (error) {
      console.error("Add All to Cart error:", error);
      Toast.show({
        type: "error",
        text1: "Error adding items",
        position: "top",
        visibilityTime: 1500,
      });
    } finally {
      setLoading(false);
    }
  }, [suggestion, quantities, callContext, updateCart]);

  const renderItem = ({ item }) => {
    const productId = item.ProductID;
    const quantity = quantities[productId] || 0;

    return (
      <View style={styles.ListOuterView}>
        <TouchableOpacity
          onPress={() => navigation.navigate("ProductDetails", { item })}
          style={styles.ImageView}
        >
          <Image
            style={styles.image}
            source={{ uri: item.ProductListingImage }}
          />
        </TouchableOpacity>

        <View style={styles.DetailsView}>
          <View style={styles.NameView}>
            <Text numberOfLines={3} style={styles.nameText}>
              {item.ProductName}
            </Text>
            {item?.Unit ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Unit: {item.Unit}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.PriceCommonView}>
            <View style={styles.PriceView}>
              {Number(item.Price ?? 0) !==
                Number(item.DiscountedPrice ?? 0) && (
                <Text style={styles.strikedPrice}>
                  {Number(item.Price ?? 0).toFixed(2)} {item.Currency || ""}
                </Text>
              )}
              <Text style={styles.rateText}>
                {Number(
                  Number(item.Price ?? 0) !== Number(item.DiscountedPrice ?? 0)
                    ? (item.DiscountedPrice ?? 0)
                    : (item.Price ?? 0)
                ).toFixed(2)}{" "}
                {item.Currency || ""}
              </Text>
            </View>

            <QuantitySelector
              quantity={quantity}
              setQuantity={(newQuantity) =>
                setQuantityHandler(productId, newQuantity)
              }
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Special Offers for You</Text>

      <FlatList
        data={suggestion}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.ProductID)}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        onPress={handleAddAllToCart}
        style={styles.addToCartButton}
      >
        <LinearGradient
          colors={["#1D9ADC", "#0B489A"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.addToCartText}>Add to cart</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default CartOfferDrawerDetails;
