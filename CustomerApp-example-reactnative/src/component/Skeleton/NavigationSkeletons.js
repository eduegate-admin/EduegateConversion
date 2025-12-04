import React from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";

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

// Drawer Skeleton Components
const DrawerHeaderSkeleton = () => (
  <View style={styles.drawerHeader}>
    <View style={styles.profileSection}>
      <SkeletonLine width={60} height={60} style={styles.profileImage} />
      <View style={styles.profileInfo}>
        <SkeletonLine width={120} height={16} style={styles.profileName} />
        <SkeletonLine width={150} height={12} style={styles.profileEmail} />
      </View>
    </View>
  </View>
);

const DrawerMenuItemSkeleton = ({ showIcon = true }) => (
  <View style={styles.drawerMenuItem}>
    {showIcon && (
      <SkeletonLine width={24} height={24} style={styles.menuIcon} />
    )}
    <SkeletonLine width={140} height={16} style={styles.menuText} />
  </View>
);

const DrawerSkeleton = () => (
  <View style={styles.drawerContainer}>
    <DrawerHeaderSkeleton />
    <View style={styles.drawerMenu}>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
        <DrawerMenuItemSkeleton key={index} />
      ))}
    </View>
    <View style={styles.drawerFooter}>
      <SkeletonLine width={100} height={14} style={styles.versionText} />
    </View>
  </View>
);

// Footer Skeleton Components
const FooterTabSkeleton = () => (
  <View style={styles.footerTab}>
    <SkeletonLine width={24} height={24} style={styles.tabIcon} />
    <SkeletonLine width={50} height={10} style={styles.tabLabel} />
  </View>
);

const FooterSkeleton = () => (
  <View style={styles.footerContainer}>
    {[1, 2, 3, 4, 5].map((index) => (
      <FooterTabSkeleton key={index} />
    ))}
  </View>
);

// Order Skeleton Components
const OrderCardSkeleton = () => (
  <View style={styles.orderCard}>
    <View style={styles.orderHeader}>
      <SkeletonLine width={100} height={16} style={styles.orderNumber} />
      <SkeletonLine width={80} height={14} style={styles.orderStatus} />
    </View>
    <SkeletonLine width={150} height={12} style={styles.orderDate} />
    <View style={styles.orderItems}>
      <SkeletonLine width="90%" height={12} style={styles.orderItemText} />
      <SkeletonLine width="70%" height={12} style={styles.orderItemText} />
    </View>
    <View style={styles.orderFooter}>
      <SkeletonLine width={80} height={16} style={styles.orderTotal} />
      <SkeletonLine width={60} height={12} style={styles.orderAction} />
    </View>
  </View>
);

const OrderListSkeleton = () => (
  <View style={styles.orderListContainer}>
    <View style={styles.orderListHeader}>
      <SkeletonLine width={120} height={20} style={styles.orderListTitle} />
      <SkeletonLine width={80} height={14} style={styles.filterOption} />
    </View>
    {[1, 2, 3, 4, 5].map((index) => (
      <OrderCardSkeleton key={index} />
    ))}
  </View>
);

// Order Details Skeleton Components
const OrderDetailHeaderSkeleton = () => (
  <View style={styles.orderDetailHeader}>
    <SkeletonLine width={150} height={18} style={styles.orderDetailTitle} />
    <SkeletonLine width={100} height={14} style={styles.orderDetailStatus} />
    <SkeletonLine width={120} height={12} style={styles.orderDetailDate} />
  </View>
);

const OrderDetailItemSkeleton = () => (
  <View style={styles.orderDetailItem}>
    <SkeletonLine width={60} height={60} style={styles.itemImage} />
    <View style={styles.itemDetails}>
      <SkeletonLine width="90%" height={14} style={styles.itemName} />
      <SkeletonLine width="60%" height={12} style={styles.itemPrice} />
      <SkeletonLine width="40%" height={12} style={styles.itemQuantity} />
    </View>
  </View>
);

