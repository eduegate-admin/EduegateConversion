import {
  DrawerActions,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  I18nManager,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import { useCart } from "../../../AppContext/CartContext";
import BillSummaryCard from "../../../component/BillSummaryCard";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import CustomHeader from "../../../component/CustomHeader";
import CartService from "../../../services/cartService";
// import { Skeleton } from "moti/skeleton"; // replaced by custom skeletons
import appSettings from "../../../../Client/appSettings";
import { CartSkeleton } from "../../../component/Skeleton";
import { useAnalytics } from "../../../hooks/useAnalytics";

const client = process.env.CLIENT;

const CartWithSummaryCard = (props) => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { cart, updateCart, cartSummary } = useCart();
  const analytics = useAnalytics();
  const cartCount = cartSummary.CartCount;
  const [isloading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const cartOfferProduct = appSettings[client]?.cartOfferProduct;
  const isRTL = I18nManager.isRTL;

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
  }, [navigation, t]);

  useEffect(() => {
    if (
      cartOfferProduct &&
      cart?.Products?.some((item) => item.Quantity === 5)
    ) {
      const offerItem = cart?.Products?.find((item) => item.Quantity === 5);
      console.log("offerItem", offerItem);
      navigation.navigate("CartOfferDrawer", {
        cartItemId: offerItem.CartItemID,
      });
      navigation.dispatch(DrawerActions.openDrawer());
    }
  }, [cart, navigation, cartOfferProduct]);

  const handleIncreaseQuantity = async (
    CartItemID,
    SKUID,
    ProductUnitID,
    Quantity
  ) => {
    setIsLoading(true);
    try {
      const productIndex = cart.Products.findIndex(
        (product) => product.CartItemID === CartItemID
      );

      if (productIndex === -1) {
        throw new Error("Product not found in cart");
      }

      const product = cart.Products[productIndex];

      // Track quantity increase
      analytics.trackCustomEvent("cart_quantity_increase", {
        item_id: SKUID,
        item_name: product.ProductName || "Unknown Product",
        old_quantity: Quantity,
        new_quantity: Quantity + 1,
        currency: "AED",
        value: product.Price || 0,
      });

      // Update the quantity locally
      const updatedCart = { ...cart };
      updatedCart.Products[productIndex].Quantity = Quantity + 1;

      // Prepare payload with updated quantity
      const updatedProduct = {
        ...updatedCart.Products[productIndex],
        Quantity: Quantity + 1,
      };

      // Call the UpdateCart API
      await updateCartOnServer(updatedProduct);
      Toast.show({
        type: "success",
        text1: t("product_added_to_cart"),
        text2: "",
        position: "top",
        visibilityTime: 1500,
      });
      // Update the global cart state
      await updateCart();
    } catch (error) {
      console.error("Error increasing quantity:", error);

      // Track quantity increase error
      analytics.trackError("cart_quantity_increase_error", error.message);

      Toast.show({
        type: "error",
        text1: t("failed_to_update_quantity"),
        text2: "",
        position: "top",
        visibilityTime: 1500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecreaseQuantity = async (
    CartItemID,
    SKUID,
    ProductUnitID,
    Quantity
  ) => {
    setIsLoading(true);
    try {
      // Find the product in the cart using CartItemID
      const productIndex = cart.Products.findIndex(
        (product) => product.CartItemID === CartItemID
      );

      if (productIndex === -1) {
        throw new Error("Product not found in cart");
      }

      const product = cart.Products[productIndex];

      // Check if the quantity is 1
      if (Quantity === 1) {
        // Track item removal from cart
        analytics.trackRemoveFromCart(
          {
            id: SKUID,
            name: product.ProductName || "Unknown Product",
            category: product.CategoryName || "unknown",
            price: product.Price || 0,
            currency: "AED",
          },
          1
        );

        // Remove the product from the cart
        await removeCartItem(SKUID, CartItemID);
        Toast.show({
          type: "success",
          text1: t("product_removed_from_cart"),
          text2: "",
          position: "top",
          visibilityTime: 1500,
        });
      } else {
        // Track quantity decrease
        analytics.trackCustomEvent("cart_quantity_decrease", {
          item_id: SKUID,
          item_name: product.ProductName || "Unknown Product",
          old_quantity: Quantity,
          new_quantity: Quantity - 1,
          currency: "AED",
          value: product.Price || 0,
        });

        // Decrease the quantity by 1
        const updatedCart = { ...cart };
        updatedCart.Products[productIndex].Quantity = Quantity - 1;

        // Prepare payload with updated quantity
        const updatedProduct = {
          ...updatedCart.Products[productIndex],
          Quantity: Quantity - 1,
        };

        // Call the UpdateCart API to decrease the quantity
        await updateCartOnServer(updatedProduct);
        Toast.show({
          type: "success",
          text1: t("quantity_updated"),
          text2: "",
          position: "top",
          visibilityTime: 1500,
        });
      }
      // Update the global cart state
      await updateCart();
    } catch (error) {
      console.error("Error decreasing quantity:", error);

      // Track quantity decrease error
      analytics.trackError("cart_quantity_decrease_error", error.message);

      Toast.show({
        type: "error",
        text1: t("failed_to_update_quantity"),
        text2: "",
        position: "top",
        visibilityTime: 1500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartOnServer = async (product) => {
    console.log("product", product);
    const payload = {
      CartItemID: product.CartItemID, // Include for precise update
      SKUID: product.SKUID,
      Quantity: product.Quantity,
      ProductUnitID: product.ProductUnitID,
    };
    try {
      console.log("updating cart on the server");
      const response = await CartService.updateCart(payload);
      const result = response.data;
      console.log("result", result);
    } catch (error) {
      console.error("Error updating cart on server:", error);
      throw error; // Re-throw to handle in caller
    }
  };

  const removeCartItem = async (SKUID, cartItemID) => {
    const payload = {
      SKUID,
      CartItemID: cartItemID,
    };
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

  useFocusEffect(
    useCallback(() => {
      let timeout;

      // Track cart view analytics
      analytics.trackCustomEvent("cart_view", {
        cart_count: cartSummary.CartCount,
        cart_value: cartSummary.GrandTotal || 0,
        items_count: cart.Products ? cart.Products.length : 0,
      });

      const fetchCart = async () => {
        setLoading(true);
        timeout = setTimeout(async () => {
          await updateCart();
          setLoading(false);
        }, 800);
      };
      fetchCart();
      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }, [])
  );

  const ProductData = cart.Products || [];
  // console.log("cart",cart)

  const handleButtonPress = () => {
    if (cartCount > 0) {
      // Track begin checkout event
      analytics.trackBeginCheckout({
        currency: "AED",
        totalAmount: cartSummary.GrandTotal || 0,
        items: cart.Products || [],
        itemCount: cartCount,
      });

      navigation.navigate("Checkout");
    } else {
      // Track empty cart checkout attempt
      analytics.trackCustomEvent("checkout_attempt_empty_cart", {
        user_action: "checkout_button_pressed",
      });

      Toast.show({
        type: "error",
        text1: t("Your Cart is Empty!"),
        text2: t("Add Products to continue"),
        position: "top",
        visibilityTime: 1500,
      });
    }
  };
  const HomeNav = () => {
    setBtnLoading(true);
    setTimeout(() => {
      setBtnLoading(false);
      navigation.navigate("Drawer", {
        screen: "Footer",
        params: {
          screen: "Home",
        },
      });
    }, 200);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#DEECFA", "#FFFFFF"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientButton}
      >
        {loading ? (
          <CartSkeleton />
        ) : cartCount > 0 ? (
          <>
            <Modal transparent={true} animationType="fade" visible={isloading}>
              <View
                style={{
                  width: wp("100%"),
                  height: hp("100%"),
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                }}
              ></View>
            </Modal>
            <ScrollView
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              contentContainerStyle={styles.ScrollView}
            >
              <View style={styles.contentHeader}>
                {loading ? (
                  // 🔸 Skeleton Header Placeholder
                  <View style={[styles.contentHeaderText]}>
                    <Skeleton
                      width={150}
                      height={20}
                      radius={4}
                      colorMode="light"
                    />
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.contentHeaderText,
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                  >
                    {cartCount} {t("items_in_cart")}
                  </Text>
                )}
                {ProductData.map((item) => {
                  return (
                    <View key={item.CartItemID}>
                      {loading ? (
                        // 🔄 Full Card Skeleton (1 for each item)
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            padding: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: "#E0E0E0",
                            backgroundColor: "#fff",
                            borderRadius: 12,
                            marginBottom: 10,
                            marginHorizontal: 12,
                          }}
                        >
                          {/* Product Image Skeleton */}
                          <Skeleton
                            height={60}
                            width={60}
                            radius={10}
                            colorMode="light"
                          />

                          {/* Text Info Skeleton */}
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Skeleton
                              height={14}
                              width={"70%"}
                              radius={4}
                              colorMode="light"
                            />
                            <Skeleton
                              height={12}
                              width={"50%"}
                              radius={4}
                              colorMode="light"
                              style={{ marginTop: 6 }}
                            />
                            <Skeleton
                              height={16}
                              width={60}
                              radius={4}
                              colorMode="light"
                              style={{ marginTop: 10 }}
                            />
                          </View>

                          {/* Quantity Button Skeleton */}
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              borderWidth: 1,
                              borderColor: "#D3D3D3",
                              borderRadius: 6,
                              paddingHorizontal: 8,
                              height: 32,
                            }}
                          >
                            <Skeleton
                              height={16}
                              width={16}
                              radius={4}
                              colorMode="light"
                            />
                            <Skeleton
                              height={16}
                              width={20}
                              radius={4}
                              colorMode="light"
                              style={{ marginHorizontal: 6 }}
                            />
                            <Skeleton
                              height={16}
                              width={16}
                              radius={4}
                              colorMode="light"
                            />
                          </View>
                        </View>
                      ) : (
                        <>
                          <TouchableOpacity
                            onPress={() =>
                              navigation.navigate("ProductDetails", {
                                item,
                              })
                            }
                            style={styles.ListOuterView}
                          >
                            <View style={styles.ImageView}>
                              <Image
                                style={styles.image}
                                source={{ uri: item.ProductListingImage }}
                              />
                            </View>
                            <View style={styles.DetailsView}>
                              <View style={styles.NameView}>
                                <Text numberOfLines={3} style={styles.nameText}>
                                  {item.ProductName}
                                </Text>
                                {item?.Unit ? (
                                  <View style={styles.badge}>
                                    <Text
                                      style={[
                                        styles.badgeText,
                                        { textAlign: isRTL ? "right" : "left" },
                                      ]}
                                    >
                                      {t("unit_label")}: {item.Unit}
                                    </Text>
                                  </View>
                                ) : null}
                              </View>
                              <View style={styles.PriceCommonView}>
                                <View style={styles.PriceView}>
                                  {Number(item.Price ?? 0) !==
                                    Number(item.DiscountedPrice ?? 0) && (
                                    <Text
                                      style={{
                                        fontSize: RFValue(12, 800),
                                        fontWeight: "600",
                                        paddingTop: hp("0.6%"),
                                        color: "#FE5656",
                                        fontFamily: "Poppins-SemiBold",
                                        textDecorationLine: "line-through",
                                      }}
                                    >
                                      {Number(item.Price ?? 0).toFixed(2)}{" "}
                                      {item.Currency || ""}
                                    </Text>
                                  )}
                                  <Text style={styles.rateText}>
                                    {Number(
                                      Number(item.Price ?? 0) !==
                                        Number(item.DiscountedPrice ?? 0)
                                        ? (Number(item.DiscountedPrice ?? 0) ??
                                            0)
                                        : (item.Price ?? 0)
                                    ).toFixed(2)}{" "}
                                    {item.Currency || ""}
                                  </Text>
                                </View>

                                {item.IsFoc === true ? (
                                  <View style={styles.ProductQuantityView}>
                                    <Text style={styles.quantity}>
                                      {item.Quantity}
                                    </Text>
                                  </View>
                                ) : (
                                  <View style={styles.ProductQuantityView}>
                                    <TouchableOpacity
                                      style={{
                                        paddingVertical: hp(0.5),
                                        paddingHorizontal: wp(2.5),
                                      }}
                                      onPress={() =>
                                        handleDecreaseQuantity(
                                          item.CartItemID,
                                          item.SKUID,
                                          item.ProductUnitID,
                                          item.Quantity
                                        )
                                      }
                                    >
                                      <Text style={[styles.QuantityChanger]}>
                                        -
                                      </Text>
                                    </TouchableOpacity>
                                    <Text style={styles.quantity}>
                                      {item.Quantity}
                                    </Text>
                                    <TouchableOpacity
                                      style={{
                                        paddingVertical: hp(0.5),
                                        paddingHorizontal: wp(2.5),
                                      }}
                                      onPress={() =>
                                        handleIncreaseQuantity(
                                          item.CartItemID,
                                          item.SKUID,
                                          item.ProductUnitID,
                                          item.Quantity
                                        )
                                      }
                                    >
                                      <Text style={[styles.QuantityChanger]}>
                                        +
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                )}
                              </View>
                            </View>
                            {item.IsFoc === true ? (
                              ""
                            ) : (
                              <TouchableOpacity
                                style={{
                                  position: "absolute",
                                  right: isRTL ? undefined : wp("3%"),
                                  left: isRTL ? wp("3%") : undefined,
                                  top: hp("1.8%"),
                                }}
                                onPress={() =>
                                  removeCartItem(item.SKUID, item.CartItemID)
                                }
                              >
                                <Image
                                  style={{ height: wp("5%"), width: wp("5%") }}
                                  source={require("../../../assets/images/client/benchmarkfoods/trash.png")}
                                />
                              </TouchableOpacity>
                            )}
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  );
                })}
              </View>
              {/* payment */}
              <BillSummaryCard
                cart={cart}
                loading={loading}
                visibleFields={["subTotal", "Charges"]}
              />
            </ScrollView>
            {loading ? (
              // 🔸 Skeleton Header Placeholder
              <View style={[styles.ButtonCommonView]}>
                <Skeleton
                  width={70}
                  height={40}
                  radius={10}
                  colorMode="light"
                />
                <Skeleton
                  width={200}
                  height={60}
                  radius={10}
                  style={{ marginTop: 8 }}
                  colorMode="light"
                />
              </View>
            ) : (
              <View style={[styles.ButtonCommonView]}>
                <View style={styles.TotalTextView}>
                  <Text style={styles.TotalText}>
                    {cart.Currency || ""}{" "}
                    {(Number(cart?.Total) || 0).toFixed(2)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.quantityTouchable}
                  onPress={handleButtonPress}
                >
                  <View style={styles.addToCartButton}>
                    <LinearGradient
                      colors={["#1D9ADC", "#0B489A"]}
                      start={{ x: 1, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientButton2}
                    >
                      <Text style={styles.addToCartText}>{t("continue")}</Text>
                    </LinearGradient>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          !loading && (
            <View style={styles.EmptyContainer}>
              <Image
                style={styles.EmptyImage}
                source={require("../../../assets/images/client/benchmarkfoods/empty_cart.png")}
              />
              <Text style={styles.emptyText}>{t("your_cart_is_empty")}</Text>
              <Text style={styles.emptyText2}>
                {t("add_products_to_continue_cart")}
              </Text>
              <TouchableOpacity style={styles.ShopButton} onPress={HomeNav}>
                <View style={styles.shopButtonGradient}>
                  <LinearGradient
                    colors={["#1D9ADC", "#0B489A"]}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientButton3}
                  >
                    {btnLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.addToCartText}>
                        {t("start_shopping")}
                      </Text>
                    )}
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            </View>
          )
          // <></>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    width: wp("100%"),
    // height: hp("100%"),
    // paddingBottom: 50,
    // zIndex: 1,
  },
  gradientButton: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  ScrollView: {
    // backgroundColor: "blue",
    // paddingBottom: 190,
    width: wp("100%"),
    justifyContent: "center",
    paddingBottom: hp("20%"),
    alignItems: "center",
  },
  contentHeader: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    width: wp("91.11%"),
    // height: hp("21.11%"),
    padding: wp("2"),
    marginTop: hp("1.2"),
    shadowColor: "#A9A9A9",
    elevation: 3,
    paddingHorizontal: wp("5%"),
  },
  contentHeaderText: {
    fontSize: RFValue(16, 800),
    fontWeight: "600",
    lineHeight: 50,
    // left: 14,
    color: "#525252",
    fontFamily: "Poppins-SemiBold",
  },
  ListOuterView: {
    // backgroundColor: "green",
    width: wp("91.11%"),
    // height: hp("18%"),
    // alignItems: "center",
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    justifyContent: "space-between",
    borderTopColor: "#EFEFEF",
    borderTopWidth: 1,
    alignSelf: "center",
    paddingVertical: wp("4.44%"),
  },

  ImageView: {
    // backgroundColor: "#000",
    width: wp("21.67%"),
    height: hp("10.625%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: wp("3.33%"),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E9E9E9",
    marginHorizontal: wp("4.44%"),
  },
  image: {
    width: wp("21.67%"),
    height: hp("10.625%"),
    resizeMode: "contain",
    borderRadius: 20,
  },
  DetailsView: {
    // backgroundColor: "red",
    // paddingVertical: 15,
    width: wp("60.56%"),
    // height: hp("14.5%"),
    // borderRadius: 20,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  NameView: {
    backgroundColor: "#fff",
    justifyContent: "space-between",
    // backgroundColor: "red",
    width: "85%",
    height: hp("12.1%"),
  },
  PriceCommonView: {
    // backgroundColor: "#000",
    width: wp("60.56%"),
    // height: hp("6%"),
    // bottom:0,
    // borderRadius: 20,
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    // justifyContent: "center",
    // paddingLeft: 15,
    alignItems: "center",
  },
  nameText: {
    fontSize: RFValue(14, 800),
    fontWeight: "500",
    color: "#252525",
    fontFamily: "Poppins-Regular",
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  weightText: {
    fontSize: RFValue(12, 800),
    fontWeight: "500",
    color: "#252525",
    fontFamily: "Poppins-Regular",
  },
  rateText: {
    fontSize: RFValue(14, 800),
    fontWeight: "600",
    color: "#525252",
    bottom: 0,
    fontFamily: "Poppins-SemiBold",
  },
  PriceView: {
    backgroundColor: "#FFFFFF",
    width: wp("30.28%"),
    // height: "80%",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  ProductQuantityView: {
    // backgroundColor: "yellow",
    width: wp("25%"),
    height: hp("3.875%"),
    paddingHorizontal: wp("1%"),
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1D9ADC",
  },
  QuantityChanger: {
    textAlign: "center",
    color: "#1D9ADC",
    fontSize: RFValue(18, 800),
    lineHeight: Platform.OS === "android" ? 18 : 0,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  quantity: {
    textAlign: "center",
    color: "#1D9ADC",
    fontSize: RFValue(14, 800),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    alignItems: "end",
    lineHeight: Platform.OS === "android" ? 14 : 0,
  },
  ButtonCommonView: {
    width: wp("100%"),
    height: hp("8%"),
    justifyContent: "space-between",
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    backgroundColor: "#ffffffff",
    alignItems: "center",
    position: "absolute",
    bottom: hp("7%"),
    elevation: 8,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    paddingHorizontal: wp("4.44%"),
  },
  quantityTouchable: {
    // backgroundColor: "#000",
    width: wp("58.39%"),
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    // marginRight:wp("4.44%"),
  },
  // gradientButton: {
  //   width: "100%",
  //   height: "100%",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   borderRadius: 10,
  //   overflow: "hidden",
  // },
  gradientButton2: {
    width: wp("58.39%"),
    height: "75%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    // overflow: "hidden",
    // backgroundColor: "#000",
  },
  addToCartButton: {
    width: wp("58.39%"),
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    // paddingHorizontal: 26,
    // marginBottom: 7,
    borderRadius: 10,
    // backgroundColor: colors.green,
  },
  addToCartText: {
    color: "white",
    fontSize: RFValue(14, 800),
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
  },
  TotalTextView: {
    // backgroundColor: "#000",
    // width: wp("20%"),
    // height: "60%",
    //  position: 'relative',
    // paddingLeft: -wp("4.44%"),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  TotalText: {
    color: "#525252",
    fontWeight: "600",
    fontSize: RFValue(16, 800),
    fontFamily: "Poppins-SemiBold",
    // left: 20,
  },
  EmptyContainer: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 15,
    width: wp("91.11%"),
    height: hp("79.11%"),
    padding: wp("2"),
    marginTop: hp("1.2"),
    shadowColor: "#A9A9A9",
    elevation: 3,
    paddingHorizontal: wp("5%"),
    marginBottom: hp("8.5%"),
  },
  emptyText: {
    fontSize: RFValue(14),
    fontWeight: "600",
    // lineHeight: 50,
    // left: 14,
    color: "#3D3D3D99",
    fontFamily: "Poppins-Regular",
  },
  emptyText2: {
    fontSize: RFValue(11),
    fontWeight: "600",
    bottom: hp("0.5"),
    // left: 14,
    color: "#B2B2B2",
    fontFamily: "Poppins-Regular",
  },
  EmptyImage: {
    resizeMode: "contain",
    width: wp("15.28%"),
    height: hp("6.875%"),
    marginBottom: hp("1"),
  },
  ShopButton: {
    marginTop: hp("2.5"),
    backgroundColor: "#FFFFFF",
    width: wp("43%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
  },
  gradientButton3: {
    width: wp("43%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    overflow: "hidden",
  },
  shopButtonGradient: {
    width: wp("43%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
    // paddingHorizontal: 26,
    marginBottom: 7,
    borderRadius: 10,
    // backgroundColor: colors.green,
  },
  badge: {
    backgroundColor: "#E8F5E9", // very light green (soft & fresh)
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C8E6C9", // matching light green border
    alignSelf: "flex-start",
    marginTop: 6,
  },
  badgeText: {
    color: "#2E7D32", // fresh green text (not gray)
    fontSize: RFValue(13, 800),
    fontWeight: "600",
  },
});

export default CartWithSummaryCard;
