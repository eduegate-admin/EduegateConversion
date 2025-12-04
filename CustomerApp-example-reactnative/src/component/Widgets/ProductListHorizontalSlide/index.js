import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import QuantitySelector from "../../QuantitySelector/Quantity";
import ProductService from "../../../services/productService";
import { useNavigation } from "@react-navigation/native";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";
import { useWishlistActions } from "../../../hooks/useWishlistActions";
import { useWishlist } from "../../../AppContext/WishlistContext";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { Skeleton } from "moti/skeleton";
import CartService from "../../../services/cartService";
import { useCallContext } from "../../../AppContext/CallContext";
import { useCart } from "../../../AppContext/CartContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";

const client = process.env.CLIENT;
const { width, height } = Dimensions.get("screen");

// Memoized Product Item Component for better performance
const ProductItem = React.memo(
  ({
    item,
    quantity,
    isWishlisted,
    onPress,
    onWishlistToggle,
    onQuantityChange,
    onAddToCart,
    styles,
    client,
    t,
    navigation,
  }) => {
    const productId = item.SKUID;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("ProductDetails", { item })}
        style={styles.widget}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("ProductDetails", { item })}
          style={styles.imageTouchView}
        >
          <Image
            style={styles.images}
            source={{ uri: item.ProductListingImage }}
            // contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          <TouchableOpacity
            onPress={() => onWishlistToggle(productId)}
            style={styles.wishlist}
          >
            {isWishlisted ? (
              <Image
                style={styles.wishlistIcon}
                source={require("../../../assets/images/client/foodworld/wishActive.png")}
                contentFit="contain"
                cachePolicy="memory"
              />
            ) : (
              <Image
                style={styles.wishlistIcon}
                source={require("../../../assets/images/client/foodworld/wishlistIcon.png")}
                contentFit="contain"
                cachePolicy="memory"
              />
            )}
          </TouchableOpacity>
        </TouchableOpacity>
        <View style={styles.textView}>
          <View style={styles.ProductNametextView}>
            <Text numberOfLines={2} style={styles.ProductName}>
              {item.SKUName}
            </Text>
          </View>
          <View style={styles.PriceCommonView}>
            <Text style={styles.ProductPrice}>
              {client === "almadina" ? item.ProductPrice : item.Currency}
            </Text>
            <Text style={styles.CurrencyText}>
              {client === "almadina" ? item.Currency : item.ProductPrice}
            </Text>
          </View>
        </View>
        {client === "benchmarkfoods" ? (
          <TouchableOpacity
            style={styles.quantityTouchable}
            onPress={() => navigation.navigate("ProductDetails", { item })}
          >
            <View style={styles.addToCartButton}>
              <LinearGradient
                colors={["#1D9ADC", "#0B489A"]}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Text style={styles.addToCartText}>Select Option</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.quantitySelector}>
            <QuantitySelector
              onPress={() => onAddToCart(productId, item.Currency)}
              quantity={quantity}
              setQuantity={(newQuantity) =>
                onQuantityChange(productId, newQuantity, item.Currency)
              }
            />
          </View>
        )}
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for better performance
    return (
      prevProps.item.SKUID === nextProps.item.SKUID &&
      prevProps.quantity === nextProps.quantity &&
      prevProps.isWishlisted === nextProps.isWishlisted
    );
  }
);

