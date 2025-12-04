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
import CustomButton from "../../../component/CustomButton";
import QuantitySelector from "../../../component/QuantitySelector/Quantity";

import { Skeleton } from "moti/skeleton";
import { useTranslation } from "react-i18next";
import {
  defaultHTMLElementModels,
  HTMLContentModel,
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
import { ProductDetailSkeleton } from "../../../component/Skeleton/SkeletonComponents";
import { useWishlistActions } from "../../../hooks/useWishlistActions";
import CartService from "../../../services/cartService";
import ProductService from "../../../services/productService";

const client = process.env.CLIENT;

const NormalProductDetails = (props) => {
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
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [units, setUnits] = useState([]);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  const conditionalHeaderProps = appSettings[client]?.conditionalHeaderProps;
  const backgroundColor = appSettings[client]?.backgroundColor;

  const { t } = useTranslation();
  const productId = SKUID;
  const quantity = quantities[productId] || 0;
  const scrollViewRef = useRef(null);

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

  useEffect(() => {
    if (wishlistMap) {
      setWishListed(wishlistMap);
    }
  }, [wishlistMap]);

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) =>
        conditionalHeaderProps ? (
          <CustomHeader
            title={t("product_details")}
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

      const isWishlisted = WishListed[productId] ?? false;
      const updatedState = !isWishlisted;

      setWishListed((prev) => ({
        ...prev,
        [productId]: updatedState,
      }));

      if (updatedState) {
        Toast.show({
          type: "success",
          text1: "Added to wishlist",
          text2: "go to your Wishlist",
          position: "top",
          visibilityTime: 3000,
        });
        await addToSaveForLater(productId);
      } else {
        Toast.show({
          type: "success",
          text1: "Removed from Wishlist",
          text2: "",
          position: "top",
          visibilityTime: 3000,
        });

        await removeFromSaveForLater(productId);
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
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

  const { width } = Dimensions.get("window");

  const source = {
    html: productDetail.ProductDescription || "<p>No description available</p>",
  };

  const customRenderers = {
    table: ({ TDefaultRenderer, ...props }) => (
      <ScrollView horizontal style={styles.tableScrollView}>
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
      {/* Content Section  */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <>
          {productImages.map((item, index) =>
            loading.Skeleton ? (
              <View key={index} style={styles.skeletonImageContainer}>
                <Skeleton
                  colorMode="light"
                  radius={15}
                  height={hp("40%")}
                  width={wp("91.11%")}
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
                  style={styles.productImage}
                  source={{ uri: item.ZoomImage || item.ListingImage }}
                />
              </TouchableOpacity>
            )
          )}
          {loading.Skeleton ? null : (
            <TouchableOpacity
              onPress={() => toggleWishList(productId)}
              style={styles.wishlistButton}
            >
              {WishListed[productId] ? (
                <Image
                  style={styles.wishlistIcon}
                  source={require("../../../assets/images/client/foodworld/wishActive.png")}
                />
              ) : (
                <Image
                  style={styles.wishlistIcon}
                  source={require("../../../assets/images/client/foodworld/wishlistIcon.png")}
                />
              )}
            </TouchableOpacity>
          )}
        </>
        {/* {console.log('productDetail:', productDetail)} */}
        {loading.Skeleton ? (
          <ProductDetailSkeleton />
        ) : (
          <>
            <View style={styles.productDetailsContainer}>
              <Text
                style={[
                  styles.stockText,
                  {
                    color: !productDetail.IsOutOfStock ? "#68B054" : "#FE5656",
                  },
                ]}
              >
                {!productDetail.IsOutOfStock
                  ? t("in_stock")
                  : t("out_of_stock")}
              </Text>
              <Text numberOfLines={2} style={styles.productNameText}>
                {productDetail.ProductName}
              </Text>
              <Text style={styles.packSizeText}>
                {t("pack_size")} {productDetail.AdditionalInfo1}
              </Text>
              <Text style={styles.priceText}>
                {productDetail.ProductDiscountPrice <
                productDetail.ProductPrice ? (
                  <Text style={styles.discountedPrice}>
                    {productDetail.ProductDiscountPrice}{" "}
                    {productDetail.Currency}
                  </Text>
                ) : (
                  <Text style={styles.price}>
                    {productDetail.ProductPrice} {productDetail.Currency}
                  </Text>
                )}
              </Text>
              <QuantitySelector
                onPress={() => handlePress(productId, productDetail.Currency)}
                quantity={quantity}
                setQuantity={(newQuantity) =>
                  setQuantity(productId, newQuantity)
                }
              />
              <View style={styles.dropdownDescriptionContent}>
                {/* Brand Section */}
                {productDetail.BrandName && (
                  <View style={styles.commonViewDetails}>
                    <Text style={styles.detailsText1}>{t("brand")}: </Text>
                    <View style={styles.brandBadge}>
                      <Text style={styles.brandBadgeText}>
                        {productDetail.BrandName}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Categories Section */}
                {productDetail.Categories &&
                  productDetail.Categories.length > 0 && (
                    <View style={styles.commonViewDetails}>
                      <Text style={styles.detailsText1}>
                        {t("categories")}:{" "}
                      </Text>
                      <View style={styles.badgeContainer}>
                        {productDetail.Categories.map((category, index) => (
                          <View key={index} style={styles.categoryBadge}>
                            <Text style={styles.badgeText}>
                              {category.CategoryName}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
              </View>
            </View>
            <CustomButton
              buttonText={t("add_to_cart")}
              handleButtonPress={() =>
                handleAddToCart(
                  productDetail.ProductID,
                  quantity,
                  productDetail
                )
              }
              Width={85}
              Height={6}
              Radius={15}
              type={"normal"}
              backgroundColor="#68B054"
              buttonColor={backgroundColor}
            />
          </>
        )}
      </ScrollView>

      {/* Custom Image Viewer Modal */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          resetZoom();
          setImageViewerVisible(false);
        }}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.imageViewerContainer}>
            <StatusBar hidden />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                resetZoom();
                setImageViewerVisible(false);
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
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 120,
  },
  skeletonImageContainer: {
    width: wp("91.11%"),
    height: hp("40%"),
    alignSelf: "center",
    borderRadius: 15,
    marginVertical: 17,
  },
  productImage: {
    width: wp("91.11%"),
    height: hp("40%"),
    resizeMode: "contain",
    alignSelf: "center",
    backgroundColor: "#F6F9FF",
    borderRadius: 15,
    marginTop: 17,
  },
  wishlistButton: {
    position: "absolute",
    right: 45,
    top: 35,
  },
  wishlistIcon: {
    resizeMode: "contain",
    width: 30,
    height: 30,
  },
  productDetailsContainer: {
    marginHorizontal: 25,
    alignItems: "flex-start",
  },
  stockText: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 50,
  },
  productNameText: {
    fontSize: 23,
    fontWeight: "700",
    color: "#133051",
  },
  packSizeText: {
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 40,
    color: "rgba(37,37,37,0.65)",
  },
  priceText: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 45,
    color: "#133051",
  },
  tableScrollView: {
    marginBottom: 12,
  },
  ProductImage: {
    resizeMode: "contain",
    width: 200,
    height: 200,
  },
  flatList: {
    overflow: "hidden",
  },
  imageTouchView: {
    backgroundColor: "#F4F9FF",
    borderRadius: 15,
    height: 145,
    width: 145,
    resizeMode: "contain",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  images: {
    height: 145,
    width: 145,
    resizeMode: "contain",
    backgroundColor: "#F4F9FF",
    borderRadius: 15,
  },
  textView: {
    height: 75,
    width: 145,
    flexDirection: "column",
  },
  ProductNameView: {
    width: "100%",
    height: "55%",
    overflow: "hidden",
  },

  commonViewDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1%"),
    flexWrap: "wrap",
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.5%"),
    marginRight: wp("1%"),
    marginBottom: hp("0.5%"),
    borderWidth: 1,
    borderColor: "#68B054",
  },
  badgeText: {
    fontSize: RFValue(12, 800),
    fontFamily: "Poppins-Regular",
    color: "#68B054",
    fontWeight: "500",
  },
  brandBadge: {
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.5%"),
    borderWidth: 1,
    borderColor: "#133051",
  },
  brandBadgeText: {
    fontSize: RFValue(13, 800),
    fontFamily: "Poppins-Medium",
    color: "#133051",
    fontWeight: "600",
  },
  detailsText1: {
    fontSize: RFValue(16, 800),
    fontFamily: "Poppins-Medium",
    color: "#252525",
    fontWeight: "500",
    marginRight: wp("2%"),
  },
  detailsText2: {
    fontSize: RFValue(14, 800),
    fontFamily: "Poppins-Regular",
    color: "#525252",
    fontWeight: "500",
  },
  ProductName: {
    alignItems: "center",
    textAlign: "left",
    bottom: -5,
    fontSize: 16,
    color: "#252525",
  },
  PriceView: {
    width: "100%",
    alignItems: "center",
    height: "25%",
    overflow: "hidden",
    flexDirection: "row",
  },
  ProductPrice: {
    alignItems: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#133051",
  },
  commonView: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    height: "20%",
  },
  oldPriceView: {
    width: "50%",
    // alignItems:'center',
    height: "100%",
    overflow: "hidden",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  oldProductPrice: {
    fontSize: 11,
    // fontWeight: "600",
    alignItems: "center",
    textDecorationLine: "line-through",
    textDecorationColor: "#FE5656",
    color: "#FE5656",
  },
  quantitySection: {
    width: "50%",
    height: "100%",
    alignItems: "flex-end",
    position: "absolute",
    right: 0,
    bottom: 15,
  },
  dropdownDescriptionContent: {
    flexDirection: "column",
    marginBottom: hp("1.875%"),
    width: wp("91.1%"),
    paddingVertical: hp("1.875%"),
    alignSelf: "center",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  ButtonView: {
    backgroundColor: "#58BB47",
    width: "89%",
    height: "7.5%",
    alignSelf: "center",
    position: "absolute",
    bottom: 35,
    borderRadius: 15,
    justifyContent: "center",
  },
  buttonText: {
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: 500,
  },
  commonTextSpec: {
    fontSize: 17,
    fontWeight: "500",
    lineHeight: 26,
    color: "#000",
  },
  commonViewSpec: {
    flexDirection: "row",
    alignItems: "baseline",
    width: "100%",
    flexWrap: "wrap",
  },
  commonTextSpec2: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
    flexShrink: 1,
  },
  Dot: {
    fontSize: 35,
    fontWeight: "900",
    color: "#000",
  },
  ListOuterView: {
    backgroundColor: "#FFFFFF",
    marginVertical: 5,
    width: "100%",
    height: 75,
    alignSelf: "center",
    borderRadius: 15,
    borderWidth: 0.4,
    borderColor: "rgba(37,37,37,0.25)",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  ImageView: {
    backgroundColor: "#FFFFFF",
    width: "23%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    overflow: "hidden",
  },
  DetailsView: {
    paddingVertical: 15,
    width: "62%",
    height: "100%",
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
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
  ProductDetailsView: {
    width: "80%",
    height: "100%",
    borderRadius: 20,
    justifyContent: "center",
    paddingLeft: 15,
  },
  nameText: {
    fontSize: 17,
    fontWeight: 600,
    color: "#252525",
  },
  weightText: {
    fontSize: 17,
    fontWeight: 600,
    color: "#B5B5B5",
  },
  rateText: {
    fontSize: 18,
    fontWeight: 600,
    color: "#133051",
  },
  TickView: {
    width: "15%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    overflow: "hidden",
  },
});

export default NormalProductDetails;
