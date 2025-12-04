import React from "react";
import { View, Animated, StyleSheet, Dimensions, ScrollView } from "react-native";

const { width } = Dimensions.get("window");

// Shimmer effect animation
const useShimmerAnimation = () => {
  const shimmerValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerValue]);

  const shimmerTranslate = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return shimmerTranslate;
};

// Basic skeleton line component
const SkeletonLine = ({
  width: lineWidth = "100%",
  height = 16,
  style = {},
}) => {
  const shimmerTranslate = useShimmerAnimation();

  return (
    <View
      style={[styles.skeletonContainer, { width: lineWidth, height }, style]}
    >
      <View style={[styles.skeletonLine, { height }]} />
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX: shimmerTranslate }],
          },
        ]}
      />
    </View>
  );
};

// Header skeleton
const HeaderSkeleton = () => (
  <View style={styles.headerSkeleton}>
    <View style={styles.headerContent}>
      <SkeletonLine width={120} height={24} style={styles.headerTitle} />
      <SkeletonLine width={60} height={20} style={styles.headerIcon} />
    </View>
    <View style={styles.searchBarSkeleton}>
      <SkeletonLine width="100%" height={40} />
    </View>
  </View>
);

// Banner skeleton
const BannerSkeleton = () => (
  <View style={styles.bannerContainer}>
    <SkeletonLine width="100%" height={160} style={styles.bannerImage} />
  </View>
);

// Category slider skeleton
const CategorySliderSkeleton = () => (
  <View style={styles.categoryContainer}>
    <SkeletonLine width={150} height={20} style={styles.categoryTitle} />
    <View style={styles.categoryItems}>
      {[1, 2, 3, 4, 5].map((index) => (
        <View key={index} style={styles.categoryItem}>
          <SkeletonLine width={60} height={60} style={styles.categoryIcon} />
          <SkeletonLine width={50} height={12} style={styles.categoryLabel} />
        </View>
      ))}
    </View>
  </View>
);

// Product horizontal slider skeleton
const ProductSliderSkeleton = () => (
  <View style={styles.productSliderContainer}>
    <SkeletonLine width={180} height={24} style={styles.productSliderTitle} />
    <View style={styles.productItems}>
      {[1, 2, 3].map((index) => (
        <View key={index} style={styles.productItem}>
          <SkeletonLine width={140} height={140} style={styles.productImage} />
          <SkeletonLine width="90%" height={14} style={styles.productName} />
          <SkeletonLine width="60%" height={12} style={styles.productPrice} />
          <SkeletonLine width="70%" height={12} style={styles.productBrand} />
        </View>
      ))}
    </View>
  </View>
);

// Main category widget skeleton
const MainCategoryWidgetSkeleton = () => (
  <View style={styles.mainCategoryContainer}>
    <SkeletonLine width={200} height={24} style={styles.mainCategoryTitle} />
    <View style={styles.mainCategoryGrid}>
      {[1, 2, 3, 4, 5, 6].map((index) => (
        <View key={index} style={styles.mainCategoryItem}>
          <SkeletonLine
            width="100%"
            height={100}
            style={styles.mainCategoryImage}
          />
          <SkeletonLine
            width="80%"
            height={14}
            style={styles.mainCategoryLabel}
          />
        </View>
      ))}
    </View>
  </View>
);

// Brand widget skeleton
const BrandWidgetSkeleton = () => (
  <View style={styles.brandContainer}>
    <SkeletonLine width={120} height={20} style={styles.brandTitle} />
    <View style={styles.brandItems}>
      {[1, 2, 3, 4].map((index) => (
        <View key={index} style={styles.brandItem}>
          <SkeletonLine width={80} height={80} style={styles.brandLogo} />
        </View>
      ))}
    </View>
  </View>
);

// Search bar skeleton
const SearchBarSkeleton = () => (
  <View style={styles.searchBarContainer}>
    <SkeletonLine width="100%" height={40} style={styles.searchBar} />
  </View>
);

// Re-order skeleton
const ReOrderSkeleton = () => (
  <View style={styles.reOrderContainer}>
    <SkeletonLine width={120} height={24} style={styles.sectionTitle} />
    <View style={styles.reOrderItems}>
      {[1, 2, 3].map((index) => (
        <View key={index} style={styles.reOrderItem}>
          <SkeletonLine width={100} height={100} style={styles.productImage} />
          <SkeletonLine width="90%" height={14} style={styles.productName} />
          <SkeletonLine width="60%" height={12} style={styles.productPrice} />
        </View>
      ))}
    </View>
  </View>
);

