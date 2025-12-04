import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import { Skeleton } from "moti/skeleton";

import QuantitySelector from "../../../component/QuantitySelector/Quantity";
import ProductOptionModal from "../../../component/ProductOptionModal";
import { useCart } from "../../../AppContext/CartContext";
import { useCallContext } from "../../../AppContext/CallContext";
import ProductService from "../../../services/productService";
import CartService from "../../../services/cartService";
import { useWishlistActions } from "../../../hooks/useWishlistActions";
import colors from "../../../config/colors";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import CustomSearchBar from "../../../component/CustomSearchBar";
import CustomHeader from "../../../component/CustomHeader";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";  

import appSettings from "../../../../Client/appSettings";

const client = process.env.CLIENT;

// Page size configuration per client (matching Cordova app behavior)
const PAGE_SIZE_CONFIG = {
  almadina: 100,        // Increased from 12 to match Cordova
  almadinadot: 100,     // Increased from 12 to match Cordova
  benchmarkfoods: 50,
  foodworld: 50,
  comtone: 50,
  default: 50
};

const PAGE_SIZE = PAGE_SIZE_CONFIG[client] || PAGE_SIZE_CONFIG.default;
const MAX_PAGES = 50;

// Performance configuration
const INITIAL_RENDER_COUNT = 20; // Render first 20 items immediately for fast initial load
const MAX_TO_RENDER_PER_BATCH = 20; // Render 20 items per batch
const UPDATE_CELLS_BATCHING_PERIOD = 30; // 30ms batching for faster updates
const END_REACHED_THRESHOLD = 0.3; // Load more when 30% from bottom

// Memoized Product Item Component with proper comparison
const ProductItem = memo(
  ({
    item,
    quantities,
    onPress,
    onQuantityChange,
    navigation,
    wishListed,
    toggleWishList,
    styles,
  }) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => setLoading(false), 100); // Reduced from 300ms
      return () => clearTimeout(timer);
    }, [item.SKUID]);

    const renderImage = () => {
      if (!item.ProductListingImage) {
        return (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        );
      }
      return (
        <>
          <Image
            style={styles.images}
            source={{ uri: item.ProductListingImage }}
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => toggleWishList(item.SKUID)}
            style={styles.wishListButton}
          >
            <Image
              style={styles.wishicon}
              source={
                wishListed[item.SKUID]
                  ? require("../../../assets/images/client/foodworld/wishActive.png")
                  : require("../../../assets/images/client/foodworld/wishlistIcon.png")
              }
            />
          </TouchableOpacity>
        </>
      );
    };

    const renderBenchmarkFoodsContent = () => (
      <>
        <View style={styles.textView}>
          <View style={styles.productNameContainer}>
            <Text numberOfLines={2} style={styles.ProductName}>
              {item.ProductName}
            </Text>
          </View>
          <Text style={styles.AedText}>
            {item.CurrencyCode} {item.ProductPrice}
          </Text>
          {/* <View style={styles.PriceCommonView}>
            
          </View> */}
        </View>
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
      </>
    );

    const renderDefaultContent = () => {
      return (
        <View style={styles.textView}>
          <View style={styles.ProductNameView}>
            <Text style={styles.ProductName} numberOfLines={2}>
              {item.ProductName}
            </Text>
          </View>
          {item.ProductDiscountPrice < item.ProductPrice ? (
            <View style={styles.PriceView}>
              <Text style={styles.ProductPrice}>
                {item.CurrencyCode}{" "}
                {item.ProductDiscountPrice?.toFixed(2) || "0.00"}
              </Text>

              <Text style={styles.oldProductPrice}>
                {item.CurrencyCode} {item.ProductPrice?.toFixed(2) || "0.00"}
              </Text>
            </View>
          ) : (
            <View style={styles.ProductPrice}>
              <Text style={styles.ProductPrice}>
                {item.CurrencyCode} {item.ProductPrice?.toFixed(2) || "0.00"}
              </Text>
            </View>
          )}
          <View style={styles.commonView}>
            <View style={styles.quantitySection}>
              <QuantitySelector
                onPress={() => onPress(item.SKUID, item.CurrencyCode, item)} // Pass full item object
                quantity={quantities[item.SKUID] || 0}
                setQuantity={(newQuantity) =>
                  onQuantityChange(item.SKUID, newQuantity, item.CurrencyCode)
                }
                minValue={0}
                maxValue={10}
              />
            </View>
          </View>
        </View>
      );
    };

    return (
      <View style={styles.widget}>
        {loading ? (
          <>
            <Skeleton
              colorMode="light"
              radius="md"
              height={hp("20%")}
              width="100%"
            />
            <View style={styles.textView}>
              <Skeleton colorMode="light" width="80%" height={hp("2.5%")} />
              <View style={{ height: 5 }} />
              <Skeleton colorMode="light" width="50%" height={hp("2.5%")} />
            </View>
            <View style={styles.quantityTouchable}>
              <Skeleton colorMode="light" width="100%" height={hp("5%")} />
            </View>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ProductDetails", { item, wishListed })
              }
              style={styles.imageTouchView}
            >
              {renderImage()}
            </TouchableOpacity>
            {client === "benchmarkfoods"
              ? renderBenchmarkFoodsContent()
              : renderDefaultContent()}
          </>
        )}
      </View>
    );
  },
  // Custom comparison function - only re-render if these props actually change
  (prevProps, nextProps) => {
    return (
      prevProps.item.SKUID === nextProps.item.SKUID &&
      prevProps.quantities[prevProps.item.SKUID] === nextProps.quantities[nextProps.item.SKUID] &&
      prevProps.wishListed[prevProps.item.SKUID] === nextProps.wishListed[nextProps.item.SKUID]
    );
  }
);

