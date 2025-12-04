import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import {
  Image,
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

const client = process.env.CLIENT;
const PAGE_SIZE = 12;
const MAX_PAGES = 50;

// Memoized Product Item Component
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
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }, [item.SKUID]);

    const renderImage = () => {
      const normalizedUrl = (item.ProductListingImage || "")
        .replace(/\\\\/g, "/")
        .replace(/\\/g, "/")
        .trim();

      if (!normalizedUrl) {
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
            source={{ uri: normalizedUrl }}
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
          <Text numberOfLines={3} style={styles.ProductName}>
            {item.ProductName}
          </Text>
          <View style={styles.PriceCommonView}>
            <Text style={styles.AedText}>
              {item.CurrencyCode} {item.ProductPrice}
            </Text>
          </View>
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

    const renderDefaultContent = () => (
      <View style={styles.textView}>
        <View style={styles.ProductNameView}>
          <Text style={styles.ProductName} numberOfLines={2}>
            {item.ProductName}
          </Text>
        </View>
        <View style={styles.PriceView}>
          <Text style={styles.ProductPrice}>
            {item.CurrencyCode}{" "}
            {item.ProductDiscountPrice?.toFixed(2) || "0.00"}
          </Text>
        </View>
        <View style={styles.commonView}>
          <View style={styles.oldPriceView}>
            <Text style={styles.oldProductPrice}>
              {item.CurrencyCode} {item.ProductPrice?.toFixed(2) || "0.00"}
            </Text>
          </View>
          <View style={styles.quantitySection}>
            <QuantitySelector
              onPress={() => onPress(item.SKUID)}
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
  }
);

// Main Component
const PaginationProductWithBrand = ({ route }) => {
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

  const [brands, setBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsError, setBrandsError] = useState(null);
  const [brandQuery, setBrandQuery] = useState("");

  // Other states
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [wishListed, setWishListed] = useState({});
  const [pageIndex, setPageIndex] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [topCategoriesLoaded, setTopCategoriesLoaded] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const isMounted = useRef(true);
  const abortControllerRef = useRef(null);
  const requestInProgress = useRef(false);
  const lastCallTime = useRef(0);
  const [styles, setStyle] = useState(ClientStyles(client, "PaginationProductWithBrand"));

  // Brand list mode: show all brands first unless a BrandID filter is provided
  // Calculate from current searchVal state so it updates when params change
  const isBrandProductsView = Boolean(
    searchVal && String(searchVal).includes("BrandID:")
  );

  // Update state when route params change (for brand navigation)
  useEffect(() => {
    const newTitle = route.params?.title || "";
    const newSearchVal = route.params?.searchVal || "";
    const newSearchText = route.params?.searchText || "";
    const newSearchBy = route.params?.searchBy || "";
    const newSortBy = route.params?.sortBy || "";
    const newIsCategory = route.params?.isCategory ?? null;
    const newPageType = route.params?.pageType || "";

    // Only update if params actually changed
    if (
      newTitle !== title ||
      newSearchVal !== searchVal ||
      newSearchText !== searchText ||
      newSearchBy !== searchBy ||
      newSortBy !== sortBy ||
      newIsCategory !== isCategory ||
      newPageType !== pageType
    ) {
      setTitle(newTitle);
      setSearchVal(newSearchVal);
      setSearchText(newSearchText);
      setSearchBy(newSearchBy);
      setSortBy(newSortBy);
      setIsCategory(newIsCategory);
      setPageType(newPageType);
      
      // Reset and fetch products with new params
      setProducts([]);
      setWishListed({});
      setQuantities({});
      setHasMore(true);
      setPageIndex(1);
      setError(null);
      setInitialLoadComplete(false);
    }
  }, [
    route.params?.title,
    route.params?.searchVal,
    route.params?.searchText,
    route.params?.searchBy,
    route.params?.sortBy,
    route.params?.isCategory,
    route.params?.pageType,
  ]);



    useEffect(() => {
      const clientStyle = ClientStyles(client, "PaginationProductWithBrand");
      if (clientStyle) {
        setStyle(clientStyle);
      } else {
        console.error("Client settings not found");
      }
    }, [client]);
 

  useEffect(() => {
    navigation.setOptions({
      header: ({ options, route }) => (
        <CustomHeader
          title={
            isBrandProductsView
              ? title || options.title || route.name
              : "Shop By Brands"
          }
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={
            <CommonHeaderRight
              type={client === "benchmarkfoods" ? ["search", "Cart"] : "Cart"}
              handleSearch={() => navigation.navigate("Search")}
            />
          }
          backgroundColor="#0B9A3A"
          color="#FFFFFF"
        />
      ),
    });

    return () => {
      isMounted.current = false;
      abortControllerRef.current?.abort();
    };
  }, [title]);

  // Handle filter changes separately
  useEffect(() => {
   
    if (route.params?.filterApplied && initialLoadComplete) {
      resetAndFetch();
    }
  }, [route.params?.filterApplied]);

  // Fetch brands for brand list mode
  useEffect(() => {
    if (isBrandProductsView) return;
    let cancelled = false;
    const loadBrands = async () => {
      try {
        setBrandsLoading(true);
        setBrandsError(null);
        const res = await ProductService.getBrands();
        const list = Array.isArray(res.data) ? res.data : [];
        // Keep only brands with a valid name
        const valid = list.filter(
          (b) => b?.BrandName && String(b.BrandName).trim() !== ""
        );
        if (!cancelled) setBrands(valid);
      } catch (e) {
        if (!cancelled) setBrandsError(e?.message || "Failed to load brands");
      } finally {
        if (!cancelled) setBrandsLoading(false);
      }
    };
    loadBrands();
    return () => {
      cancelled = true;
    };
  }, [isBrandProductsView]);

  // Fetch products when switching to brand products view
  useEffect(() => {
    console.log("Brand products view effect:", { isBrandProductsView, searchVal, initialLoadComplete });
    if (isBrandProductsView && searchVal && !initialLoadComplete) {
      console.log("Triggering fetchProducts for brand view");
      fetchProducts(1);
    }
  }, [isBrandProductsView, searchVal]);

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

      // Only show loading for initial load or refresh
      if (page === 1) {
        setIsLoading(true);
      }

      setError(null);
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        console.log("Fetching products with params:", {
          page,
          PAGE_SIZE,
          searchText,
          searchVal,
          searchBy,
          sortBy,
          isCategory,
          pageType,
        });
        
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
        console.log("Product response:", response);
        if (response.data?.Products) {
          allCatalogs = response.data.Products;
        } else if (response.data?.CatalogGroups) {
          allCatalogs = response.data.CatalogGroups.flatMap(
            (group) => group.Catalogs || []
          );
        } else if (Array.isArray(response.data)) {
          allCatalogs = response.data;
        }
        console.log("Extracted products count:", allCatalogs.length);
        console.log("Products:", allCatalogs);

        // Update products list
        setProducts((prev) => {
          if (page === 1) {
            return allCatalogs;
          }
          // Avoid duplicates
          const existingIds = new Set(prev.map((p) => p.SKUID));
          const newItems = allCatalogs.filter((p) => !existingIds.has(p.SKUID));
          return [...prev, ...newItems];
        });

        // Determine if there are more pages
        const hasResults = allCatalogs.length > 0;
        const isFullPage = allCatalogs.length >= PAGE_SIZE;
        setHasMore(hasResults && isFullPage && page < MAX_PAGES);

        if (page === 1) {
          setInitialLoadComplete(true);
        }
      } catch (error) {
        if (error.name !== "AbortError" && isMounted.current) {
          console.error("Fetch error:", error);
          setError(error.message || "Failed to load products");
          setHasMore(false);
        }
      } finally {
        if (isMounted.current) {
          requestInProgress.current = false;
          setIsLoading(false);
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
    if (
      isLoading ||
      !hasMore ||
      error ||
      requestInProgress.current ||
      pageIndex >= MAX_PAGES
    ) {
      return;
    }

    const now = Date.now();
    if (now - lastCallTime.current > 500) {
      lastCallTime.current = now;
      const nextPage = pageIndex + 1;
      setPageIndex(nextPage);
      fetchProducts(nextPage);
    }
  }, [isLoading, hasMore, error, pageIndex, fetchProducts]);

  const handleAddToCart = useCallback(
    async (productId, currency) => {
      Toast.show({
        type: "success",
        text1: t("product_added_to_cart"),
        text2: t("go_to_cart_for_checkout"),
        position: "top",
        visibilityTime: 1500,
      });

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
        if (!response.status) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        await updateCart();
      } catch (error) {
        console.error("Add to Cart error:", error);
        setQuantities((prev) => ({
          ...prev,
          [productId]: Math.max((prev[productId] || 0) - 1, 0),
        }));
      }
    },
    [callContext, updateCart, t]
  );

  const handleQuantityChange = useCallback(
    async (productId, newQuantity, currency) => {
      const oldQuantity = quantities[productId] || 0;
      if (oldQuantity === newQuantity) return;

      setQuantities((prev) => ({
        ...prev,
        [productId]: newQuantity,
      }));

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
        if (!response.status) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        await updateCart();
      } catch (error) {
        console.error("Update cart error:", error);
        setQuantities((prev) => ({
          ...prev,
          [productId]: oldQuantity,
        }));
      }
    },
    [callContext, quantities, updateCart]
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

  const handleCategoryPress = useCallback((item) => {
    setSelectedCategory(item.key);
    setTitle(item.key);
    setSearchVal(`Category:${item.value}`);
    setSearchText("");
    setSearchBy("");
    setSortBy("relevance");
    setIsCategory(false);
    setPageType("");

    // Reset and fetch with new category
    setProducts([]);
    setPageIndex(1);
    setHasMore(true);
  }, []);

  // Trigger fetch when category changes
  useEffect(() => {
    if (selectedCategory && initialLoadComplete) {
      resetAndFetch();
    }
  }, [selectedCategory]);

  const renderCategoryItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        onPress={() => handleCategoryPress(item)}
        style={[
          styles.catListView,
          selectedCategory === item.key && styles.selectedCat,
        ]}
      >
        <Text
          style={[
            styles.catText,
            selectedCategory === item.key && styles.selectedCatText,
          ]}
        >
          {item.key}
        </Text>
      </TouchableOpacity>
    ),
    [handleCategoryPress, selectedCategory]
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
    if (!isLoading || pageIndex === 1) return null;

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={client === "benchmarkfoods" ? colors.primary : colors.green}
        />
        <Text style={styles.loadingText}>Loading more products...</Text>
      </View>
    );
  }, [isLoading, pageIndex]);

  const renderEmpty = useCallback(() => {
    if (isLoading && pageIndex === 1) return null;

    return (
      <View style={styles.emptyContainer}>
        <Image
          style={styles.noProductsImage}
          source={require("../../../assets/images/client/benchmarkfoods/noproduct.png")}
        />
        <Text style={styles.noProductsText}>No products found</Text>
      </View>
    );
  }, [isLoading, pageIndex]);

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

  // Initial load for products view only
  useEffect(() => {
    if (!initialLoadComplete && isBrandProductsView) {
      fetchProducts(1);
    }
  }, [isBrandProductsView]);

  // Navigate to brand products page
  const handleBrandPress = useCallback(
    (brand) => {
      const brandId = brand?.BrandIID || brand?.BrandID || brand?.BrandId;
      const brandName = brand?.BrandName || "Brand";
      console.log("Brand pressed:", { brand, brandId, brandName });
      if (!brandId) {
        console.log("No brandId found, returning");
        return;
      }
      const navParams = {
        pageIndex: 1,
        pageSize: PAGE_SIZE,
        title: brandName,
        searchText: "",
        searchVal: `BrandID:${brandId}`,
        searchBy: "",
        sortBy: "relevance",
        isCategory: false,
        pageType: "",
        filterApplied: true,
      };
      console.log("Navigating to ProductListing with params:", navParams);
      navigation.navigate("ProductListing", navParams);
    },
    [navigation]
  );

  // Memoized Brand Item Component with Image Error Handling
  const BrandItem = memo(({ item, onPress }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    
    const brandImgRaw =
      item?.BrandImage || item?.BrandLogo || item?.LogoURL || item?.ImageURL;
    const brandImg = typeof brandImgRaw === "string"
      ? brandImgRaw.replace(/\\\\/g, "/").replace(/\\/g, "/").trim()
      : null;
    
    const brandName = item?.BrandName || item?.Name || "Brand";
    const BrandStyles = ClientStyles(client, "BrandWidget");

    const handleImageLoad = () => {
      setImageLoading(false);
      setImageError(false);
    };

    const handleImageError = () => {
      setImageLoading(false);
      setImageError(true);
    };

    return (
      <TouchableOpacity
        style={BrandStyles.widget}
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <View style={BrandStyles.imageTouchView}>
          {brandImg && !imageError ? (
            <>
              {imageLoading && (
                <View style={[BrandStyles.images, { position: 'absolute', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              )}
              <Image
                source={{ uri: brandImg }}
                style={BrandStyles.images}
                onLoad={handleImageLoad}
                onError={handleImageError}
                resizeMode="contain"
              />
            </>
          ) : (
            <View style={[
              BrandStyles.images,
              {
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8f9fa",
              }
            ]}>
              <Text
                numberOfLines={2}
                style={{
                  fontSize: RFValue(9),
                  fontWeight: "600",
                  color: "#666",
                  textAlign: "center",
                  paddingHorizontal: 4,
                  fontFamily: "Poppins-SemiBold",
                }}
              >
                {brandName}
              </Text>
            </View>
          )}
        </View>
        <Text
          numberOfLines={2}
          style={{
            fontSize: RFValue(10),
            fontWeight: "500",
            color: "#333",
            textAlign: "center",
            marginTop: hp("0.5%"),
            paddingHorizontal: wp("1%"),
            fontFamily: "Poppins-Medium",
          }}
        >
          {brandName}
        </Text>
      </TouchableOpacity>
    );
  });

  const renderBrandItem = useCallback(
    ({ item }) => <BrandItem item={item} onPress={handleBrandPress} />,
    [handleBrandPress]
  );

  // Filter brands based on search query with validation
  const filteredBrands = React.useMemo(() => {
    // Filter out brands without valid names
    const validBrands = brands.filter(b => {
      const name = b?.BrandName || b?.Name || "";
      return name.trim().length > 0;
    });

    if (!brandQuery.trim()) return validBrands;
    
    const q = brandQuery.trim().toLowerCase();
    return validBrands.filter((b) => {
      const name = String(b?.BrandName || b?.Name || "").toLowerCase();
      return name.includes(q);
    });
  }, [brands, brandQuery]);

  // Brand List Mode (default view)
  if (!isBrandProductsView) {
    const BrandStyles = ClientStyles(client, "BrandWidget");
    return (
      <View style={BrandStyles.container}>
        <View style={{ paddingHorizontal: wp("2%"), marginBottom: hp("1%") }}>
          <CustomSearchBar
            placeholder="Search brands"
            Filter={false}
            onChangeText={(text) => setBrandQuery(text)}
            value={brandQuery}
          />
        </View>
        {brandsError ? (
          <View style={{ alignItems: "center", padding: 20 }}>
            <Text style={{ color: colors.red }}>{brandsError}</Text>
          </View>
        ) : null}
        {brandsLoading ? (
          <View style={{ alignItems: "center", padding: 20 }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            contentContainerStyle={{ paddingTop: hp("2%"), paddingBottom: hp("2%"), paddingHorizontal: wp("2%") }}
            columnWrapperStyle={{ justifyContent: "space-between", paddingVertical: hp("1.2%") }}
            numColumns={3}
            data={filteredBrands}
            keyExtractor={(b, i) => `brand-${b.BrandIID || b.BrandID || i}`}
            renderItem={renderBrandItem}
            showsVerticalScrollIndicator={false}
            initialNumToRender={12}
            maxToRenderPerBatch={6}
            windowSize={10}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={50}
            ListEmptyComponent={() => (
              <View style={{ alignItems: "center", padding: hp("4%") }}>
                <Text style={{ color: "#525252", fontSize: RFValue(13), fontFamily: "Poppins-Regular" }}>
                  {brandQuery ? "No brands match your search" : "No brands available"}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    );
  }

  if (client === "benchmarkfoods") {
    return (
      <LinearGradient
        colors={["#DEECFA", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.container}>
          {/* Search bar aligned like Brands screen */}
          <View style={{ paddingHorizontal: wp("2%"), marginTop: hp("1%") }}>
            <CustomSearchBar
              placeholder={t("search")}
              Filter={false}
              onChangeText={() => {}}
            />
          </View>
          <View style={styles.catListCommonView}>
            {/* Hide filter icon on selected brand products */}
            {!isBrandProductsView && (
              <TouchableOpacity onPress={() => navigation.navigate("Filter")}>
                <Image
                  style={styles.filterIcon}
                  source={require("../../../assets/images/client/benchmarkfoods/filter.png")}
                />
              </TouchableOpacity>
            )}
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              contentContainerStyle={styles.flatList2}
              data={category}
              keyExtractor={(item, index) => `category-${item.key}-${index}`}
              renderItem={renderCategoryItem}
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
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshing={isRefreshing}
            onRefresh={resetAndFetch}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            windowSize={5}
            initialNumToRender={PAGE_SIZE}
            maxToRenderPerBatch={5}
            updateCellsBatchingPeriod={100}
            removeClippedSubviews={true}
          />
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <CustomSearchBar
        placeholder={t("search")}
        Filter={isBrandProductsView ? false : true}
        {...(!isBrandProductsView
          ? { handleFilter: () => navigation.navigate("Filter") }
          : {})}
        onChangeText={() => {}}
      />
      {renderError()}
      <FlatList
        numColumns={2}
        contentContainerStyle={styles.flatList}
        showsVerticalScrollIndicator={false}
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => `product-${item.SKUID}`}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={isRefreshing}
        onRefresh={resetAndFetch}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        windowSize={5}
        initialNumToRender={PAGE_SIZE}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={100}
        removeClippedSubviews={true}
      />
    </View>
  );
};

// const styles = StyleSheet.create({
//   selectedCat: {
//     backgroundColor: "#F4F9FF",
//     borderRadius: 10,
//     shadowColor: "#E4E4E4",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 4,
//     elevation: 3,
//     paddingHorizontal: wp("3.89%"),
//   },
//   selectedCatText: {
//     color: "#525252",
//     fontSize: RFValue(12),
//     fontWeight: "600",
//     fontFamily: "Poppins-SemiBold",
//   },
//   gradient: {
//     flex: 1,
//     width: wp("100%"),
//     height: hp("100%"),
//     alignSelf: "center",
//   },
//   catListCommonView: {
//     backgroundColor: "#FFFFFF",
//     width: wp("100%"),
//     height: hp("6%"),
//     marginTop: hp("0.875%"),
//     marginBottom: hp("0.25%"),
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 10,
//     elevation: 3,
//     shadowColor: "#A3A3A340",
//   },
//   filterIcon: {
//     width: wp("9.72%"),
//     height: hp("3.75%"),
//     resizeMode: "contain",
//     alignItems: "center",
//     justifyContent: "center",
//     marginLeft: wp("4.44%"),
//     marginRight: wp("1.39%"),
//   },
//   catListView: {
//     backgroundColor: "white",
//     height: hp("3.75%"),
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: wp("3.89%"),
//     marginRight: wp("1.39%"),
//     borderRadius: 10,
//     borderColor: "#E4E4E4",
//     borderWidth: wp("0.28%"),
//   },
//   catText: {
//     color: "#525252",
//     fontFamily: "Poppins-Medium",
//     fontSize: RFValue(12),
//     fontWeight: "500",
//   },
//   container: {
//     flex: 1,
//     width: wp("100%"),
//     alignItems: "flex-start",
//     justifyContent: "flex-start",
//     alignSelf: "center",
//     alignItems: "center",
//     borderRadius: 10,
//   },
//   flatList: {
//     width: wp("91.11%"),
//     alignItems: "flex-start",
//     overflow: "hidden",
//     paddingBottom: hp("20%"),
//   },
//   flatList2: {
//     height: hp("6%"),
//     paddingRight: wp("4%"),
//     alignItems: "center",
//     alignSelf: "center",
//   },
//   widget: {
//     backgroundColor: "#FFFFFF",
//     // backgroundColor: "#da1010ff",
//     marginVertical: hp("1%"),
//     marginHorizontal: wp("1%"),
//     width: wp("44%"),
//     borderRadius: 12,
//     elevation: 4,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: wp('2%'),
//     borderWidth: 1,
//     borderColor: '#F0F0F0',
//   },
//   imageTouchView: {
//     width: '100%',
//     aspectRatio: 1.33, // Makes it wider than tall (4:3 aspect ratio)
//     maxHeight: wp('60%'), // Optional: prevent it from getting too tall on larger screens
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: wp('2%'),
//     backgroundColor: 'transparent',
//     borderRadius: 8,
//     marginBottom: hp('1%'),
//     position: 'relative',
//     overflow: 'hidden',
//   },
//   wishListButton: {
//     position: "absolute",
//     top: -8,
//     right: -6,
//     padding: wp('2%'),
//     zIndex: 2,
//   },
//   wishicon: {
//     resizeMode: "contain",
//     width: wp("6%"),
//     height: wp("6%"),
//   },
//   images: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'contain',
//     position: 'absolute',
//   },
//   imagePlaceholder: {
//     height: 185,
//     width: 180,
//     backgroundColor: "#F4F9FF",
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 15,
//   },
//   placeholderText: {
//     color: "#666",
//     fontSize: 14,
//   },
//   textView: {
//     width: '100%',
//     paddingHorizontal: wp('2%'),
//     marginBottom: hp('1%'),
//     flex: 1,
//     justifyContent: 'space-between',
//   },
//   ProductNameView: {
//     justifyContent: "center",
//   },
//   ProductName: {
//     textAlign: "left",
//     fontSize: RFValue(13, 800),
//     fontWeight: "500",
//     color: "#333333",
//     fontFamily: "Poppins-Medium",
//     marginBottom: hp('0.5%'),
//     lineHeight: 18,
//     height: 36,
//     overflow: 'hidden',
//   },
//   PriceCommonView: {
//     flexDirection: "row",
//     alignItems: "baseline",
//     alignSelf: "baseline",
//   },
//   PriceView: {
//     justifyContent: "center",
//   },
//   AedText: {
//     fontSize: RFValue(14, 800),
//     textAlign: "left",
//     fontWeight: "600",
//     color: "#525252",
//     fontFamily: "Poppins-SemiBold",
//   },
//   ProductPrice: {
//     textAlign: "left",
//     color: "#525252",
//     fontSize: RFValue(14, 800),
//     fontWeight: "600",
//   },
//   commonView: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     height: 30,
//   },
//   oldPriceView: {
//     flex: 1,
//   },
//   oldProductPrice: {
//     fontSize: RFValue(14, 800),
//     textDecorationLine: "line-through",
//     color: "#FE5656",
//   },
//   quantitySection: {
//     width: 80,
//     alignItems: "flex-end",
//   },
//   addButton: {
//     width: 27,
//     height: 27,
//     resizeMode: "contain",
//   },
//   errorContainer: {
//     padding: 10,
//     alignItems: "center",
//     width: "100%",
//   },
//   errorText: {
//     color: "#FE5656",
//     fontSize: 16,
//     textAlign: "center",
//     marginBottom: 5,
//   },
//   retryButton: {
//     padding: 8,
//     backgroundColor: colors.primary,
//     borderRadius: 5,
//     minWidth: 100,
//     alignItems: "center",
//   },
//   retryText: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   emptyContainer: {
//     justifyContent: "center",
//     alignItems: "center",
//     alignSelf: "center",
//     width: "100%",
//     paddingTop: hp("20%"),
//   },
//   noProductsImage: {
//     width: wp('45.28%'),
//     height: wp("45.28%"),
//     resizeMode: "contain",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   noProductsText: {
//     fontSize: RFValue(14),
//     marginTop: hp('2%'),
//     color: "#525252",
//     fontWeight: "500",
//     textAlign: "center",
//     fontFamily: "Poppins-Medium",
//     overflow: "hidden",
//   },
//   loadingContainer: {
//     width: wp("100%"),
//     paddingVertical: 20,
//     alignItems: "center",
//     justifyContent: "center",
//     alignSelf: "center"
//   },
//   loadingText: {
//     marginTop: 10,
//     color: "#B4B4B4",
//     fontSize: RFValue(14, 800),
//   },
//   quantityTouchable: {
//     width: '100%',
//     height: hp('5.5%'),
//     marginTop: hp('1%'),
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   gradientButton: {
//     width: "100%",
//     height: "100%",
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: 10,
//     overflow: "hidden",
//   },
//   addToCartButton: {
//     width: '100%',
//     height: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 8,
//     backgroundColor: colors.primary,
//   },
//   addToCartText: {
//     color: "white",
//     fontSize: RFValue(14, 800),
//     fontWeight: "600",
//     fontFamily: "Poppins-SemiBold",
//   },
// });

export default PaginationProductWithBrand;
