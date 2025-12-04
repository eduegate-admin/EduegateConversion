import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import CustomHeader from "../../../component/CustomHeader";
import callContextCache from "../../../utils/callContextCache";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import BillSummaryCard from "../../../component/BillSummaryCard";
import OrderService from "../../../services/orderService";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import appSettings from "../../../../Client/appSettings";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { Skeleton } from "moti/skeleton";
import Toast from "react-native-toast-message";

const client = process.env.CLIENT;

const SimpleOrderDetails = (props) => {
  const { t } = useTranslation();
  const ID = props.route.params.orderId;
  const navigation = useNavigation();
  const whatsapp = appSettings[client].whatsapp;
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        <CustomHeader
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
      title: "Order Details",
    });
    setOrderDetails([]);
    OrderHistory();
  }, [ID]);

  const shareOnWhatsApp = () => {
    const message = "Hello! I would like to know more about your app.";
    const url = `https://wa.me/${whatsapp.replace(
      "+",
      ""
    )}?text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() => {
      alert(t("whatsapp_not_installed"));
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    const options = { year: "numeric", month: "short", day: "2-digit" };
    return date.toLocaleDateString(undefined, options);
  };

  const OrderHistory = async () => {
    setLoading(true);
    try {
      const response = await OrderService.getOrderHistoryDetails(ID);
      setTimeout(() => {
        setLoading(false);
      }, 800);
      if (!response.data) throw new Error("Failed to fetch cart data");
      setOrderDetails(response.data);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const handleReorder = async (order) => {
    if (!order?.TransactionOrderIID) {
      return;
    }

    try {
      const response = await OrderService.ReOrder(order?.TransactionOrderIID);
      if (response.status !== 200) {
        console.error("Failed to fetch reorder details");
        return;
      }
      navigation.navigate("Drawer", {
        screen: "Footer",
        params: { screen: "Cart" },
      });
    } catch (error) {
      console.log("failed to fetch", error);
    }
  };

  const handleCancelOrder = async (order) => {
    if (!order?.TransactionOrderIID) return;

    try {
      const response = await OrderService.CancelOrder(
        order.TransactionOrderIID
      );
      if (response.status === 200) {
        alert(t("order_cancelled_successfully"));
        OrderHistory();
      } else {
        alert(t("failed_to_cancel_order"));
      }
    } catch (error) {
      console.log("Cancel order error:", error);
      alert(t("something_went_wrong"));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewMain}>
        {orderDetails.length > 0 &&
          orderDetails.map((order) => {
            const status = order.StatusTransaction;
            return (
              <View style={styles.card} key={order.TransactionOrderIID}>
                {order?.OrderDetails?.map((item) => (
                  <View style={styles.productRow} key={item.ProductID}>
                    {loading ? (
                      <>
                        <Skeleton
                          height={wp("18%")}
                          width={wp("18%")}
                          radius={wp("2%")}
                          colorMode="light"
                        />
                        <View
                          style={[
                            styles.productDetails,
                            {
                              paddingLeft: 15,
                              justifyContent: "space-between",
                            },
                          ]}
                        >
                          <Skeleton
                            height={25}
                            width="90%"
                            radius={8}
                            colorMode="light"
                          />
                          <Skeleton
                            height={16}
                            width="40%"
                            radius={8}
                            colorMode="light"
                            style={{}}
                          />
                          <Skeleton
                            height={16}
                            width="30%"
                            radius={8}
                            colorMode="light"
                            style={{}}
                          />
                        </View>
                      </>
                    ) : (
                      <>
                        <Image
                          source={{ uri: item.ProductLargeImageUrl }}
                          style={styles.productImage}
                        />
                        <View style={styles.productDetails}>
                          <Text style={styles.productName}>
                            {item.ProductName}
                          </Text>
                          
                          {/* Product Option Display */}
                          {(item.ProductOptionName || item.ProductOptionID) && (
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginTop: 4,
                              marginBottom: 4,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              backgroundColor: '#f0f9ff',
                              borderRadius: 4,
                              alignSelf: 'flex-start',
                            }}>
                              <Text style={{
                                fontSize: RFValue(9, 800),
                                fontWeight: '600',
                                color: '#6b7280',
                                letterSpacing: 0.3,
                              }}>Option: </Text>
                              <Text style={{
                                fontSize: RFValue(9, 800),
                                fontWeight: '700',
                                color: '#1e40af',
                                letterSpacing: 0.3,
                              }}>{item.ProductOptionName ? item.ProductOptionName.trim() : `ID: ${item.ProductOptionID}`}</Text>
                            </View>
                          )}
                          
                          <Text style={styles.productUnit}>
                            {item.Quantity} {item.UnitName}
                          </Text>
                          <Text
                            style={styles.productPrice}
                          >{`${item.UnitPrice} ${order.Currency}`}</Text>
                          {item?.UnitName ? (
                            <View style={styles.badge}>
                              <Text style={styles.badgeText}>
                                Unit: {item.UnitName}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      </>
                    )}
                  </View>
                ))}

                {/* Timeline Stepper */}
                {loading ? (
                  <View style={{ marginTop: 30 }}>
                    <View style={[styles.stepRow]}>
                      <Skeleton
                        height={wp("4%")}
                        width={wp("4%")}
                        radius={wp("50%")}
                        colorMode="light"
                      />
                      <View style={{ left: 10 }}>
                        <Skeleton
                          height={16}
                          width={"50%"}
                          radius={8}
                          colorMode="light"
                          style={{ left: 20 }}
                        />
                      </View>
                    </View>
                    <View style={styles.stepLine} />
                    <View style={styles.stepRow}>
                      <Skeleton
                        height={wp("4%")}
                        width={wp("4%")}
                        radius={wp("50%")}
                        colorMode="light"
                      />
                      <View style={{ left: 10 }}>
                        <Skeleton
                          height={16}
                          width={"50%"}
                          radius={8}
                          colorMode="light"
                          style={{ left: 20 }}
                        />
                      </View>
                    </View>
                    <View style={styles.stepLine} />
                    <View style={styles.stepRow}>
                      <Skeleton
                        height={wp("4%")}
                        width={wp("4%")}
                        radius={wp("50%")}
                        colorMode="light"
                      />
                      <View style={{ left: 10 }}>
                        <Skeleton
                          height={16}
                          width={"50%"}
                          radius={8}
                          colorMode="light"
                          style={{ left: 20 }}
                        />
                      </View>
                    </View>

                    <View style={[styles.whatsappView, { marginTop: 20 }]}>
                      <Skeleton
                        height={"100%"}
                        width={"100%"}
                        colorMode="light"
                      />
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={styles.timelineContainer}>
                      <View style={styles.stepRow}>
                        <View
                          style={[
                            styles.stepCircleFilled,
                            {
                              backgroundColor: [
                                "Order places",
                                "In Processed",
                                "Processed",
                                "Cancelled",
                              ].includes(status)
                                ? "#1976D2"
                                : "#FFF",
                            },
                          ]}
                        />
                        <Text style={styles.stepText}>Order confirmed</Text>
                      </View>
                      <View style={styles.stepLine} />
                      <View style={styles.stepRow}>
                        <View
                          style={[
                            styles.stepCircleFilled,
                            {
                              backgroundColor: [
                                "In Processed",
                                "Processed",
                                "Cancelled",
                              ].includes(status)
                                ? "#1976D2"
                                : "#FFF",
                            },
                          ]}
                        />
                        <Text style={styles.stepText}>Order Processed</Text>
                      </View>
                      {status === "Cancelled" ? (
                        <>
                          <View style={styles.stepLine} />
                          <View style={styles.stepRow}>
                            <View
                              style={[
                                styles.stepCircleFilled,
                                {
                                  backgroundColor: ["Cancelled"].includes(
                                    status
                                  )
                                    ? "#e40f20ff"
                                    : "#FFF",
                                },
                              ]}
                            />
                            <Text style={styles.stepText}>Order Cancelled</Text>
                          </View>
                        </>
                      ) : (
                        <>
                          <View style={styles.stepLine} />
                          <View style={styles.stepRow}>
                            <View
                              style={[
                                styles.stepCircleEmpty,
                                {
                                  backgroundColor: ["Processed"].includes(
                                    status
                                  )
                                    ? "#1976D2"
                                    : "#FFF",
                                },
                              ]}
                            />
                            <Text style={styles.stepText}>Delivered</Text>
                          </View>
                        </>
                      )}
                    </View>

                    <TouchableOpacity
                      onPress={shareOnWhatsApp}
                      style={styles.whatsappView}
                    >
                      <LinearGradient
                        colors={["#DEECFA40", "#26FF4880"]}
                        start={{ x: 0, y: 2 }}
                        end={{ x: 2, y: 0 }}
                        style={styles.gradientButton3}
                      >
                        <View style={styles.WhatsappIconView}>
                          <Image
                            style={[styles.whatsappImage]}
                            source={require("../../../assets/images/client/benchmarkfoods/Header_info.png")}
                          />
                        </View>
                        <View style={styles.whatsappTextView}>
                          <Text style={styles.whatsappText}>Chat with us</Text>
                        </View>

                        <View style={styles.dropDownCommonView}>
                          <Image
                            style={[styles.dropdownImage]}
                            source={require("../../../assets/images/client/benchmarkfoods/arrow-right.png")}
                          />
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                )}

                <BillSummaryCard
                  cart={order}
                  loading={loading}
                  visibleFields={[
                    "subTotal",
                    "OrderNumber",
                    "DeliveryMethod",
                    "Charges",
                  ]}
                />

                <View style={styles.actionButtons}>
                  {loading ? (
                    <>
                      <Skeleton
                        height={hp("6%")}
                        width={wp("40%")}
                        radius={wp("2%")}
                        colorMode="light"
                      />
                      <Skeleton
                        height={hp("6%")}
                        width={wp("40%")}
                        radius={wp("2%")}
                        colorMode="light"
                      />
                    </>
                  ) : status === "Processed" ? (
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => handleReorder(order)}
                    >
                      <LinearGradient
                        colors={["#1D9ADC", "#0B489A"]}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientButton}
                      >
                        <Text style={styles.addText}>Reorder</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={() => handleCancelOrder(order)}
                        style={[
                          styles.cancelBtn,
                          status !== "Order places" && {
                            backgroundColor: "#ccc",
                          },
                        ]}
                        disabled={status !== "Order places"}
                      >
                        <Text
                          style={[
                            styles.cancelText,
                            status !== "Order places" && { color: "#666" },
                          ]}
                        >
                          Cancel Order
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  scrollViewMain: {
    width: wp("100%"),
  },
  whatsappView: {
    marginBottom: hp("1.875%"),
    width: wp("91.1%"),
    height: hp("7.25%"),
    backgroundColor: "#FFFFFF",
    alignSelf: "center",
    borderRadius: 12,
    shadowColor: "#787878",
    elevation: 5,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  gradientButton3: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 12,
    overflow: "hidden",
  },
  WhatsappIconView: {
    width: wp("13.6%"),
    height: hp("7.25%"),
    justifyContent: "center",
    alignItems: "flex-end",
  },
  whatsappText: {
    color: "#525252",
    fontSize: RFValue(14),
    fontWeight: "400",
    fontFamily: "poppins-Regular",
  },
  whatsappImage: {
    resizeMode: "contain",
    width: wp("10.28%"),
    height: hp("4.63%"),
  },
  whatsappTextView: {
    width: wp("54.6%"),
    height: hp("7.25%"),
    justifyContent: "center",
    alignItems: "Left",
  },
  dropdownImage: {
    resizeMode: "contain",
    width: wp("6.67%"),
    height: hp("3%"),
  },
  dropDownCommonView: {
    width: wp("13.6%"),
    height: hp("7.25%"),
    justifyContent: "center",
    alignItems: "flex-end",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: wp("3%"),
    padding: wp("4%"),
    paddingTop: wp("8%"),
    marginBottom: hp("6%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productRow: {
    flexDirection: "row",
    marginBottom: hp("1.5%"),
    alignItems: "center",
  },
  productImage: {
    width: wp("18%"),
    height: wp("18%"),
    borderRadius: wp("2%"),
    marginRight: wp("3%"),
    resizeMode: "contain",
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: wp("4.2%"),
    fontWeight: "600",
    color: "#252525",
  },
  productUnit: {
    fontSize: wp("3.8%"),
    color: "#9E9E9E",
    marginVertical: hp("0.5%"),
  },
  productPrice: {
    fontSize: wp("4%"),
    fontWeight: "500",
    color: "#133051",
  },
  timelineContainer: {
    marginVertical: hp("2%"),
    paddingLeft: wp("1%"),
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("0.5%"),
  },
  stepCircleFilled: {
    width: wp("4%"),
    height: wp("4%"),
    borderWidth: 1,
    borderRadius: wp("2%"),
    borderColor: "#C4C4C4",
    marginRight: wp("2.5%"),
  },
  stepCircleEmpty: {
    width: wp("4%"),
    height: wp("4%"),
    borderRadius: wp("2%"),
    borderWidth: 1,
    borderColor: "#C4C4C4",
    backgroundColor: "#FFF",
    marginRight: wp("2.5%"),
  },
  stepText: {
    fontSize: wp("3.8%"),
    color: "#555",
  },
  stepLine: {
    height: hp("2.5%"),
    width: 1,
    backgroundColor: "#D3D3D3",
    marginLeft: wp("2%"),
    marginBottom: hp("0.5%"),
  },
  summaryContainer: {
    backgroundColor: "#E9F2FF",
    borderRadius: wp("2%"),
    padding: wp("4%"),
  },
  summaryTitle: {
    fontSize: wp("4.2%"),
    fontWeight: "600",
    marginBottom: hp("1%"),
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp("0.8%"),
  },
  summaryLabel: {
    fontSize: wp("3.8%"),
    color: "#666",
  },
  summaryValue: {
    fontSize: wp("3.8%"),
    color: "#333",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp("1%"),
  },
  totalLabel: {
    fontSize: wp("4.5%"),
    fontWeight: "700",
  },
  totalValue: {
    fontSize: wp("4.5%"),
    fontWeight: "700",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: hp("2%"),
    paddingBottom: hp("10%"),
  },
  cancelBtn: {
    width: wp("40%"),
    height: hp("6%"),
    backgroundColor: "#FFFFFF",
    borderColor: "#D32F2F",
    borderWidth: 1,
    borderRadius: wp("2%"),
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    color: "#D32F2F",
    fontWeight: "600",
    fontSize: RFValue(14, 800),
    fontFamily: "Poppins-Medium",
  },
  addBtn: {
    width: wp("40%"),
    height: hp("6%"),
    justifyContent: "center",
    backgroundColor: "#1976D2",
    borderRadius: wp("2%"),
    alignItems: "center",
  },
  gradientButton: {
    width: wp("40%"),
    height: hp("6%"),
    borderRadius: wp("2%"),
    justifyContent: "center",
    alignItems: "center",
  },
  addText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: RFValue(14, 800),
    fontFamily: "Poppins-Medium",
  },
  badge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C8E6C9",
    alignSelf: "flex-start",
    marginTop: 6,
  },
  badgeText: {
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default SimpleOrderDetails;
