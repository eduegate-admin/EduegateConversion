import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import { useTranslation } from "react-i18next";
import OrderService from "../../../services/orderService";
import Toast from "react-native-toast-message";
import QuantitySelector from "../../../component/QuantitySelector/Quantity";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import CustomHeader from "../../../component/CustomHeader";
import CommonHeaderRight from "../../../component/CommonHeaderRight";

const client = process.env.CLIENT;

const NormalReOrder = ({ navigation, route }) => {
  const products = route.params.products;
  const [quantities, setQuantities] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        <CustomHeader
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
      title: "Reorder",
    });
  }, [navigation]);

  const handlePress = useCallback(
    (productId) => {
      Toast.show({
        type: "success",
        text1: t("product_added_to_cart"),
        text2: t("go_to_cart_for_checkout"),
        position: "top",
        visibilityTime: 1500,
      });
      setQuantities((prev) => ({
        ...prev,
        [productId]: 1,
      }));
    },
    [t]
  );

  const setQuantity = useCallback((productId, quantity) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: quantity,
    }));
  }, []);

  const handleReorder = useCallback(
    async (item) => {
      if (!item?.TransactionOrderIID) return;
      try {
        const response = await OrderService.ReOrder(
          "",
          item?.TransactionOrderIID
        );
        if (response.status !== 200) {
          console.error("Failed to fetch reorder details");
          return;
        }
        navigation.navigate("Drawer", {
          screen: "Footer",
          params: { screen: "Cart" },
        });
      } catch (error) {
        console.log("failed to fetch", error);
      }
    },
    [navigation]
  );

  const renderProduct = useCallback(
    ({ item, index }) => {
      const productId = item.ProductID;
      const quantity = quantities[productId] || 0;
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate("ProductDetails", { item })}
          key={index}
          style={styles.widget}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("ProductDetails", { item })}
            style={styles.imageTouchView}
          >
            <Image
              style={styles.images}
              source={{ uri: item.ProductListingImage }}
            />
          </TouchableOpacity>
          {client === "benchmarkfoods" ? (
            <View style={styles.textView}>
              <Text numberOfLines={2} style={styles.ProductName}>
                {item.ProductName}
              </Text>
              <View style={styles.PriceCommonView}>
                <Text style={styles.AedText}>{item.Currency}</Text>
                <Text style={styles.ProductPrice}>{item.ProductPrice}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.textView}>
              <View style={styles.PriceCommonView}>
                <Text style={styles.ProductPrice}>{item.ProductPrice}</Text>
                <Text style={styles.AedText}>{item.Currency}</Text>
              </View>
              <Text numberOfLines={2} style={styles.ProductName}>
                {item.ProductName}
              </Text>
            </View>
          )}
          {client === "benchmarkfoods" ? (
            <TouchableOpacity
              style={styles.quantityTouchable}
              onPress={() => handleReorder(item)}
            >
              <View style={styles.addToCartButton}>
                <LinearGradient
                  colors={["#1D9ADC", "#0B489A"]}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.addToCartText}>Re Order </Text>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          ) : quantity === 0 ? (
            <TouchableOpacity
              style={styles.quantityTouchable}
              onPress={() => handlePress(productId)}
            >
              <View style={styles.addToCartButton}>
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <QuantitySelector
              quantity={quantity}
              setQuantity={(newQuantity) => setQuantity(productId, newQuantity)}
            />
          )}
        </TouchableOpacity>
      );
    },
    [navigation, quantities, handlePress, handleReorder, setQuantity]
  );

  return (
    <LinearGradient
      colors={["#DEECFA", "#FFFFFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <FlatList
          numColumns={2}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={styles.flatList}
          keyExtractor={(item, index) => String(index)}
          data={products}
          renderItem={renderProduct}
        />
      </View>
    </LinearGradient>
  );
};

export default NormalReOrder;

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
    // marginTop: 20,
    paddingTop: 10,
    // backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 10,
    // marginBottom: 30,
  },
  widgetTitle: {
    fontSize: 23,
    fontWeight: "600",
    color: "#525252",
    // textAlign:"left",
    marginBottom: 15,
    left: -150,
  },
  flatList: {
    alignItems: "center",
    overflow: "hidden",
    paddingBottom: 15,
  },
  widget: {
    backgroundColor: "#ffffffff",
    marginHorizontal: 3,
    marginVertical: 3,
    height: hp("39%"),
    width: wp("45%"),
    borderRadius: 15,
    elevation: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageTouchView: {
    // backgroundColor: "blue",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    height: hp("25%"),
    width: "100%",
    resizeMode: "contain",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  images: {
    // margin: 4,
    height: "100%",
    width: "100%",
    resizeMode: "cover",
    // backgroundColor: "#000",
  },
  textView: {
    // backgroundColor: "green",
    height: hp("7.5%"),
    width: "85%",
  },
  ProductName: {
    alignItems: "center",
    textAlign: "left",
    marginBottom: 8,
    fontSize: hp("1.9%"),
    fontWeight: "500",
    color: "#525252",
  },
  PriceCommonView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    bottom: 5,
  },
  ProductPrice: {
    alignItems: "center",
    textAlign: "left",
    color: "#525252",
    fontSize: hp("2%"),
    fontWeight: "600",
    left: 5,
  },
  AedText: {
    fontSize: hp("2%"),
    textAlign: "left",
    fontWeight: "600",
    color: "#525252",
    // bottom:5,
  },

  quantityTouchable: {
    // backgroundColor: "green",
    width: "100%",
    height: "16%",
    alignItems: "center",
    justifyContent: "center",
  },
  gradientButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    overflow: "hidden",
  },
  addToCartButton: {
    width: "85%",
    height: "75%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    // backgroundColor: colors.green,
  },
  addToCartText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
