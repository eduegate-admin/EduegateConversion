import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  I18nManager,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import { useCallContext } from "../../../AppContext/CallContext";
import OrderService from "../../../services/orderService";
import { useTranslation } from "react-i18next";
import { RFValue } from "react-native-responsive-fontsize";
import CustomHeader from "../../../component/CustomHeader";
import CommonHeaderRight from "../../../component/CommonHeaderRight";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import appSettings from "../../../../Client/appSettings";
import { LinearGradient } from "expo-linear-gradient";
import { OrderListSkeleton } from "../../../component/Skeleton";

const client = process.env.CLIENT;

const GroupingOrder = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { callContext } = useCallContext();
  const [order, setOrder] = useState([]);
  const [groupedOrders, setGroupedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [loadingStates, setLoadingStates] = useState({});
  const Order_ReorderButton = appSettings[client].Order_ReorderButton;
  const [btnLoading, setBtnLoading] = useState(false);
  const isRTL = I18nManager.isRTL;

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        <CustomHeader
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),

      title: t("my_orders"),
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      OrderHistory();
    }, [])
  );

  useEffect(() => {
    if (order.length > 0) {
      const grouped = groupOrdersByDate(order);
      setGroupedOrders(grouped);
    }
  }, [order]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;

    return `${day}-${month}-${year}, ${formattedHours}:${
      minutes < 10 ? "0" : ""
    }${minutes} ${ampm}`;
  };

  const groupOrdersByDate = (orders) => {
    const grouped = {};

    orders.forEach((order) => {
      const cartKey = order.CartID;
      if (!grouped[cartKey]) {
        grouped[cartKey] = [];
      }
      grouped[cartKey].push(order);
    });

    return Object.keys(grouped)
      .map((cartId) => ({
        id: cartId,
        date: grouped[cartId][0].TransactionDate,
        items: grouped[cartId].sort(
          (a, b) => new Date(b.TransactionDate) - new Date(a.TransactionDate)
        ),
      }))
      .sort(
        (a, b) =>
          new Date(b.items[0].TransactionDate) -
          new Date(a.items[0].TransactionDate)
      );
  };

  const OrderHistory = async () => {
    try {
      setLoading(true);
      const response = await OrderService.getOrderHistory();
      if (!response.data) {
        throw new Error("Failed to fetch cart data");
      }
      const orderData = response.data;
      setOrder(orderData);
    } catch (error) {
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handleReorder = async (cartId) => {
    setLoadingStates((prev) => ({ ...prev, [cartId]: true }));
    console.log("pass 1");
    if (!cartId) {
      setLoadingStates((prev) => ({ ...prev, [cartId]: false }));
      console.log("reorder");
      return;
    }

    try {
      console.log("pass 2");
      const response = await OrderService.ReOrder(cartId, "");

      if (response.status !== 200) {
        console.log("reorder response error");
        return;
      }
      navigation.navigate("Cart");
      setLoadingStates((prev) => ({ ...prev, [cartId]: false }));
    } catch (error) {
      console.log("pass 3");
      console.log("reorder api error catched ", error);
      setLoadingStates((prev) => ({ ...prev, [cartId]: false }));
    }
  };
  const HomeNav = () => {
    setBtnLoading(true);
    setTimeout(() => {
      setBtnLoading(false);
      navigation.navigate("Drawer", {
        screen: "Footer",
        params: {
          screen: "Home",
        },
      });
    }, 200);
  };

  const RenderItem = ({ item, index }) => {
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, [opacity]);

    return (
      <View key={index} style={styles.container}>
        <>
          <Image
            style={styles.Image}
            source={
              item.OrderImages && item.OrderImages.length > 0
                ? { uri: item.OrderImages[0] }
                : require("../../../assets/images/client/almadina/profile_icon.png")
            }
          />
          <View style={styles.contentView}>
            <View style={styles.detailsView}>
              <Text numberOfLines={2} style={[styles.orderId, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t("order_id_label")}: {item.TransactionNo}
              </Text>

              <Text style={[styles.Amount, { textAlign: isRTL ? 'right' : 'left' }]}>
                {item.Total} {t("currency_aed")}
              </Text>
              <View style={[styles.orderStatusView, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Animated.View
                  style={[
                    styles.statusWrapper,
                    {
                      opacity,
                      marginRight: isRTL ? 0 : wp("2.5%"),
                      marginLeft: isRTL ? wp("2.5%") : 0,
                      backgroundColor:
                        item.StatusTransaction === "Cancelled"
                          ? "rgba(210,25,25,0.25)"
                          : "rgba(28,187,0,0.25)",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.stepCircleFilled,
                      {
                        backgroundColor:
                          item.StatusTransaction === "Cancelled"
                            ? "#d21919ff"
                            : "#1cbb00ff",
                        shadowColor:
                          item.StatusTransaction === "Cancelled"
                            ? "#d21919ff"
                            : "#1cbb00ff",
                        borderColor:
                          item.StatusTransaction === "Cancelled"
                            ? "#d21919ff"
                            : "#1cbb00ff",
                      },
                    ]}
                  />
                </Animated.View>
                <Text style={[styles.dateText, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {item.StatusTransaction === "Order places"
                    ? t("order_confirmed")
                    : item.StatusTransaction === "In Processed"
                      ? t("order_processed")
                      : item.StatusTransaction === "Processed"
                        ? t("order_delivered")
                        : item.StatusTransaction === "Cancelled"
                          ? t("cancelled")
                          : ""}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.buttonCommonView}>
            <TouchableOpacity
              style={styles.quantityTouchable}
              onPress={() => {
                navigation.navigate("OrderDetails", {
                  orderId: item.TransactionOrderIID,
                });
              }}
            >
              <LinearGradient
                colors={["#1D9ADC", "#0B489A"]}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Text style={styles.addToCartText}>{t("view_order_details")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.MainContainer}>
        <OrderListSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.MainContainer}>
      <FlatList
        contentContainerStyle={{ paddingBottom: hp("20%") }}
        data={groupedOrders}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.groupContainer}>
            <View
              style={{
                marginHorizontal: wp("4.44%"),
                paddingVertical: hp("1%"),
                justifyContent: "space-between",
                flexDirection: isRTL ? "row-reverse" : "row",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: "#B4B4B4",
              }}
            >
              <View>
                <Text
                  style={{
                    fontFamily: "Poppins-Medium",
                    fontWeight: "500",
                    fontSize: RFValue(14, 800),
                    color: "#525252",
                    textAlign: isRTL ? "right" : "left",
                  }}
                >
                  {t("cart_id_label")}:
                  <Text
                    style={{
                      fontFamily: "Poppins-Medium",
                      fontWeight: "500",
                      fontSize: RFValue(14, 800),
                      color: "#1D9ADC",
                    }}
                  >
                    {" "}
                    {item.id}
                  </Text>
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins-Regular",
                    fontWeight: "400",
                    fontSize: RFValue(14, 800),
                    color: "#525252",
                    textAlign: isRTL ? "right" : "left",
                  }}
                >
                  {t("date_label")}:
                  <Text
                    style={{
                      fontFamily: "Poppins-Regular",
                      fontWeight: "400",
                      fontSize: RFValue(14, 800),
                      color: "#B5B5B5",
                    }}
                  >
                    {" "}
                    {formatDate(item.date)}
                  </Text>
                </Text>
              </View>

              {Order_ReorderButton && (
                <TouchableOpacity
                  style={styles.reOrder}
                  onPress={() => {
                    handleReorder(item.id);
                  }}
                  disabled={loadingStates[item.id]}
                >
                  {loadingStates[item.id] ? (
                    <ActivityIndicator size={"small"} color={"#1D9ADC"} />
                  ) : (
                    <Text style={styles.reOrderText}>{t("reorder")}</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {item.items.map((orderItem, index) => (
              <>
                <Text style={[styles.titleText, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {orderItem.Description} {t("products_label")}
                </Text>
                <RenderItem
                  key={orderItem.TransactionOrderIID}
                  item={orderItem}
                  index={index}
                />
              </>
            ))}
          </View>
        )}
        ListEmptyComponent={
          !loading &&
          (!order || order.length === 0) && (
            <View style={styles.EmptyContainer}>
              <Image
                style={styles.EmptyImage}
                source={require("../../../assets/images/client/benchmarkfoods/empty_cart.png")}
              />
              <Text style={styles.emptyText}>{t("your_orders_empty")}</Text>
              <Text style={styles.emptyText2}>{t("add_products_to_continue")}</Text>

              <TouchableOpacity style={styles.ShopButton} onPress={HomeNav}>
                <View style={styles.shopButtonGradient}>
                  <LinearGradient
                    colors={["#1D9ADC", "#0B489A"]}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientButton3}
                  >
                    {btnLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.addToCartText}>{t("start_shopping")}</Text>
                    )}
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    width: wp("100%"),

    paddingBottom: hp("2%"),
  },
  groupContainer: {
    elevation: 5,
    borderWidth: 1,
    borderColor: "#EDEDED",
    shadowColor: "#797979",
    width: wp("91.11%"),
    alignSelf: "center",
    paddingBottom: hp("2.5%"),
    marginVertical: hp("2.5%"),
    backgroundColor: "#ffffffff",
    borderRadius: 25,
  },
  titleText: {
    marginTop: hp("3.1%"),
    left: I18nManager.isRTL ? 0 : wp("5%"),
    right: I18nManager.isRTL ? wp("5%") : 0,
    color: "#525252",
    fontSize: RFValue(14, 800),
    fontFamily: "Poppins-Medium",
    fontWeight: "500",
  },
  container: {
    alignSelf: "center",
    width: wp("91.11%"),
    height: hp("18%"),
    justifyContent: "space-between",
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
  },
  statusWrapper: {
    justifyContent: "center",
    alignItems: "center",
    padding: wp("1%"),
    borderRadius: 50,
  },
  stepCircleFilled: {
    width: wp("2%"),
    height: wp("2%"),
    borderWidth: 1,
    borderRadius: wp("2%"),

    elevation: 3,
  },
  orderStatusView: {
    flexDirection: "row",

    alignItems: "center",
  },
  Image: {
    width: wp("21.6%"),
    height: hp("10%"),
    borderRadius: 25,
    resizeMode: "contain",
    borderWidth: 1,
    borderColor: "#EDEDED",
    left: I18nManager.isRTL ? 0 : wp("5%"),
    right: I18nManager.isRTL ? wp("5%") : 0,
    top: hp("1.625%"),
  },
  contentView: {
    width: wp("62.9%"),
    height: hp("18%"),

    borderRadius: 25,
  },
  reOrder: {
    width: wp("22.5%"),
    height: hp("4%"),
    borderWidth: 1,
    borderColor: "#1D9ADC",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  reOrderText: {
    fontSize: RFValue(14, 800),
    fontWeight: "500",
    color: "#1D9ADC",
    fontFamily: "Poppins-Medium",
  },
  detailsView: {
    width: wp("62.9%"),
    height: hp("11.25%"),
    justifyContent: "center",
    paddingLeft: I18nManager.isRTL ? 0 : wp("5.28%"),
    paddingRight: I18nManager.isRTL ? wp("5.28%") : 0,
    borderRadius: 25,
  },
  orderId: {
    fontSize: RFValue(14, 800),
    fontWeight: "500",
    color: "#525252",
    fontFamily: "Poppins-Medium",
    marginTop: hp("1.6%"),
  },
  dateText: {
    fontSize: RFValue(12, 800),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    color: "#B5B5B5",
  },
  Amount: {
    fontSize: RFValue(12, 800),
    fontWeight: "500",
    color: "#525252",
    fontFamily: "Poppins-Medium",
  },
  buttonCommonView: {
    marginHorizontal: wp("5%"),
    width: wp("81.11%"),
    height: hp("5%"),
    justifyContent: "space-between",
    alignSelf: "center",
    borderRadius: 9,
    flexDirection: "row",

    position: "absolute",
    bottom: 0,
  },
  quantityTouchable: {
    width: wp("81.11%"),
    height: hp("5%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
  },
  gradientButton: {
    width: wp("81.11%"),
    height: hp("5%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
  },
  addToCartText: {
    color: "white",
    fontSize: RFValue(14, 800),
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
  },
  EmptyContainer: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 15,
    width: wp("91.11%"),
    height: hp("79.11%"),
    padding: wp("2"),
    marginTop: hp("1.2"),
    shadowColor: "#A9A9A9",
    elevation: 3,
    paddingHorizontal: wp("5%"),
    marginBottom: hp("8.5%"),
    position: "absolute",
    top: hp("-0.4%"),
    bottom: 0,
    right: 0,
    left: wp("4%"),
  },
  EmptyImage: {
    resizeMode: "contain",
    width: wp("15.28%"),
    height: hp("6.875%"),
    marginBottom: hp("1"),
  },
  emptyText: {
    fontSize: RFValue(14),
    fontWeight: "600",

    color: "#3D3D3D99",
    fontFamily: "Poppins-Regular",
  },
  emptyText2: {
    fontSize: RFValue(11),
    fontWeight: "600",
    bottom: hp("0.5"),

    color: "#B2B2B2",
    fontFamily: "Poppins-Regular",
  },
  ShopButton: {
    marginTop: hp("2.5"),
    backgroundColor: "#FFFFFF",
    width: wp("43%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
  },
  shopButtonGradient: {
    width: wp("43%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",

    marginBottom: 7,
    borderRadius: 10,
  },
  gradientButton3: {
    width: wp("43%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    overflow: "hidden",
  },
  addToCartText: {
    color: "white",
    fontSize: RFValue(14, 800),
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
  },
});

export default GroupingOrder;
