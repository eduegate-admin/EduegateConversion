import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import styles from "./style";
import QuantitySelector from "../../QuantitySelector/Quantity";
import colors from "../../../config/colors";
import ProductService from "../../../services/productService";

import { useTranslation } from "react-i18next";

const InspiredProductHorizontalSlide = (props) => {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const { t } = useTranslation();

  const boilerplates = props.data?.filter(
    (item) => item.Name === "product list horizontal slide"
  );

  const title = props?.title;
  const BoilerplateMapIID = Array.isArray(props?.BoilerplateMapIID)
    ? props.BoilerplateMapIID[0]
    : props?.BoilerplateMapIID;
  let boilerplate;
  boilerplates?.forEach((bp) => {
    if (bp.BoilerplateMapIID === BoilerplateMapIID) {
      boilerplate = bp;
    }
  });

  // const title = boilerplate.RuntimeParameters?.find((param) => param.Key === "Title")?.Value || "Featured Products";

  useEffect(() => {
    if (boilerplate) {
      fetchProduct();
    }
  }, [boilerplate]);

  const fetchProduct = async () => {
    try {
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

      setProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching API data:", error);
    }
  };

  const handlePress = (productId) => {
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
  if (products.ProductListingImage) {
    return (
      <View style={styles.container}>
        <View style={styles.dshMenuCnt}>
          <View style={styles.dshMenuTitle}>
            <Text style={styles.widgetTitle}>{title}</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>{t("view_all")}</Text>
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
              const productId = item.SKUID;
              const quantity = quantities[productId] || 0;

              if (item.ItemImage !== null)
                return (
                  <View style={styles.widget}>
                    <TouchableOpacity style={styles.imageTouchView}>
                      <Image
                        style={styles.images}
                        source={{ uri: item.ProductListingImage }}
                        contentFit="cover"
                        transition={200}
                        cachePolicy="memory-disk"
                      />
                    </TouchableOpacity>
                    <View style={styles.textView}>
                      <View style={styles.PriceCommonView}>
                        <Text style={styles.ProductPrice}>
                          {item.ProductPrice}
                        </Text>
                        <Text style={styles.AedText}>AED</Text>
                      </View>
                      <Text style={styles.ProductName}>{item.ProductName}</Text>
                    </View>

                    {quantity === 0 ? (
                      <TouchableOpacity onPress={() => handlePress(productId)}>
                        <View
                          style={{
                            paddingHorizontal: 26,
                            paddingVertical: 7,
                            borderRadius: 30,
                            backgroundColor: colors.green,
                          }}
                        >
                          <Text style={{ color: "white", fontSize: 17 }}>
                            Add
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
                  </View>
                );
            }}
          />
        </View>
      </View>
    );
  }
};

export default InspiredProductHorizontalSlide;
