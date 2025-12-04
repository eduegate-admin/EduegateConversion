import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
// import styles from "./style";
import { FlatList } from "react-native";
import ProductService from "../../../services/productService";
import { useNavigation } from "@react-navigation/native";
import { Skeleton } from "moti/skeleton";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";
const client = process.env.CLIENT;

const BrandWidget = (props) => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const boilerplates = props.data?.filter(
    (item) => item.Name === "Brand widget"
  );
  const [styles, setStyle] = useState(ClientStyles(client, "BrandWidget"));

  useEffect(() => {
    const clientStyle = ClientStyles(client, "BrandWidget");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, [client]);
  // console.log("boilerplates",boilerplates);
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
  // console.log("boilerplate",boilerplate);
  useEffect(() => {
    if (boilerplate) {
      fetchProduct();
    }
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
      const response = await ProductService.getBrandsByBoilerplage(payload);
      const result = response.data.Items;
      setProducts(result);
    } catch (error) {
      console.error("Error fetching API data:", error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dshMenuCnt}>
        {loading ? (
          <View style={styles.dshMenuTitle}>
            <Skeleton width={150} height={20} radius={4} colorMode="light" />
          </View>
        ) : (
          <View style={styles.dshMenuTitle}>
            <Text style={styles.widgetTitle}>{title}</Text>
          </View>
        )}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={{ padding: 5 }}
          keyExtractor={(item, index) => String(index)}
          data={products}
          renderItem={({ item, index }) => {
            return loading ? (
              // 🔸 Show skeleton while loading
              <View style={{ marginRight: 12, alignItems: "center" }}>
                <Skeleton
                  width={64}
                  height={64}
                  radius="round"
                  colorMode="light"
                />
              </View>
            ) : item.ImageUrl ? (
              // 🔸 Actual content after loading
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ProductListing", {
                    title: `${item.Name}`,
                    searchVal: `Brand:${item.ReferenceID}`,
                    searchText: "",
                    searchBy: "",
                    sortBy: "relevance",
                    isCategory: false,
                    pageType: "",
                  })
                }
                style={styles.widget}
              >
                <View style={styles.imageTouchView}>
                  <Image
                    style={styles.images}
                    source={{ uri: item.ImageUrl }}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                  />
                </View>
              </TouchableOpacity>
            ) : null;
          }}
        />
      </View>
    </View>
  );
};
export default BrandWidget;