const ProductListHorizontalSlideItem = (props) => {
  const [styles, setStyle] = useState(ClientStyles(client, "ProductListHorizontalSlide"));
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [WishListed, setWishListed] = useState({});
  const [loading, setLoading] = useState(true);
  const { callContext } = useCallContext();
  const { updateCart, cart } = useCart();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language; // 'en' or 'ar'
  const { addToSaveForLater, removeFromSaveForLater, getSaveForLater } =
    useWishlistActions();
  const { isInWishlist } = useWishlist();
   
  const boilerplates = props.data?.filter((item) => item.Name === "product list horizontal slide");
  
 

  useEffect(() => {
    const clientStyle = ClientStyles(client, "ProductListHorizontalSlide");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, [client]);

  const title = props?.title;
  
  const BoilerplateMapIID = Array.isArray(props?.BoilerplateMapIID)
    ? props.BoilerplateMapIID[0]
    : props?.BoilerplateMapIID;
  let boilerplate;
  boilerplates?.forEach((bp) => {
    if (bp.BoilerplateMapIID === BoilerplateMapIID) {
      boilerplate = bp;
    }
  });
  

  useEffect(() => {
    if (boilerplate) {
      fetchProduct();
    }
  }, [boilerplate]);

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const payload = {
        BoilerPlateID: boilerplate.BoilerPlateID,
        BoilerPlateParameters: boilerplate.BoilerPlateParameters,
        BoilerplateMapIID: boilerplate.BoilerplateMapIID,
        Compatibility: boilerplate.Compatibility,
        CreatedBy: boilerplate.CreatedBy,
        CreatedDate: boilerplate.CreatedDate,
        Description: boilerplate.Description,
        DesignTemplate: boilerplate.DesignTemplate,
        Name: boilerplate.Name,
        PageID: boilerplate.PageID,
        ReferenceID: boilerplate.ReferenceID,
        ReferenceIDName: boilerplate.ReferenceIDName,
        ReferenceIDRequired: boilerplate.ReferenceIDRequired,
        RuntimeParameters: boilerplate.RuntimeParameters,
        SerialNumber: boilerplate.SerialNumber,
        Template: boilerplate.Template,
        TimeStamps: boilerplate.TimeStamps,
        UpdatedBy: boilerplate.UpdatedBy,
        UpdatedDate: boilerplate.UpdatedDate,
      };

      const response = await ProductService.getProductsByBoilerplage(payload);
      const fetchedProducts = response.data || [];
      setProducts(fetchedProducts);

      // Wishlist state is now managed by WishlistContext - no need for local state
    } catch (error) {
      console.error("Error fetching API data:", error);
    } finally {
      setTimeout(() => setLoading(false), 100);
      // setLoading(false)
    }
  };
  useEffect(() => {
    if (!cart || !Array.isArray(cart.Products)) return;

    // Build a map of SKUID -> Quantity
    const quantityMap = {};
    cart.Products.forEach((item) => {
      quantityMap[item.SKUID] = item.Quantity;
    });

    setQuantities(quantityMap);
  }, [cart, products]);

  const handlePress = useCallback(
    async (productId, currency) => {
      // Optimistic UI update FIRST
      setQuantities((prev) => ({
        ...prev,
        [productId]: (prev[productId] || 0) + 1,
      }));

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
        const { operationResult, Message } = response.data;

        if (operationResult === 1) {
          // Update cart in background without awaiting
          updateCart();

          Toast.show({
            type: "success",
            text1: t("product_added_to_cart"),
            text2: t("go_to_cart_for_checkout"),
            position: "top",
            visibilityTime: 1500,
          });
        } else if (operationResult === 2) {
          // Revert optimistic update
          setQuantities((prev) => ({
            ...prev,
            [productId]: (prev[productId] || 1) - 1,
          }));

          Toast.show({
            type: "error",
            text1: Message || t("the_requested_quantity_is_not_available_for_this_product"),
            position: "top",
            visibilityTime: 2000,
          });
        } else {
          // Revert on unexpected response
          setQuantities((prev) => ({
            ...prev,
            [productId]: (prev[productId] || 1) - 1,
          }));

          Toast.show({
            type: "error",
            text1: Message || t("failed_to_add_to_cart"),
            position: "top",
            visibilityTime: 2000,
          });
        }
      } catch (error) {
        // Revert on error
        setQuantities((prev) => ({
          ...prev,
          [productId]: (prev[productId] || 1) - 1,
        }));

        console.error("Add to Cart error:", error);
        Toast.show({
          type: "error",
          text1: t("failed_to_add_to_cart"),
          text2: error.message || "",
          position: "top",
          visibilityTime: 1500,
        });
      }
    },
    [callContext, updateCart, t]
  );

  const setQuantity = useCallback(
    async (productId, newQuantity, currency) => {
      if (newQuantity < 0) return;

      const oldQuantity = quantities[productId] || 0;
      if (oldQuantity === newQuantity) return;

      // Optimistic UI update FIRST
      setQuantities((prev) => ({
        ...prev,
        [productId]: newQuantity,
      }));

      const quantityDelta = newQuantity - oldQuantity;

      const payload = {
        SKUID: productId,
        Quantity: quantityDelta,
        Currency: currency,
        CartItemNote: "",
        MaximumQuantityInCart: 1,
        ProductOptionID: "",
      };

      try {
        const response = await CartService.addToCart(payload, callContext);
        const { operationResult, Message } = response.data;

        if (operationResult === 1) {
          // Update cart in background without awaiting
          updateCart();

          Toast.show({
            type: "success",
            text1:
              newQuantity > oldQuantity
                ? t("product_added_to_cart")
                : newQuantity === 0
                ? t("product_removed_from_cart")
                : t("cart_updated_successfully"),
            text2: newQuantity > 0 ? t("go_to_cart_for_checkout") : "",
            position: "top",
            visibilityTime: 1500,
          });
        } else if (operationResult === 2) {
          if (newQuantity === 0 && (!Message || Message.trim() === "")) {
            // Update cart in background
            updateCart();

            Toast.show({
              type: "success",
              text1: t("product_removed_from_cart"),
              position: "top",
              visibilityTime: 1500,
            });
          } else {
            // Revert to old quantity
            setQuantities((prev) => ({
              ...prev,
              [productId]: oldQuantity,
            }));

            const errorMessage = Message && Message.trim() !== "" 
              ? Message 
              : t("the_requested_quantity_is_not_available_for_this_product");

            Toast.show({
              type: "error",
              text1: errorMessage,
              position: "top",
              visibilityTime: 3000,
            });
          }
        } else {
          // Revert on unexpected response
          setQuantities((prev) => ({
            ...prev,
            [productId]: oldQuantity,
          }));

          Toast.show({
            type: "error",
            text1: Message || t("failed_to_update_cart"),
            position: "top",
            visibilityTime: 3000,
          });
        }
      } catch (error) {
        // Revert on error
        setQuantities((prev) => ({
          ...prev,
          [productId]: oldQuantity,
        }));

        Toast.show({
          type: "error",
          text1: t("failed_to_update_cart"),
          text2: error.message || "",
          position: "top",
          visibilityTime: 3000,
        });
      }
    },
    [quantities, updateCart, t, callContext]
  );

  const Item = products.map((item) => item);
  const Data = boilerplate.RuntimeParameters;
  const arabicTitle = Data?.find((entry) => entry.Key === "Title-ar")?.Value;
  const englishTitle = Data?.find((entry) => entry.Key === "Title")?.Value;
  const displayTitle = currentLanguage === 'ar' ? arabicTitle : englishTitle;
  const ProductCount =
    Data.find((entry) => entry.Key === "ProductCount")?.Value || "";
  const PriceListCode =
    Data.find((entry) => entry.Key === "PromotionPriceListCode")?.Value || "";
  const CategoryID =
    Data.find((entry) => entry.Key === "CategoryID")?.Value || "";
  const Tag = Data.find((entry) => entry.Key === "Tag")?.Value || "";
  const Count = Data.find((entry) => entry.Key === "Count")?.Value || "";

  // const PriceListCode = !!PriceListCode;
  const activeKey = PriceListCode
    ? "PriceListCode"
    : CategoryID
      ? "cat"
      : Tag
        ? "skutags"
        : "";
  const activeValue = PriceListCode
    ? PriceListCode
    : CategoryID
      ? CategoryID
      : Tag
        ? Tag
        : "";
  const countkey = ProductCount ? "ProductCount" : Count ? "Count" : "";
  const countvalue = ProductCount ? ProductCount : Count ? Count : "";

  // console.log(",,,,,,,Using", activeKey, ":", activeValue);

  const toggleWishList = useCallback(
    async (productId) => {
      try {
        if (!productId) return;
        const isWishlisted = isInWishlist(productId);

        if (isWishlisted) {
          await removeFromSaveForLater(productId);
          Toast.show({
            type: "success",
            text1: t("removed_from_wishlist"),
          });
        } else {
          await addToSaveForLater(productId);
          Toast.show({
            type: "success",
            text1: t("added_to_wishlist"),
          });
        }
        // No need to manually update state - WishlistContext will handle it automatically
      } catch (error) {
        console.error("Wishlist toggle error:", error);
      }
    },
    [isInWishlist, addToSaveForLater, removeFromSaveForLater, t]
  );
  // console.log("products",products);
  // No need for manual wishlist sync - WishlistContext handles this automatically

  return (
    products.length > 0 && (
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
        <View style={styles.dshMenuCnt}>
          {loading ? (
            <View style={styles.dshMenuTitle}>
              <Skeleton width={150} height={20} radius={4} colorMode="light" />
              <Skeleton width={60} height={16} radius={4} colorMode="light" />
            </View>
          ) : (
            <View style={styles.dshMenuTitle}>
              <Text style={styles.widgetTitle}>{displayTitle || title}</Text>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ProductListing", {
                    title: title,
                    searchVal: `;${activeKey}:${activeValue};${countkey}:${countvalue}; `,
                    searchText: `${""}`,
                    searchBy: PriceListCode
                      ? "pricelists"
                      : CategoryID
                        ? "category"
                        : Tag
                          ? "skutags"
                          : "",
                    sortBy: `${"relevance"}`,
                    isCategory: `${false}`,
                    pageType: `${"Recommended"}`,
                  })
                }
              >
                {client === "benchmarkfoods" ? (
                  <Image
                    style={styles.arrow}
                    source={require("../../../assets/images/client/benchmarkfoods/arrow.png")}
                    contentFit="contain"
                    cachePolicy="memory"
                  />
                ) : (
                  <Text style={styles.viewAll}>{t("view_all")}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            contentContainerStyle={{ padding: 5 }}
            keyExtractor={(item, index) => item.SKUID || String(index)}
            data={products}
            renderItem={({ item, index }) => {
              const productId = item.SKUID;
              const quantity = quantities[productId] || 0;

              if (item.ProductListingImage !== null)
                return (
                  <>
                    {loading ? (
                      <View style={[styles.widget, { gap: hp("0.7%") }]}>
                        <Skeleton
                          height={100}
                          width={100}
                          radius={8}
                          colorMode="light"
                        />

                        <Skeleton
                          height={12}
                          width={90}
                          radius={4}
                          colorMode="light"
                          style={{ marginTop: 8 }}
                        />
                        <Skeleton
                          height={12}
                          width={50}
                          radius={4}
                          colorMode="light"
                          style={{ marginTop: 6 }}
                        />

                        <Skeleton
                          height={28}
                          width={60}
                          radius={20}
                          colorMode="light"
                          style={{ marginTop: 10 }}
                        />

                        {/* Heart Icon placeholder */}
                        <View style={styles.wishlistSkeletonIcon}>
                          <Skeleton
                            height={20}
                            width={20}
                            radius={10}
                            colorMode="light"
                          />
                        </View>
                      </View>
                    ) : (
                      <ProductItem
                        item={item}
                        quantity={quantity}
                        isWishlisted={isInWishlist(productId)}
                        onWishlistToggle={toggleWishList}
                        onQuantityChange={setQuantity}
                        onAddToCart={handlePress}
                        styles={styles}
                        client={client}
                        t={t}
                        navigation={navigation}
                      />
                    )}
                  </>
                );
            }}
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={5}
            initialNumToRender={3}
          />
        </View>
      </View>
    )
  );
};

export default ProductListHorizontalSlideItem;
