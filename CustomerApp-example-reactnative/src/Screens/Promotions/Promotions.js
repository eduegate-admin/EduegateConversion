import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import CustomHeader from '../../component/CustomHeader';
import CommonHeaderLeft from '../../component/CommonHeaderLeft';
import CommonHeaderRight from '../../component/CommonHeaderRight';
import appSettings from '../../../Client/appSettings';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import ProductService from '../../services/productService';
import CartService from '../../services/cartService';
import { useCart } from '../../AppContext/CartContext';
import Toast from 'react-native-toast-message';
import QuantitySelector from '../../component/QuantitySelector/Quantity';
import colors from '../../config/colors';

const { width } = Dimensions.get('window');
const client = process.env.CLIENT;

const PAGE_SIZE = 12;
const PROMO_SEARCH_VAL = 'skutags:PROMOTIONS';  // searchVal param
const PROMO_SEARCH_BY = 'skutags';
const PROMO_PAGE_TYPE = 'Recommended';

const Promotions = ({ route }) => {
  const { promotions = [] } = route?.params || {};
  const scrollRef = useRef(null);
  const timerRef = useRef(null);
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { updateCart } = useCart();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [products, setProducts] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [errorProducts, setErrorProducts] = useState(null);

  const auto = true;
  const interval = 6000;
  const conditionalHeaderProps = appSettings[client]?.conditionalHeaderProps;

  useEffect(() => {
    navigation.setOptions({
      header: () =>
        conditionalHeaderProps ? (
          <CustomHeader
            title={t('promotions')}
            leftComponent={<CommonHeaderLeft type="back" />}
            elevation={0}
            borderBottomLeftRadius={0}
            borderBottomRightRadius={0}
            backgroundColor="#12a14f"
            showCustomIcons={true}
            hideicon={true}
            color="#FFFFFF"
          />
        ) : (
          <CustomHeader
            title={t('promotions')}
            leftComponent={<CommonHeaderLeft type="back" />}
            rightComponent={<CommonHeaderRight type={['Cart']} />}
          />
        ),
      title: t('promotions'),
    });
  }, [navigation, t, conditionalHeaderProps]);

  useEffect(() => {
    // If auto slide disabled or only 1 promotion → stop
    if (!auto || promotions.length <= 1) {
      clearInterval(timerRef.current);
      return;
    }

    // Create autoplay timer
    timerRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const next = (prevIndex + 1) % promotions.length;
        scrollRef.current?.scrollTo({
          x: next * width,
          animated: true
        });
        return next;
      });
    }, interval);

    return () => clearInterval(timerRef.current);
  }, [auto, promotions.length, interval]);

  const onScroll = (e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const openModal = (promo) => {
    setModalImage(promo.PromotionFile);
    setModalVisible(true);
  };

  const handlePromotionPress = (promo) => {
    navigation.navigate('PaginationProductListing', {
      from: 'Promotions',
      title: promo?.Title || t('promotions'),
    });
  };

  const normalizeProduct = (p) => {
    // console.log('[Promotions] normalizeProduct raw:', JSON.stringify(p, null, 2));
    
    const normalized = {
      SKUID: p.SKUID || p.ProductID || p.SKU || p.id,
      ProductName: p.ProductName || p.Name || '',
      ProductPrice: Number(p.ProductPrice ?? 0),
      ProductDiscountPrice: Number(p.ProductDiscountPrice ?? p.ProductPrice ?? 0),
      CurrencyCode: p.CurrencyCode || 'AED',
      ProductListingImage: p.ProductListingImage || p.ProductImage || null,
      raw: p,
    };
    
    // console.log('[Promotions] normalized:', normalized);
    return normalized;
  };

  const isDiscountedItem = (item) => {
    const vp = Number(item.raw?.ProductVariantPrice ?? NaN);
    const vdp = Number(item.raw?.ProductVariantDiscountPrice ?? NaN);
    if (!Number.isNaN(vp) && !Number.isNaN(vdp)) return vdp < vp;

    return item.ProductDiscountPrice < item.ProductPrice;
  };

  const fetchProducts = async (page = 1) => {
    if (loadingProducts || (page > 1 && !hasMore)) return;
    setLoadingProducts(true);
    setErrorProducts(null);

    try {
      const res = await ProductService.getProducts(
        page,                 // pageIndex
        PAGE_SIZE,            // pageSize
        '',                   // searchText (empty)
        PROMO_SEARCH_VAL,     // searchVal -> 'skutags:PROMOTIONS'
        PROMO_SEARCH_BY,      // searchBy  -> 'skutags'
        'relevance',          // sortBy
        false,                // isCategory
        PROMO_PAGE_TYPE       // pageType -> 'Recommended'
      );

      // console.log('[Promotions] Full API response:', JSON.stringify(res?.data, null, 2));

      // Extract products from CatalogGroups structure
      let items = [];
      const catalogGroups = res?.data?.CatalogGroups || [];
      // console.log('[Promotions] CatalogGroups count:', catalogGroups.length);
      
      for (const group of catalogGroups) {
        const catalogs = group.Catalogs || [];
        // console.log('[Promotions] Group has', catalogs.length, 'catalogs');
        items = items.concat(catalogs);
      }

      // console.log('[Promotions] page=', page, 'raw items=', items.length);

      const normalized = items
        .map(normalizeProduct)
        .filter(p => p.SKUID); // Only keep items with valid SKUID

      // console.log('[Promotions] page=', page, 'normalized items=', normalized.length);
      // console.log('[Promotions] normalized products:', normalized);

      setProducts(prev => {
        if (page === 1) return normalized;
        const seen = new Set(prev.map(p => p.SKUID));
        const merged = [...prev];
        for (const p of normalized) {
          if (!seen.has(p.SKUID)) {
            merged.push(p);
            seen.add(p.SKUID);
          }
        }
        return merged;
      });

      setHasMore(normalized.length >= PAGE_SIZE);
      setPageIndex(page);
    } catch (e) {
      // console.log('[Promotions] error', e);
      setErrorProducts(e?.message || 'Failed to load products');
      if (page !== 1) setHasMore(false);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (products.length === 0) {
        fetchProducts(1);
      }
    }, [products.length])
  );

  const loadMore = () => {
    if (!loadingProducts && hasMore) {
      fetchProducts(pageIndex + 1);
    }
  };

  const resetProducts = () => {
    setProducts([]);
    setPageIndex(1);
    setHasMore(true);
    fetchProducts(1);
  };

  const handleAddToCart = useCallback(
    async (productId, currency) => {
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
    [updateCart, t, quantities]
  );

  const updateCartOnServer = useCallback(
    async (product) => {
      const payload = {
        SKUID: product.SKUID,
        Quantity: product.Quantity,
      };
      try {
        const response = await CartService.updateCart(payload);

        if (response?.data?.operationResult === 1) {
          return { success: true, message: t("cart_updated_successfully") };
        }
        if (response?.data?.operationResult === 2) {
          if (response?.data?.Message) {
            return { success: false, message: t("the_requested_quantity_is_not_available_for_this_product") };
          } else {
            return { success: true, message: t("cart_updated_successfully") };
          }
        }
      } catch (error) {
        return { success: false, message: t("network_or_server_error") };
      }
    },
    [t]
  );

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
        if (newQuantity > 0) {
          Toast.show({
            type: "success",
            text1: result.message,
            position: "top",
            visibilityTime: 1500,
          });
        }
      } else {
        // On failure, revert the UI state
        setQuantities((prev) => ({
          ...prev,
          [productId]: oldQuantity, // Revert to old quantity
        }));
        Toast.show({
          type: "error",
          text1: result.message || t("update_failed"),
          position: "top",
          visibilityTime: 3000,
        });
      }
    },
    [quantities, updateCartOnServer, updateCart, t]
  );

  const renderProduct = ({ item }) => {
    // console.log("item", item);
    const quantity = quantities[item.SKUID] || 0;
    
    return (
      <View style={styles.widget}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProductDetails', { item })}
          style={styles.imageTouchView}
        >
          {item.ProductListingImage ? (
            <Image source={{ uri: item.ProductListingImage }} style={styles.images} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.textView}>
          <View style={styles.ProductNameView}>
            <Text style={styles.ProductName} numberOfLines={2}>
              {item.ProductName}
            </Text>
          </View>
          {item.ProductDiscountPrice < item.ProductPrice ? (
            <View style={styles.PriceView}>
              <Text style={styles.ProductPrice}>
                {item.CurrencyCode} {item.ProductDiscountPrice?.toFixed(2) || "0.00"}
              </Text>
              <Text style={styles.oldProductPrice}>
                {item.CurrencyCode} {item.ProductPrice?.toFixed(2) || "0.00"}
              </Text>
            </View>
          ) : (
            <View style={styles.PriceView}>
              <Text style={styles.ProductPrice}>
                {item.CurrencyCode} {item.ProductPrice?.toFixed(2) || "0.00"}
              </Text>
            </View>
          )}
          <View style={styles.commonView}>
            <View style={styles.quantitySection}>
              <QuantitySelector
                onPress={() => handleAddToCart(item.SKUID, item.CurrencyCode)}
                quantity={quantity}
                setQuantity={(q) => handleQuantityChange(item.SKUID, q, item.CurrencyCode)}
                minValue={0}
                maxValue={10}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingProducts || pageIndex === 1) return null;

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading more products...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loadingProducts && pageIndex === 1) return null;

    return (
      <View style={styles.emptyContainer}>
        <Image
          style={styles.noProductsImage}
          source={require('../../assets/images/client/benchmarkfoods/noproduct.png')}
        />
        <Text style={styles.noProductsText}>No products found</Text>
      </View>
    );
  };

  const renderError = () => {
    if (!errorProducts) return null;

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorProducts}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={resetProducts}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (client === "benchmarkfoods") {
    return (
      <LinearGradient
        colors={["#DEECFA", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.container}>
          {promotions && promotions.length > 0 && (
            <View style={styles.carouselContainer}>
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onScroll}
                style={styles.scroll}
              >
                {promotions.map((p, i) => (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={0.9}
                    onPress={() => handlePromotionPress(p)}
                    onLongPress={() => openModal(p)}
                  >
                    <Image source={{ uri: p.PromotionFile }} style={styles.image} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.pager}>
                {promotions.map((_, idx) => (
                  <View key={idx} style={[styles.dot, idx === currentIndex && styles.activeDot]} />
                ))}
              </View>
            </View>
          )}

          {renderError()}

          <FlatList
            data={products}
            keyExtractor={item => `promo-${item.SKUID}`}
            renderItem={renderProduct}
            numColumns={2}
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            windowSize={5}
            initialNumToRender={PAGE_SIZE}
            maxToRenderPerBatch={5}
            updateCellsBatchingPeriod={100}
            removeClippedSubviews={true}
          />

          <Modal visible={modalVisible} transparent={false} onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.closeArea} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>✕ {t('close')}</Text>
              </TouchableOpacity>
              {modalImage ? (
                <Image source={{ uri: modalImage }} style={styles.modalImage} resizeMode="contain" />
              ) : null}
            </View>
          </Modal>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {promotions && promotions.length > 0 && (
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScroll}
            style={styles.scroll}
          >
            {promotions.map((p, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.9}
                onPress={() => handlePromotionPress(p)}
                onLongPress={() => openModal(p)}
              >
                <Image source={{ uri: p.PromotionFile }} style={styles.image} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.pager}>
            {promotions.map((_, idx) => (
              <View key={idx} style={[styles.dot, idx === currentIndex && styles.activeDot]} />
            ))}
          </View>
        </View>
      )}

      {renderError()}

      <FlatList
        data={products}
        keyExtractor={item => `promo-${item.SKUID}`}
        renderItem={renderProduct}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        windowSize={5}
        initialNumToRender={PAGE_SIZE}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={100}
        removeClippedSubviews={true}
      />

      <Modal visible={modalVisible} transparent={false} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeArea} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeText}>✕ {t('close')}</Text>
          </TouchableOpacity>
          {modalImage ? (
            <Image source={{ uri: modalImage }} style={styles.modalImage} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: wp("100%"),
    height: hp("100%"),
    alignSelf: "center",
  },
  container: {
    flex: 1,
    width: wp("100%"),
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  carouselContainer: {
    position: 'relative',
    marginBottom: hp('2%'),
    width: wp('100%'),
  },
  scroll: {
    width,
    height: hp('30%'),
    backgroundColor: '#f5f5f5',
  },
  image: {
    width,
    height: hp('30%'),
  },
  pager: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: wp('2%'),
    height: wp('2%'),
    borderRadius: wp('1%'),
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: wp('1%'),
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: wp('2.5%'),
    height: wp('2.5%'),
    borderRadius: wp('1.25%'),
  },
  productsList: {
    width: wp('91.11%'),
    alignItems: 'flex-start',
    paddingBottom: hp('20%'),
  },
  widget: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginVertical: hp('1%'),
    marginHorizontal: wp('1%'),
    width: wp('44%'),
    borderRadius: 12,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'stretch',
    padding: wp('2%'),
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  imageTouchView: {
    width: '100%',
    aspectRatio: 1.33,
    maxHeight: wp('60%'),
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp('2%'),
    backgroundColor: 'transparent',
    borderRadius: 8,
    marginBottom: hp('1%'),
    position: 'relative',
    overflow: 'hidden',
  },
  images: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    position: 'absolute',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: "#F4F9FF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  placeholderText: {
    color: "#666",
    fontSize: RFValue(12),
  },
  textView: {
    width: '100%',
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('1%'),
    flex: 1,
    justifyContent: 'space-between',
  },
  ProductNameView: {
    justifyContent: "center",
    marginBottom: hp('0.8%'),
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
    overflow: 'hidden',
    letterSpacing: 0.2,
  },
  PriceView: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: hp('0.3%'),
  },
  ProductPrice: {
    color: "#2D3748",
    fontSize: RFValue(18, 800),
    fontWeight: "800",
    fontFamily: 'Poppins-ExtraBold',
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  oldProductPrice: {
    fontSize: RFValue(12, 800),
    textDecorationLine: "line-through",
    color: "#ff0000",
    fontFamily: 'Poppins-Medium',
    marginLeft: 4,
    opacity: 0.8,
  },
  commonView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 'auto',
    paddingTop: hp('0.8%'),
    minHeight: 40,
  },
  quantitySection: {
    minWidth: 90,
    alignItems: "flex-end",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '85%',
  },
  closeArea: {
    position: 'absolute',
    top: hp('5%'),
    right: wp('5%'),
    zIndex: 2,
    padding: wp('2%'),
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontFamily: 'Poppins-Medium',
  },
  errorContainer: {
    padding: 10,
    alignItems: "center",
    width: "100%",
  },
  errorText: {
    color: "#FE5656",
    fontSize: RFValue(14),
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
    fontSize: RFValue(12),
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
    width: wp('45.28%'),
    height: wp("45.28%"),
    resizeMode: "contain",
  },
  noProductsText: {
    fontSize: RFValue(14),
    marginTop: hp('2%'),
    color: "#525252",
    fontWeight: "500",
    textAlign: "center",
    fontFamily: "Poppins-Medium",
  },
  loadingContainer: {
    width: wp("100%"),
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center"
  },
  loadingText: {
    marginTop: 10,
    color: "#B4B4B4",
    fontSize: RFValue(14, 800),
  },
});

export default Promotions;