// Main Component
const PaginationProductListing = ({ route }) => {
  const navigation = useNavigation();
  const { updateCart } = useCart();
  const { callContext } = useCallContext();
  const { t } = useTranslation();
  const { addToSaveForLater, removeFromSaveForLater, getSaveForLater } =
    useWishlistActions();

  // Store initial params in a ref to prevent unnecessary re-fetches
  const initialParamsRef = useRef({
    title: route.params?.title || "",
    searchVal: route.params?.searchVal || "",
    searchText: route.params?.searchText || "",
    searchBy: route.params?.searchBy || "",
    sortBy: route.params?.sortBy || "",
    isCategory: route.params?.isCategory ?? null,
    pageType: route.params?.pageType || "",
  });

  // Individual search parameters as separate state
  const [title, setTitle] = useState(initialParamsRef.current.title);
  const [searchVal, setSearchVal] = useState(
    initialParamsRef.current.searchVal
  );
  const [searchText, setSearchText] = useState(
    initialParamsRef.current.searchText
  );
  const [searchBy, setSearchBy] = useState(initialParamsRef.current.searchBy);
  const [sortBy, setSortBy] = useState(initialParamsRef.current.sortBy);
  const [isCategory, setIsCategory] = useState(
    initialParamsRef.current.isCategory
  );
  const [pageType, setPageType] = useState(initialParamsRef.current.pageType);
  const [styles, setStyle] = useState(getStyles(client));
  const Showtitle = appSettings[client]?.showtitle;
  // console.log("showtitle",Showtitle);

  // Other states
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([]);
  
  // Debug: Monitor products state changes
  useEffect(() => {
    if (products.length > 0) {
      }
  }, [products]);
  
  const [quantities, setQuantities] = useState({});
  const [wishListed, setWishListed] = useState({});
  const [pageIndex, setPageIndex] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [topCategoriesLoaded, setTopCategoriesLoaded] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productOptions, setProductOptions] = useState([]);

  const isMounted = useRef(true);
  const searchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);    
  const requestInProgress = useRef(false);
  const lastCallTime = useRef(0);
  const backgroundColor = appSettings[client]?.backgroundColor;
  const conditionalHeaderProps = appSettings[client]?.conditionalHeaderProps;

  // Handle component mount/unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
        isMounted.current = false;
      abortControllerRef.current?.abort();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Debounce search query for better performance
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 150); // 150ms debounce for instant search

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Log route params for debugging

  useEffect(() => {
    const clientStyle = getStyles(client);
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, [client]);

 useEffect(() => {
  navigation.setOptions({
    header: ({ options, route }) =>
      conditionalHeaderProps ? (
        <CustomHeader
          title={title}
          leftComponent={<CommonHeaderLeft type="back" />}
          elevation={0}
          borderBottomLeftRadius={0}
          borderBottomRightRadius={0}
          backgroundColor={backgroundColor}
          showCustomIcons={true}
          hideicon={true}
          color="#FFFFFF"
        />
      ) : (
        <CustomHeader
          title={title}
          leftComponent={
            <CommonHeaderLeft
              type={route?.params?.showBackButton ? "back" : undefined}
            />
          }
          rightComponent={
            <CommonHeaderRight
              type={client === "benchmarkfoods" ? ["search", "Cart"] : "Cart"}
              handleSearch={() => navigation.navigate("Search")}
            />
          }
        />
      ),
  });
}, [title]);
  // Handle filter changes separately
  useEffect(() => {
    if (route.params?.filterApplied && initialLoadComplete) {
      resetAndFetch();
    }
  }, [route.params?.filterApplied]);

  // Fetch wishlist only when products actually change
  useFocusEffect(
    useCallback(() => {
      if (products.length > 0) {
        fetchWishlist();
      }
    }, [products.length])
  );

  const fetchProducts = useCallback(
    async (page) => {
      if (!isMounted.current || requestInProgress.current) return;

      requestInProgress.current = true;

      // Show loading indicators appropriately
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      setError(null);
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await ProductService.getProducts(
          page,
          PAGE_SIZE,
          searchText,
          searchVal,
          searchBy,
          sortBy,
          isCategory,
          pageType
        );
        
    
        if (!isMounted.current) return;

        let allCatalogs = [];

        // Load categories only once on first page
        if (
          page === 1 &&
          response.data?.FacetsDetails &&
          response.data.FacetsDetails.length > 0 &&
          !topCategoriesLoaded
        ) {
          const categoryData = response.data.FacetsDetails[0].FaceItems.map(
            (facet) => ({
              key: facet.key,
              image: facet.ItemImage,
              value: facet.value,
            })
          );
          setCategory(categoryData);
          setTopCategoriesLoaded(true);
        }

        // Extract products from various response formats
        if (response.data?.Products) {
          allCatalogs = response.data.Products;
              } else if (response.data?.CatalogGroups) {
          allCatalogs = response.data.CatalogGroups.flatMap(
            (group) => group.Catalogs || []
          );
              } else if (Array.isArray(response.data)) {
          allCatalogs = response.data;
        }

        // Update products list (optimized for performance)
        setProducts((prev) => {
          if (page === 1) {
            return allCatalogs;
          }
          // Avoid duplicates using Set for O(n) performance
          const existingIds = new Set(prev.map((p) => p.SKUID));
          const newItems = allCatalogs.filter((p) => !existingIds.has(p.SKUID));
          return [...prev, ...newItems];
        });

        // Continue fetching until we receive zero products
        const hasResults = allCatalogs.length > 0;
        const isFullPage = allCatalogs.length >= PAGE_SIZE;
        setHasMore(hasResults && isFullPage && page < MAX_PAGES);

        if (page === 1) {
          setInitialLoadComplete(true);
        }
      } catch (error) {
        if (error.name !== "AbortError" && isMounted.current) {
          setError(error.message || "Failed to load products");
          setHasMore(false);
        }
      } finally {
        if (isMounted.current) {
          requestInProgress.current = false;
          setIsLoading(false);
          setIsLoadingMore(false);
          setIsRefreshing(false);
          abortControllerRef.current = null;
        }
      }
    },
    [
      searchText,
      searchVal,
      searchBy,
      sortBy,
      isCategory,
      pageType,
      topCategoriesLoaded,
    ]
  );

  const resetAndFetch = useCallback(() => {
    setProducts([]);
    setWishListed({});
    setQuantities({});
    setHasMore(true);
    setPageIndex(1);
    setError(null);
    setInitialLoadComplete(false);
    fetchProducts(1);
  }, [fetchProducts]);

  const fetchWishlist = useCallback(async () => {
    try {
      const wishlistResponse = getSaveForLater();
      const wishlistedSkus = wishlistResponse.data.map((item) => item.SKUID);

      const wishlistMap = {};
      products.forEach((product) => {
        wishlistMap[product.SKUID] = wishlistedSkus.includes(product.SKUID);
      });
      setWishListed(wishlistMap);
    } catch (error) {
      console.error("Wishlist fetch error:", error);
    }
  }, [products]);

  const handleLoadMore = useCallback(() => {
    
    // Don't load more if initial load hasn't completed yet
    if (!initialLoadComplete) {
      return;
    }
    
    // Don't load more if there are no products yet
    if (products.length === 0) {
      return;
    }
    
    if (
      isLoading ||
      !hasMore ||
      error ||
      requestInProgress.current ||
      pageIndex >= MAX_PAGES
    ) {
      return;
    }

    // Throttle to prevent multiple rapid calls
    const now = Date.now();
    if (now - lastCallTime.current > 300) {
      lastCallTime.current = now;
      const nextPage = pageIndex + 1;
        setPageIndex(nextPage);
      fetchProducts(nextPage);
    }
  }, [isLoading, hasMore, error, pageIndex, products.length, initialLoadComplete, fetchProducts]);

  // Optimized getItemLayout for better scroll performance (2-column grid)
  const getItemLayout = useCallback(
    (data, index) => ({
      length: 280, // Approximate item height
      offset: 280 * Math.floor(index / 2),
      index,
    }),
    []
  );

 const handleAddToCart = useCallback(
  async (productId, currency, product) => {
    // Mock options for meat/fish products (until API provides actual options)
    // Check if product name contains meat/fish keywords
    const productName = product?.ProductName?.toLowerCase() || '';
    const isMeatOrFish = productName.includes('fish') || 
                         productName.includes('meat') || 
                         productName.includes('chicken') ||
                         productName.includes('mutton') ||
                         productName.includes('beef') ||
                         productName.includes('lamb') ||
                         productName.includes('prawn') ||
                         productName.includes('salmon') ||
                         productName.includes('tuna') ||
                         productName.includes('mackerel');
    
    // Check if product has options (from API) OR is meat/fish item
    const hasOptions = (product?.ProductOptions && product.ProductOptions.length > 0) || isMeatOrFish;
    
    if (hasOptions) {
      // Use API options if available, otherwise use mock options
      const options = product?.ProductOptions || [
        { id: 'whole_cleaned', name: 'WHOLE CLEANED' },
        { id: 'whole_uncleaned', name: 'WHOLE UNCLEANED' },
        { id: 'curry_cut', name: 'CURRY CUT' },
        { id: 'fry_cut', name: 'FRY CUT' },
      ];
      
      // Show option selection modal
      setSelectedProduct({ ...product, productId, currency });
      setProductOptions(options);
      setShowOptionModal(true);
      return;
    }

    // Regular add to cart flow (no options)
    const oldQuantity = quantities[productId] || 0;
    const newQuantity = oldQuantity + 1;

      // Optimistic UI update
      setQuantities((prev) => ({
        ...prev,
        [productId]: newQuantity,
      }));

      const payload = {
        CartItemNote: "",
        Currency: currency,
        MaximumQuantityInCart: 1,
        ProductOptionID: "",
        Quantity: 1, // Adding 1 item
        SKUID: productId,
      };

    try {
      const response = await CartService.updateCart(payload);
      
      // ✅ Check the operation result
      if (response?.data?.operationResult === 1) {
        // Success
        await updateCart();
        Toast.show({
          type: "success",
          text1: t("product_added_to_cart"),
          text2: t("go_to_cart_for_checkout"),
          position: "top",
          visibilityTime: 1500,
        });
      } else if (response?.data?.operationResult === 2) {
        // ❌ Quantity not available - revert UI
        setQuantities((prev) => ({
          ...prev,
          [productId]: oldQuantity,
        }));
        
        Toast.show({
          type: "error",
          text1: response?.data?.Message || t("the_requested_quantity_is_not_available_for_this_product"),
          position: "top",
          visibilityTime: 3000,
        });
      } else {
        // Other errors - revert UI
        throw new Error(response?.data?.Message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to Cart error:", error);
      
      // Revert quantity on error
      setQuantities((prev) => ({
        ...prev,
        [productId]: oldQuantity,
      }));
      
      Toast.show({
        type: "error",
        text1: t("failed_to_add_to_cart"),
        text2: error.message,
        position: "top",
        visibilityTime: 3000,
      });
    }
  },
  [callContext, updateCart, t, quantities]
);

  // Handle adding product with selected option
  const handleAddWithOption = useCallback(
    async (selectedOption) => {
      if (!selectedProduct) return;

      const { productId, currency } = selectedProduct;
      const oldQuantity = quantities[productId] || 0;
      const newQuantity = oldQuantity + 1;

      // Optimistic UI update
      setQuantities((prev) => ({
        ...prev,
        [productId]: newQuantity,
      }));

      const payload = {
        CartItemNote: "",
        Currency: currency,
        MaximumQuantityInCart: 1,
        ProductOptionID: parseInt(selectedOption.id, 10) || 0,
        Quantity: 1,
        SKUID: productId,
      };

      try {
        const response = await CartService.updateCart(payload);
        
        if (response?.data?.operationResult === 1) {
          await updateCart();
          Toast.show({
            type: "success",
            text1: t("product_added_to_cart"),
            text2: `${selectedOption.name} - ${t("go_to_cart_for_checkout")}`,
            position: "top",
            visibilityTime: 2000,
          });
        } else if (response?.data?.operationResult === 2) {
          setQuantities((prev) => ({
            ...prev,
            [productId]: oldQuantity,
          }));
          
          Toast.show({
            type: "error",
            text1: response?.data?.Message || t("the_requested_quantity_is_not_available_for_this_product"),
            position: "top",
            visibilityTime: 3000,
          });
        } else {
          throw new Error(response?.data?.Message || "Failed to add to cart");
        }
      } catch (error) {
        setQuantities((prev) => ({
          ...prev,
          [productId]: oldQuantity,
        }));
        
        Toast.show({
          type: "error",
          text1: t("failed_to_add_to_cart"),
          text2: error.message,
          position: "top",
          visibilityTime: 3000,
        });
      }
    },
    [selectedProduct, quantities, updateCart, t]
  );

  // --- NEW FUNCTION ADDED HERE ---
  const updateCartOnServer = useCallback(
    async (product) => {
      const payload = {
        SKUID: product.SKUID,
        Quantity: product.Quantity,
      };
      try {
        const response = await CartService.updateCart(payload);


        // Fixed the conditional logic - removed the extra curly brace
        if (response?.data?.operationResult === 1) {
          const message =
            response?.data?.Message || t("cart_updated_successfully");
          return { success: true, message: t("cart_updated_successfully") };
        }
        if (response?.data?.operationResult === 2) {
          // console.log("operationResult failed", response?.data?.operationResult);
          // const message =
          //   response?.data?.Message || t("cart_updated_successfully");
          if (response?.data?.Message) {
            return {
              success: false,
              message: t(
                "the_requested_quantity_is_not_available_for_this_product"
              ),
            };
          } else {
            return { success: true, message: t("cart_updated_successfully") };
          }
        }
      } catch (error) {
        // console.error("Error updating cart on server:", error);
        return { success: false, message: t("network_or_server_error") };
      }
    },
    [t]
  ); // Dependency 't' is required

  // --- HANDLEQUANTITYCHANGE MODIFIED HERE ---
  const handleQuantityChange = useCallback(
    async (productId, newQuantity, currency) => {
      const oldQuantity = quantities[productId] || 0;
      if (oldQuantity === newQuantity) return;

      // Optimistic UI update
      setQuantities((prev) => ({
        ...prev,
        [productId]: newQuantity,
      }));

      // Create payload for the new function
      const productPayload = {
        SKUID: productId,
        Quantity: newQuantity, // Send the total new quantity
      };

      // Call your new function
      const result = await updateCartOnServer(productPayload);

      if (result.success) {
        // On success, update the cart context
        await updateCart();
        Toast.show({
          type: "success",
          text1: result.message,
          position: "top",
          visibilityTime: 1500,
        });
      } else {
        // On failure, revert the UI state
        // console.error("Failed to update cart:", result.message);
        setQuantities((prev) => ({
          ...prev,
          [productId]: oldQuantity, // Revert to old quantity
        }));
        Toast.show({
          type: "error",
          text1: result.message || t("update_failed"), // Using text1 for main message
          position: "top",
          visibilityTime: 3000,
        });
      }
    },
    [quantities, updateCartOnServer, updateCart, t] // Updated dependencies
  );

  const toggleWishList = useCallback(
    async (productId) => {
      try {
        if (!productId) return;
        const isWishlisted = wishListed[productId];

        setWishListed((prev) => ({
          ...prev,
          [productId]: !isWishlisted,
        }));

        if (isWishlisted) {
          await removeFromSaveForLater(productId);
          Toast.show({
            type: "success",
            text1: t("removed_from_wishlist"),
            position: "top",
            visibilityTime: 3000,
          });
        } else {
          await addToSaveForLater(productId);
          Toast.show({
            type: "success",
            text1: t("added_to_wishlist"),
            text2: t("go_to_your_wishlist"),
            position: "top",
            visibilityTime: 3000,
          });
        }
      } catch (error) {
        console.error("Wishlist toggle error:", error);
        // Revert on error
        setWishListed((prev) => ({
          ...prev,
          [productId]: !prev[productId],
        }));
      }
    },
    [wishListed, t]
  );

  const handleSearchChange = useCallback((text) => {
    setSearchQuery(text);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
  }, []);

  const handleCategoryPress = useCallback((item) => {
    // Clear search when category is pressed
    setSearchQuery("");
    setDebouncedSearchQuery("");
    
    // item.value is the CategoryIID (number), item.key is the category name (string)
    const newSearchVal = `Category:${item.value}`; // Use item.value (CategoryIID)
    
    // Prevent duplicate calls - if searchVal is already set to this category AND products are loaded
    const isAlreadyShowingThisCategory = searchVal === newSearchVal;
    
    if (isAlreadyShowingThisCategory && products.length > 0) {
      return;
    }
    
    // Also check if selected category matches and we're trying to click it again
    if (selectedCategory === item.value && products.length > 0) {
      return;
    }
    
    // Batch all state updates together using React 18's automatic batching
    setSelectedCategory(item.value);
    setTitle(item.key); // item.key is the category name
    setSearchText("");
    setSearchBy("");
    setSortBy("relevance");
    setIsCategory(true); // Keep isCategory true for subcategory filtering
    setPageType("");
    setProducts([]);
    setWishListed({});
    setQuantities({});
    setHasMore(true);
    setError(null);
    setTopCategoriesLoaded(true); // Keep categories loaded
    setSearchVal(newSearchVal);
    setPageIndex(1);
    setInitialLoadComplete(false);
    
  }, [selectedCategory, searchVal, products.length]);

  // Initial load on component mount
  useEffect(() => {
    fetchProducts(1);
  }, []); // Only runs once on mount

  // Trigger fetch when search parameters change from category filter
  useEffect(() => {
    // Only trigger if we explicitly set initialLoadComplete to false AND pageIndex is exactly 1
    // This prevents initial load from triggering here
    if (!initialLoadComplete && searchVal && pageIndex === 1) {
      // Immediate fetch without timeout for faster response
      fetchProducts(1);
    }
  }, [searchVal, initialLoadComplete, fetchProducts]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      // Reset and fetch with search query
      setProducts([]);
      setPageIndex(1);
      setHasMore(true);
      setError(null);
      setInitialLoadComplete(false);
      setSearchText(debouncedSearchQuery);
      setSearchBy("ProductName");
      fetchProducts(1);
    } else if (searchQuery === "" && debouncedSearchQuery === "") {
      // Reset to original category view when search is cleared
      setSearchText("");
      setSearchBy("");
      setProducts([]);
      setPageIndex(1);
      setHasMore(true);
      setInitialLoadComplete(false);
      fetchProducts(1);
    }
  }, [debouncedSearchQuery, fetchProducts]);

  const renderCategoryItem = useCallback(
    ({ item }) => {
      const isSelected = selectedCategory === item.value;
      const hasImage = item.image && item.image.trim() !== '';
      
      return (
        <TouchableOpacity
          onPress={() => handleCategoryPress(item)}
          activeOpacity={0.7}
          style={[
            styles.catListView,
            isSelected && styles.selectedCat,
            hasImage && styles.catListViewWithImage,
          ]}
        >
          {hasImage && (
            <Image
              source={{ uri: item.image }}
              style={styles.categoryImage}
              resizeMode="cover"
            />
          )}
          <Text
            style={[
              styles.catText,
              isSelected && styles.selectedCatText,
              hasImage && styles.catTextWithImage,
            ]}
            numberOfLines={1}
          >
            {item.key}
          </Text>
        </TouchableOpacity>
      );
    },
    [handleCategoryPress, selectedCategory, styles]
  );

  const renderProductItem = useCallback(
    ({ item }) => (
      <ProductItem
        item={item}
        quantities={quantities}
        onPress={handleAddToCart}
        onQuantityChange={handleQuantityChange}
        navigation={navigation}
        wishListed={wishListed}
        toggleWishList={toggleWishList}
        styles={styles}
      />
    ),
    [
      quantities,
      handleAddToCart,
      handleQuantityChange,
      wishListed,
      toggleWishList,
    ]
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={client === "benchmarkfoods" ? colors.primary : colors.green}
        />
        <Text style={styles.loadingText}>Loading more products...</Text>
      </View>
    );
  }, [isLoadingMore]);

  const renderEmpty = useCallback(() => {
    
    // Don't show empty state while loading initial data or during filter chip clicks
    if (isLoading || !initialLoadComplete) {
        return null;
    }

    const emptyMessage = searchQuery 
      ? `No results found for "${searchQuery}"`
      : "No products found";

    return (
      <View style={styles.emptyContainer}>
        <Image
          style={styles.noProductsImage}
          source={require("../../../assets/images/client/benchmarkfoods/noproduct.png")}
        />
        <Text style={styles.noProductsText}>{emptyMessage}</Text>
        {searchQuery && (
          <Text style={styles.emptySubText}>
            Try searching with different keywords
          </Text>
        )}
      </View>
    );
  }, [isLoading, initialLoadComplete, searchQuery, styles]);

  const renderError = useCallback(() => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={resetAndFetch}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }, [error, resetAndFetch]);

  if (client === "benchmarkfoods") {
    return (
      <LinearGradient
        colors={["#DEECFA", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <View style={styles.catListCommonView}>
            <TouchableOpacity onPress={() => navigation.navigate("Filter")}>
              <Image
                style={styles.filterIcon}
                source={require("../../../assets/images/client/benchmarkfoods/filter.png")}
              />
            </TouchableOpacity>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              contentContainerStyle={styles.flatList2}
              data={category}
              keyExtractor={(item, index) => `category-${item.key}-${index}`}
              renderItem={renderCategoryItem}
              initialNumToRender={8}
              maxToRenderPerBatch={4}
              windowSize={5}
            />
          </View>
          {renderError()}
          <FlatList
            numColumns={2}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatList}
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => `product-${item.SKUID}`}
            getItemLayout={getItemLayout}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={END_REACHED_THRESHOLD}
            refreshing={isRefreshing}
            onRefresh={resetAndFetch}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            windowSize={5}
            initialNumToRender={INITIAL_RENDER_COUNT}
            maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
            updateCellsBatchingPeriod={UPDATE_CELLS_BATCHING_PERIOD}
            removeClippedSubviews={true}
            legacyImplementation={false}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
          />
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <CustomSearchBar
        placeholder={t("search_products")}
        Filter={true}
        handleFilter={() => navigation.navigate("Filter")}
        onChangeText={handleSearchChange}
        value={searchQuery}
        onClear={handleSearchClear}
      />
      {searchQuery && searchQuery !== debouncedSearchQuery && (
        <View style={styles.searchingIndicator}>
          <Text style={styles.searchingText}>Searching...</Text>
        </View>
      )}
      {category && category.length > 0 && !searchQuery && (
        <View style={styles.catListCommonView}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            contentContainerStyle={styles.flatList2}
            data={category}
            keyExtractor={(item, index) => `category-${item.key}-${index}`}
            renderItem={renderCategoryItem}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={3}
            removeClippedSubviews={true}
          />
        </View>
      )}
      {renderError()}
      <FlatList
        numColumns={2}
        contentContainerStyle={styles.flatList}
        showsVerticalScrollIndicator={false}
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => `product-${item.SKUID}`}
        getItemLayout={getItemLayout}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={END_REACHED_THRESHOLD}
        refreshing={isRefreshing}
        onRefresh={resetAndFetch}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        windowSize={5}
        initialNumToRender={INITIAL_RENDER_COUNT}
        maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
        updateCellsBatchingPeriod={UPDATE_CELLS_BATCHING_PERIOD}
        removeClippedSubviews={true}
        legacyImplementation={false}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />
      
      <ProductOptionModal
        visible={showOptionModal}
        onClose={() => {
          setShowOptionModal(false);
          setSelectedProduct(null);
          setProductOptions([]);
        }}
        product={selectedProduct}
        options={productOptions}
        onAddToCart={handleAddWithOption}
      />
    </View>
  );
};

