import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import appSettings from "../../../../Client/appSettings";
import { useCart } from "../../../AppContext/CartContext";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import CustomHeader from "../../../component/CustomHeader";
import { CartSkeleton } from "../../../component/Skeleton";
import CartSuggestion from "../../../component/Widgets/CartSuggestion";
import CartService from "../../../services/cartService";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";

const { width, height } = Dimensions.get("screen");
const client = process.env.CLIENT;
// console.log("client", client);
const CART_CACHE_KEY = "CART_SCREEN_LAST_UPDATED";
const CACHE_EXPIRE_TIME = 5 * 60 * 1000;

const CartWithHorizontalSlideProductsList = (props) => {
  const navigation = useNavigation();
  const CartReOrderStructure = appSettings[client].CartReOrderStructure;
  const conditionalHeaderProps = appSettings[client].conditionalHeaderProps;
  const showRemoveButton = appSettings[client].showRemoveButton;
  const [styles, setStyle] = useState(
    ClientStyles(client, "CartWithHorizontalSlide")
  );
  const { cart, updateCart, setCart, cartSummary } = useCart();
  const backgroundColor = appSettings[client]?.backgroundColor;
  // console.log("cart", cart);
  // console.log("clientNameKey", clientNameKey);
  const InvertProductList = appSettings[client]?.InvertProductList; //for condition to reverse the product list
  // console.log("InvertProductList", InvertProductList);

  const cartCount = cartSummary.CartCount;
  const [loading, setLoading] = useState(false);
  const [updatingItems, setUpdatingItems] = useState({});
  const ProductData = cart.Products || [];
  // console.log("Ptoduct Data", ProductData);
  const availableQuantities = ProductData.map(
    (product) => product.AvailableQuantity
  );
  // console.log("Available Quantities:", availableQuantities);

  const checkQuantity = availableQuantities.find((quantity) => quantity === 0);
  // console.log("checkQuantity", checkQuantity);

  const reverseProductData = [...ProductData].reverse(); //reverse product list for Almadina
  // console.log("Reverse Data", reverseProductData);

  const { t } = useTranslation();

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) =>
        conditionalHeaderProps ? (
          <CustomHeader
            title={t("shop_by_cart")}
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
        ) : (
          <CustomHeader
            title={t("shop_by_cart")}
            leftComponent={<CommonHeaderLeft type="back" />}
            elevation={1}
          />
        ),
      title: t("cart"),
    });
  }, [t]);

  useEffect(() => {
    const clientStyle = ClientStyles(client, "CartWithHorizontalSlide");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, [client]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const refreshCart = async () => {
        try {
          const data = await updateCart(); // your API call

          if (isActive && data) {
            setCartItems(data.items); // updates UI smoothly
          }
        } catch (e) {
          console.log("Cart refresh failed", e);
        }
      };

      refreshCart(); // No loading, no flicker, no delay

      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleIncreaseQuantity = async (SKUID) => {
    setUpdatingItems((prev) => ({ ...prev, [SKUID]: true }));
    try {
      const productIndex = cart.Products.findIndex(
        (product) => product.SKUID === SKUID
      );

      if (productIndex === -1) {
        throw new Error("Product not found in cart");
      }

      const updatedCart = { ...cart };
      updatedCart.Products[productIndex].Quantity += 1;

      const result = await updateCartOnServer(
        updatedCart.Products[productIndex]
      );
      await updateCart();

      if (result.success === true) {
        Toast.show({
          type: "success",
          text1: result.message,
          position: "top",
          visibilityTime: 1500,
        });
      } else {
        // Show error from server
        Toast.show({
          type: "error",
          text1: result.message,
          position: "top",
          visibilityTime: 2000,
        });
      }
      setUpdatingItems((prev) => ({ ...prev, [SKUID]: false }));
    } catch (error) {
      setUpdatingItems((prev) => ({ ...prev, [SKUID]: false }));
      console.error("Error increasing quantity:", error);
    }
  };

  const handleDecreaseQuantity = async (SKUID) => {
    setUpdatingItems((prev) => ({ ...prev, [SKUID]: true }));
    try {
      const productIndex = cart.Products.findIndex(
        (product) => product.SKUID === SKUID
      );

      if (productIndex === -1) throw new Error("Product not found in cart");

      const updatedCart = { ...cart };

      if (cart.Products[productIndex].Quantity === 1) {
        updatedCart.Products.splice(productIndex, 1);
        const result = await updateCartOnServer({ SKUID, Quantity: 0 });
        await updateCart();
        if (result.success === true) {
          Toast.show({
            type: "success",
            text1: result.message,
            position: "top",
            visibilityTime: 1500,
          });
        } else {
          Toast.show({
            type: "error",
            text1: result.message,
            position: "top",
            visibilityTime: 2000,
          });
        }
      } else {
        updatedCart.Products[productIndex].Quantity -= 1;
        const result = await updateCartOnServer(
          updatedCart.Products[productIndex]
        );
        console.log("resultonsever", result);
        if (result.success === true) {
          await updateCart();
          Toast.show({
            type: "success",
            text1: result.message,
            position: "top",
            visibilityTime: 1500,
          });
        } else {
          Toast.show({
            type: "error",
            text1: result.message,
            position: "top",
            visibilityTime: 2000,
          });
        }
      }

      setUpdatingItems((prev) => ({ ...prev, [SKUID]: false }));
    } catch (error) {
      setUpdatingItems((prev) => ({ ...prev, [SKUID]: false }));
      console.error("Error decreasing quantity:", error);
      Toast.show({
        type: "error",
        text1: error.message,
        position: "top",
        visibilityTime: 2000,
      });
    }
  };

  const updateCartOnServer = async (product) => {
    const payload = {
      SKUID: product.SKUID,
      Quantity: product.Quantity,
    };
    try {
      const response = await CartService.updateCart(payload);
      // console.log("response", response);
      if (response?.data?.operationResult === 1) {
        console.log("operationResult", response?.data?.operationResult);
        const message = response?.data?.Message || "Cart updated successfully";
        return { success: true, message };
      } else {
        console.log("operationResult 1", response?.data?.operationResult);
        const message =
          response?.data?.Message || t("product_removed_from_cart");
        return { success: false, message };
      }
    } catch (error) {
      console.error("Error updating cart on server:", error);
      return { success: false, message: t("network_or_server_error") };
    }
  };

  const BlinkingBorderView = ({ children, shouldBlink, style }) => {
    const borderColorAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(borderColorAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(borderColorAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }),
        ])
      );

      if (shouldBlink) {
        animation.start();
      } else {
        animation.stop();
      }

      return () => animation.stop();
    }, [shouldBlink, borderColorAnim]);

    const borderColor = borderColorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["red", "transparent"],
    });

    return (
      <Animated.View
        style={[
          style,
          {
            borderColor: shouldBlink ? borderColor : "transparent",
            borderWidth: shouldBlink ? 2 : 0,
          },
        ]}
      >
        {children}
      </Animated.View>
    );
  };

  // 🗑️ Remove Cart Item
  const removeCartItem = async (SKUID, cartItemID) => {
    const payload = { SKUID, CartItemID: cartItemID };
    try {
      const response = await CartService.deleteCartItem(payload);
      console.log("deleted cart item status:", response.data);

      if (response.status !== 200) {
        Toast.show({
          type: "error",
          text1: response.data?.Message,
          position: "top",
          visibilityTime: 1500,
        });
        return;
      }

      await updateCart();
      Toast.show({
        type: "success",
        text1: response?.data?.Message || t("item_removed"),
        position: "top",
        visibilityTime: 1500,
      });
    } catch (err) {
      console.error("Error removing item:", err);
      Toast.show({
        type: "error",
        text1: t("failed_to_remove_item"),
        position: "top",
        visibilityTime: 1500,
      });
    }
  };
  const renderCartItem = ({ item }) => (
    <BlinkingBorderView
      key={item.CartItemID || `${item.SKUID}-${item.ProductOptionID || 'default'}`}
      shouldBlink={item.AvailableQuantity === 0}
      style={styles.cartItemContainer}
    >
      {/* Product Image with Navigation */}
      <TouchableOpacity
        style={styles.imageContainer}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("ProductDetails", { item })}
      >
        <Image
          style={styles.productImage}
          source={{ uri: item.ProductListingImage }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Product Details */}
      <View style={styles.productDetailsContainer}>
        <View style={styles.productInfo}>
          {/* Product Name */}
          <TouchableOpacity
            onPress={() => navigation.navigate("ProductDetails", { item })}
            activeOpacity={0.7}
          >
            <Text numberOfLines={2} style={styles.productName}>
              {item.ProductName}
            </Text>
          </TouchableOpacity>

          {/* Product Option Display */}
          {(item.ProductOptionName || item.ProductOptionID) && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: hp('0.5%'),
              marginBottom: hp('0.5%'),
              paddingHorizontal: wp('2%'),
              paddingVertical: hp('0.3%'),
              backgroundColor: '#f0f9ff',
              borderRadius: 4,
              alignSelf: 'flex-start',
            }}>
              <Text style={{
                fontSize: RFValue(9, 800),
                fontWeight: '600',
                color: '#6b7280',
                letterSpacing: 0.3,
              }}>Option: </Text>
              <Text style={{
                fontSize: RFValue(9, 800),
                fontWeight: '700',
                color: '#1e40af',
                letterSpacing: 0.3,
              }}>{item.ProductOptionName ? item.ProductOptionName.trim() : `ID: ${item.ProductOptionID}`}</Text>
            </View>
          )}

          {/* Availability Status */}
          {item.AvailableQuantity === 0 && (
            <View style={styles.unavailableContainer}>
              <Text style={styles.unavailableText}>
                • Not available in store
              </Text>
            </View>
          )}

          {showRemoveButton && (
            <TouchableOpacity
              onPress={() => removeCartItem(item.SKUID, item.CartItemID)}
              style={styles.removeButton}
              activeOpacity={0.7}
            >
              <Image
                source={require("../../../assets/images/client/almadinadot/trash.png")}
                style={styles.removeIcon}
              />
            </TouchableOpacity>
          )}

          {/* Product Details Row */}
          <View style={styles.productDetailsRow}>
            {/* Unit Price */}
            <View style={styles.priceSection}>
              <Text style={styles.sectionLabel}>Unit Price</Text>
              {item.PriceUnit < item.DiscountedPrice ? (
                <Text style={styles.currentPrice}>
                  {item.Price} {item.Currency}
                </Text>
              ) : (
                <View style={styles.discountPriceContainer}>
                  <Text style={styles.discountedPrice}>
                    {item.ProductDiscountPrice} {item.Currency}
                  </Text>
                  <Text style={styles.originalPrice}>
                    {item.Price} {item.Currency}
                  </Text>
                </View>
              )}
            </View>

            {/* Unit Info */}
            {item.AdditionalInfo1 && (
              <View style={styles.unitSection}>
                <Text style={styles.sectionLabel}>Unit</Text>
                <Text style={styles.unitValue}>
                  {item.Quantity} × {item.AdditionalInfo1}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom Section: Total Price and Actions */}
        <View style={styles.bottomSection}>
          <View style={styles.totalPriceContainer}>
            <Text style={styles.totalPrice}>
              {item.Total} {item.Currency}
            </Text>
          </View>

          <View style={styles.quantityControls}>
            <TouchableOpacity
              onPress={() => handleDecreaseQuantity(item.SKUID)}
              style={styles.quantityButton}
              activeOpacity={0.7}
              disabled={updatingItems[item.SKUID]}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>

            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityText}>{item.Quantity}</Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                item.AvailableQuantity > 0
                  ? handleIncreaseQuantity(item.SKUID)
                  : null
              }
              style={[
                styles.quantityButton,
                item.AvailableQuantity === 0 && styles.disabledButton,
              ]}
              activeOpacity={item.AvailableQuantity > 0 ? 0.7 : 1}
              disabled={
                updatingItems[item.SKUID] || item.AvailableQuantity === 0
              }
            >
              {item.AvailableQuantity > 0 ? (
                <Text style={styles.quantityButtonText}>+</Text>
              ) : (
                <Image
                  style={styles.disabledButtonImage}
                  source={require("../../../assets/images/client/almadina/Buttons.png")}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </BlinkingBorderView>
  );

  const memoizedCartSuggestion = useMemo(() => {
    return <CartSuggestion data={ProductData} setLoading={setLoading} />;
  }, [ProductData.length]);

  if (loading) {
    return (
      <View style={styles.root}>
        <View style={styles.container}>
          <CartSkeleton />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        {!CartReOrderStructure && cartCount > 0 ? (
          <View>
            <Text style={styles.amountToPay}>
              {t("Payable_Amount")} :{" "}
              <Text style={styles.amountValue}>{cart.SubTotal}</Text>
              <Text style={styles.currencyValue}>{cart.Currency}</Text>
            </Text>
            {cart.SubTotal < cart.MinimumCartAmount && (
              <View style={styles.minimumCartAmountView}>
                <Text style={styles.miminumCartAmountText}>
                  {t("cart_warning", {
                    amount: cart.CartWarning.match(/[\d.]+/)[0] || "0",
                  })}
                </Text>
              </View>
            )}
          </View>
        ) : null}
        <Modal transparent={true} animationType="fade" visible={loading}>
          <View style={styles.loadingOverlay} />
        </Modal>

        {cartCount > 0 ? (
          <View style={{ flex: 1 }}>
            {CartReOrderStructure && (
              <View>
                <View style={styles.suggestionContainer}>
                  {memoizedCartSuggestion}
                </View>

                <Text style={styles.amountToPay}>
                  Payable Amount:{" "}
                  <Text style={styles.amountValue}>{cart.SubTotal}</Text>
                  <Text style={styles.currencyValue}>{cart.Currency}</Text>
                </Text>

                {cart.SubTotal < cart.MinimumCartAmount && (
                  <View style={styles.minimumCartAmountView}>
                    <Text style={styles.miminumCartAmountText}>
                      {cart.CartWarning}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <FlatList
              data={InvertProductList ? reverseProductData : ProductData}
              renderItem={renderCartItem}
              keyExtractor={(item) => (item.CartItemID || `${item.SKUID}-${item.ProductOptionID || 'default'}`).toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              ItemSeparatorComponent={() => (
                <View style={styles.itemSeparator} />
              )}
            />

            {!CartReOrderStructure && (
              <View style={styles.suggestionContainer}>
                {memoizedCartSuggestion}
              </View>
            )}

            <View style={styles.checkoutButtonContainer}>
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={() => {
                  // console.log('Available Quantity:', checkQuantity);
                  if (cart.SubTotal >= cart.MinimumCartAmount) {
                    if (checkQuantity !== 0) {
                      navigation.navigate("Checkout", { ...cart });
                    } else {
                      Toast.show({
                        type: "error",
                        text1: t("cant_proceed"),
                        text2: t("Stock_Not_Available_in_Your_Cart"),
                        position: "top",
                        visibilityTime: 2000,
                      });
                    }
                  } else {
                    Toast.show({
                      type: "error",
                      text1:
                        t("minimum_cart_amount_is") +
                        cart.MinimumCartAmount +
                        "AED",
                      text2: "",
                      position: "top",
                      visibilityTime: 1500,
                    });
                  }
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.checkoutButtonText}>
                  {t("Proceed_to_Checkout")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCartContainer}>
            <Image
              style={styles.emptyCartImage}
              source={require("../../../assets/images/client/benchmarkfoods/empty_cart.png")}
            />
            <Text style={styles.emptyCartTitle}>{t("your_cart_is_empty")}</Text>
            <Text style={styles.emptyCartSubtitle}>
              {t("add_products_to_continue")}
            </Text>
            <TouchableOpacity
              style={styles.startShoppingButton}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate("Drawer", {
                  screen: "Footer",
                  params: { screen: "Home" },
                })
              }
            >
              <View style={styles.startShoppingGradient}>
                <Text style={styles.startShoppingText}>
                  {t("start_shopping")}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

// const styles = StyleSheet.create({
// root: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   container: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//     marginTop: hp("1%"),
//     // backgroundColor:"red",
//     overflow: "hidden",
//     paddingBottom: height * 0.05,

//   },

//   amountToPay: {

//     fontFamily: "Poppins-Regular",
//     fontSize: RFValue(13, 800),
//     fontWeight: "400",
//     textAlign: "center",
//     color: colors.textHeading,

//     letterSpacing: 0.3,
//   },
//   amountValue: {
//     fontFamily: "Poppins-SemiBold",
//     color: colors.textHeading,
//     fontSize: RFValue(13, 800),
//   },
//   currencyValue: {
//     fontFamily: "Poppins-Medium",
//     color: colors.textHeading,
//     fontSize: RFValue(12, 800),
//   },
//   minimumCartAmountView: {
//     backgroundColor: "#ceedff",
//     paddingVertical: hp("1%"),
//     paddingHorizontal: wp("4%"),
//     marginHorizontal: wp("4%"),
//     // marginBottom: hp("2%"),
//     marginVertical: hp("1.5%"),
//     width: wp("92%"),
//     borderRadius: 7,
//     borderWidth: 1,
//     borderColor: colors.error + "40",
//   },
//   miminumCartAmountText: {
//     fontFamily: "Poppins-Regular",
//     fontSize: RFValue(14, 800),

//     // fontWeight: "200",
//     color: colors.textHeading,
//     textAlign: "center",
//   },
//   loadingOverlay: {
//     width: wp("100%"),
//     height: hp("100%"),
//     backgroundColor: "rgba(255, 255, 255, 0.5)",
//   },
//   listContainer: {
//     paddingHorizontal: wp("4%"),
//     paddingTop: hp("1%"),
//     paddingBottom: height * 0.15,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   itemSeparator: {
//     // height: hp("1%"),
//     borderBottomColor: colors.border,
//     borderBottomWidth: 1,

//   },
//   cartItemContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//     borderRadius: wp("5%"), // Responsive border radius
//     padding: wp("3%"),
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: wp("0.5%") },
//     shadowOpacity: 0.1,
//     shadowRadius: wp("1.5%"),
//     elevation: 3,
//     marginBottom: hp("1.5%"),
//     marginHorizontal: wp("1%"), // Add horizontal margin for better spacing on larger screens
//   },
//   imageContainer: {
//     width: wp("28%"), // Slightly reduced to fit better on smaller screens
//     aspectRatio: 1,
//     borderRadius: wp("3%"), // Responsive border radius
//     overflow: "hidden",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "transparent",
//     marginRight: wp("1.6%"), // Slightly increased margin to compensate for larger size
//   },
//   productImage: {
//     width: "100%",
//     height: "100%",
//     resizeMode: "contain",
//     maxWidth: "100%",
//     maxHeight: "100%",
//   },

//   productDetailsContainer: {
//     flex: 1,
//     justifyContent: "center",
//   },

//   productInfo: {
//     flex: 1,
//   },

//   productName: {
//     fontSize: RFValue(13, 800),
//     fontFamily: "Poppins-SemiBold",
//     color: "#222222",
//     marginBottom: hp("0.6%"),
//     paddingRight: wp("10%"),
//   },
//   unavailableContainer: {
//     backgroundColor: colors.error + "15",
//     paddingVertical: hp("0.4%"),
//     paddingHorizontal: wp("1.5%"),
//     borderRadius: 5,
//     alignSelf: "flex-start",
//     marginBottom: hp("0.6%"),
//   },
//   unavailableText: {
//     fontSize: RFValue(9, 800),
//     color: colors.error,
//     fontWeight: "600",
//     fontFamily: "Poppins-SemiBold",
//     letterSpacing: 0.2,
//   },
//   productDetailsRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: hp("0.6%"),
//   },
//   priceSection: {
//     flex: 1,
//   },
//   unitSection: {
//     flex: 1,
//     alignItems: "flex-end",
//   },
//   sectionLabel: {
//     fontSize: RFValue(8, 800),
//     fontWeight: "600",
//     color: colors.textTertiary,
//     marginBottom: hp("0.2%"),
//     fontFamily: "Poppins-SemiBold",
//     textTransform: "uppercase",
//     letterSpacing: 0.8,
//   },
//   priceContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     flexWrap: "wrap",
//     marginBottom: hp("0.4%"),
//   },
//   priceLabel: {
//     fontSize: RFValue(11, 800),
//     fontWeight: "500",
//     // color: colors.textTertiary,
//     // color: "red",

//   },
//   currentPrice: {
//     fontSize: RFValue(14, 800),
//     fontFamily: "Poppins-Bold",
//     color: "#000",
//   },
//   discountPriceContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: wp("1.5%"),
//   },
//   discountedPrice: {
//     fontSize: RFValue(12, 800),
//     fontWeight: "700",
//     color: colors.textHeading,
//     fontFamily: "Poppins-Bold",
//   },
//   originalPrice: {
//     fontSize: RFValue(10, 800),
//     fontWeight: "500",
//     color: colors.error,
//     textDecorationLine: "line-through",
//     fontFamily: "Poppins-Medium",
//   },
//   unitContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   unitLabel: {
//     fontSize: RFValue(11, 800),
//     fontWeight: "500",
//     color: colors.textTertiary,
//   },
//   unitValue: {
//     fontSize: RFValue(11, 800),
//     fontWeight: "700",
//     color: colors.textSecondary,
//     fontFamily: "Poppins-Bold",
//   },
//   bottomSection: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: hp("0.8%"),
//     paddingTop: hp("0.8%"),
//     borderTopWidth: 1,
//     borderTopColor: colors.border,
//   },
//   actionsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//   },
//   removeButton: {
//      position: 'absolute',
//     top: -4,
//     right: -6,
//     width: 22,
//     height: 22,
//     borderRadius: 12,
//     backgroundColor: 'transparent',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   removeIcon: {
//     width: 18,
//     height: 18,
//     tintColor: '#640702',
//   },
//   totalPriceContainer: {
//     flex: 1,
//   },
//   totalPrice: {
//     fontSize: RFValue(16, 800),
//     fontWeight: "700",
//     color: colors.primary,
//     fontFamily: "Poppins-Bold",
//     letterSpacing: 0.3,
//   },
//   quantityControls: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: colors.backgroundSecondary,
//     borderRadius: 8,
//     paddingVertical: hp("0.4%"),
//     paddingHorizontal: wp("0.8%"),
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   quantityButton: {
//     width: wp("8%"),
//     height: hp("3.5%"),
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 6,
//     backgroundColor: colors.background,
//   },
//   disabledButton: {
//     opacity: 0.4,
//     backgroundColor: colors.backgroundSecondary,
//   },
//   quantityButtonText: {
//     fontSize: RFValue(18, 800),
//     fontWeight: "700",
//     color: colors.primary,
//     fontFamily: "Poppins-Bold",
//   },
//   quantityDisplay: {
//     minWidth: wp("10%"),
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: wp("2%"),
//   },
//   quantityText: {
//     fontSize: RFValue(14, 800),
//     fontWeight: "700",
//     color: colors.textHeading,
//     textAlign: "center",
//     fontFamily: "Poppins-Bold",
//   },
//   disabledButtonImage: {
//     width: wp("4.5%"),
//     height: wp("4.5%"),
//     resizeMode: "contain",
//     opacity: 0.5,
//   },
//   suggestionContainer: {
//     backgroundColor: "transparent",
//     borderRadius: 0,
//     marginTop: 0,
//     padding: 0,
//     width: width,
//     marginHorizontal: wp("-2%"),
//     shadowColor: "transparent",
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0,
//     shadowRadius: 0,
//     elevation: 0,
//   },
//   emptyCartContainer: {
//     backgroundColor: colors.background,
//     alignItems: "center",
//     justifyContent: "center",
//     alignSelf: "center",
//     borderRadius: 20,
//     width: wp("86%"),
//     height: hp("70%"),
//     padding: wp("6%"),
//     marginTop: hp("2%"),
//     shadowColor: colors.shadow,
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.12,
//     shadowRadius: 10,
//     elevation: 6,
//   },
//   emptyCartImage: {
//     resizeMode: "contain",
//     width: wp("25%"),
//     height: hp("12%"),
//     marginBottom: hp("2.5%"),
//     opacity: 0.8,
//   },
//   emptyCartTitle: {
//     fontSize: RFValue(18, 800),
//     fontWeight: "700",
//     color: colors.textHeading,
//     fontFamily: "Poppins-Bold",
//     textAlign: "center",
//     marginBottom: hp("0.8%"),
//   },
//   emptyCartSubtitle: {
//     fontSize: RFValue(13, 800),
//     fontWeight: "500",
//     color: colors.textSecondary,
//     fontFamily: "Poppins-Medium",
//     textAlign: "center",
//     marginBottom: hp("3%"),
//   },
//   startShoppingButton: {
//     borderRadius: 12,
//     backgroundColor: colors.buttonPrimary,
//     paddingHorizontal: wp("7%"),
//     paddingVertical: hp("0.8%"),
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: colors.buttonPrimary,
//     shadowOffset: {
//       width: 0,
//       height: 3,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   startShoppingGradient: {
//     width: "100%",
//     height: hp("6%"),
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: 12,
//   },
//   startShoppingText: {
//     color: colors.background,
//     fontSize: RFValue(14, 800),
//     fontFamily: "Poppins-Bold",
//     fontWeight: "700",
//     letterSpacing: 0.5,
//   },
//   checkoutButtonContainer: {
//     position: "absolute",
//     marginVertical: hp("1%"),
//     bottom: 0,
//     left: 0,
//     right: 0,
//     // backgroundColor: colors.background,
//     backgroundColor:"transparent",
//     paddingHorizontal: wp("4%"),
//     paddingVertical: hp("1.5%"),
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     shadowColor: colors.shadow,
//     shadowOffset: {
//       width: 0,
//       height: -3,
//     },
//     shadowOpacity: 0.12,
//     shadowRadius: 10,
//     elevation: 6,
//   },
//   checkoutButton: {
//     backgroundColor: colors.buttonPrimary,
//     borderRadius: 12,
//     paddingVertical: hp("1.6%"),
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: colors.buttonPrimary,
//     shadowOffset: {
//       width: 0,
//       height: 3,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   checkoutButtonText: {
//     fontSize: RFValue(14, 800),
//     fontWeight: "700",
//     fontFamily: "Poppins-Bold",
//     color: colors.background,
//     letterSpacing: 0.5,
//   },
//   });

export default CartWithHorizontalSlideProductsList;
