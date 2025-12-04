import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import QuantitySelector from "../../../component/QuantitySelector/Quantity";

import { LinearGradient } from "expo-linear-gradient";
import { Skeleton } from "moti/skeleton";
import { useTranslation } from "react-i18next";
import {
  defaultHTMLElementModels,
  HTMLContentModel,
  RenderHTML,
} from "react-native-render-html";
import { RFValue } from "react-native-responsive-fontsize";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import appSettings from "../../../../Client/appSettings";
import { useCallContext } from "../../../AppContext/CallContext";
import { useCart } from "../../../AppContext/CartContext";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import CustomHeader from "../../../component/CustomHeader";
import {
  ProductBottomButtonSkeleton,
  ProductDetailSkeleton,
} from "../../../component/Skeleton/SkeletonComponents";
import { useWishlistActions } from "../../../hooks/useWishlistActions";
import CartService from "../../../services/cartService";
import ProductService from "../../../services/productService";

const client = process.env.CLIENT;

const GradientProductDetails = (props) => {
  const navigation = useNavigation();
  const SKUID = props.route?.params?.item?.SKUID;
  const [quantities, setQuantities] = useState(() => {
    if (SKUID) {
      return { [SKUID]: 1 };
    }
    return {};
  });
  const { callContext } = useCallContext();
  const { updateCart, cart } = useCart();
  const whatsapp = appSettings[client].whatsapp;
  const { addToSaveForLater, removeFromSaveForLater } = useWishlistActions();
  const wishlistMap = props.route.params?.WishListed;
  const [loading, setLoading] = useState({ button: false, Skeleton: true });
  const [WishListed, setWishListed] = useState({});
  const [productImages, setProductImages] = useState([]);
  const [productDetail, setProductDetail] = useState({});
  const [dropDownDescription, setDropDownDescription] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [units, setUnits] = useState([]);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Zoom animation values
  const scale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const { t } = useTranslation();
  const productId = SKUID;
  const quantity = quantities[productId] || 0;
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (wishlistMap) {
      setWishListed(wishlistMap);
    }
  }, [wishlistMap]);

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        <CustomHeader
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={
            <CommonHeaderRight
              type={["search", "Cart"]}
              handleSearch={handleSearch}
            />
          }
        />
      ),
    });
    fetchProduct();
  }, [navigation, SKUID]);

  const handleSearch = () => {
    navigation.navigate("Search");
  };

  const fetchProduct = async () => {
    setLoading((prev) => ({ ...prev, Skeleton: true }));
    try {
      const respUnits = await ProductService.GetUnits(SKUID);

      if (respUnits) {
        setUnits(respUnits.data);

        if (respUnits.data.length > 0 && !selectedUnit) {
          setSelectedUnit(respUnits.data[0]);
          await fetchProductDetailForUnit(respUnits.data[0].Key);
        }
      } else {
        setUnits([]);
        await fetchProductDetailForUnit(null);
      }

      const response = await ProductService.GetProductDetailImages(SKUID);

      setProductImages(response.data);
      setLoading((prev) => ({ ...prev, Skeleton: false }));
    } catch (error) {
      console.error("Fetch product error:", error);
    }
  };

  const fetchProductDetailForUnit = async (unitKey) => {
    try {
      const responseDetail = await ProductService.GetProductDetail(
        SKUID,
        1, // Default cultureId, can be changed if needed
        unitKey
      );
      setProductDetail(responseDetail.data);
    } catch (error) {
      console.error("Fetch product detail error:", error);
    }
  };

  useEffect(() => {
    if (selectedUnit) {
      fetchProductDetailForUnit(selectedUnit.Key);
    }
  }, [selectedUnit]);

  const handlePress = (productId) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: 1,
    }));
  };
  const setQuantity = (productId, quantity) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: quantity,
    }));
  };

  const handleAddToCart = useCallback(
    async (productId, quantity, Item) => {
      if (quantity === 0) {
        Toast.show({
          type: "error",
          text1: "Add Quantity",
          position: "top",
          visibilityTime: 1500,
        });
        return;
      }

      setLoading((prev) => ({ ...prev, button: true }));

      const payload = {
        CartItemNote: "",
        Currency: productDetail.Currency || Item.Currency,
        MaximumQuantityInCart: 1,
        ProductOptionID: "",
        Quantity: quantity,
        SKUID: productId,
        ProductUnitID: selectedUnit.Key,
      };

      try {
        const response = await CartService.addToCart(payload, callContext);
        if (response?.data?.Message) {
          await updateCart();
          Toast.show({
            type: response.data.operationResult === 1 ? "success" : "error",
            text1: response.data.Message,
            text2:
              response.data.operationResult === 1
                ? t("go_to_cart_for_checkout")
                : "",
            position: "top",
            visibilityTime: 1500,
          });
        }
      } catch (error) {
        console.error("Add to Cart error:", error);
        Toast.show({
          type: "error",
          text1: t("error_adding_to_cart"),
          position: "top",
          visibilityTime: 1500,
        });
      } finally {
        setLoading((prev) => ({ ...prev, button: false }));
      }
    },
    [
      callContext,
      updateCart,
      quantity,
      productId,
      productDetail,
      navigation,
      t,
      selectedUnit,
    ]
  );

  const toggleWishList = async (productId) => {
    try {
      if (!productId) return;

      // Determine current wishlist state (from local state or API)
      const isCurrentlyWishlisted =
        WishListed[productId] ?? productDetail.IsWishList ?? false;

      // Optimistically update UI immediately
      const updatedState = !isCurrentlyWishlisted;
      setWishListed((prev) => ({
        ...prev,
        [productId]: updatedState,
      }));

      // Also update the productDetail to ensure re-render
      setProductDetail((prev) => ({
        ...prev,
        IsWishList: updatedState,
      }));

      // API call based on action
      if (updatedState) {
        await addToSaveForLater(productId);
        Toast.show({
          type: "success",
          text1: "Added to Wishlist",
          text2: "Go to your Wishlist",
          position: "top",
          visibilityTime: 1500,
        });
      } else {
        await removeFromSaveForLater(productId);
        Toast.show({
          type: "success",
          text1: "Removed from Wishlist",
          position: "top",
          visibilityTime: 1500,
        });
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
      Toast.show({
        type: "error",
        text1: "Error updating wishlist",
        position: "top",
        visibilityTime: 1500,
      });
    }
  };

  const shareOnWhatsApp = () => {
    const message = "Hello! I would like to know more about your app.";
    const url = `https://wa.me/${whatsapp.replace(
      "+",
      ""
    )}?text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() => {
      alert(t("whatsapp_not_installed"));
    });
  };

  // Pinch gesture handler for zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = event.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const resetZoom = () => {
    scale.value = withSpring(1);
  };

  const { width } = Dimensions.get("window");

  const source = {
    html: productDetail.ProductDescription || "<p>No description available</p>",
  };

  const customRenderers = {
    table: ({ TDefaultRenderer, ...props }) => (
      <ScrollView horizontal style={{ marginBottom: 12 }}>
        <TDefaultRenderer {...props} />
      </ScrollView>
    ),
  };

  const tagsStyles = {
    p: {
      fontSize: RFValue(14),
      lineHeight: 20,
      color: "#333",
      fontmaily: "regular",
    },
    table: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 4,
    },
    tr: { flexDirection: "row", width: wp("90%") },
    td: {
      borderWidth: 1,
      borderColor: "#ccc",
      padding: wp("2%"),
      flex: 1,
    },
    th: {
      borderWidth: 1,
      borderColor: "#ccc",
      padding: wp("2%"),
      fontWeight: "bold",
      backgroundColor: "#f1f1f1",
      flex: 1,
    },
  };

  const customHTMLElementModels = {
    table: defaultHTMLElementModels.table.extend({
      contentModel: HTMLContentModel.block,
    }),
    tr: defaultHTMLElementModels.tr.extend({
      contentModel: HTMLContentModel.block,
    }),
    td: defaultHTMLElementModels.td.extend({
      contentModel: HTMLContentModel.block,
    }),
    th: defaultHTMLElementModels.th.extend({
      contentModel: HTMLContentModel.block,
    }),
  };

  return (
    <View style={styles.container}>
      <Modal transparent={true} animationType="fade" visible={loading.button}>
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
        style={styles.scrollView}
        ref={scrollViewRef}
      >
        <LinearGradient
          colors={["#DEECFA", "#FFFFFF"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          {productImages.map((item, index) =>
            loading.Skeleton ? (
              <View key={index} style={styles.ProductImage}>
                <Skeleton
                  colorMode="light"
                  radius={15}
                  height={"100%"}
                  width="100%"
                />
              </View>
            ) : (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setCurrentImageIndex(index);
                  setImageViewerVisible(true);
                }}
                activeOpacity={0.9}
              >
                <Image
                  style={styles.ProductImage}
                  source={{ uri: item.ZoomImage || item.ListingImage }}
                />
              </TouchableOpacity>
            )
          )}
          {loading.Skeleton ? null : (
            <TouchableOpacity
              onPress={() => toggleWishList(productDetail.SKUID)}
              style={{
                position: "absolute",
                right: wp("10%"),
                top: hp("5%"),
                zIndex: 1,
              }}
            >
              {(WishListed[productId] ?? productDetail.IsWishList) ? (
                <Image
                  style={{
                    resizeMode: "contain",
                    width: wp("6.67%"),
                    height: hp("3%"),
                  }}
                  source={require("../../../assets/images/client/foodworld/wishActive.png")}
                />
              ) : (
                <Image
                  style={{
                    resizeMode: "contain",
                    width: wp("6.67%"),
                    height: hp("3%"),
                  }}
                  source={require("../../../assets/images/client/foodworld/wishlistIcon.png")}
                />
              )}
            </TouchableOpacity>
          )}
        </LinearGradient>
        {loading.Skeleton ? (
          <ProductDetailSkeleton />
        ) : (
          <View style={styles.contentView}>
            <Text
              style={{
                fontSize: RFValue(12),
                fontWeight: "500",
                fontFamily: "Poppins-Regular",
                color: !productDetail.IsOutOfStock ? "#68B054" : "#FE5656",
              }}
            >
              {!productDetail.IsOutOfStock ? "In Stock" : "Out of Stock"}
            </Text>
            <Text
              numberOfLines={2}
              style={{
                fontSize: RFValue(16),
                fontWeight: "600",
                color: "#525252",
                fontFamily: "Poppins-SemiBold",
              }}
            >
              {productDetail.ProductName}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text
                style={{
                  fontSize: RFValue(18),
                  fontWeight: "600",
                  color: "#525252",
                  fontFamily: "Poppins-SemiBold",
                }}
              >
                {productDetail.Currency}{" "}
                {productDetail.ProductPrice !==
                productDetail.ProductDiscountPrice
                  ? productDetail.ProductDiscountPrice
                  : productDetail.ProductPrice}
              </Text>
              {productDetail.ProductPrice !==
                productDetail.ProductDiscountPrice && (
                <Text
                  style={{
                    fontSize: RFValue(16, 800),
                    fontWeight: "600",
                    left: wp("2%"),
                    color: "#FE5656",
                    fontFamily: "Poppins-SemiBold",
                    textDecorationLine: "line-through",
                  }}
                >
                  {productDetail.Currency} {productDetail.ProductPrice}
                </Text>
              )}
            </View>

            <View style={styles.quantityMainView}>
              <Text style={styles.packText}>Pcs / Carton</Text>

              <QuantitySelector
                onPress={() => handlePress(productId, productDetail.Currency)}
                quantity={quantity}
                setQuantity={(newQuantity) =>
                  setQuantity(productId, newQuantity)
                }
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                setDropDown(!dropDown);
              }}
              style={styles.dropDownQuantity}
            >
              <Text style={styles.perCartonText}>
                {selectedUnit?.Value
                  ? selectedUnit?.Value.trim()
                  : "Select Unit"}
              </Text>
              <Image
                style={[
                  styles.dropdownImage,
                  { transform: dropDown ? [{ rotate: "180deg" }] : "" },
                ]}
                source={require("../../../assets/images/client/benchmarkfoods/dropDownArrow.png")}
              />
            </TouchableOpacity>
            {dropDown && (
              <View style={styles.dropDownContent}>
                {units.map((u) => (
                  <TouchableOpacity
                    key={u.Key}
                    onPress={() => {
                      setSelectedUnit(u);
                      setDropDown(false);
                    }}
                    style={[
                      styles.dropDownItem,
                      {
                        borderBottomWidth: 1,
                      },
                    ]}
                  >
                    <Text style={styles.dropDownText}>
                      Per {u.Value.trim()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity
              onPress={shareOnWhatsApp}
              style={styles.whatsappView}
            >
              <LinearGradient
                colors={["#DEECFA40", "#26FF4880"]}
                start={{ x: 0, y: 2 }}
                end={{ x: 2, y: 0 }}
                style={styles.gradientButton3}
              >
                <View style={styles.WhatsappIconView}>
                  <Image
                    style={[styles.whatsappImage]}
                    source={require("../../../assets/images/client/benchmarkfoods/Header_info.png")}
                  />
                </View>
                <View style={styles.whatsappTextView}>
                  <Text style={styles.whatsappText}>Chat with us</Text>
                </View>

                <View style={styles.dropDownCommonView}>
                  <Image
                    style={[styles.dropdownImage]}
                    source={require("../../../assets/images/client/benchmarkfoods/arrow-right.png")}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setDropDownDescription(!dropDownDescription);
                scrollViewRef.current?.scrollTo({
                  y: hp("22%"),
                  animated: true,
                });
              }}
              style={styles.whatsappView}
            >
              <View style={styles.WhatsappIconView}>
                <Image
                  style={[styles.barcodeImg]}
                  source={require("../../../assets/images/client/benchmarkfoods/barcode_scanner.png")}
                />
              </View>
              <View style={styles.whatsappTextView}>
                <Text numberOfLines={1} style={styles.whatsappText}>
                  Product Details
                </Text>
                <Text numberOfLines={1} style={styles.whatsappText2}>
                  Care Instructions, Pack Contains
                </Text>
              </View>

              <View style={styles.dropDownCommonView}>
                <Image
                  style={[
                    styles.dropdownImage,
                    {
                      transform: dropDownDescription
                        ? [{ rotate: "180deg" }]
                        : "",
                    },
                  ]}
                  source={require("../../../assets/images/client/benchmarkfoods/dropDownArrow.png")}
                />
              </View>
            </TouchableOpacity>
            {dropDownDescription && (
              <View style={styles.dropdownDescriptionContent}>
                <RenderHTML
                  contentWidth={width}
                  source={source}
                  tagsStyles={tagsStyles}
                  renderers={customRenderers}
                  customHTMLElementModels={customHTMLElementModels}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>
      {loading.Skeleton ? (
        <ProductBottomButtonSkeleton />
      ) : (
        <View style={styles.ButtonCommonView}>
          <Text style={styles.TotalText}>
            {productDetail.ProductPrice
              ? `${
                  quantity *
                  (productDetail.ProductPrice !==
                  productDetail.ProductDiscountPrice
                    ? productDetail.ProductDiscountPrice
                    : productDetail.ProductPrice)
                }  ${productDetail.Currency || productDetail.CurrencyCode}`
              : ""}
          </Text>

          <TouchableOpacity
            style={styles.quantityTouchable}
            onPress={() =>
              handleAddToCart(productDetail.ProductID, quantity, productDetail)
            }
          >
            <View style={styles.addToCartButton}>
              <LinearGradient
                colors={["#1D9ADC", "#0B489A"]}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton2}
              >
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Custom Image Viewer Modal */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setImageViewerVisible(false);
          resetZoom();
        }}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.imageViewerContainer}>
            <StatusBar hidden />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setImageViewerVisible(false);
                resetZoom();
              }}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>

            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x /
                    Dimensions.get("window").width
                );
                setCurrentImageIndex(index);
                resetZoom();
              }}
              contentOffset={{
                x: currentImageIndex * Dimensions.get("window").width,
                y: 0,
              }}
            >
              {productImages.map((item, index) => (
                <View key={index} style={styles.imageViewerPage}>
                  <GestureDetector gesture={pinchGesture}>
                    <Animated.View
                      style={[styles.imageContainer, animatedStyle]}
                    >
                      <Image
                        source={{ uri: item.ZoomImage || item.ListingImage }}
                        style={styles.fullImage}
                        resizeMode="contain"
                      />
                    </Animated.View>
                  </GestureDetector>
                </View>
              ))}
            </ScrollView>

            {productImages.length > 1 && (
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {currentImageIndex + 1} / {productImages.length}
                </Text>
              </View>
            )}
          </View>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    width: wp("100%"),
    height: hp("100%"),
  },
  scrollView: {
    overflow: "hidden",
    width: wp("100%"),
  },
  gradientButton: {
    width: wp("100%"),
    height: hp("45%"),
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  skeletonItem: {
    marginBottom: hp("1.2%"),
  },
  ProductImage: {
    width: wp("91.11%"),
    height: hp("42%"),
    resizeMode: "contain",
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    elevation: 15,
    shadowColor: "#9A9A9A40",
  },
  contentView: {
    marginHorizontal: wp("4.17%"),
    alignItems: "flex-start",
    marginBottom: hp("10%"),
  },
  ButtonCommonView: {
    width: wp("100%"),
    height: hp("8.5%"),
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: wp("4.44%"),
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 5,
    shadowColor: "#CFCFCF40",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: "#ffffff",
  },
  quantityTouchable: {
    backgroundColor: "#FFFFFF",
    width: wp("66.39%"),
    height: hp("8.5%"),
    alignItems: "center",
    justifyContent: "center",
  },
  gradientButton2: {
    width: wp("66.39%"),
    height: hp("5.75%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    overflow: "hidden",
  },
  gradientButton3: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 12,
    overflow: "hidden",
  },
  addToCartButton: {
    width: wp("66.39%"),
    height: hp("5.75%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  addToCartText: {
    color: "white",
    fontSize: RFValue(14),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  quantityMainView: {
    width: wp("91.11%"),
    height: hp("4.5%"),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropDownQuantity: {
    width: wp("42.22%"),
    height: hp("5.25%"),
    shadowColor: "#787878",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    elevation: 5,
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: hp("2.125%"),
    flexDirection: "row",
  },
  perCartonText: {
    width: wp("25%"),
    color: "#525252",
    fontSize: RFValue(14),
    fontFamily: "Poppins-Regular",
    fontWeight: "400",
  },
  dropdownImage: {
    resizeMode: "contain",
    width: wp("6.67%"),
    height: hp("3%"),
  },
  dropDownContent: {
    width: wp("42.22%"),
    shadowColor: "#787878",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    elevation: 5,
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: hp("2.125%"),
    marginTop: hp("-1.95%"),
    zIndex: 1,
  },
  dropDownItem: {
    width: "100%",
    paddingVertical: hp("1%"),
    borderColor: "#EFEFEF",
    paddingHorizontal: wp("4%"),
  },
  dropDownText: {
    color: "#525252",
    fontSize: RFValue(14),
    fontFamily: "Poppins-Regular",
    fontWeight: "400",
  },
  whatsappView: {
    marginBottom: hp("1.875%"),
    width: wp("91.1%"),
    height: hp("7.25%"),
    backgroundColor: "#FFFFFF",
    alignSelf: "center",
    borderRadius: 12,
    shadowColor: "#787878",
    elevation: 5,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  dropdownDescriptionContent: {
    marginBottom: hp("1.875%"),
    width: wp("91.1%"),
    paddingVertical: hp("1.875%"),
    backgroundColor: "#FFFFFF",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    shadowColor: "#787878",
    elevation: 5,
  },
  whatsappText: {
    color: "#525252",
    fontSize: RFValue(14),
    fontWeight: "400",
    fontFamily: "poppins-Regular",
  },
  whatsappText2: {
    color: "#B2B2B2",
    fontSize: RFValue(12),
    fontWeight: "400",
    fontFamily: "poppins-Regular",
  },
  whatsappImage: {
    resizeMode: "contain",
    width: wp("10.28%"),
    height: hp("4.63%"),
  },
  barcodeImg: {
    resizeMode: "contain",
    width: wp("7.78%"),
    height: hp("3.5%"),
  },
  WhatsappIconView: {
    width: wp("13.6%"),
    height: hp("7.25%"),
    justifyContent: "center",
    alignItems: "flex-end",
  },
  whatsappTextView: {
    width: wp("54.6%"),
    height: hp("7.25%"),
    justifyContent: "center",
    alignItems: "Left",
  },
  dropDownCommonView: {
    width: wp("13.6%"),
    height: hp("7.25%"),
    justifyContent: "center",
    alignItems: "flex-end",
  },
  packText: {
    fontSize: RFValue(14),
    color: "#525252",
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
  },
  TotalText: {
    fontSize: RFValue(16),
    color: "#525252",
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
  },
  imageViewerPage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  imageCounter: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  imageCounterText: {
    color: "white",
    fontSize: RFValue(14),
    fontFamily: "Poppins-Regular",
  },
});

export default GradientProductDetails;
