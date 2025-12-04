import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";

// Config and Styles
import colors from "../../config/colors";
import ClientStyles from "../../Styles/StyleLoader/ClientStyles";

// Services
import pageServices from "../../services/pageServices";
import UserService from "../../services/UserService";

// Context
import { useCallContext } from "../../AppContext/CallContext";

// Components
import HomeHeader from "../../component/HomeHeader";
import CategorySlider from "../../component/Widgets/CategorySlider";
import MobileHomePageBanners from "../../component/Widgets/MobileHomePageBanners";
import MobileBigBanners from "../../component/Widgets/MobileBigBanners";
import MobileAppWidget from "../../component/Widgets/MobileAppWidget";
import MainCategoryWidget from "../../component/Widgets/MainCategoryWidget";
import InspiredProductHorizontalSlide from "../../component/Widgets/InspiredProductHorizontalSlide";
import ProductListHorizontalSlide from "../../component/Widgets/ProductListHorizontalSlide";
import MobileHomePageCategoryProducts from "../../component/Widgets/MobileHomePageCategoryProducts";
import BrandWidget from "../../component/Widgets/BrandWidget";
import MobileAppOptions from "../../component/Widgets/MobileAppOptions";
import ReorderWidget from "../../component/Widgets/ReorderWidget";
import { HomeSkeleton } from "../../component/Skeleton";



// Constants
const CLIENT = process.env.CLIENT;
const HOME_PAGE_ID = 1;

// Component parameters helper
const getParameterValue = (data, parameterName) => {
  return data
    .filter((entry) => entry.ParameterName === parameterName)
    .map((entry) => entry.ParameterValue);
};

const getParameterMapId = (data, parameterName) => {
  return data
    .filter((entry) => entry.ParameterName === parameterName)
    .map((entry) => entry.PageBoilerplateMapID);
};

