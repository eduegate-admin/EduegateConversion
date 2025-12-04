// Comprehensive Skeleton Components Index
// This file exports all skeleton components for easy importing across the app

// Home Screen Skeletons
import HomeSkeleton from "./HomeSkeleton";
export { HomeSkeleton };
// Also import commonly used items for the default export object
import {
  SkeletonBox,
  WidgetSkeleton,
  ProductCardSkeleton,
  CategoryItemSkeleton,
} from "./SkeletonComponents";
import {
  DrawerSkeleton,
  FooterSkeleton,
  OrderScreenSkeleton,
  OrderListSkeleton,
  OrderDetailsSkeleton,
} from "./NavigationSkeletons";
import {
  CartSkeleton,
  ProductListSkeleton,
  SearchSkeleton,
  ProfileSkeleton,
  NotificationSkeleton,
} from "./ScreenSkeletons";
export {
  SkeletonBox,
  WidgetSkeleton,
  ProductCardSkeleton,
  CategoryItemSkeleton,
  BannerItemSkeleton,
  ListItemSkeleton,
  GridSkeleton,
  HorizontalListSkeleton,
} from "./SkeletonComponents";

// Navigation Skeletons (Drawer, Footer, Orders)
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
} from "./NavigationSkeletons";

// Screen Skeletons (Cart, Products, Search, Profile, etc.)
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
} from "./ScreenSkeletons";

// Default export - most commonly used skeletons
export default {
  // Home & Navigation
  HomeSkeleton,
  DrawerSkeleton,
  FooterSkeleton,

  // Orders
  OrderScreenSkeleton,
  OrderListSkeleton,
  OrderDetailsSkeleton,

  // Main Screens
  CartSkeleton,
  ProductListSkeleton,
  SearchSkeleton,
  ProfileSkeleton,
  NotificationSkeleton,

  // Components
  SkeletonBox,
  WidgetSkeleton,
  ProductCardSkeleton,
  CategoryItemSkeleton,

  // Usage Examples:
  // import { HomeSkeleton, CartSkeleton } from '../component/Skeleton';
  // import Skeletons from '../component/Skeleton';
  // <HomeSkeleton />
  // <Skeletons.CartSkeleton />
};