// Shop by category skeleton
const ShopByCategorySkeleton = () => (
  <View style={styles.shopByCategoryContainer}>
    <SkeletonLine width={150} height={24} style={styles.sectionTitle} />
    <View style={styles.categoryGrid}>
      {[1, 2, 3, 4, 5, 6].map((index) => (
        <View key={index} style={styles.categoryGridItem}>
          <SkeletonLine width={80} height={80} style={styles.categoryImage} />
          <SkeletonLine width={60} height={14} style={styles.categoryName} />
        </View>
      ))}
    </View>
  </View>
);

// Bottom tabs skeleton
const BottomTabsSkeleton = () => (
  <View style={styles.bottomTabsContainer}>
    {[1, 2, 3, 4, 5].map((index) => (
      <View key={index} style={styles.tabItem}>
        <SkeletonLine width={24} height={24} style={styles.tabIcon} />
        <SkeletonLine width={40} height={12} style={styles.tabLabel} />
      </View>
    ))}
  </View>
);

// Complete home skeleton
const HomeSkeleton = () => (
  <View style={styles.container}>
    <HeaderSkeleton />
    <ScrollView showsVerticalScrollIndicator={false}>
      <SearchBarSkeleton />
      <BannerSkeleton />
      <ReOrderSkeleton />
      <ShopByCategorySkeleton />
    </ScrollView>
    <BottomTabsSkeleton />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  skeletonContainer: {
    overflow: "hidden",
    backgroundColor: "#e1e9ee",
    borderRadius: 8,
  },
  skeletonLine: {
    backgroundColor: "#e1e9ee",
    borderRadius: 8,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },

  // Header styles
  headerSkeleton: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    marginRight: 8,
  },
  headerIcon: {
    borderRadius: 12,
  },
  searchBarSkeleton: {
    marginTop: 8,
  },

  // Banner styles
  bannerContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  bannerImage: {
    borderRadius: 12,
  },

  // Category styles
  categoryContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  categoryTitle: {
    marginBottom: 12,
  },
  categoryItems: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryItem: {
    alignItems: "center",
  },
  categoryIcon: {
    borderRadius: 30,
    marginBottom: 8,
  },
  categoryLabel: {
    borderRadius: 6,
  },

  // Product slider styles
  productSliderContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  productSliderTitle: {
    marginBottom: 16,
  },
  productItems: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productItem: {
    width: (width - 64) / 3,
    marginRight: 8,
  },
  productImage: {
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    marginBottom: 4,
  },
  productPrice: {
    marginBottom: 4,
  },
  productBrand: {
    marginBottom: 8,
  },

  // Main category styles
  mainCategoryContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  mainCategoryTitle: {
    marginBottom: 16,
  },
  mainCategoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  mainCategoryItem: {
    width: (width - 48) / 2,
    marginBottom: 16,
  },
  mainCategoryImage: {
    borderRadius: 8,
    marginBottom: 8,
  },
  mainCategoryLabel: {
    borderRadius: 6,
  },

  // Brand styles
  brandContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  brandTitle: {
    marginBottom: 16,
  },
  brandItems: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  brandItem: {
    alignItems: "center",
  },
  brandLogo: {
    borderRadius: 8,
  },

  // Search bar styles
  searchBarContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  searchBar: {
    borderRadius: 8,
  },

  // Re-order styles
  reOrderContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  reOrderItems: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  reOrderItem: {
    width: (width - 64) / 3,
    alignItems: "center",
  },

  // Shop by category styles
  shopByCategoryContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
  },
  categoryGridItem: {
    width: (width - 64) / 4,
    alignItems: "center",
    marginBottom: 16,
  },

  // Bottom tabs styles
  bottomTabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  tabItem: {
    alignItems: "center",
  },
});

export default HomeSkeleton;
export {
  SkeletonLine,
  HeaderSkeleton,
  BannerSkeleton,
  SearchBarSkeleton,
  ReOrderSkeleton,
  ShopByCategorySkeleton,
  BottomTabsSkeleton,
};