const HomeScreen = () => {
  // State management
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [boilerplate, setBoilerplate] = useState([]);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isAutoRetrying, setIsAutoRetrying] = useState(false);

  // Constants for retry logic (optimized to reduce over-fetching)
  const MAX_RETRY_COUNT = 2; // Reduced from 3 to 2 for better performance
  const RETRY_DELAY = 3000; // Increased to 3 seconds to reduce server load

  // Context and hooks
  const { callContext, fetchIPAddress, storeCallContext } = useCallContext();
  const windowWidth = useWindowDimensions().width - 45;

  // Memoized styles
  const styles = useMemo(() => ClientStyles(CLIENT, "homeScreen"), [CLIENT]);

  // Enhanced data fetching with automatic retry
  const fetchPageInfo = useCallback(
    async (isRefresh = false, isAutoRetry = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (isAutoRetry) {
          setIsAutoRetrying(true);
        } else {
          setLoading(true);
          setRetryCount(0); // Reset retry count on fresh load
        }
        setError(null);

        console.log("📡 Fetching page info...", {
          isRefresh,
          isAutoRetry,
          retryCount,
        });

        const response = await pageServices.getPageInfo(HOME_PAGE_ID);

        // Enhanced response validation
        if (!response) {
          throw new Error("No response received from server");
        }

        if (!response.data) {
          throw new Error("Invalid response: missing data");
        }

        const pageMaps = response.data.PageBoilerPlateMaps || [];
        const boilerPlates = response.data.BoilerPlates || [];

        // Validate that we have some content
        if (pageMaps.length === 0 && boilerPlates.length === 0) {
          throw new Error("No content available from server");
        }

        // Successfully set data
        setConfig(pageMaps);
        setBoilerplate(boilerPlates);
        setRetryCount(0); // Reset retry count on success

        console.log("✅ Page info loaded successfully", {
          pageMaps: pageMaps.length,
          boilerPlates: boilerPlates.length,
        });
      } catch (error) {
        // console.error("❌ Error fetching page info:", error);

        // const currentRetryCount = isAutoRetry ? retryCount : retryCount + 1;
        // setRetryCount(currentRetryCount);

        // // Auto retry logic
        // if (currentRetryCount < MAX_RETRY_COUNT && !isRefresh) {
        //   console.log(
        //     `🔄 Auto retrying... (${currentRetryCount}/${MAX_RETRY_COUNT})`
        //   );
        //   setTimeout(() => {
        //     fetchPageInfo(false, true);
        //   }, RETRY_DELAY);
        //   return;
        // }

        // // Set error only if all retries failed
        const errorMessage = error.message || "Failed to load page content";
        //console.log("error//////..........")
        setError(`${errorMessage}. Please try again.`);
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else if (isAutoRetry) {
          setIsAutoRetrying(false);
        } else {
          setLoading(false);
        }
      }
    },
    [retryCount]
  );

  const fetchUser = useCallback(async () => {
    try {
      if (callContext?.LoginID) {
        await UserService.getUserDetails();
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }, [callContext]);

  // Effects
  useEffect(() => {
    fetchPageInfo();
    fetchUser();
  }, [fetchPageInfo, fetchUser]);

  // Removed excessive auto-retry logic for better performance
  // Users can manually retry by tapping "Tap to reload" or pulling to refresh

  // Widget rendering function with optimized lazy rendering
  const renderWidget = useCallback(
    ({ item, index }) => {
      if (!item?.IsActive) return null;

      const parameters = item.PageBoilerPlateMapParameters || [];

      // Extract common parameters
      const titleParams = ["Title", "Title-en"];
      const titles = getParameterValue(parameters, titleParams[0]).concat(
        getParameterValue(parameters, titleParams[1])
      );
      const categoryNames = getParameterValue(parameters, "CategoryName");
      const titleMapIds = getParameterMapId(parameters, titleParams[0]).concat(
        getParameterMapId(parameters, titleParams[1])
      );
      const categoryMapIds = getParameterMapId(parameters, "CategoryName");

      // Widget component mapping
      const widgetMap = {
        "Mobile HomePage Banners": () => <MobileHomePageBanners data={item} />,
        "Mobile HomeBig Banners": () => <MobileBigBanners data={item} />,
        "mobile app widget": () => <MobileAppWidget />,
        "main-category-widget": () => <MainCategoryWidget data={boilerplate} />,
        "product list horizontal slide": () => (
          <ProductListHorizontalSlide
            data={boilerplate}
            title={titles}
            BoilerplateMapIID={titleMapIds}
          />
        ),
        "mobile homepage category products": () => (
          <MobileHomePageCategoryProducts
            data={boilerplate}
            title={categoryNames}
            BoilerplateMapIID={categoryMapIds}
          />
        ),
        "inspired product horizontal slide": () => (
          <InspiredProductHorizontalSlide
            data={boilerplate}
            title={titles}
            BoilerplateMapIID={titleMapIds}
          />
        ),
        "Brand widget": () => (
          <BrandWidget
            data={boilerplate}
            title={titles}
            BoilerplateMapIID={titleMapIds}
          />
        ),
        mobileappoptions: () => <MobileAppOptions />,
        "category slider": () => <CategorySlider data={boilerplate} />,
        "ReOrder page": () => (
          <ReorderWidget data={boilerplate} BoilerplateMapIID={titleMapIds} />
        ),
      };

      const WidgetComponent = widgetMap[item.Name];
      return WidgetComponent ? WidgetComponent() : null;
    },
    [boilerplate]
  );

  // Refresh handler
  const onRefresh = useCallback(() => {
    fetchPageInfo(true);
    fetchUser();
  }, [fetchPageInfo, fetchUser]);

  // Header component
  const HeaderComponent = useCallback(() => {
    return (
      <View style={styles.headerContainer}>
        <HomeHeader client={CLIENT} />
      </View>
    );
  }, [styles.headerContainer]);

  // Loading state with skeleton
  if (loading) {
    return (
      <View style={styles.safeAreaView}>
       
      </View>
    );
  }

  // Error state
  if (error === "Network Error. Please try again.") {
    return (
      <View style={styles.errorView}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text
            style={styles.retryText}
            onPress={() => {
              setError(null);
              fetchPageInfo();
            }}
          >
            Tap to retry
          </Text>
        </View>
      </View>
    );
  }

  // No data state with retry option
  if (!loading && error !== "Network Error. Please try again." && (!config || config.length === 0)) {
    return (
      <View style={styles.errorView}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No content available</Text>
          <Text style={styles.noDataSubtext}>
            Content might be loading or temporarily unavailable
          </Text>
          <Text
            style={styles.retryText}
            onPress={() => {
              console.log("🔄 Manual retry from no data state");
              fetchPageInfo();
            }}
          >
            Tap to reload
          </Text>

          {isAutoRetrying && (
            <View style={styles.retryIndicator}>
              <Text style={styles.retryingText}>
                Retrying... ({retryCount}/{MAX_RETRY_COUNT})
              </Text>
              <ActivityIndicator size="small" color={colors.green} />
            </View>
          )}
        </View>
      </View>
    );
  }

  // Main render
  return (
    <View style={styles.safeAreaView}>
      <FlatList
        contentContainerStyle={styles.flatListContent}
        data={config}
        extraData={boilerplate}
        keyExtractor={(item, index) => `${item.Name}-${item.IID || index}`}
        renderItem={renderWidget}
        ListHeaderComponent={HeaderComponent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={3}
        updateCellsBatchingPeriod={100}
        getItemLayout={undefined} // Let FlatList calculate
        // Pull to refresh functionality
        refreshing={refreshing}
        onRefresh={onRefresh}
        // Enhanced empty component with retry logic
        ListEmptyComponent={() => {
          if (loading || isAutoRetrying) {
            return <HomeSkeleton />;
          }

          return (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Content temporarily unavailable
              </Text>
              <Text style={styles.emptySubtext}>
                {retryCount > 0
                  ? `Tried ${retryCount} time(s)`
                  : "Loading failed"}
              </Text>
              <Text
                style={styles.retryText}
                onPress={() => {
                  console.log("🔄 Retry from ListEmptyComponent");
                  fetchPageInfo();
                }}
              >
                Tap to reload
              </Text>
              {isAutoRetrying && (
                <View style={styles.retryIndicator}>
                  <ActivityIndicator size="small" color={colors.green} />
                  <Text style={styles.retryingText}>Auto retrying...</Text>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

// const styles = StyleSheet.create({
//   safeAreaView: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   flatListContent: {
//     paddingBottom: hp("10%"),
//   },

//   headerContainer: {
//     alignItems: "center",
//     paddingVertical: hp("1%"),
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//   },
//   errorView: {
//     width: wp("100%"),
//     height: hp("100%"),
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#FFFFFF",
//   },
//   errorContainer: {
//     justifyContent: "center",
//     alignItems: "center",
//     width: wp("75%"),
//     height: hp("15%"),
//     borderColor: "#E0E0E080",
//     borderWidth: 1,
//     elevation: 5,
//     shadowColor: "#CFCFCF40",
//     borderRadius: 10,
//     backgroundColor: "#FFFFFF",
//   },
//   errorText: {
//     fontSize: RFValue(14, 800),
//     color: "#D9534F",
//     textAlign: "center",
//     marginBottom: hp("1%"),
//     fontWeight: "600",
//     fontFamily: "Poppins-Regular",
//   },
//   retryText: {
//     fontSize: RFValue(13, 800),
//     color: "#007AFF",
//     fontWeight: "600",
//     textAlign: "center",
//     fontFamily: "Poppins-Regular",
//     textDecorationLine: "underline",
//   },
//   noDataContainer: {
//     width: wp("80%"),
//     height: hp("20%"),
//     justifyContent: "center",
//     alignItems: "center",
//     borderColor: "#E0E0E080",
//     borderWidth: 1,
//     elevation: 5,
//     shadowColor: "#CFCFCF40",
//     borderRadius: 10,
//     backgroundColor: "#FFFFFF",
//   },
//   noDataText: {
//     fontSize: RFValue(16, 800),
//     fontWeight: "600",
//     textAlign: "center",
//     color: "#525252",
//     marginBottom: hp("1.5%"),
//     fontFamily: "Poppins-Medium",
//   },
//   noDataSubtext: {
//     fontSize: RFValue(14, 800),
//     color: "#888",
//     textAlign: "center",
//     fontFamily: "Poppins-Regular",

//     marginBottom: hp("2%"),
//   },
//   retryIndicator: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: hp("2%"),
//     gap: 10,
//   },
//   retryingText: {
//     fontSize: hp("1.7%"),
//     color: "#28A745",
//     marginLeft: wp("1%"),
//   },
//   emptyContainer: {
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: hp("10%"),
//   },
//   emptyText: {
//     fontSize: hp("2%"),
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: hp("0.5%"),
//   },
//   emptySubtext: {
//     fontSize: hp("1.7%"),
//     color: "#888",
//     textAlign: "center",
//     marginBottom: hp("2%"),
//   },
//   text: {
//     fontSize: hp("2%"),
//     fontWeight: "500",
//     color: "#333",
//   },
// });

export default HomeScreen;
