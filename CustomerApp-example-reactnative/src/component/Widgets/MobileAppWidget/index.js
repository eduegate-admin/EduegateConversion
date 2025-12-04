import React, { useState, useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Skeleton } from "moti/skeleton";
import UserService from "../../../services/UserService";
import bookletService from "../../../services/bookletService";

import styles from "./style";
import AddressService from "../../../services/addressService";
import callContextCache from "../../../utils/callContextCache";

const MobileAppWidget = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [branchID, setBranchID] = useState(null);

  // Fetch BranchID
  useEffect(() => {
    const fetchBranchID = async () => {
      try {
        const authToken = await callContextCache.getAuthToken();
      const response = await AddressService.getShippingAddress(authToken);
       
        
        const branch = response?.data?.BranchID || null;
        setBranchID(branch);
      } catch (error) {
        console.error("Error fetching BranchID:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranchID();
  }, []);

  // Function to fetch booklets with branchID
  const fetchBooklets = async () => {
    if (!branchID) {
      console.warn("BranchID not available");
      return;
    }

    try {
      const response = await bookletService.GetBooklets(branchID);
      console.log("Booklets data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching booklets:", error);
    }
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3].map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={async () => {
            if (!loading) {
              if (index === 0) navigation.navigate("Wishlist");
              if (index === 1) navigation.navigate("PlusRewardsScreen");
              if (index === 2) {
                await fetchBooklets();
                navigation.navigate("Booklets");
              }
            }
          }}
          style={styles.commonView}
        >
          <View style={styles.imageView}>
            {loading ? (
              <Skeleton
                width={40}
                height={40}
                radius={8}
                colorMode="light"
              />
            ) : (
              <Image
                style={
                  index === 0
                    ? styles.imageWish
                    : index === 1
                      ? styles.imagePlus
                      : styles.imageBooklet
                }
                source={
                  index === 0
                    ? require("../../../assets/images/heart.png")
                    : index === 1
                      ? require("../../../assets/images/PlusRewards.jpg")
                      : require("../../../assets/images/booklet.png")
                }
                contentFit="contain"
                cachePolicy="memory"
              />
            )}
          </View>

          {loading ? (
            <View style={{ marginTop: 10 }}>
              <Skeleton width={60} height={14} radius={4} style={{ marginTop: 8 }} colorMode="light"
              />
            </View>
          ) : (
            <Text style={styles.Text}>
              {index === 0
                ? t("wishlist")
                : index === 1
                  ? t("plus_reward")
                  : t("booklets")}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default MobileAppWidget;
