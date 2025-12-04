import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import colors from "../../../config/colors";
import CategoryService from "../../../services/categoryService";
import { useTranslation } from "react-i18next";
import CustomHeader from "../../../component/CustomHeader";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import { Skeleton } from "moti/skeleton";

const { width, height } = Dimensions.get("screen");
const NormalCategory = (props) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (category?.Name) {
      navigation.setOptions({
        header: ({ navigation, route, options }) => (
          <CustomHeader
            title={options.title || route.name}
            leftComponent={<CommonHeaderLeft type="back" />}
            rightComponent={<CommonHeaderRight />}
          />
        ),
        title: t("category"),
      });
    }
  }, [category?.Name]);

  useFocusEffect(
    useCallback(() => {
      GetCategory();
    }, [])
  );

  const GetCategory = async () => {
    try {
      const response = await CategoryService.getAllCategories(2);
      if (Array.isArray(response.data) && response.data.length > 0) {
        setCategory(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching getAllCategories data:", error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      style={styles.scrollView}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {Array.isArray(category?.FaceItems) &&
        category.FaceItems.map((section, index) => (
          <View style={styles.container} key={index}>
            <View style={styles.dshMenuCnt}>
              {loading ? (
                // 🔸 Skeleton Header Placeholder
                <View style={styles.dshMenuTitle}>
                  <Skeleton
                    width={150}
                    height={20}
                    radius={4}
                    colorMode="light"
                  />
                  <Skeleton
                    width={60}
                    height={16}
                    radius={4}
                    colorMode="light"
                  />
                </View>
              ) : (
                <View style={styles.dshMenuTitle}>
                  <Text style={styles.widgetTitle}>{section.key}</Text>

                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("ProductListing", {
                        title: section.key,
                        searchVal: `Category:${section.value}`,
                        searchText: "",
                        searchBy: "",
                        sortBy: "relevance",
                        isCategory: false,
                        pageType: "",
                        showBackButton: true,
                      })
                    }
                  >
                    <Text style={styles.viewAll}>{t("view_all")}</Text>
                  </TouchableOpacity>
                </View>
              )}
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
                contentContainerStyle={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
                keyExtractor={(item, index) => String(index)}
                data={section.FaceItems}
                renderItem={({ item, index }) => {
                  // Only filter out items without a key, but show all items with default images if needed
                  if (!item.key) return null;
                  return (
                    <>
                      {loading ? (
                        // 🔄 Full Card Skeleton (1 for each item)
                        <View style={styles.skeletonContainer}>
                          <Skeleton
                            height={100}
                            width={100}
                            radius={8}
                            colorMode="light"
                          />
                          <View style={styles.skeletonTextContainer}>
                            <Skeleton
                              height={14}
                              width={60}
                              radius={4}
                              colorMode="light"
                            />
                          </View>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("ProductListing", {
                              title: item.key,
                              searchVal: `;Category:${item.value}`,
                              searchText: "",
                              searchBy: "",
                              sortBy: "relevance",
                              isCategory: false,
                              pageType: "",
                              showBackButton: true,
                            })
                          }
                          style={styles.touch}
                          activeOpacity={0.7}
                        >
                          <View style={styles.imageView}>
                            <Image
                              style={styles.images}
                              source={
                                item.ItemImage && item.ItemImage.trim() !== ""
                                  ? { uri: item.ItemImage }
                                  : require("../../../assets/images/defaultimage.png")
                              }
                              defaultSource={require("../../../assets/images/defaultimage.png")}
                              resizeMode="cover"
                            />
                          </View>
                          <Text style={styles.Text} numberOfLines={2}>
                            {item.key}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  );
                }}
              />
            </View>
          </View>
        ))}
    </ScrollView>
  );
};

export default NormalCategory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingTop: 8,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    // marginBottom: 100,
    backgroundColor: "#FFFFFF",
  },
  dshMenuCnt: {
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: "white",
    marginBottom: 8,
  },
  dshMenuTitle: {
    paddingHorizontal: 4,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  widgetTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.darkGrey,
    letterSpacing: 0.5,
  },
  viewAll: {
    color: "#2E7D32",
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  touch: {
    marginHorizontal: 6,
    height: 140,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  imageView: {
    borderRadius: 12,
    height: 85,
    width: 85,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    backgroundColor: "#E8F5E8",
    shadowColor: "#2E7D32",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  images: {
    height: 80,
    width: 80,
    borderRadius: 10,
    backgroundColor: "#F1F8E9",
  },
  Text: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    color: "#1B5E20",
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  skeletonContainer: {
    alignItems: "center",
    width: 100,
    marginRight: 15,
    marginHorizontal: 6,
  },
  skeletonTextContainer: {
    marginTop: 10,
    alignItems: "center",
  },
});
