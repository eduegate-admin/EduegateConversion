import React, { useEffect, useState } from "react";
import {
  View,
  Dimensions,
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  StyleSheet,
} from "react-native";
import ImageZoom from "react-native-image-pan-zoom";
import bookletService from "../../../services/bookletService";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import CustomHeader from "../../../component/CustomHeader";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import callContextCache from "../../../utils/callContextCache";
import AddressService from "../../../services/addressService";

const { width } = Dimensions.get("window");
const imageHeight = 600;

const NormalBooklets = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [booklets, setBooklets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branchID, setBranchID] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        <CustomHeader
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
    });
  }, []);

  useEffect(() => {
    const fetchBranchID = async () => {
      try {
        const authToken = await callContextCache.getAuthToken();
        const response = await AddressService.getShippingAddress(authToken);
        
        const branch = response?.data?.BranchID || null;
        setBranchID(branch);
      } catch (error) {
        console.error("Error fetching BranchID:", error);
      }
    };

    fetchBranchID();
  }, []);

  useEffect(() => {
    if (branchID) {
      fetchBooklets();
    }
  }, [branchID]);

  const fetchBooklets = async () => {
    try {
      const { data } = await bookletService.GetBooklets(branchID);
      console.log("Booklets data:", data);
      setBooklets(data);
    } catch (error) {
      console.error("Error fetching Booklets:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ flex: 1 }} />
      ) : booklets.length === 0 ? (
        <View style={styles.emptyContainer}>
          {/* <Image
            source={require("../../../assets/images/client/foodworld/no-booklets.png")}
            style={styles.emptyImage}
            resizeMode="contain"
          /> */}
          <Text style={styles.emptyTitle}>{t("no_booklets_available")}</Text>
          <Text style={styles.emptySubtitle}>
            {t("booklets_will_appear_here")}
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          {booklets.map((booklet) => (
            <View key={booklet.BookletID} style={styles.bookletBlock}>
              <Text style={styles.title}>{booklet.Title}</Text>

              {booklet.BookletPageLinks?.map((page, idx) => (
                <View key={idx} style={styles.pageWrapper}>
                  <ImageZoom
                    cropWidth={width * 0.9}
                    cropHeight={imageHeight * 0.9}
                    imageWidth={width * 0.9}
                    imageHeight={imageHeight * 0.9}
                    panToMove
                    enableScrollViewPanResponder
                  >
                    <Image
                      source={{
                        uri: page.PageFile.replace(/\\/g, "/"),
                      }}
                      style={styles.pageImage}
                    />
                  </ImageZoom>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default NormalBooklets;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  bookletBlock: {
    marginBottom: 45,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  pageWrapper: {
    marginVertical: 5,
    alignItems: "center",
  },
  pageImage: {
    width: width * 0.9,
    height: imageHeight * 0.9,
    resizeMode: "contain",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: "#F9FAFB",
  },
  emptyImage: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 24,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "Poppins-Bold",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "Poppins-Regular",
  },
});
