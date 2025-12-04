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

import CategoryService from "../../../services/categoryService";
import { useTranslation } from "react-i18next";
import { RFValue } from "react-native-responsive-fontsize";
import { Skeleton } from "moti/skeleton";
// import styles from "./style";

const client = process.env.CLIENT;

const CategorySlider = (props) => {
  const navigation = useNavigation();
  const { t ,i18n} = useTranslation();
  const windowWidth = 107.5;
  const [styles, setStyle] = useState(ClientStyles(client, "categorySlider"));
  const [products, setProducts] = useState([]);
  const Boilerplate = props?.data;
  const [loading, setLoading] = useState(true);

  const BoilerplateData = Boilerplate?.BoilerPlateParameters ?? [];
  console.log("0002000item",BoilerplateData)

   useFocusEffect(
      useCallback(() => {
        fetchProduct();
      }, [])
    );

  useFocusEffect(
    useCallback(() => {
      if (products?.length > 0) {
        return;
      }
      const selectedBoilerplate = Boilerplate?.find(
        (item) => item?.Name === "category slider"
      );

      if (selectedBoilerplate?.BoilerPlateID) {
        fetchProduct(selectedBoilerplate);
      }
    }, [Boilerplate, products])
  );

  useEffect(() => {
    const clientStyle = ClientStyles(client, "categorySlider");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
   }
  }, [client]);

  const fetchProduct = async (selectedBoilerplate) => {
    if (!selectedBoilerplate || !selectedBoilerplate.BoilerPlateID) {
      console.warn(
        "CategorySlider:-fetchProduct called with invalid boilerplate data"
      );
      return;
    }
    try {
      setLoading(true);

      const payload = {
        LanguageCode: i18n.language,
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
      // console.log("payload",payload);

      const response =
        await CategoryService.getCategoriesByBoilerplage(payload);
      const data = response.data;
      // console.log("API Response#:", data[0]);
      // const allCatalogs = data.FacetsDetails.flatMap(
      //   (group) => group.FaceItems
      // );
      setProducts(data);
      // console.log('Extracted Products:', allCatalogs);
    } catch (error) {
      console.error("Error fetching API data:", error);
    } finally {
      setTimeout(() => setLoading(false), 100); // Always run this after try/catch — success or fail
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dshMenuCnt}>
        {loading ? (
          <View style={styles.dshMenuTitle}>
            <Skeleton width={150} height={20} radius={4} colorMode="light" />
            <Skeleton width={60} height={16} radius={4} colorMode="light" />
          </View>
        ) : (
          <View style={styles.dshMenuTitle}>
            {client === "almadina" ? (
              <Text style={styles.widgetTitle}>
                {t("shop_by_category")}
              </Text>
            ) : client === "benchmarkfoods" ? (
              <TouchableOpacity>
                <Text style={styles.widgetTitle}>Re Order</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.widgetTitle}>Category</Text>
            )}

            {client === "benchmarkfoods" ? (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ReOrder", { products: products })
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
        )}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={{ paddingHorizontal: wp("4.44%") }}
          keyExtractor={(item, index) => String(index)}
          data={products}
          renderItem={({ item, index }) => {
            if (item.ImageName !== null && item.key !== null)
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
                      <View style={styles.touch}>
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("ProductListing", {
                              title: `${item.CategoryName}`,
                              searchVal: `${"Category:" + item.CategoryIID}`,
                              searchText: `${""}`,
                              searchBy: `${""}`,
                              sortBy: `${"relevance"}`,
                              isCategory: true,
                              pageType: `${""}`,
                              showBackButton: true,
                            })
                          }
                          style={styles.imageView}
                        >
                          <Image
                            style={styles.images}
                            source={{ uri: item.ImageName }}
                            contentFit="cover"
                            transition={200}
                            cachePolicy="memory-disk"
                          />
                        </TouchableOpacity>
                        <View>
                          <Text style={styles.Text} numberOfLines={2}>
                            {item.CategoryName}
                          </Text>
                        </View>
                      </View>
                    </>
                  )}
                </>
              );
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: wp("100%"),
    marginTop: hp("0.75%"),
    backgroundColor: "#FFFFFF",
  },
  dshMenuCnt: {
    backgroundColor: "#FFFFFF",
  },
  dshMenuTitle: {
    width: wp("91.11%"),
    marginHorizontal: wp("4.44%"),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom:hp('1.25%'),
  },
  widgetTitle: {
    fontSize: RFValue(18, 800),
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#525252",
  },
  viewAll: {
    color: "#34B067",
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    fontSize: RFValue(12, 800),
  },
  touch: {
    backgroundColor: "#ffffffff",
    marginRight: 1,
    width: wp("22.78%"),
    alignItems:"center",
  },
  imageView: {
    backgroundColor: "#EEF4EE",
    borderRadius: 50,
    borderWidth: wp("0.5%"),
    borderColor: "#01AC67",
    height: wp('18.61%'),
    width: wp('18.61%'),
    resizeMode: "contain",
    alignItems: "center",
    justifyContent: "center",
  },
  images: {
   height: wp("16.62%"),
    width: wp("16.62%"),
    resizeMode: "cover",
    backgroundColor: "#EEF4EE",
    borderRadius: 50,
  },
  Text: {
    textAlign:"center",
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    fontSize: RFValue(12, 800),
    color: "#252525",
  },
});

export default CategorySlider;
