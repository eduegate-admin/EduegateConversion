import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import styles from "./style";
// import QuantitySelector from "../../QuantitySelector/Quantity";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";

const RelativeProducts = ({ data }) => {
  const [products, setProducts] = useState([]);
  // const { updateCart } = useCart();
  const { t } = useTranslation();

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = () => {
    setProducts(data);
    // console.log("Data000000", products);
  };
  //   const fetchProduct = async () => {
  //     try {
  //       const storedContext = await AsyncStorage.getItem("@CallContext");
  //       const parsedContext = JSON.parse(storedContext);
  //       const authToken = await AsyncStorage.getItem("authToken");
  //       const payload = {};
  //       const response = await CartService.getCartSuggestions(
  //         parsedContext,
  //         authToken,
  //         payload
  //       );

  //       setProducts(response.data?.Datas[0] || []);
  //     } catch (error) {
  //       console.error("Error fetching getCartSuggestions API data:", error);
  //     }
  //   };

  //   const handlePress = async (productId) => {
  //     try {
  //       const storedContext = await AsyncStorage.getItem("@CallContext");
  //       const currency = storedContext.CurrencyCode;
  //       const callContext = JSON.parse(storedContext);
  //       const parsedContext = JSON.parse(storedContext);
  //       const authToken = await AsyncStorage.getItem("authToken");
  //       const user = await UserService.getUserDetails(parsedContext, authToken);
  //       const BranchID = user?.data?.Branch?.BranchIID;
  //       // console.log("result",BranchID)
  //       const payload = {
  //         BranchID: BranchID,
  //         CartItemNote: "",
  //         Currency: currency,
  //         MaximumQuantityInCart: productId,
  //         ProductOptionID: "",
  //         Quantity: 1,
  //         SKUID: productId,
  //       };
  //       // console.log(payload);
  //       const response = await CartService.addToCart(payload, callContext);
  //       if (!response.status) {
  //         throw new Error(`HTTP Error! Status: ${response.status}`);
  //       }
  //       const data = await response.data;
  //       console.log("Add to Cart response:", data);
  //       await updateCart();
  //     } catch (error) {
  //       console.error("Error fetching getCartSuggestions API data:", error);
  //     }
  //   };
  //   if (products !== null)
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FFFFFF", "#DEECFA"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientButton}
      >
        <View style={styles.commonView}>
          <View style={styles.widgetTitleView}>
            <Text style={styles.widgetTitle}>Related Products</Text>
            <TouchableOpacity>
            <Image
            style={styles.arrowImage}
            source={require("../../../assets/images/client/benchmarkfoods/arrow.png")}
            contentFit="contain"
            cachePolicy="memory"
            />
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            contentContainerStyle={{ padding: 5 }}
            keyExtractor={(item, index) => String(index)}
            data={products}
            renderItem={({ item }) => {
              const productId = item.id;
              // const quantity = quantities[productId] || 0;

              if (item.ItemImage !== null)
                return (
                  <View style={styles.widget}>
                    <TouchableOpacity style={styles.imageTouchView}>
                      <Image style={styles.images} source={{uri: item.ItemImage}} contentFit="cover" transition={200} cachePolicy="memory-disk" />
                    </TouchableOpacity>
                    <View style={styles.textView}>
                      <Text numberOfLines={1} style={styles.ProductName}>
                        {item.name}
                      </Text>
                      <Text style={styles.rateText}>{item.rate}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.AddButtonView}
                      onPress={() => {}}
                    >
                      <LinearGradient
                        colors={["#1D9ADC", "#0B489A"]}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientButton2}
                      >
                        <Text style={styles.AddText}>Select Option</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                );
            }}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

export default RelativeProducts;
