import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import BannerService from "../../../services/bannerService";
import { Skeleton } from "moti/skeleton";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const client = process.env.CLIENT;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MobileBigBanners = (props) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carouselHeight] = useState(hp("45%"));
  const navigation = useNavigation();

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const autoScrollInterval = useRef(null);
  const resumeTimeout = useRef(null);
  const currentIndex = useRef(1); // start from 1 (real first)
  const lastIndex = useRef(1); // track last banner to check swipe

  // Normalize products to array and extend with clones for infinite loop
  const baseProducts = Array.isArray(products)
    ? products
    : products
      ? [products]
      : [];
  const extendedProducts =
    baseProducts.length > 1
      ? [
          baseProducts[baseProducts.length - 1],
          ...baseProducts,
          baseProducts[0],
        ]
      : baseProducts;

  // Fetch banners on focus
  useFocusEffect(
    useCallback(() => {
      if (!props.data || !props.data.PageBoilerPlateMapParameters) {
        console.warn(
          "PageBoilerPlateMaps is not properly formatted",
          props.data
        );
        return;
      }

      const bannerTypeParam = props.data.PageBoilerPlateMapParameters.find(
        (entry) => entry.ParameterName === "BannerType"
      );

      if (bannerTypeParam) {
        fetchProduct(bannerTypeParam.ParameterValue);
      }
    }, [props.data])
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

  const handleProductShow = (item) => {
    try {
      if (item.Link) {
        let parsed = JSON.parse(item.Link);
        console.log("parsed", parsed);
        // // 🔄 Rename filterBy → searchBy
        // if (parsed.params?.filterBy) {
        //   parsed.params.searchBy = parsed.params.filterBy;
        //   delete parsed.params.filterBy;
        // }

        // // 🔄 Rename filterValue → searchVal
        // if (parsed.params?.filterValue) {
        //   parsed.params.searchVal = parsed.params.filterValue;
        //   delete parsed.params.filterValue;
        // }

        parsed.params.isCategory = false;
        // const { route, params } = JSON.parse(item.Link);
        const { route, params } = parsed;
        if (route) navigation.navigate(route, params);
      }
    } catch (error) {
      console.error("❌ Error parsing navigation link:", error.message);
    }
  };

  // Auto-scroll
  const startAutoScroll = () => {
    if (
      extendedProducts.length > 1 &&
      !loading &&
      !autoScrollInterval.current
    ) {
      autoScrollInterval.current = setInterval(() => {
        currentIndex.current += 1;
        scrollViewRef.current?.scrollTo({
          x: currentIndex.current * SCREEN_WIDTH,
          animated: true,
        });
      }, 4000);
    }
  };

  const stopAutoScroll = () => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
    if (resumeTimeout.current) {
      clearTimeout(resumeTimeout.current);
      resumeTimeout.current = null;
    }
  };

  useEffect(() => {
    if (extendedProducts.length > 1 && !loading && scrollViewRef.current) {
      // Jump to the first real banner
      scrollViewRef.current.scrollTo({ x: SCREEN_WIDTH, animated: false });
      currentIndex.current = 1;
      lastIndex.current = 1;
      startAutoScroll();
    }
    return () => stopAutoScroll();
  }, [products, loading]);

  // When user starts dragging → stop auto-scroll
  const handleScrollBeginDrag = () => {
    stopAutoScroll();
  };

  // Loop reset logic + resume auto-scroll
  const handleMomentumScrollEnd = () => {
    const index = Math.round(scrollX._value / SCREEN_WIDTH);

    if (index === extendedProducts.length - 1) {
      // reached fake first → reset to real first
      currentIndex.current = 1;
      scrollViewRef.current.scrollTo({ x: SCREEN_WIDTH, animated: false });
    } else if (index === 0) {
      // reached fake last → reset to real last
      currentIndex.current = extendedProducts.length - 2;
      scrollViewRef.current.scrollTo({
        x: (extendedProducts.length - 2) * SCREEN_WIDTH,
        animated: false,
      });
    } else {
      currentIndex.current = index;
    }

    // ✅ Resume auto-scroll ONLY if user swiped to a new banner
    // if (currentIndex.current !== lastIndex.current) {
    setTimeout(() => {
      startAutoScroll();
    }, 1000);

    lastIndex.current = currentIndex.current;
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      key={index}
      style={{
        width: SCREEN_WIDTH,
        height: carouselHeight,
        alignItems: "center",
        justifyContent: "center",
      }}
      onPress={() => handleProductShow(item)}
    >
      <Image
        style={{
          width: wp("90%"),
          height: "100%",
          borderRadius: 20,
          backgroundColor: "white",
        }}
        source={{ uri: item.BannerFile }}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: hp("5%"),
        },
      ]}
    >
      {loading ? (
        <View
          style={{
            width: SCREEN_WIDTH,
            height: carouselHeight,
            borderRadius: 15,
            overflow: "hidden",
          }}
        >
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
          onScrollBeginDrag={handleScrollBeginDrag} // 👈 added
          onMomentumScrollEnd={handleMomentumScrollEnd} // 👈 updated
          scrollEventThrottle={16}
          style={{
            width: SCREEN_WIDTH,
            height: carouselHeight,
          }}
        >
          {Array.isArray(extendedProducts) &&
            extendedProducts.map((item, index) => renderItem({ item, index }))}
        </Animated.ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    width: wp("100%"),
  },
});

export default MobileBigBanners;
