import { View, Text, FlatList } from "react-native";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
// import styles from "./style";
import QuantitySelector from "../../QuantitySelector/Quantity";
import ProductService from "../../../services/productService";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";
import { LinearGradient } from "expo-linear-gradient";
import { Skeleton } from "moti/skeleton";

const client = process.env.CLIENT;

const MobileHomePageCategoryProducts = (props) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [styles, setStyle] = useState(
    ClientStyles(client, "MobileHomePageCategoryProducts")
  );
  const windowWidth = 107.5;
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState(0);
  const [loading, setLoading] = useState(true);
  const boilerplates = props.data?.filter(
    (item) => item.Name === "Mobile HomePage Category Products"
  );

  // console.log("boilerplates", boilerplates);
  const title = props?.title;
  const BoilerplateMapIID = Array.isArray(props?.BoilerplateMapIID)
    ? props.BoilerplateMapIID[0]
    : props?.BoilerplateMapIID;
  // console.log("BoilerplateMapIID",BoilerplateMapIID);
  let boilerplate;
  boilerplates?.forEach((bp) => {
    if (bp.BoilerplateMapIID === BoilerplateMapIID) {
      boilerplate = bp;
    }
  });

  useEffect(() => {
    const clientStyle = ClientStyles(client, "MobileHomePageCategoryProducts");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, [client]);

  useEffect(() => {
    // if (boilerplate) {
    fetchProduct();
    // }
  }, [boilerplate]);

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const payload = {
        BoilerPlateID: boilerplate.BoilerPlateID,
        BoilerPlateParameters: boilerplate.BoilerPlateParameters,
        BoilerplateMapIID: boilerplate.BoilerplateMapIID,
        Compatibility: boilerplate.Compatibility,
        CreatedBy: boilerplate.CreatedBy,
        CreatedDate: boilerplate.CreatedDate,
        Description: boilerplate.Description,
        DesignTemplate: boilerplate.DesignTemplate,
        Name: boilerplate.Name,
        PageID: boilerplate.PageID,
        ReferenceID: boilerplate.ReferenceID,
        ReferenceIDName: boilerplate.ReferenceIDName,
        ReferenceIDRequired: boilerplate.ReferenceIDRequired,
        RuntimeParameters: boilerplate.RuntimeParameters,
        SerialNumber: boilerplate.SerialNumber,
        Template: boilerplate.Template,
        TimeStamps: boilerplate.TimeStamps,
        UpdatedBy: boilerplate.UpdatedBy,
        UpdatedDate: boilerplate.UpdatedDate,
      };

      // console.log("payload", payload);
      const response = await ProductService.getProductsByBoilerplage(payload);

      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching API data:", error);
    } finally {
      setTimeout(() => setLoading(false), 600); // Always run this after try/catch — success or fail
    }
  };
  // console.log("//////", products);
  const handlePress = (productId) => {
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
  };
  const setQuantity = (productId, quantity) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: quantity,
    }));
  };
  // console.log("title", title);
  return (
    // <View style={styles.dshMenuSc}>
    <View style={styles.container}>
      <View style={styles.dshMenuCnt}>
        <View style={styles.dshMenuCnt}>
          {loading ? (
            // 🔸 Skeleton Header Placeholder
            <View style={styles.dshMenuTitle}>
              <Skeleton width={150} height={20} radius={4} colorMode="light" />
              <Skeleton width={60} height={16} radius={4} colorMode="light" />
            </View>
          ) : (
            <View style={styles.dshMenuTitle}>
              <Text style={styles.widgetTitle}>{title}</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Category", { products: products })
                }
              >
                {client === "benchmarkfoods" ? null : (
                  <Text style={styles.viewAll}>{t("view_all")}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          <FlatList
            numColumns={2}
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            style={styles.flatList}
            keyExtractor={(item, index) => String(index)}
            data={products}
            renderItem={({ item, index }) => {
              const productId = item.ProductID;
              const quantity = quantities[productId] || 0;
              // console.log("index", item);
              // DummyData condition if case not needed
              if (item.ProductListingImage !== null && index < 6)
                return (
                  <>
                    {loading ? (
                      // 🔄 Full Card Skeleton (1 for each item)
                      <View style={styles.skeletonCard}>
                        <Skeleton
                          height={100}
                          width={100}
                          radius={8}
                          colorMode="light"
                        />

                        <Skeleton
                          height={12}
                          width={90}
                          radius={4}
                          colorMode="light"
                          style={{ marginTop: 8 }}
                        />
                        <Skeleton
                          height={12}
                          width={50}
                          radius={4}
                          colorMode="light"
                          style={{ marginTop: 6 }}
                        />

                        <Skeleton
                          height={28}
                          width={60}
                          radius={20}
                          colorMode="light"
                          style={{ marginTop: 10 }}
                        />

                        {/* Heart Icon placeholder */}
                        <View style={styles.wishlistSkeletonIcon}>
                          <Skeleton
                            height={20}
                            width={20}
                            radius={10}
                            colorMode="light"
                          />
                        </View>
                      </View>
                    ) : (
                      <>
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("ProductDetails", {
                              item: item,
                            })
                          }
                          key={index}
                          style={styles.widget}
                        >
                          <TouchableOpacity
                            onPress={() =>
                              navigation.navigate("ProductDetails", {
                                item: item,
                              })
                            }
                            style={styles.imageTouchView}
                          >
                            <Image
                              style={styles.images}
                              source={{ uri: item.ProductListingImage }}
                              contentFit="cover"
                              transition={200}
                              cachePolicy="memory-disk"
                            />
                          </TouchableOpacity>
                          {client === "benchmarkfoods" ? (
                            <View style={styles.textView}>
                              <Text
                                numberOfLines={2}
                                style={styles.ProductName}
                              >
                                {item.ProductName}
                              </Text>
                              <View style={styles.PriceCommonView}>
                                <Text style={styles.AedText}>
                                  {item.Currency}
                                </Text>
                                <Text style={styles.ProductPrice}>
                                  {item.ProductPrice}
                                </Text>
                              </View>
                            </View>
                          ) : (
                            <View style={styles.textView}>
                              <View style={styles.PriceCommonView}>
                                <Text style={styles.ProductPrice}>
                                  {item.ProductPrice}
                                </Text>
                                <Text style={styles.AedText}>
                                  {item.Currency}
                                </Text>
                              </View>
                              <Text
                                numberOfLines={2}
                                style={styles.ProductName}
                              >
                                {item.ProductName}
                              </Text>
                            </View>
                          )}

                          {client === "benchmarkfoods" ? (
                            <TouchableOpacity
                              style={styles.quantityTouchable}
                              onPress={() =>
                                navigation.navigate("ProductDetails", {
                                  item: item,
                                })
                              }
                            >
                              <View style={styles.addToCartButton}>
                                <LinearGradient
                                  colors={["#1D9ADC", "#0B489A"]}
                                  start={{ x: 1, y: 0 }}
                                  end={{ x: 1, y: 1 }}
                                  style={styles.gradientButton}
                                >
                                  <Text style={styles.addToCartText}>
                                    Select Option
                                  </Text>
                                </LinearGradient>
                              </View>
                            </TouchableOpacity>
                          ) : (
                            <>
                              {quantity === 0 ? (
                                <TouchableOpacity
                                  style={styles.quantityTouchable}
                                  onPress={() => handlePress(productId)}
                                >
                                  <View style={styles.addToCartButton}>
                                    <Text style={styles.addToCartText}>
                                      Add to Cart
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              ) : (
                                <QuantitySelector
                                  quantity={quantity}
                                  setQuantity={(newQuantity) =>
                                    setQuantity(productId, newQuantity)
                                  }
                                />
                              )}
                            </>
                          )}
                        </TouchableOpacity>
                      </>
                    )}
                  </>
                );
            }}
          />
        </View>
      </View>
    </View>
  );
};
export default MobileHomePageCategoryProducts;
