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
import CategoryService from "../../../services/categoryService";
import { Skeleton } from "moti/skeleton";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import CustomHeader from "../../../component/CustomHeader";
import CommonHeaderRight from "../../../component/CommonHeaderRight";

const client = process.env.CLIENT;

const { width, height } = Dimensions.get("screen");
const SimpleCategory = (props) => {
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
        title: category.Name || t("category"),
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
      const response = await CategoryService.getAllCategories();
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
    <LinearGradient
      colors={["#DEECFA", "#FFFFFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        style={styles.scrollView}
      >
        <View style={styles.container}>
          {loading ? (
            // 🔸 Skeleton Header Placeholder
            <View style={styles.widgetTitle}>
              <Skeleton width={150} height={20} radius={4} colorMode="light" />
            </View>
          ) : (
            <Text style={styles.widgetTitle}>Shop By Category</Text>
          )}
          <FlatList
            data={category.FaceItems}
            numColumns={3}
            style={styles.flatList}
            keyExtractor={(item, index) => String(index)}
            renderItem={({ item, index }) => {
              return (
                <>
                  {loading ? (
                    // 🔄 Full Card Skeleton (1 for each item)
                    <View
                      style={{
                        alignItems: "center",
                        width: 100,
                        marginRight: 15,
                      }}
                    >
                      <View style={{ marginTop: 10 }}>
                        <Skeleton
                          height={100}
                          width={100}
                          radius={6}
                          colorMode="light"
                        />
                      </View>
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
                      <View style={styles.outerView}>
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("ProductListing", {
                              title: `${item.key}`,
                              searchVal: `${"Category:" + item.value}`,
                              searchText: `${""}`,
                              searchBy: `${""}`,
                              sortBy: `${"relevance"}`,
                              isCategory: `${false}`,
                              pageType: `${""}`,
                            })
                          }
                          style={styles.TouchableOpacity}
                        >
                          <View style={styles.imageView}>
                            <Image
                              style={styles.image}
                              source={{ uri: item.ItemImage }}
                            />
                          </View>
                        </TouchableOpacity>
                        <Text numberOfLines={1} style={styles.itemName}>
                          {item.key}
                        </Text>
                      </View>
                    </>
                  )}
                </>
              );
            }}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default SimpleCategory;

const styles = StyleSheet.create({
  scrollView: {
    marginBottom: 80,
  },
  gradient: {
    flex: 1,
    width: wp("100%"),
    height: hp("100%"),
    alignSelf: "center",
  },
  container: {
    flex: 1,
    width: wp("90%"),
    marginTop: 20,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 10,
    // paddingHorizontal: 10,
    elevation: 5,
    marginBottom: 30,
  },
  widgetTitle: {
    fontSize: hp("2.5%"),
    fontWeight: "600",
    color: "#525252",
    // textAlign:"left",
    marginBottom: 15,
    left: -hp("9%"),
  },
  outerView: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 15,
    justifyContent: "space-between",
    // backgroundColor: "#F00000",
    marginHorizontal: 5,
  },
  TouchableOpacity: {
    alignSelf: "center",
    alignItems: "center",
    marginHorizontal: 8,
    // justifyContent:'space-between',
    width: wp("22%"),
    height: hp("10%"),
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    // shadowColor:"#B0D8FF"
  },
  imageView: {
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: 20,
    width: "100%",
    backgroundColor: "#DEECFA",
    height: "100%",
  },
  image: {
    height: "100%",
    width: "100%",
    resizeMode: "cover",
    borderRadius: 15,
  },
  itemName: {
    fontSize: 14,
    color: "#525252",
    fontWeight: "500",
    textAlign: "center",
    marginTop: 5,
  },
});
