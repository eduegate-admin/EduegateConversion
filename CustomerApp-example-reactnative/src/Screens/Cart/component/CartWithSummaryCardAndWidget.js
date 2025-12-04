import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useCart } from "../../../AppContext/CartContext";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import CustomHeader from "../../../component/CustomHeader";
import CustomTextInput from "../../../component/CustomTextInput";
import { CartSkeleton } from "../../../component/Skeleton";
import CartSuggestion from "../../../component/Widgets/CartSuggestion";
import CartService from "../../../services/cartService";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";

const CartWithSummaryCardAndWidget = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [styles, setStyles] = useState({});
  const [loading, setLoading] = useState(false);

  const { cart, updateCart, setCart } = useCart();
  const client = process.env.CLIENT;

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        <CustomHeader
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
      title: t("cart"),
    });

    // Load client-specific styles
    const clientStyles = ClientStyles(client, "Cart");
    if (clientStyles && Object.keys(clientStyles).length > 0) {
      setStyles(clientStyles);
    } else {
      // Fallback to default styles
      setStyles({
        container: { flex: 1, backgroundColor: "#F8F9FA" },
        scrollView: { paddingBottom: 100 },
        contentHeader: { marginHorizontal: 16, marginVertical: 8 },
        contentHeaderText: {
          fontSize: 22,
          fontWeight: "700",
          color: "#133051",
        },
        cartItemContainer: {
          backgroundColor: "#FFFFFF",
          marginHorizontal: 16,
          marginVertical: 4,
          borderRadius: 16,
          flexDirection: "row",
          minHeight: 100,
        },
        imageContainer: {
          backgroundColor: "#F8F9FA",
          width: "25%",
          justifyContent: "center",
          alignItems: "center",
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
        },
        productImage: { width: "80%", height: "80%", resizeMode: "contain" },
        detailsContainer: {
          flex: 1,
          paddingHorizontal: 12,
          paddingVertical: 8,
          justifyContent: "space-between",
        },
        productName: {
          fontSize: 16,
          fontWeight: "600",
          color: "#252525",
          marginBottom: 4,
        },
        productWeight: {
          fontSize: 14,
          fontWeight: "500",
          color: "#6C757D",
          marginBottom: 8,
        },
        productPrice: { fontSize: 18, fontWeight: "700", color: "#133051" },
        quantityContainer: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#F8F9FA",
          borderRadius: 12,
          paddingHorizontal: 8,
          paddingVertical: 4,
          marginTop: 8,
        },
        quantityButton: {
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: "#68B054",
          justifyContent: "center",
          alignItems: "center",
        },
        quantityButtonText: {
          color: "#FFFFFF",
          fontSize: 18,
          fontWeight: "700",
        },
        quantityText: {
          fontSize: 16,
          fontWeight: "700",
          color: "#252525",
          marginHorizontal: 12,
        },
        paymentSection: {
          backgroundColor: "#FFFFFF",
          marginHorizontal: 16,
          marginVertical: 8,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 12,
        },
        amountRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: "#E9ECEF",
        },
        amountRowLast: {
          borderBottomWidth: 0,
          borderTopWidth: 2,
          borderTopColor: "#E9ECEF",
          marginTop: 4,
          paddingTop: 8,
        },
        amountLabel: { fontSize: 16, fontWeight: "500", color: "#495057" },
        amountValue: { fontSize: 16, fontWeight: "600", color: "#133051" },
        discountValue: { color: "#DC3545" },
        totalLabel: { fontSize: 18, fontWeight: "700", color: "#133051" },
        totalValue: { fontSize: 20, fontWeight: "700", color: "#133051" },
        checkoutButton: {
          position: "absolute",
          bottom: 16,
          left: 20,
          right: 20,
          height: 50,
          backgroundColor: "#68B054",
          borderRadius: 12,
          justifyContent: "center",
          alignItems: "center",
        },
        checkoutButtonText: {
          color: "#FFFFFF",
          fontSize: 16,
          fontWeight: "700",
        },
        emptyCartContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 40,
        },
        emptyCartText: {
          fontSize: 18,
          fontWeight: "600",
          color: "#6C757D",
          textAlign: "center",
          marginTop: 16,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
      });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let timeout;
      const fetch = async () => {
        setLoading(true);
        timeout = setTimeout(async () => {
          await updateCart();
          setLoading(false);
        }, 800);
      };
      fetch();
      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }, [])
  );

  // const CartData = async () => {
  //   try {
  //     const storedContext = await AsyncStorage.getItem("@CallContext");
  //     const parsedContext = JSON.parse(storedContext);
  //     const authToken = await AsyncStorage.getItem("authToken");
  //     const response =  await CartService.getCartDetails(parsedContext,authToken);
  //     setCart(response.data);
  //   } catch (error) {
  //     console.error("Error fetching cart data:", error);
  //   }
  // }

  const handleIncreaseQuantity = async (SKUID) => {
    try {
      setLoading(true);
      // Find the product in the cart
      const productIndex = cart.Products.findIndex(
        (product) => product.SKUID === SKUID
      );

      if (productIndex === -1) {
        throw new Error("Product not found in cart");
      }

      // Update the quantity locally
      const updatedCart = { ...cart };
      updatedCart.Products[productIndex].Quantity += 1;

      // Call the UpdateCart API
      await updateCartOnServer(updatedCart.Products[productIndex]);

      // Update the global cart state
      await updateCart();
    } catch (error) {
      console.error("Error increasing quantity:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecreaseQuantity = async (SKUID) => {
    try {
      setLoading(true);
      // Find the product in the cart
      const productIndex = cart.Products.findIndex(
        (product) => product.SKUID === SKUID
      );

      if (productIndex === -1) {
        throw new Error("Product not found in cart");
      }

      // Check if the quantity is 1
      if (cart.Products[productIndex].Quantity === 1) {
        // Remove the product from the cart
        const updatedCart = { ...cart };
        updatedCart.Products.splice(productIndex, 1); // Remove the product

        // Call the UpdateCart API to remove the product
        await updateCartOnServer({ SKUID: SKUID, Quantity: 0 }); // Set quantity to 0 to remove the product

        // Update the global cart state
        await updateCart();
      } else {
        // Decrease the quantity by 1
        const updatedCart = { ...cart };
        updatedCart.Products[productIndex].Quantity -= 1;

        // Call the UpdateCart API to decrease the quantity
        await updateCartOnServer(updatedCart.Products[productIndex]);

        // Update the global cart state
        await updateCart();
      }
    } catch (error) {
      console.error("Error decreasing quantity:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCartOnServer = async (product) => {
    const payload = {
      SKUID: product.SKUID,
      Quantity: product.Quantity,
    };
    try {
      const response = await CartService.updateCart(payload);
      const result = response.data;
      // console.log(result)
    } catch (error) {
      console.error("Error updating cart on server:", error);
    }
  };

  const ProductData = cart.Products || [];

  if (loading) {
    return (
      <View style={styles.container}>
        <CartSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={styles.scrollView}
      >
        <CartSuggestion data={ProductData} />
        <View style={styles.contentHeader}>
          <Text style={styles.contentHeaderText}>{t("your_products")}</Text>
        </View>
        {ProductData.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <Text style={styles.emptyCartText}>{t("your_cart_is_empty")}</Text>
          </View>
        ) : (
          ProductData.map((item) => {
            return (
              <View style={styles.cartItemContainer} key={item.CartItemID || `${item.SKUID}-${item.ProductOptionID || 'default'}`}>
                <View style={styles.imageContainer}>
                  <Image
                    style={styles.productImage}
                    source={{ uri: item.ProductListingImage }}
                    defaultSource={require("../../../assets/images/defaultimage.png")}
                  />
                </View>
                <View style={styles.detailsContainer}>
                  <View style={styles.productInfoContainer}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.ProductName}
                    </Text>

                    {/* Product Option Display */}
                    {(item.ProductOptionName || item.ProductOptionID) && (
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 4,
                        marginBottom: 4,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        backgroundColor: '#f0f9ff',
                        borderRadius: 4,
                        alignSelf: 'flex-start',
                      }}>
                        <Text style={{
                          fontSize: 10,
                          fontWeight: '600',
                          color: '#6b7280',
                          letterSpacing: 0.3,
                        }}>Option: </Text>
                        <Text style={{
                          fontSize: 10,
                          fontWeight: '700',
                          color: '#1e40af',
                          letterSpacing: 0.3,
                        }}>{item.ProductOptionName ? item.ProductOptionName.trim() : `ID: ${item.ProductOptionID}`}</Text>
                      </View>
                    )}

                    <Text style={styles.productWeight}>
                      {item.ProductWeight}
                    </Text>
                    <Text style={styles.productPrice}>
                      {item.DiscountedPrice} BHD
                    </Text>
                  </View>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleIncreaseQuantity(item.SKUID)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.Quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleDecreaseQuantity(item.SKUID)}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {/* Payment Section */}
        {ProductData.length > 0 && (
          <View style={styles.paymentSection}>
            <View style={styles.promoCodeContainer}>
              <CustomTextInput placeholder={"Enter promo Code"} Apply={true} />
            </View>

            <View style={styles.amountContainer}>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>{t("sub_total")}</Text>
                <Text style={styles.amountValue}>{cart.SubTotal} BHD</Text>
              </View>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>{t("discount")}</Text>
                <Text style={[styles.amountValue, styles.discountValue]}>
                  {cart.Discount} BHD
                </Text>
              </View>
              <View style={styles.amountRowLast}>
                <Text style={styles.totalLabel}>{t("total")}</Text>
                <Text style={styles.totalValue}>{cart.Total} BHD</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {ProductData.length > 0 && (
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => {
            navigation.navigate("Checkout", { ...cart });
          }}
        >
          <Text style={styles.checkoutButtonText}>
            {cart.Total} BHD - {t("checkout")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Styles are now loaded from client-specific style files

export default CartWithSummaryCardAndWidget;