const OrderDetailSummarySkeleton = () => (
  <View style={styles.orderSummary}>
    <SkeletonLine width={120} height={16} style={styles.summaryTitle} />
    {[1, 2, 3, 4].map((index) => (
      <View key={index} style={styles.summaryRow}>
        <SkeletonLine width={100} height={12} />
        <SkeletonLine width={60} height={12} />
      </View>
    ))}
    <View style={styles.totalRow}>
      <SkeletonLine width={80} height={16} />
      <SkeletonLine width={80} height={16} />
    </View>
  </View>
);

const OrderDetailsSkeleton = () => (
  <View style={styles.orderDetailsContainer}>
    <OrderDetailHeaderSkeleton />
    <View style={styles.orderItemsList}>
      {[1, 2, 3, 4].map((index) => (
        <OrderDetailItemSkeleton key={index} />
      ))}
    </View>
    <OrderDetailSummarySkeleton />
    <View style={styles.orderActions}>
      <SkeletonLine width={120} height={40} style={styles.actionButton} />
      <SkeletonLine width={100} height={40} style={styles.actionButton} />
    </View>
  </View>
);

// Main Order Screen Skeleton (combines list and details)
const OrderScreenSkeleton = ({ variant = "list" }) => {
  if (variant === "details") {
    return <OrderDetailsSkeleton />;
  }
  return <OrderListSkeleton />;
};

const styles = StyleSheet.create({
  skeletonLine: {
    backgroundColor: "#e1e9ee",
    borderRadius: 8,
  },

  // Drawer Styles
  drawerContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    borderRadius: 30,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    marginBottom: 4,
  },
  profileEmail: {
    marginBottom: 8,
  },
  drawerMenu: {
    flex: 1,
    paddingTop: 10,
  },
  drawerMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuIcon: {
    marginRight: 16,
    borderRadius: 4,
  },
  menuText: {
    flex: 1,
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    alignItems: "center",
  },
  versionText: {
    borderRadius: 6,
  },

  // Footer Styles
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  footerTab: {
    alignItems: "center",
  },
  tabIcon: {
    borderRadius: 4,
    marginBottom: 4,
  },
  tabLabel: {
    borderRadius: 4,
  },

  // Order List Styles
  orderListContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  orderListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  orderListTitle: {
    borderRadius: 6,
  },
  filterOption: {
    borderRadius: 6,
  },
  orderCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderNumber: {
    borderRadius: 6,
  },
  orderStatus: {
    borderRadius: 12,
  },
  orderDate: {
    marginBottom: 8,
    borderRadius: 4,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItemText: {
    marginBottom: 4,
    borderRadius: 4,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderTotal: {
    borderRadius: 6,
  },
  orderAction: {
    borderRadius: 6,
  },

  // Order Details Styles
  orderDetailsContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  orderDetailHeader: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  orderDetailTitle: {
    marginBottom: 8,
    borderRadius: 6,
  },
  orderDetailStatus: {
    marginBottom: 4,
    borderRadius: 6,
  },
  orderDetailDate: {
    borderRadius: 4,
  },
  orderItemsList: {
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  orderDetailItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemImage: {
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    marginBottom: 4,
    borderRadius: 4,
  },
  itemPrice: {
    marginBottom: 4,
    borderRadius: 4,
  },
  itemQuantity: {
    borderRadius: 4,
  },
  orderSummary: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  summaryTitle: {
    marginBottom: 12,
    borderRadius: 6,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  orderActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: "#fff",
  },
  actionButton: {
    borderRadius: 20,
  },
});

export {
  DrawerSkeleton,
  FooterSkeleton,
  OrderScreenSkeleton,
  OrderListSkeleton,
  OrderDetailsSkeleton,
  DrawerHeaderSkeleton,
  DrawerMenuItemSkeleton,
  FooterTabSkeleton,
  OrderCardSkeleton,
  OrderDetailHeaderSkeleton,
  OrderDetailItemSkeleton,
  OrderDetailSummarySkeleton,
};

export default {
  DrawerSkeleton,
  FooterSkeleton,
  OrderScreenSkeleton,
};
