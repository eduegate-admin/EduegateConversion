import React from "react";
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { Skeleton } from "moti/skeleton";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const { width, height } = Dimensions.get("window");

// Shimmer effect animation
const useShimmerAnimation = () => {
  const shimmerValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerValue]);

  return shimmerValue;
};

// Basic skeleton box
const SkeletonBox = ({
  width: boxWidth = 100,
  height = 100,
  borderRadius = 8,
  style = {},
}) => {
  const shimmerValue = useShimmerAnimation();

  const opacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeletonBox,
        {
          width: boxWidth,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Widget skeleton wrapper
const WidgetSkeleton = ({ children, title = true, height = 200 }) => (
  <View style={[styles.widgetContainer, { height }]}>
    {title && (
      <SkeletonBox width={150} height={20} style={styles.widgetTitle} />
    )}
    <View style={styles.widgetContent}>{children}</View>
  </View>
);

// Product card skeleton
const ProductCardSkeleton = () => (
  <View style={styles.productCard}>
    <SkeletonBox width={120} height={120} style={styles.productImage} />
    <SkeletonBox width="90%" height={14} style={styles.productName} />
    <SkeletonBox width="60%" height={12} style={styles.productPrice} />
    <SkeletonBox width="70%" height={12} style={styles.productBrand} />
  </View>
);

// Category item skeleton
const CategoryItemSkeleton = () => (
  <View style={styles.categoryItem}>
    <SkeletonBox
      width={50}
      height={50}
      borderRadius={25}
      style={styles.categoryIcon}
    />
    <SkeletonBox width={40} height={10} style={styles.categoryLabel} />
  </View>
);

// Banner skeleton
const BannerItemSkeleton = ({ height = 160 }) => (
  <View style={styles.bannerItem}>
    <SkeletonBox width="100%" height={height} borderRadius={12} />
  </View>
);

// List item skeleton
const ListItemSkeleton = () => (
  <View style={styles.listItem}>
    <SkeletonBox width={60} height={60} style={styles.listIcon} />
    <View style={styles.listContent}>
      <SkeletonBox width="80%" height={14} style={styles.listTitle} />
      <SkeletonBox width="60%" height={12} style={styles.listSubtitle} />
    </View>
  </View>
);

// Grid layout skeleton
const GridSkeleton = ({ itemCount = 6, itemsPerRow = 2 }) => (
  <View style={styles.grid}>
    {Array.from({ length: itemCount }).map((_, index) => (
      <View
        key={index}
        style={[styles.gridItem, { width: (width - 48) / itemsPerRow }]}
      >
        <SkeletonBox width="100%" height={80} style={styles.gridImage} />
        <SkeletonBox width="80%" height={12} style={styles.gridLabel} />
      </View>
    ))}
  </View>
);

// Horizontal list skeleton
const HorizontalListSkeleton = ({ itemCount = 3, itemWidth = 120 }) => (
  <View style={styles.horizontalList}>
    {Array.from({ length: itemCount }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </View>
);

// Payment Methods Skeleton
const PaymentMethodsSkeleton = () => (
  <>
    <View style={styles.paymentHeader}>
      <Skeleton width={"70%"} height={30} radius={6} colorMode="light" />
    </View>
    <View style={styles.paymentList}>
      {[1, 2, 3].map((_, index) => (
        <View key={index} style={styles.paymentRow}>
          <Skeleton width={30} height={30} radius={8} colorMode="light" />
          <View style={styles.paymentTextCol}>
            <Skeleton width={"70%"} height={20} radius={6} colorMode="light" />
          </View>
          <Skeleton width={20} height={20} radius={10} colorMode="light" />
        </View>
      ))}
    </View>
  </>
);

// Header Skeleton
const HeaderSkeleton = () => (
  <View style={styles.headerSkeleton}>
    <View style={styles.headerContent}>
      <SkeletonBox width={120} height={24} style={styles.headerTitle} />
      <SkeletonBox width={60} height={20} style={styles.headerIcon} />
    </View>
    <View style={styles.searchBarSkeleton}>
      <SkeletonBox width="100%" height={40} />
    </View>
  </View>
);

// Home Screen Skeleton
const HomeSkeleton = () => (
  <ScrollView style={styles.homeContainer}>
    <HeaderSkeleton />
    <BannerItemSkeleton />
    <CategorySliderSkeleton />
    <ProductSliderSkeleton />
    <ProductSliderSkeleton />
  </ScrollView>
);

// Category Slider Skeleton
const CategorySliderSkeleton = () => (
  <View style={styles.categoryContainer}>
    <SkeletonBox width={150} height={20} style={styles.categoryTitle} />
    <View style={styles.categoryItems}>
      {[1, 2, 3, 4, 5].map((index) => (
        <View key={index} style={styles.categoryItemHome}>
          <SkeletonBox width={60} height={60} style={styles.categoryIcon} />
          <SkeletonBox width={50} height={12} style={styles.categoryLabel} />
        </View>
      ))}
    </View>
  </View>
);

// Product Slider Skeleton
const ProductSliderSkeleton = () => (
  <View style={styles.productSliderContainer}>
    <SkeletonBox width={180} height={20} style={styles.productSliderTitle} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.productSliderItems}>
        {[1, 2, 3, 4].map((index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </View>
    </ScrollView>
  </View>
);

// Cart Skeleton
const CartSkeleton = () => (
  <View style={styles.cartContainer}>
    {[1, 2, 3].map((index) => (
      <View key={index} style={styles.cartItem}>
        <SkeletonBox width={80} height={80} style={styles.cartImage} />
        <View style={styles.cartDetails}>
          <SkeletonBox width="80%" height={16} style={styles.cartTitle} />
          <SkeletonBox width="60%" height={14} style={styles.cartPrice} />
          <SkeletonBox width={100} height={32} style={styles.cartQuantity} />
        </View>
      </View>
    ))}
  </View>
);

// Order List Skeleton
const OrderListSkeleton = () => (
  <View style={styles.orderContainer}>
    {[1, 2, 3].map((index) => (
      <View key={index} style={styles.orderItem}>
        <View style={styles.orderHeader}>
          <SkeletonBox width="50%" height={16} />
          <SkeletonBox width="30%" height={14} />
        </View>
        <View style={styles.orderDetails}>
          <SkeletonBox width="70%" height={14} style={{ marginBottom: 8 }} />
          <SkeletonBox width="40%" height={12} />
        </View>
      </View>
    ))}
  </View>
);

// Navigation Skeleton
const NavigationSkeleton = () => (
  <View style={styles.navigationContainer}>
    {[1, 2, 3, 4, 5].map((index) => (
      <View key={index} style={styles.navItem}>
        <SkeletonBox width={24} height={24} style={styles.navIcon} />
        <SkeletonBox width={40} height={12} style={styles.navLabel} />
      </View>
    ))}
  </View>
);

// Search Skeleton
const SearchSkeleton = () => (
  <View style={styles.searchContainer}>
    <View style={styles.searchHeader}>
      <SkeletonBox width="100%" height={40} style={styles.searchBar} />
    </View>
    <GridSkeleton itemCount={8} itemsPerRow={2} />
  </View>
);

// Product Detail Skeleton
const ProductDetailSkeleton = () => (
  <View style={styles.contentView}>
    <SkeletonBox
      width={wp("20%")}
      height={hp("2%")}
      borderRadius={6}
      style={styles.skeletonItem}
    />

    {/* Product name skeleton */}
    <SkeletonBox
      width={wp("80%")}
      height={hp("4%")}
      borderRadius={8}
      style={styles.skeletonItem}
    />

    {/* Price row skeleton */}
    <View style={styles.priceRowSkeleton}>
      <SkeletonBox
        width={wp("25%")}
        height={hp("3%")}
        borderRadius={8}
        style={styles.skeletonItem}
      />
      <SkeletonBox
        width={wp("18%")}
        height={hp("2.5%")}
        borderRadius={8}
        style={[styles.skeletonItem, { marginLeft: wp("4%") }]}
      />
    </View>

    {/* Quantity row skeleton */}
    <View style={styles.quantityRowSkeleton}>
      <SkeletonBox
        width={wp("22%")}
        height={hp("2.5%")}
        borderRadius={6}
        style={styles.skeletonItem}
      />
      <SkeletonBox
        width={wp("35%")}
        height={hp("4.5%")}
        borderRadius={10}
        style={styles.skeletonItem}
      />
    </View>

    <View style={styles.actionButtonSkeleton}>
      <SkeletonBox width="100%" height={hp("7.25%")} borderRadius={12} />
    </View>

    <View style={styles.actionButtonSkeleton}>
      <SkeletonBox width="100%" height={hp("7.25%")} borderRadius={12} />
    </View>
  </View>
);

// Product Bottom Button Skeleton
const ProductBottomButtonSkeleton = () => (
  <View style={styles.ButtonCommonView}>
    {/* Left: total price placeholder */}
    <SkeletonBox
      width={wp("25%")}
      height={hp("3%")}
      borderRadius={6}
      style={styles.skeletonItem}
    />

    {/* Right: Add to Cart button placeholder */}
    <SkeletonBox
      width={wp("60%")}
      height={hp("5.5%")}
      borderRadius={12}
      style={styles.skeletonItem}
    />
  </View>
);

// Wishlist Item Skeleton
const WishlistItemSkeleton = () => (
  <View style={styles.wishlistItem}>
    {/* Product Image Skeleton */}
    <SkeletonBox
      width="100%"
      height={150}
      borderRadius={6}
      style={styles.wishlistImageSkeleton}
    />

    {/* Product Name Skeleton */}
    <SkeletonBox
      width="90%"
      height={40}
      borderRadius={4}
      style={styles.wishlistNameSkeleton}
    />

    {/* Price Skeleton */}
    <SkeletonBox
      width={60}
      height={20}
      borderRadius={4}
      style={styles.wishlistPriceSkeleton}
    />

    {/* Add Button Skeleton */}
    <SkeletonBox
      width="95%"
      height={35}
      borderRadius={8}
      style={styles.wishlistButtonSkeleton}
    />
  </View>
);

// Wishlist Grid Skeleton
const WishlistSkeleton = ({ itemCount = 6 }) => (
  <View style={styles.wishlistGrid}>
    {Array.from({ length: itemCount }).map((_, index) => (
      <WishlistItemSkeleton key={index} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeletonBox: {
    backgroundColor: "#e1e9ee",
  },
  widgetContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  widgetTitle: {
    marginBottom: 16,
  },
  widgetContent: {
    flex: 1,
  },

  // Product card styles
  productCard: {
    width: 130,
    marginRight: 12,
  },
  productImage: {
    marginBottom: 8,
  },
  productName: {
    marginBottom: 4,
  },
  productPrice: {
    marginBottom: 4,
  },
  productBrand: {},

  // Category styles
  categoryItem: {
    alignItems: "center",
    marginRight: 16,
  },
  categoryIcon: {
    marginBottom: 8,
  },
  categoryLabel: {},

  // Banner styles
  bannerItem: {
    marginHorizontal: 16,
    marginBottom: 16,
  },

  // List styles
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    marginBottom: 1,
  },
  listIcon: {
    marginRight: 12,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    marginBottom: 4,
  },
  listSubtitle: {},

  // Grid styles
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    marginBottom: 16,
  },
  gridImage: {
    marginBottom: 8,
  },
  gridLabel: {},

  // Horizontal list styles
  horizontalList: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },

  // Payment methods styles
  paymentHeader: {
    paddingHorizontal: wp(5),
    marginBottom: hp(1.5),
  },
  paymentList: {
    paddingHorizontal: wp(5),
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    marginBottom: hp(1),
  },
  paymentTextCol: {
    flex: 1,
    marginHorizontal: wp(3),
  },

  // Header styles
  headerSkeleton: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2),
  },
  headerTitle: {
    marginBottom: 0,
  },
  headerIcon: {
    marginBottom: 0,
  },
  searchBarSkeleton: {
    marginBottom: hp(1),
  },

  // Home screen styles
  homeContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  categoryContainer: {
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
  },
  categoryTitle: {
    marginBottom: hp(1.5),
  },
  categoryItems: {
    flexDirection: "row",
  },
  categoryItemHome: {
    alignItems: "center",
    marginRight: wp(4),
  },
  productSliderContainer: {
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
  },
  productSliderTitle: {
    marginBottom: hp(1.5),
  },
  productSliderItems: {
    flexDirection: "row",
  },

  // Cart styles
  cartContainer: {
    paddingHorizontal: wp(4),
  },
  cartItem: {
    flexDirection: "row",
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cartImage: {
    marginRight: wp(3),
  },
  cartDetails: {
    flex: 1,
  },
  cartTitle: {
    marginBottom: hp(0.5),
  },
  cartPrice: {
    marginBottom: hp(1),
  },
  cartQuantity: {},

  // Order styles
  orderContainer: {
    paddingHorizontal: wp(4),
  },
  orderItem: {
    backgroundColor: "#fff",
    padding: wp(4),
    marginBottom: hp(1.5),
    borderRadius: 8,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(1),
  },
  orderDetails: {
    paddingTop: hp(1),
  },

  // Navigation styles
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: hp(1),
    backgroundColor: "#fff",
  },
  navItem: {
    alignItems: "center",
  },
  navIcon: {
    marginBottom: hp(0.5),
  },
  navLabel: {},

  // Search styles
  searchContainer: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  searchHeader: {
    paddingVertical: hp(2),
  },
  searchBar: {
    borderRadius: 8,
  },

  // Product Detail styles
  contentView: {
    marginHorizontal: wp("4.17%"),
    alignItems: "flex-start",
    marginBottom: hp("10%"),
  },
  skeletonItem: {
    marginBottom: hp("1.2%"),
  },
  priceRowSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp("0.5%"),
    justifyContent: "space-around",
    width: "100%",
  },
  quantityRowSkeleton: {
    width: wp("91.11%"),
    height: hp("4.5%"),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp("1.5%"),
  },
  actionButtonSkeleton: {
    marginBottom: hp("1.875%"),
    width: wp("91.1%"),
    marginTop: hp("1.5%"),
  },

  // Bottom Button styles
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

  // Wishlist styles
  wishlistGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: wp("2%"),
  },
  wishlistItem: {
    width: wp("45%"),
    marginBottom: hp("2%"),
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: wp("2%"),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  wishlistImageSkeleton: {
    marginBottom: hp("1%"),
  },
  wishlistNameSkeleton: {
    marginBottom: hp("0.5%"),
  },
  wishlistPriceSkeleton: {
    marginTop: hp("1%"),
    marginBottom: hp("1%"),
  },
  wishlistButtonSkeleton: {
    marginTop: hp("1%"),
    alignSelf: "center",
  },
});

export {
  SkeletonBox,
  WidgetSkeleton,
  ProductCardSkeleton,
  CategoryItemSkeleton,
  BannerItemSkeleton,
  ListItemSkeleton,
  GridSkeleton,
  HorizontalListSkeleton,
  PaymentMethodsSkeleton,
  HeaderSkeleton,
  HomeSkeleton,
  CategorySliderSkeleton,
  ProductSliderSkeleton,
  CartSkeleton,
  OrderListSkeleton,
  NavigationSkeleton,
  SearchSkeleton,
  ProductDetailSkeleton,
  ProductBottomButtonSkeleton,
  WishlistSkeleton,
  WishlistItemSkeleton,
};

export default SkeletonBox;
