import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import CustomButton from "../../component/CustomButton";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import CustomHeader from "../../component/CustomHeader";
import CommonHeaderLeft from "../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../component/CommonHeaderRight";
import { LinearGradient } from "expo-linear-gradient";
import { useCallContext } from "../../AppContext/CallContext";
import Toast from "react-native-toast-message";
import ProductService from "../../services/productService";
import CategoryService from "../../services/categoryService";
import { RFValue } from "react-native-responsive-fontsize";
import { useTranslation } from "react-i18next";
import appSettings from "../../../Client/appSettings";

const client = process.env.CLIENT;

const Filter = (props) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  // Default sort options
  const sortOptions = ["relevance", "best-sellers", "new-arrivals"];
  const filters = ["Category", "Sortby", "Brands"];

  const [selectedFilter, setSelectedFilter] = useState("Category");
  const [selectedOptions, setSelectedOptions] = useState({});
  const { callContext } = useCallContext();
  const conditionalHeaderProps = appSettings[client]?.conditionalHeaderProps

  // State for API data
  const [filterOptions, setFilterOptions] = useState({
    Category: [],
    Sortby: sortOptions,
    Brands: [],
  });
  const [filterOptionIds, setFilterOptionIds] = useState({
    Category: {},
    Brands: {},
  });
  const [loading, setLoading] = useState(true);

  // Debug current state
  useEffect(() => {
    console.log("Current filter options state:", filterOptions);
  }, [filterOptions]);

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        conditionalHeaderProps ? (
          <CustomHeader
            title={t("filter")}
            leftComponent={<CommonHeaderLeft type="back" />}
            elevation={0}
            borderBottomLeftRadius={0}
            borderBottomRightRadius={0}
            // dbgcolor="#12a14f"
            backgroundColor="#12a14f"
            showCustomIcons={true}
            hideicon={true}
            color="#FFFFFF"
          />
        ) : <CustomHeader
          //   title={title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
          title={t("filter")}
        />
      ),
    });
  }, [navigation, t]);

  // Fetch brands and categories from API
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const brandsResponse = await ProductService.getBrands();
        if (brandsResponse.data && Array.isArray(brandsResponse.data)) {
          const validBrands = brandsResponse.data.filter(
            (brand) => brand.BrandName && brand.BrandName.trim() !== ""
          );

          const brandNames = validBrands.map((brand) => brand.BrandName);
          const brandIdsMap = {};

          validBrands.forEach((brand) => {
            brandIdsMap[brand.BrandName] = brand.BrandIID.toString();
          });

          setFilterOptions((prev) => ({
            ...prev,
            Brands: brandNames,
          }));

          setFilterOptionIds((prev) => ({
            ...prev,
            Brands: brandIdsMap,
          }));
        }

        const categoriesResponse = await CategoryService.getAllCategories();
        let validCategories = [];

        if (
          Array.isArray(categoriesResponse.data) &&
          categoriesResponse.data.length > 0 &&
          categoriesResponse.data[0].FaceItems
        ) {
          validCategories = categoriesResponse.data[0].FaceItems;
        } else if (Array.isArray(categoriesResponse.data)) {
          validCategories = categoriesResponse.data.filter(
            (category) => category.key && (category.value || category.code)
          );
        }

        const categoryNames = validCategories.map((category) => category.key);
        const categoryIdsMap = {};

        validCategories.forEach((category) => {
          const categoryId = category.value || category.code;
          if (categoryId) {
            categoryIdsMap[category.key] = categoryId.toString();
          }
        });

        setFilterOptions((prev) => ({
          ...prev,
          Category: categoryNames,
        }));

        setFilterOptionIds((prev) => ({
          ...prev,
          Category: categoryIdsMap,
        }));
      } catch (error) {
        console.error("Error fetching filter data:", error);
        Toast.show({
          type: "error",
          text1: t("failed_to_load_filter_options"),
          text2: t("please_try_again_later"),
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const toggleOption = (option) => {
    setSelectedOptions((prev) => {
      // Initialize the array for the current filter type if it doesn't exist
      const currentOptions = prev[selectedFilter] || [];

      // Check if the option is already selected
      const optionIndex = currentOptions.indexOf(option);

      if (optionIndex === -1) {
        // Option not selected, add it
        return {
          ...prev,
          [selectedFilter]: [...currentOptions, option],
        };
      } else {
        // Option already selected, remove it
        return {
          ...prev,
          [selectedFilter]: currentOptions.filter(
            (_, index) => index !== optionIndex
          ),
        };
      }
    });
  };

  // Function to build the searchVal parameter from selected filters
  const buildSearchVal = () => {
    const selectedCategories = selectedOptions.Category || [];
    const selectedBrands = selectedOptions.Brands || [];

    console.log("Selected categories:", selectedCategories);
    console.log("Selected brands:", selectedBrands);
    console.log("Filter option IDs:", filterOptionIds);

    // If no filters are selected, return empty string
    if (selectedCategories.length === 0 && selectedBrands.length === 0) {
      return "";
    }

    let searchVal = "";

    // Add selected categories to searchVal
    if (selectedCategories.length > 0) {
      const categoryIds = selectedCategories
        .map((cat) => filterOptionIds.Category[cat])
        .filter((id) => id); // Filter out undefined values

      console.log("Category IDs for search:", categoryIds);

      if (categoryIds.length > 0) {
        searchVal += `Category:${categoryIds.join(",")}`;
      }
    }

    // Add selected brands to searchVal
    if (selectedBrands.length > 0) {
      const brandIds = selectedBrands
        .map((brand) => filterOptionIds.Brands[brand])
        .filter((id) => id); // Filter out undefined values

      console.log("Brand IDs for search:", brandIds);

      if (brandIds.length > 0) {
        if (searchVal) searchVal += ";";
        searchVal += `BrandID:${brandIds.join(",")}`;
      }
    }

    return searchVal;
  };

  // Force re-render when filter options change
  const renderFilterOptions = () => {
    console.log(
      `Rendering ${selectedFilter} options:`,
      filterOptions[selectedFilter]
    );

    if (loading) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#0B489A" />
          <Text style={{ marginTop: 10, color: "#525252" }}>
            Loading options...
          </Text>
        </View>
      );
    }

    if (
      !filterOptions[selectedFilter] ||
      filterOptions[selectedFilter].length === 0
    ) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#525252" }}>
            No {selectedFilter.toLowerCase()} options available
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filterOptions[selectedFilter]}
        extraData={selectedOptions} // Force re-render when selections change
        numColumns={2}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => {
          const isSelected = selectedOptions[selectedFilter]?.includes(item);
          return (
            <TouchableOpacity
              style={[
                styles.optionButton,
                isSelected && styles.optionSelected, // apply selected style last
              ]}
              onPress={() => toggleOption(item)}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && {
                    fontFamily: "Poppins-Medium",
                    color: "#0B489A",
                  },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Left Filter Tabs */}
        <View style={styles.filterTabs}>
          {filters.map((item, index) => {
            const isActive = selectedFilter === item;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedFilter(item)}
                style={[styles.tabButton, isActive && styles.activeTab]}
              >
                <Text
                  style={[styles.tabText, isActive && styles.activeTabText]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Right Filter Options */}
        <View style={styles.filterOptions}>{renderFilterOptions()}</View>
      </View>
      {client === "benchmarkfoods" ? (
        <TouchableOpacity
          style={styles.quantityTouchable}
          onPress={() => {
            const searchVal = buildSearchVal();
            if (!searchVal) {
              Toast.show({
                type: "info",
                text1: t("please_select_filter_option"),
              });
              return;
            }

            navigation.navigate("ProductListing", {
              pageIndex: 1,
              pageSize: 12,
              searchText: "",
              searchVal: searchVal,
              searchBy: "",
              sortBy: selectedOptions.Sortby?.[0] || "relevance",
              isCategory: false,
              pageType: "",
              filterApplied: true,
            });
          }}
        >
          <View style={styles.addToCartButton}>
            <LinearGradient
              colors={["#1D9ADC", "#0B489A"]}
              start={{ x: 1, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.addToCartText}>{t("apply_filters")}</Text>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      ) : (
        <CustomButton
          buttonText={t("apply_filters")}
          handleButtonPress={() => {
            const searchVal = buildSearchVal();
            if (!searchVal) {
              Toast.show({
                type: "info",
                text1: t("please_select_filter_option"),
              });
              return;
            }

            navigation.navigate("ProductListing", {
              pageIndex: 1,
              pageSize: 12,
              searchText: "",
              searchVal: searchVal,
              searchBy: "",
              sortBy: selectedOptions.Sortby?.[0] || "relevance",
              isCategory: false,
              pageType: "",
              filterApplied: true,
            });
          }}
          position="absolute"
          bottom={0.03}
          Radius={15}
          Width={"91.11%"}
          Height={"6%"}
          fontSize={14}
          type="normal"
        />
      )}

      {/* Apply Filter Button */}
      {/* <TouchableOpacity style={styles.applyButton}>
        <Text style={styles.applyText}>Apply Filter</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  innerContainer: {
    flex: 1,
    flexDirection: "row",
  },
  filterTabs: {
    width: wp("29%"),
    borderRightWidth: 1,
    borderRightColor: "#C4C4C440",
    // paddingVertical: 10,
    borderRadius: 12,
  },
  tabButton: {
  width: wp("28.6%"),
  height: hp("8.6%"),
  justifyContent: "center",
  alignItems: "center",
  borderBottomWidth: 1,
  borderColor: "#C4C4C440",
  backgroundColor: "#FFFFFF",
},
activeTab: {
  backgroundColor: "#F7FBFF",
  borderLeftWidth: 4,
  borderLeftColor: "#0B489A",
},
tabText: {
  color: "#525252",
  fontSize: RFValue(14),
  fontFamily: "Poppins-Regular",
},
activeTabText: {
  color: "#0B489A",
  fontFamily: "Poppins-Medium",
},
  filterOptions: {
    flex: 1,
    padding: 10,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    margin: 5,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    justifyContent: "center",
  },
  optionSelected: {
    backgroundColor: "#E7F1FF",
    borderColor: "#0B489A",
  },
  optionText: {
    color: "#333",
    fontWeight: "400",
    fontSize: RFValue(12),
    fontFamily: "Poppins-Regular",
  },
  applyButton: {
    backgroundColor: "#58BB47",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
    borderRadius: 10,
  },
  applyText: {
    color: "#fff",
    fontWeight: "bold",
  },
  quantityTouchable: {
    backgroundColor: "#FFFFFF",
    width: wp("91.11%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: hp("6%"),
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
    width: wp("91.11%"),
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    // paddingHorizontal: 26,
    // marginBottom: hp("8%"),
    borderRadius: 10,
    // backgroundColor: colors.green,
  },
  addToCartText: {
    color: "white",
    fontSize: RFValue(14, 800),
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: RFValue(14),
    color: "#525252",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: RFValue(14),
    color: "#525252",
  },
});

export default Filter;
