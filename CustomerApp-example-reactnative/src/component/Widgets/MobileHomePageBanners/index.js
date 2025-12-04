import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { View, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import BannerService from "../../../services/bannerService";
import { Skeleton } from "moti/skeleton";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import appSettings from "../../../../Client/appSettings";

const BANNER_WIDTH = wp("90%");
const client = process.env.CLIENT;
const MobileHomePageBanners = ({ data: PageBoilerPlateMaps }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  
  const customBannerStyle = appSettings[client].customBannerStyle;

  // Memoize styles for performance
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        },
        bannerWrapper: {
          width: wp("100%"),
          aspectRatio: customBannerStyle ?   30.6 / 9: null,
          alignItems: "center",
          justifyContent: "center",
          marginVertical: 8,
        },
        scrollView: {
          width: wp("100%"),
        },
        image: {
          width: wp("91.11%"),
          height: "100%",
          borderRadius: 15,
          aspectRatio: customBannerStyle ?   30 / 9:  22.5 / 9,
          alignSelf: "center",
          marginHorizontal: 8,
        },
      }),
    []
  );

  // Carousel state/refs
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const autoScrollInterval = useRef(null);
  const resumeTimeout = useRef(null);
  const currentIndex = useRef(1);
  const lastIndex = useRef(1);

  // Create circular effect by adding first slide at end and last slide at beginning
  const slides = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) {
      return products ? [products] : [];
    }
    // Add last slide at start and first slide at end for circular effect
    return [products[products.length - 1], ...products, products[0]];
  }, [products]);

  // Fetch banners on focus

  // Fetch banners on focus

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      
      const fetchBanners = async () => {
        if (!PageBoilerPlateMaps?.PageBoilerPlateMapParameters) return;
        
        const bannerTypeParam = PageBoilerPlateMaps.PageBoilerPlateMapParameters.find(
          (entry) => entry.ParameterName === "BannerType"
        );
        
        if (bannerTypeParam && (products.length === 0 || !isMounted)) {
          await fetchProduct(bannerTypeParam.ParameterValue);
        }
      };
      
      fetchBanners();
      
      return () => {
        isMounted = false;
      };
    }, [PageBoilerPlateMaps?.PageBoilerPlateMapParameters]) // Only depend on PageBoilerPlateMapParameters
  );

  const fetchProduct = async (parameter) => {
    try {
      setLoading(true);
      const response = await BannerService.getHomeBanner(parameter);
      if (response && typeof response === "object" && "data" in response) {
        const data = response.data;
        setProducts(Array.isArray(data) ? data : data ? [data] : []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching API data:", error);
      setProducts([]);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handleProductShow = useCallback(
    (item) => {
      try {
        if (item.Link) {
          let parsed = JSON.parse(item.Link);
          parsed.params.isCategory = false;
          const { route, params } = parsed;
          if (route) navigation.navigate(route, params);
        }
      } catch (error) {
        console.error("❌ Error parsing navigation link:", error.message);
      }
    },
    [navigation]
  );

  // Auto-scroll with continuous circular effect
  const startAutoScroll = useCallback(() => {
    if (slides.length > 1 && !loading && !autoScrollInterval.current) {
      autoScrollInterval.current = setInterval(() => {
        let nextIndex = currentIndex.current + 1;
        if (nextIndex >= slides.length - 1) {
          // When reaching the last slide (cloned first), prepare to loop
          nextIndex = 1;
          // First scroll to the cloned slide with animation
          scrollViewRef.current?.scrollTo({
            x: (slides.length - 1) * wp("100%"),
            animated: true,
          });
          // Then immediately jump back to first real slide
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({
              x: nextIndex * wp("100%"),
              animated: false,
            });
          }, 400); // Adjust timing based on your scroll animation duration
        } else {
          // Normal scroll to next slide
          scrollViewRef.current?.scrollTo({
            x: nextIndex * wp("100%"),
            animated: true,
          });
        }
        currentIndex.current = nextIndex;
      }, 4000);
    }
  }, [slides.length, loading]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
    if (resumeTimeout.current) {
      clearTimeout(resumeTimeout.current);
      resumeTimeout.current = null;
    }
  }, []);

  useEffect(() => {
    if (slides.length > 1 && !loading && scrollViewRef.current) {
      // Start at index 1 (first real slide) since index 0 is the cloned last slide
      scrollViewRef.current.scrollTo({ x: wp("100%"), animated: false });
      currentIndex.current = 1;
      lastIndex.current = 1;
      startAutoScroll();
    }
    return () => stopAutoScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, loading, startAutoScroll, stopAutoScroll]);

  const handleScrollBeginDrag = useCallback(() => {
    stopAutoScroll();
  }, [stopAutoScroll]);

  const handleMomentumScrollEnd = useCallback(() => {
    const index = Math.round(scrollX._value / wp("100%"));
    currentIndex.current = index;

    // Handle circular scrolling
    if (index === 0) {
      // If we're at the cloned last slide (beginning), jump to the real last slide
      scrollViewRef.current?.scrollTo({
        x: (slides.length - 2) * wp("100%"),
        animated: false,
      });
      currentIndex.current = slides.length - 2;
    } else if (index === slides.length - 1) {
      // If we're at the cloned first slide (end), jump to the real first slide
      scrollViewRef.current?.scrollTo({
        x: wp("100%"),
        animated: false,
      });
      currentIndex.current = 1;
    }

    // Clear any existing timeouts to prevent multiple intervals
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
    if (resumeTimeout.current) {
      clearTimeout(resumeTimeout.current);
      resumeTimeout.current = null;
    }

    // Resume auto-scroll after a brief pause
    resumeTimeout.current = setTimeout(() => {
      startAutoScroll();
    }, 4000); // Match the auto-scroll interval for consistency

    lastIndex.current = currentIndex.current;
  }, [scrollX, startAutoScroll, slides.length]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const renderItem = useCallback(
    ({ item, index }) => (
      <TouchableOpacity
        key={index}
        style={styles.bannerWrapper}
        onPress={() => handleProductShow(item)}
        activeOpacity={0.85}
      >
        <Image
          style={styles.image}
          source={{ uri: item.BannerFile }}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
      </TouchableOpacity>
    ),
    [handleProductShow, styles.bannerWrapper, styles.image]
  );

  return (
    <View style={styles.container}>
     
      {loading ? (
        <View style={styles.bannerWrapper}>
          <Skeleton
            colorMode="light"
            width={"100%"}
            height={"100%"}
            radius={15}
          />
        </View>
      ) : (
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBeginDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {Array.isArray(slides) &&
            slides.map((item, index) => renderItem({ item, index }))}
        </Animated.ScrollView>
      )}
    </View>
  );
};

export default MobileHomePageBanners;
