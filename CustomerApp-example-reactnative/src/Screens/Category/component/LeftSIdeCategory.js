import { useFocusEffect, useNavigation } from "@react-navigation/native";
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
import CustomHeader from "../../../component/CustomHeader";
import CategoryService from "../../../services/categoryService";
import colors from "../../../config/colors";
import { useTranslation } from "react-i18next";
import { Skeleton } from "moti/skeleton";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import drawer from "../../../component/CustomDrawer/clients/drawer";
import appSettings from "../../../../Client/appSettings";
const client = process.env.CLIENT;
const LeftSideCategory = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const backgroundColor = appSettings[client]?.backgroundColor;
  const contents = drawer[client] || [];
  
  // State variables
  const [categories, setCategories] = useState([]); // Stores all main categories
  const [selectedCategory, setSelectedCategory] = useState(null); // Stores the currently selected category
  const [loading, setLoading] = useState(true); // Controls skeleton loading UI

  /**
   * 🔹 Set up the screen header only once when the component mounts.
   *    This avoids flickering and ensures the header is consistent.
   */
  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          title={t("Shop by Category")}
          leftComponent={<CommonHeaderLeft type="back" />}
          elevation={1}
          borderBottomLeftRadius={0}
          borderBottomRightRadius={0}
           dbgcolor={backgroundColor}
          showCustomIcons={true}
          color="#FFFFFF"
        />
      ),

    });
  }, [navigation, t]);

  /**
   * 🔹 Fetch categories whenever the screen is focused.
   *    This ensures updated data when user navigates back to this screen.
   */
  useFocusEffect(
    useCallback(() => {
      GetCategory();
    }, [])
  );

  /**
   * 🔹 Fetch all categories from the API
   * - Uses CategoryService.getAllCategories()
   * - Sets the first category as selected by default
   * - Displays loading skeleton for 600ms for better UX
   */
  const GetCategory = async () => {
    try {
      const response = await CategoryService.getAllCategories();

      // Check if response is valid and contains category data
      if (Array.isArray(response.data) && response.data.length > 0) {
        const list = response.data[0].FaceItems || [];
        setCategories(list); // Store all categories
        setSelectedCategory(list[0] || null); // Select the first category by default
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      // Simulate slight delay for smoother loading transition
      setTimeout(() => setLoading(false), 600);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        {/* 🔸 LEFT SIDE — Category List */}
        <View style={styles.leftColumn}>
          {loading ? (
            // Show skeleton placeholders while loading
            Array.from({ length: 10 }).map((_, index) => (
              <View key={index} style={styles.skeletonItem}>
                <Skeleton width={80} height={18} radius={4} colorMode="light" />
              </View>
            ))
          ) : (
            // Display list of categories
            <FlatList
              data={categories}
              keyExtractor={(item, index) => String(index)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    selectedCategory?.key === item.key && styles.selectedCategoryItem,
                  ]}
                  onPress={() => setSelectedCategory(item)} // Update selected category
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory?.key === item.key && styles.selectedCategoryText,
                    ]}
                  >
                    {item.key}

                  </Text>

                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* 🔸 RIGHT SIDE — Subcategory Grid */}
        <View style={styles.rightColumn}>
          {loading ? (
            // Show skeleton placeholders while loading
            <View style={styles.skeletonContainer}>
              {Array.from({ length: 3 }).map((_, index) => (
                <View key={index} style={styles.skeletonCard}>
                  <Skeleton
                    height={wp("22%")}
                    width={wp("22%")}
                    radius="round"
                    colorMode="light"
                  />
                  <Skeleton
                    height={14}
                    width={wp("15%")}
                    radius={4}
                    colorMode="light"
                  />
                </View>
              ))}
            </View>
          ) : (
            // Display subcategories for the selected category
            <FlatList
              numColumns={3}
              data={selectedCategory?.FaceItems || []}
              keyExtractor={(item, index) => String(index)}
              contentContainerStyle={styles.subcategoryGrid}
              columnWrapperStyle={styles.columnWrapper}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.touch}
                  onPress={() =>
                    navigation.navigate("ProductListing", {
                      title: item.key,
                      searchVal: `;Category:${item.value}`,
                      searchText: "",
                      searchBy: "",
                      sortBy: "relevance",
                      isCategory: false,
                      pageType: "",
                    })
                  }
                >
                  {/* Category Image */}
                  <View style={styles.imageView}>
                    <Image
                      source={
                        item.ItemImage && item.ItemImage.trim() !== ""
                          ? { uri: item.ItemImage }
                          : require("../../../assets/images/defaultimage.png")
                      }
                      style={styles.image}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Category Name */}
                  <Text style={styles.text} numberOfLines={2}>
                    {item.key}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default LeftSideCategory;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  mainContainer: {
    flexDirection: "row",
    flex: 1,
  },
  leftColumn: {
    width: "28%",
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
    backgroundColor: "#F5F5F5",
  },
  rightColumn:
  {
    flex: 1
  },

  categoryItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  selectedCategoryItem: {
    backgroundColor: "#FFF9C4",
  },
  categoryText: {
    fontSize: 12,
    color: "black",
    fontFamily: "Poppins-Regular",
  },
  selectedCategoryText: {
    // fontWeight: "600",
    color: colors.darkGrey,
  },


  subcategoryGrid: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  touch: {
    marginHorizontal: 2,
    marginVertical: 12,
    width: wp("22%"),
    alignItems: "center",
    // backgroundColor: "green",
    justifyContent: "flex-start", // Aligns content from the top
    // flex: 1, // Allows the container to grow with content
  },
  imageView: {
    width: 65,
    aspectRatio: 1, // Maintains a square/circular shape without fixed height
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    backgroundColor: "#E8F5E8",
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  image: {
    width: "100%", // Fills the imageView width
    aspectRatio: 1, // Maintains the circular shape
    borderRadius: 999,
  },
  text: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: "600",
    color: "#1B5E20",
    lineHeight: 12,
    paddingTop: 4,
    width: "80%", // Limits text width to prevent excessive wrapping
  },

  /** Skeleton Loaders */
  skeletonContainer: {
    flexDirection: "row",
    paddingVertical: 10,
  },
  skeletonCard: {
    alignItems: "center",
    width: wp("22%"),
    marginRight: wp("2%"),
    marginBottom: 20,
  },
  skeletonItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
});
