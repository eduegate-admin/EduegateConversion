import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

import CustomSearchBar from "../../../component/CustomSearchBar";
import CustomHeader from "../../../component/CustomHeader";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import SearchService from "../../../services/SearchService";
import appSettings from "../../../../Client/appSettings";
import { useAnalytics } from "../../../hooks/useAnalytics";
import { useTranslation } from "react-i18next";

const client = process.env.CLIENT;

const NormalSearch = ({ navigation }) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const analytics = useAnalytics();

  const { category_Search, product_Search } = appSettings[client];

  useEffect(() => {
    navigation.setOptions({
      header: ({ options, route }) => (
        <CustomHeader
          elevation={-1}
          borderBottomLeftRadius={0.001}
          borderBottomRightRadius={0.001}
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" Customcolor={true} />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
      title: "Search",
    });
  }, [navigation]);

  // Debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchText.trim()) {
        // Track search event
        analytics.trackSearch(searchText.trim());

        if (category_Search) fetchCategories(searchText.trim());
        if (product_Search) fetchProducts(searchText.trim());
      } else {
        setCategories([]);
        setProducts([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchText]);

  const fetchCategories = async (query) => {
    try {
      const response = await SearchService.GetFacetSearch(query);
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async (query) => {
    try {
      const response = await SearchService.GetProductSearch(
        1,
        10,
        query,
        "",
        "",
        "relevance",
        false,
        ""
      );

      const allCatalogs =
        response.data?.CatalogGroups?.flatMap(
          (group) => group.Catalogs || []
        ) || [];
      setProducts(allCatalogs);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const renderCategoryItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.itemTouchable}
        onPress={() =>
          navigation.navigate("ProductListing", {
            title: item.key,
            searchVal: `Category:${item.id}`,
            searchText,
            searchBy: "",
            sortBy: "relevance",
            isCategory: false,
            pageType: "",
            showBackButton: true,
          })
        }
      >
        <Image source={{ uri: item.ItemImage }} style={styles.itemImage} />
        <View style={styles.itemTextContainer}>
          <Text
            style={[styles.itemText, { color: "#B2B2B2" }]}
            numberOfLines={1}
          >
            {searchText}
          </Text>
          <Text style={styles.itemText}>in {item.key}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderProductItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.itemTouchable}
        onPress={() => navigation.navigate("ProductDetails", { item })}
      >
        <Image
          source={{ uri: item.ProductListingImage }}
          style={styles.itemImage}
        />
        <Text style={styles.itemText}>{item.ProductName}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {(category_Search || product_Search) && (
        <View style={styles.searchBarContainer}>
          <CustomSearchBar
            placeholder={t("search_for_products")}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => {
              navigation.navigate("ProductListing", {
                searchVal: "",
                searchText: searchText.trim(),
                searchBy: "",
                sortBy: "relevance",
                isCategory: false,
                pageType: "",
                
              });
            }}
            style={styles.searchBar}
          />
        </View>
      )}

      {category_Search && (
        <FlatList
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          data={categories[0]?.FaceItems || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCategoryItem}
        />
      )}

      {product_Search && (
        <FlatList
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          data={products || []}
          keyExtractor={(item) => item.SKUID}
          renderItem={renderProductItem}
        />
      )}
    </View>
  );
};

export default NormalSearch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  searchBarContainer: {
    width: "100%",
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("1%"),
    backgroundColor: "#FFFFFF",
  },
  searchBar: {
    width: "100%",
    borderRadius: 12,
    fontSize: RFValue(14, 800),
    backgroundColor: "#F5F5F5",
  },
  listContainer: {
    paddingBottom: 100,
  },
  itemContainer: {
    width: wp("95%"),
    alignSelf: "center",
    marginVertical: hp("0.5%"),
  },
  itemTouchable: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: wp("2%"),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  itemImage: {
    width: 55,
    height: 55,
    borderRadius: 5,
    marginRight: wp("3%"),
    resizeMode: "contain",
    backgroundColor: "#DEECFA80",
  },
  itemTextContainer: {
    flex: 1,
  },
  itemText: {
    color: "#525252",
    fontSize: RFValue(14, 800),
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
  },
});
