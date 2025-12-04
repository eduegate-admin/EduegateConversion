import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";

import styles from "./style";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const MobileAppOptions = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Order")}
        style={styles.commonView}>
        <View style={styles.imageView}>
          <Image
            style={styles.imageWish}
            source={require("../../../assets/images/client/foodworld/shop-bag.png")}
            contentFit="contain"
            cachePolicy="memory"
          />
        </View>
        <Text style={styles.Text}>{t("orders")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("Booklets")}
        style={styles.commonView}>
        <View style={styles.imageView}>
          <Image
            style={styles.imagePlus}
            source={require("../../../assets/images/client/foodworld/megaphones.png")}
            contentFit="contain"
            cachePolicy="memory"
          />
        </View>
        <Text style={styles.Text}>{t("promotions")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("ProductListing", {
          title: `Offers`,
          searchVal: `${"skutags:" + "PROMOTIONS"}`,
          searchText: `${""}`,
          searchBy: `${"skutags"}`,
          sortBy: `${"relevance"}`,
          isCategory: `${false}`,
          pageType: `${"Recommended"}`,
        })}
        style={styles.commonView}>
        <View style={styles.imageView}>
          <Image
            style={styles.imageBooklet}
            source={require("../../../assets/images/client/foodworld/deals.png")}
            contentFit="contain"
            cachePolicy="memory"
          />
        </View>
        <Text style={styles.Text}>{t("deal_of_the_day")}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MobileAppOptions;
