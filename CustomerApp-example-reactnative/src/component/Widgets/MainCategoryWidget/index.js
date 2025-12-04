import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import CategoryService from "../../../services/categoryService";

import { Skeleton } from "moti/skeleton";
import appSettings from "../../../../Client/appSettings";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";

const client = process.env.CLIENT;

const MainCategoryWidget = (props) => {
  const AppSettings = appSettings[client];
  const ShopByCategoryText = AppSettings?.ShopByCategoryText;
  const MainCategoryWidgetNOC = AppSettings?.MainCategoryWidgetNOC;
  // console.log("shopcategory",ShopByCategoryText);


  const [products, setProducts] = useState([]);
  const navigation = useNavigation();
  const { t ,i18n} = useTranslation();

  const [styles, setStyle] = useState(ClientStyles(client, "MainCategoryWidget"));
  const Boilerplate = props?.data;
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      // ❌ Don't fetch again if products already loaded
      if (products?.length > 0) {
        return;
      }

      const selectedBoilerplate = Boilerplate?.find(
        (item) => item?.Name === "main-category-widget"
      );

      if (selectedBoilerplate?.BoilerPlateID) {
        fetchProduct(selectedBoilerplate);
      }
    }, [Boilerplate, products])
  );

  useEffect(() => {
    const clientStyle = ClientStyles(client, "MainCategoryWidget");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, [client]);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async (selectedBoilerplate) => {
    const currentLanguage = i18n.language;
    if (!selectedBoilerplate || !selectedBoilerplate.BoilerPlateID) {
      if (selectedBoilerplate) {
        console.log(selectedBoilerplate.BoilerPlateID);
      }
      console.warn(
        "MainCategoryWidget:- fetchProduct called with invalid boilerplate data"
      );
      return;
    }
    try {
      setLoading(true);

      const payload = {
        LanguageCode: currentLanguage,
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
      console.log("API Response#:", data[0]);
      // const allCatalogs = data.FacetsDetails.flatMap(
      //   (group) => group.FaceItems
      // );
      setProducts(data);
      // console.log('Extracted Products:', allCatalogs);
    } catch (error) {
      console.error("Error fetching API data:", error);
    } finally {
      setTimeout(() => setLoading(false), 800); // Always run this after try/catch — success or fail
    }
  };
  // console.log("f i r s t",products)

  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        {ShopByCategoryText && ShopByCategoryText.length > 0 ? (
          loading ? (
            // 🔸 Skeleton Header Placeholder
            <View style={styles.dshMenuTitle}>
              <Skeleton width={150} height={20} radius={4} colorMode="light" />
              <Skeleton width={60} height={16} radius={4} colorMode="light" />
            </View>
          ) : (
            <View style={styles.dshMenuTitle}>
              <Text style={styles.widgetTitle}> {t(ShopByCategoryText)} </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Category", { products: products })
                }
              >
                {client === "benchmarkfoods" ? (
                  <Image
                    style={styles.arrow}
                    source={require("../../../assets/images/client/benchmarkfoods/arrow.png")}
                    contentFit="contain"
                    cachePolicy="memory"
                  />
                ) : (
                  <Text style={styles.viewAll}>{ShopByCategoryText?.length > 0 && t("view_all")} </Text>
                )}
              </TouchableOpacity>
            </View>
          )
        ) : null}
        <View style={styles.imageContainer}>
          <FlatList
            data={products}

            numColumns={MainCategoryWidgetNOC}     //Defined No of columns
            style={styles.flatList}
            keyExtractor={(item, index) => String(index)}
            renderItem={({ item, index }) => {
              // console.log(item);
              // console.log(item.ItemImage);
              // DummyData condition if case not needed
              if (item.ImageName !== null)
                return (
                  <>
                    {loading ? (
                      // 🔄 Full Card Skeleton (1 for each item)
                      <View
                        style={{
                          alignItems: "center",
                          width: 100,
                          marginTop: 5,
                        }}
                      >
                        <Skeleton
                          height={70}
                          width={90}
                          radius={6}
                          colorMode="light"
                        />
                        <View style={{ marginTop: 5 }}>
                          <Skeleton
                            height={14}
                            width={60}
                            radius={4}
                            colorMode="light"
                            style={{ marginTop: 10 }}
                          />
                        </View>
                      </View>
                    ) : (
                      <>
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
                          style={styles.TouchableOpacity}
                        >
                          <View style={styles.imageView}>
                            <Image
                              style={styles.image}
                              source={{ uri: item.ImageName }}
                              contentFit="cover"
                              transition={200}
                              cachePolicy="memory-disk"
                            />
                          </View>

                          <Text style={styles.itemName}>
                            {item.CategoryName}
                          </Text>
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

export default MainCategoryWidget;
