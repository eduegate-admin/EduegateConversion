import React from "react";
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";

const { width } = Dimensions.get("window");

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

// Basic skeleton line component
const SkeletonLine = ({
  width: lineWidth = "100%",
  height = 16,
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
        styles.skeletonLine,
        {
          width: lineWidth,
          height,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Cart Skeleton Components
const CartItemSkeleton = () => (
  <View style={styles.cartItem}>
    <SkeletonLine width={60} height={60} style={styles.cartItemImage} />
    <View style={styles.cartItemDetails}>
      <SkeletonLine width="90%" height={14} style={styles.cartItemName} />
      <SkeletonLine width="60%" height={12} style={styles.cartItemPrice} />
      <View style={styles.cartItemActions}>
        <SkeletonLine width={80} height={32} style={styles.quantitySelector} />
        <SkeletonLine width={24} height={24} style={styles.deleteButton} />
      </View>
    </View>
  </View>
);

const CartSkeleton = () => (
  <View style={styles.cartContainer}>
    <View style={styles.cartHeader}>
      <SkeletonLine width={120} height={20} style={styles.cartTitle} />
      <SkeletonLine width={80} height={14} style={styles.itemCount} />
    </View>
    <ScrollView style={styles.cartItems}>
      {[1, 2, 3, 4].map((index) => (
        <CartItemSkeleton key={index} />
      ))}
    </ScrollView>
    <View style={styles.cartFooter}>
      <View style={styles.cartSummary}>
        <SkeletonLine width={100} height={16} style={styles.summaryTitle} />
        <SkeletonLine width={80} height={20} style={styles.totalAmount} />
      </View>
      <SkeletonLine width="100%" height={48} style={styles.checkoutButton} />
    </View>
  </View>
);

// Product List/Category Skeleton Components
const ProductGridItemSkeleton = () => (
  <View style={[styles.productGridItem, { width: (width - 48) / 2 }]}>
    <SkeletonLine width="100%" height={120} style={styles.productImage} />
    <SkeletonLine width="90%" height={14} style={styles.productName} />
    <SkeletonLine width="60%" height={12} style={styles.productPrice} />
    <SkeletonLine width="70%" height={12} style={styles.productBrand} />
    <SkeletonLine width="100%" height={32} style={styles.addToCartButton} />
  </View>
);

const ProductListSkeleton = ({ layout = "grid", itemCount = 6 }) => (
  <View style={styles.productListContainer}>
    <View style={styles.productListHeader}>
      <SkeletonLine width={150} height={20} style={styles.categoryTitle} />
      <SkeletonLine width={80} height={14} style={styles.itemCountText} />
    </View>
    <View style={styles.filterBar}>
      <SkeletonLine width={60} height={32} style={styles.filterButton} />
      <SkeletonLine width={80} height={32} style={styles.sortButton} />
      <SkeletonLine width={70} height={32} style={styles.viewToggle} />
    </View>
    <View
      style={layout === "grid" ? styles.gridContainer : styles.listContainer}
    >
      {Array.from({ length: itemCount }).map((_, index) => (
        <ProductGridItemSkeleton key={index} />
      ))}
    </View>
  </View>
);

// Search Skeleton Components
const SearchBarSkeleton = () => (
  <View style={styles.searchBarContainer}>
    <SkeletonLine width="100%" height={40} style={styles.searchBar} />
  </View>
);

const SearchResultItemSkeleton = () => (
  <View style={styles.searchResultItem}>
    <SkeletonLine width={50} height={50} style={styles.searchItemImage} />
    <View style={styles.searchItemDetails}>
      <SkeletonLine width="80%" height={14} style={styles.searchItemName} />
      <SkeletonLine width="60%" height={12} style={styles.searchItemCategory} />
    </View>
  </View>
);

const SearchSkeleton = () => (
  <View style={styles.searchContainer}>
    <SearchBarSkeleton />
    <View style={styles.searchSuggestions}>
      <SkeletonLine width={120} height={16} style={styles.suggestionsTitle} />
      {[1, 2, 3, 4, 5].map((index) => (
        <SearchResultItemSkeleton key={index} />
      ))}
    </View>
  </View>
);

// Profile Skeleton Components
const ProfileHeaderSkeleton = () => (
  <View style={styles.profileHeader}>
    <SkeletonLine width={80} height={80} style={styles.profileAvatar} />
    <View style={styles.profileInfo}>
      <SkeletonLine width={150} height={18} style={styles.profileName} />
      <SkeletonLine width={180} height={14} style={styles.profileEmail} />
      <SkeletonLine width={120} height={12} style={styles.profilePhone} />
    </View>
  </View>
);

const ProfileMenuSkeleton = () => (
  <View style={styles.profileMenu}>
    {[1, 2, 3, 4, 5, 6].map((index) => (
      <View key={index} style={styles.profileMenuItem}>
        <SkeletonLine width={24} height={24} style={styles.profileMenuIcon} />
        <SkeletonLine width={140} height={16} style={styles.profileMenuText} />
        <SkeletonLine width={12} height={12} style={styles.profileMenuArrow} />
      </View>
    ))}
  </View>
);

const ProfileSkeleton = () => (
  <View style={styles.profileContainer}>
    <ProfileHeaderSkeleton />
    <ProfileMenuSkeleton />
  </View>
);

// Notification Skeleton Components
const NotificationItemSkeleton = () => (
  <View style={styles.notificationItem}>
    <SkeletonLine width={40} height={40} style={styles.notificationIcon} />
    <View style={styles.notificationContent}>
      <SkeletonLine width="90%" height={14} style={styles.notificationTitle} />
      <SkeletonLine
        width="70%"
        height={12}
        style={styles.notificationMessage}
      />
      <SkeletonLine width={80} height={10} style={styles.notificationTime} />
    </View>
  </View>
);

const NotificationSkeleton = () => (
  <View style={styles.notificationContainer}>
    <View style={styles.notificationHeader}>
      <SkeletonLine
        width={120}
        height={20}
        style={styles.notificationHeaderTitle}
      />
      <SkeletonLine width={60} height={14} style={styles.markAllRead} />
    </View>
    {[1, 2, 3, 4, 5, 6].map((index) => (
      <NotificationItemSkeleton key={index} />
    ))}
  </View>
);

// Address Skeleton Components
const AddressCardSkeleton = () => (
  <View style={styles.addressCard}>
    <View style={styles.addressHeader}>
      <SkeletonLine width={80} height={16} style={styles.addressType} />
      <SkeletonLine width={50} height={14} style={styles.addressAction} />
    </View>
    <SkeletonLine width="90%" height={14} style={styles.addressLine1} />
    <SkeletonLine width="70%" height={12} style={styles.addressLine2} />
    <SkeletonLine width={100} height={12} style={styles.addressContact} />
  </View>
);

const AddressSkeleton = () => (
  <View style={styles.addressContainer}>
    <View style={styles.addressListHeader}>
      <SkeletonLine width={140} height={20} style={styles.addressListTitle} />
      <SkeletonLine width={80} height={32} style={styles.addNewButton} />
    </View>
    {[1, 2, 3].map((index) => (
      <AddressCardSkeleton key={index} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeletonLine: {
    backgroundColor: "#e1e9ee",
    borderRadius: 8,
  },

  // Cart Styles
  cartContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    width: "100%",
    alignSelf: "stretch",
  },
  cartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  cartTitle: {
    borderRadius: 6,
  },
  itemCount: {
    borderRadius: 4,
  },
  cartItems: {
    flex: 1,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 1,
    padding: 16,
  },
  cartItemImage: {
    borderRadius: 8,
    marginRight: 12,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    marginBottom: 4,
  },
  cartItemPrice: {
    marginBottom: 8,
  },
  cartItemActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantitySelector: {
    borderRadius: 16,
  },
  deleteButton: {
    borderRadius: 4,
  },
  cartFooter: {
    backgroundColor: "#fff",
    padding: 16,
  },
  cartSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryTitle: {
    borderRadius: 6,
  },
  totalAmount: {
    borderRadius: 6,
  },
  checkoutButton: {
    borderRadius: 24,
  },

  // Product List Styles
  productListContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  productListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  categoryTitle: {
    borderRadius: 6,
  },
  itemCountText: {
    borderRadius: 4,
  },
  filterBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  filterButton: {
    borderRadius: 16,
  },
  sortButton: {
    borderRadius: 16,
  },
  viewToggle: {
    borderRadius: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  productGridItem: {
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: 8,
    padding: 12,
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
  productBrand: {
    marginBottom: 8,
  },
  addToCartButton: {
    borderRadius: 16,
  },

  // Search Styles
  searchContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchBarContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  searchBar: {
    borderRadius: 20,
  },
  searchSuggestions: {
    backgroundColor: "#fff",
    marginTop: 8,
    paddingHorizontal: 16,
  },
  suggestionsTitle: {
    marginVertical: 12,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchItemImage: {
    borderRadius: 8,
    marginRight: 12,
  },
  searchItemDetails: {
    flex: 1,
  },
  searchItemName: {
    marginBottom: 4,
  },
  searchItemCategory: {
    borderRadius: 4,
  },

  // Profile Styles
  profileContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 8,
  },
  profileAvatar: {
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    marginBottom: 8,
  },
  profileEmail: {
    marginBottom: 4,
  },
  profilePhone: {
    borderRadius: 4,
  },
  profileMenu: {
    backgroundColor: "#fff",
  },
  profileMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileMenuIcon: {
    marginRight: 16,
    borderRadius: 4,
  },
  profileMenuText: {
    flex: 1,
  },
  profileMenuArrow: {
    borderRadius: 2,
  },

  // Notification Styles
  notificationContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  notificationHeaderTitle: {
    borderRadius: 6,
  },
  markAllRead: {
    borderRadius: 4,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 1,
  },
  notificationIcon: {
    borderRadius: 20,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    marginBottom: 4,
  },
  notificationMessage: {
    marginBottom: 4,
  },
  notificationTime: {
    borderRadius: 4,
  },

  // Address Styles
  addressContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  addressListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  addressListTitle: {
    borderRadius: 6,
  },
  addNewButton: {
    borderRadius: 16,
  },
  addressCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addressType: {
    borderRadius: 6,
  },
  addressAction: {
    borderRadius: 4,
  },
  addressLine1: {
    marginBottom: 4,
  },
  addressLine2: {
    marginBottom: 4,
  },
  addressContact: {
    borderRadius: 4,
  },
});

export {
  CartSkeleton,
  ProductListSkeleton,
  SearchSkeleton,
  ProfileSkeleton,
  NotificationSkeleton,
  AddressSkeleton,
  CartItemSkeleton,
  ProductGridItemSkeleton,
  SearchBarSkeleton,
  ProfileHeaderSkeleton,
  NotificationItemSkeleton,
  AddressCardSkeleton,
};

export default {
  CartSkeleton,
  ProductListSkeleton,
  SearchSkeleton,
  ProfileSkeleton,
  NotificationSkeleton,
  AddressSkeleton,
};