export default PaginationProductListing;

// Dynamic styles based on client
const getStyles = (clientName) => {
  const isAlmadina = clientName === "almadina";
  
  return StyleSheet.create({
    // Modern category filter chip styles (almadina only)
    selectedCat: isAlmadina ? {
      backgroundColor: "#E8F5E9", // Light green background for selected state
      borderRadius: 24, // Full rounded pill shape
      borderWidth: 2,
      borderColor: "#4CAF50", // Green border
      shadowColor: "#4CAF50",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 4,
      paddingHorizontal: wp("4.5%"),
      paddingVertical: hp("1.2%"),
      minHeight: hp("5%"),
      transform: [{ scale: 1.03 }], // Slightly larger when selected
    } : {
      backgroundColor: "#F4F9FF",
      borderRadius: 10,
      shadowColor: "#E4E4E4",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
      paddingHorizontal: wp("3.89%"),
    },
    selectedCatText: isAlmadina ? {
      color: "#2E7D32", // Dark green text for contrast
      fontSize: RFValue(13),
      fontWeight: "700",
      fontFamily: "Poppins-Bold",
      letterSpacing: 0.3,
    } : {
      color: "#525252",
      fontSize: RFValue(12),
      fontWeight: "600",
      fontFamily: "Poppins-SemiBold",
    },
    categoryImage: {
      width: wp("6%"),
      height: wp("6%"),
      borderRadius: wp("3%"),
      marginRight: wp("2%"),
      backgroundColor: "#F5F5F5",
    },
    catListViewWithImage: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: wp("3%"),
      paddingVertical: hp("0.8%"),
    },
    catTextWithImage: {
      marginLeft: 0,
    },
    gradient: {
      flex: 1,
      width: wp("100%"),
      height: hp("100%"),
      alignSelf: "center",
    },
    catListCommonView: isAlmadina ? {
      backgroundColor: "#FAFAFA", // Light background
      width: wp("100%"),
      minHeight: hp("8%"),
      paddingVertical: hp("1.5%"),
      paddingHorizontal: wp("2%"),
      marginTop: hp("0.5%"),
      marginBottom: hp("1%"),
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#F0F0F0",
    } : {
      backgroundColor: "#FFFFFF",
      width: wp("100%"),
      height: hp("6%"),
      marginTop: hp("0.875%"),
      marginBottom: hp("0.25%"),
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
      elevation: 3,
      shadowColor: "#A3A3A340",
    },
    filterIcon: {
      width: wp("9.72%"),
      height: hp("3.75%"),
      resizeMode: "contain",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: wp("4.44%"),
      marginRight: wp("1.39%"),
    },
    catListView: isAlmadina ? {
      backgroundColor: "#FFFFFF",
      minHeight: hp("5%"),
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: wp("4.5%"),
      paddingVertical: hp("1.2%"),
      marginRight: wp("2.5%"),
      borderRadius: 24, // Full rounded pill shape
      borderColor: "#E0E0E0",
      borderWidth: 1.5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
    } : {
      backgroundColor: "white",
      height: hp("3.75%"),
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: wp("3.89%"),
      marginRight: wp("1.39%"),
      borderRadius: 10,
      borderColor: "#E4E4E4",
      borderWidth: wp("0.28%"),
    },
    catText: isAlmadina ? {
      color: "#495057", // Neutral dark gray
      fontFamily: "Poppins-Medium",
      fontSize: RFValue(13),
      fontWeight: "600",
      letterSpacing: 0.2,
    } : {
      color: "#525252",
      fontFamily: "Poppins-Medium",
      fontSize: RFValue(12),
      fontWeight: "500",
    },
    container: {
      flex: 1,
      width: wp("100%"),
      alignItems: "flex-start",
      justifyContent: "flex-start",
      alignSelf: "center",
      alignItems: "center",
      borderRadius: 10,

    },
    flatList: {
      width: wp("91.11%"),
      alignItems: "flex-start",
      overflow: "hidden",
      paddingBottom: hp("20%"),
    },
    flatList2: isAlmadina ? {
      paddingHorizontal: wp("4%"),
      paddingVertical: hp("0.5%"),
      alignItems: "center",
    } : {
      height: hp("6%"),
      paddingRight: wp("4%"),
      alignItems: "center",
      alignSelf: "center",
    },
    searchingIndicator: {
      paddingVertical: hp("1%"),
      paddingHorizontal: wp("4%"),
      backgroundColor: "#F0F8FF",
      borderBottomWidth: 1,
      borderBottomColor: "#E0E0E0",
    },
    searchingText: {
      fontSize: RFValue(12),
      color: "#4A90E2",
      fontFamily: "Poppins-Medium",
      fontStyle: "italic",
    },
  widget: {
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    marginVertical: hp("1%"),
    marginHorizontal: wp("1%"),
    width: wp("44%"),
    borderRadius: 12,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "stretch",
    padding: wp("2%"),
    borderWidth: 1,
    borderColor: "#F0F0F0",
    // Height will be determined by content
  },
  imageTouchView: {
    width: "100%",
    aspectRatio: 1.33, // Makes it wider than tall (4:3 aspect ratio)
    maxHeight: wp("60%"), // Optional: prevent it from getting too tall on larger screens
    alignItems: "center",
    justifyContent: "center",
    padding: wp("2%"),
    backgroundColor: "transparent",
    borderRadius: 8,
    marginBottom: hp("1%"),
    position: "relative",
    overflow: "hidden",
  },
  wishListButton: {
    position: "absolute",
    top: -8,
    right: -6,
    padding: wp("2%"),
    zIndex: 2,
  },
  wishicon: {
    resizeMode: "contain",
    width: wp("6%"),
    height: wp("6%"),
  },
  images: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    position: "absolute",
  },
  imagePlaceholder: {
    height: 185,
    width: 180,
    backgroundColor: "#F4F9FF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  placeholderText: {
    color: "#666",
    fontSize: 14,
  },
  textView: {
    width: "100%",
    paddingHorizontal: wp("2.5%"),
    paddingVertical: hp("1%"),
    flex: 1,
    justifyContent: "space-between",
  },
  ProductNameView: {
    justifyContent: "center",
    marginBottom: hp("0.8%"),
  },
  ProductName: {
    textAlign: "left",
    fontSize: RFValue(13, 800),
    fontWeight: "500",
    color: "#1A202C",
    fontFamily: "Poppins-Medium",
    lineHeight: 20,
    minHeight: 40,
    maxHeight: 40,
    overflow: "hidden",
    letterSpacing: 0.2,
  },
  PriceCommonView: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("0.5%"),
    flexWrap: "wrap",
  },
  PriceView: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: hp("0.3%"),
  },
  AedText: {
    fontSize: RFValue(15, 800),
    fontWeight: "700",
    color: "#2D3748",
    fontFamily: "Poppins-Bold",
    marginRight: 2,
    lineHeight: 24,
  },
  ProductPrice: {
    color: "#2D3748",
    fontSize: RFValue(18, 800),
    fontWeight: "800",
    fontFamily: "Poppins-ExtraBold",
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  commonView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: "auto",
    paddingTop: hp("0.8%"),
    minHeight: 40,
  },
  oldPriceView: {
    marginRight: 8,
  },
  oldProductPrice: {
    fontSize: RFValue(12, 800),
    textDecorationLine: "line-through",
    color: "#ff0000",
    fontFamily: "Poppins-Medium",
    marginLeft: 4,
    opacity: 0.8,
  },
  quantitySection: {
    minWidth: 90,
    alignItems: "flex-end",
  },
  addButton: {
    width: 27,
    height: 27,
    resizeMode: "contain",
  },
  errorContainer: {
    padding: 10,
    alignItems: "center",
    width: "100%",
  },
  errorText: {
    color: "#FE5656",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 5,
  },
  retryButton: {
    padding: 8,
    backgroundColor: colors.primary,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
    paddingTop: hp("20%"),
  },
  noProductsImage: {
    width: wp("45.28%"),
    height: wp("45.28%"),
    resizeMode: "contain",
    alignItems: "center",
    justifyContent: "center",
  },
  noProductsText: {
    fontSize: RFValue(14),
    marginTop: hp("2%"),
    color: "#525252",
    fontWeight: "500",
    textAlign: "center",
    fontFamily: "Poppins-Medium",
  },
  emptySubText: {
    fontSize: RFValue(12),
    marginTop: hp('1%'),
    color: "#999999",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
  loadingContainer: {
    width: wp("100%"),
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#B4B4B4",
    fontSize: RFValue(14, 800),
  },
  quantityTouchable: {
    width: "100%",
    height: hp("5.5%"),
    marginTop: hp("1%"),
    borderRadius: 8,
    overflow: "hidden",
  },
  gradientButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    overflow: "hidden",
  },
  addToCartButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  addToCartText: {
    color: "white",
    fontSize: RFValue(14, 800),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  });
};
