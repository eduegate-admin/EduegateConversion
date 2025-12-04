import React, { useCallback, useEffect, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { FlatList } from "react-native";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Skeleton } from "moti/skeleton";
import ProductService from "../../../services/productService";
import { RFValue } from "react-native-responsive-fontsize";

const client = process.env.CLIENT;

const ReorderWidget = (props) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const windowWidth = 107.5;
  const [styles, setStyle] = useState(ClientStyles(client, "ReorderWidget"));
  const [products, setProducts] = useState([]);
  const Boilerplate = props?.data;
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const selectedBoilerplate = Boilerplate?.find(
        (item) => item?.Name === "ReOrder page"
      );

      if (selectedBoilerplate?.BoilerPlateID) {
        fetchProduct(selectedBoilerplate);
      }
    }, [Boilerplate])
  );

  useEffect(() => {
    const clientStyle = ClientStyles(client, "ReorderWidget");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, [client]);

  const fetchProduct = async (selectedBoilerplate) => {
    if (!selectedBoilerplate || !selectedBoilerplate.BoilerPlateID) {
      console.warn(
        "ReorderWidget:-fetchProduct called with invalid boilerplate data"
      );
      return;
    }
    try {
      setLoading(true);

      const payload = {
        BoilerPlateID: selectedBoilerplate.BoilerPlateID,
        BoilerPlateParameters: selectedBoilerplate.BoilerPlateParameters,
        BoilerplateMapIID: selectedBoilerplate.BoilerplateMapIID,
        Compatibility: selectedBoilerplate.Compatibility,
        CreatedBy: selectedBoilerplate.CreatedBy,
        CreatedDate: selectedBoilerplate.CreatedDate,
        Description: selectedBoilerplate.Description,
        DesignTemplate: selectedBoilerplate.DesignTemplate,
        Name: selectedBoilerplate.Name,
        PageID: selectedBoilerplate.PageID,
        ReferenceID: selectedBoilerplate.ReferenceID,
        ReferenceIDName: selectedBoilerplate.ReferenceIDName,
        ReferenceIDRequired: selectedBoilerplate.ReferenceIDRequired,
        RuntimeParameters: selectedBoilerplate.RuntimeParameters,
        SerialNumber: selectedBoilerplate.SerialNumber,
        Template: selectedBoilerplate.Template,
        TimeStamps: selectedBoilerplate.TimeStamps,
        UpdatedBy: selectedBoilerplate.UpdatedBy,
        UpdatedDate: selectedBoilerplate.UpdatedDate,
      };

      const response = await ProductService.getProductsByBoilerplage(payload);

      const data = response.data;
      setProducts(data);
    } catch (error) {
      console.error("Error fetching API data:", error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };
  // console.log("ReOreder products", products);
  return (
    <View style={styles.container}>
      <View style={styles.dshMenuCnt}>
        {loading ? (
          <View style={styles.dshMenuTitle}>
            <Skeleton width={150} height={20} radius={4} colorMode="light" />
            <Skeleton width={60} height={16} radius={4} colorMode="light" />
          </View>
        ) : (
          products.length > 0 && (
            <View style={styles.dshMenuTitle}>
              <TouchableOpacity>
                <Text style={styles.widgetTitle}>Re Order</Text>
              </TouchableOpacity>
              {client === "benchmarkfoods" ? (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("ProductListing", {
                      title: "Re Order",
                      searchVal: `${"skutab:REORDER"}`,
                      searchText: `${""}`,
                      searchBy: `${""}`,
                      sortBy: `${"relevance"}`,
                      isCategory: `${false}`,
                      pageType: `${"Recommended"}`,
                    })
                  }
                >
                  <Image
                    style={styles.arrow}
                    source={require("../../../assets/images/client/benchmarkfoods/arrow.png")}
                    contentFit="contain"
                    cachePolicy="memory"
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("Category", { products: products })
                  }
                >
                  <Text style={styles.viewAll}>{t("view_all")}</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        )}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={{ padding: 5 }}
          keyExtractor={(item, index) => String(index)}
          data={products}
          renderItem={({ item, index }) => {
            // console.log(item);
            // DummyData condition if case not needed
            if (item.ProductListingImage !== null)
              return (
                <>
                  {loading ? (
                    <View
                      style={{
                        alignItems: "center",
                        width: 100,
                        marginRight: 15,
                      }}
                    >
                      <Skeleton
                        height={100}
                        width={100}
                        radius={6}
                        colorMode="light"
                      />
                      <View style={{ marginTop: 10 }}>
                        <Skeleton
                          height={14}
                          width={60}
                          radius={4}
                          colorMode="light"
                        />
                      </View>
                    </View>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("ProductDetails", {
                            item,
                            products,
                          })
                        }
                        style={styles.touch}
                      >
                        <View style={styles.imageView}>
                          <Image
                            style={styles.images}
                            source={{ uri: item.ProductListingImage }}
                            contentFit="cover"
                            transition={200}
                            cachePolicy="memory-disk"
                          />
                        </View>
                        <View>
                          <Text style={styles.Text} numberOfLines={3}>
                            {item.ProductName}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              );
          }}
        />
      </View>
    </View>
    // </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: wp("100%"),
    // paddingHorizontal: 10,
    // paddingBottom: 10,
    paddingTop: hp("1%"),
    // backgroundColor: "#000",
    marginBottom: hp("2%"),
  },
  arrow: {
    resizeMode: "contain",
    width: wp("6.67%"),
    height: wp("6.67%"),
    elevation: 5,
    borderRadius: 50,
    backgroundColor: "white",
  },
  dshMenuCnt: {
    // paddingTop: 15,
    paddingHorizontal: wp("1.8%"),
    // backgroundColor: "white",
    // borderRadius: 15,
  },
  dshMenuTitle: {
    // width:wp("100%"),
    paddingHorizontal: wp("1.8%"),
    // marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  widgetTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
    color: "#525252",
    left: wp("1.5%"),
    fontFamily: "Poppins-SemiBold",
  },
  viewAll: {
    color: "black",
    fontSize: 15,
  },
  touch: {
    // backgroundColor: 'green',
    marginHorizontal: wp("0.5%"),
    width: wp("30%"),
    alignItems: "center",
    // gap: hp('0%')
    // backgroundColor: 'black',
  },
  imageView: {
    // elevation: 35,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    height: wp("28%"),
    width: wp("28%"),
    resizeMode: "contain",
    // margin: 4,
    alignItems: "center",
    justifyContent: "center",
    // marginHorizontal: 10,
  },
  images: {
    // margin: 4,
    // flexWrap: "wrap",
    // flexBasis: 1,
    height: wp("28%"),
    width: wp("28%"),
    resizeMode: "contain",
    // padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#ABE2FF",
  },
  Text: {
    // backgroundColor: "#1AD",
    alignItems: "center",
    textAlign: "center",
    width: wp("28.22%"),
    // bottom: -5,
    fontSize: RFValue(12, 800),
    fontWeight: "regular",
    color: "#525252",
    overflow: "hidden",
    fontFamily: "Poppins-Regular",
    // marginTop: hp('3%'),
  },
});

export default ReorderWidget;
