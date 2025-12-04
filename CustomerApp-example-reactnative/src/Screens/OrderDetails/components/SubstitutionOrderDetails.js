import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import OrderService from "../../../services/orderService";
import Comment from "../../../component/CommentSection/Comment";
import SubstitutionView from "../../../component/Substitution/SubstitutionView";
import CustomHeader from "../../../component/CustomHeader";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import appSettings from "../../../../Client/appSettings";

const { width, height } = Dimensions.get("screen");
const SubstitutionOrderDetails = (props) => {
  const { t } = useTranslation();
  const ID = props?.route?.params?.orderId;
  //   console.log("ID",ID)
  const navigation = useNavigation();
  const [orderDetails, setOrderDetails] = useState([]);
  const [substitution, setSubstitution] = useState([]);
  const [showSubstitutionView, setShowSubstitutionView] = useState(true);
  const currency = orderDetails.flatMap((item) => item.Currency);
  const UserName = orderDetails.flatMap((item) => item?.UserDetail?.UserName);
  const conditionalHeaderProps = appSettings[process.env.CLIENT]?.conditionalHeaderProps;
  // console.log("UserName", UserName);
  //   console.log("orderDetails", orderDetails);
  //   console.log("substitution", substitution);

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        conditionalHeaderProps ? (
          <CustomHeader
            title={t("order_details")}
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
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
      title: "Order Details",
    });
  }, [ID]);

  useFocusEffect(
    useCallback(() => {
      OrderHistory();
    }, [ID || cartID])
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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

  const OrderHistory = async () => {
    try {
      const response = await OrderService.getOrderHistoryDetails(ID);
      if (!response.data) {
        throw new Error("Failed to fetch orderHistory data");
      }
      const orderData = response.data;
      setOrderDetails(orderData);

      const cartID = orderData.find((item) => item.CartID)?.CartID;
      //   console.log("CartID...........................", cartID);
      if (cartID) {
        CartActivity(cartID);
      }
    } catch (error) {
      console.error("Error fetching orderHistory data:", error);
    }
  };

  const CartActivity = async (cartID) => {
    try {
      const response = await OrderService.getCartActivities(cartID);

      if (!response.data) {
        throw new Error("Failed to fetch Substitution data");
      }
      const SubData = response.data;
      setSubstitution(SubData);
      SubData.length > 0 && setShowSubstitutionView(true);
    } catch (error) {
      console.error("Error fetching Substitution data:", error);
    }
  };

  const cartID = orderDetails.find((item) => item.CartID)?.CartID;
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={styles.scrollViewMain}
        style={styles.scrollView}
      >
        <View
          style={{
            width: width,
            // height: height,
            backgroundColor: "#FFFFFF",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            borderRadius: 10,
            marginTop: 5,
            marginBottom: 100,
          }}
        >
          <Comment ID={ID} UserName={UserName} />
          {showSubstitutionView && (
            <SubstitutionView
              data={substitution}
              ID={ID}
              currency={currency}
              cartID={cartID}
              onSubmit={() => setShowSubstitutionView(false)}
            />
          )}

          <View style={{ padding: 15 }}>
            {Array.isArray(orderDetails) &&
              orderDetails.map((order) =>
                order.OrderDetails?.map((item) => (
                  <View style={styles.ListOuterView} key={item.ProductID}>
                    <View style={styles.ImageView}>
                      <Image
                        style={{
                          width: "100%",
                          height: "100%",
                          resizeMode: "contain",
                          borderRadius: 15,
                        }}
                        source={{ uri: item.ProductLargeImageUrl }}
                      />
                    </View>
                    <View style={styles.DetailsView}>
                      <View style={styles.ProductDetailsView}>
                        <Text numberOfLines={2} style={styles.nameText}>
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
                        
                        <Text style={styles.weightText}>
                          {item.UnitCode} X {item.Quantity}
                        </Text>

                        <Text style={styles.rateText}>
                          {item.UnitPrice} {order.Currency}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
          </View>

          {/* DotLine  */}
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              height: height * 0.045,
              //   backgroundColor: "red",
            }}
          >
            <View
              style={{
                borderRadius: 100,
                backgroundColor: "#F6f6f6",
                width: "12%",
                height: height * 0.046,
                justifyContent: "center",
              }}
            ></View>
            <View style={styles.dottedLine} />
            <View
              style={{
                borderRadius: 100,
                backgroundColor: "#F6f6f6",
                width: "12%",
                height: height * 0.046,
                justifyContent: "center",
              }}
            ></View>
          </View>

          {/* Details */}
          {orderDetails.map((item) => (
            <View key={item.TransactionOrderIID}>
              <View
                style={{
                  width: "100%",
                  height: height * 0.15,
                  borderBottomColor: "rgba(37,37,37,0.06)",
                  borderBottomWidth: 1,
                  paddingBottom: 10,
                  paddingHorizontal: 15,
                }}
              >
                <View style={styles.section}>
                  <Text style={styles.label}>Order Date</Text>
                  <Text style={styles.label}>
                    {formatDate(item.TransactionDate)}
                  </Text>
                </View>
                <View style={styles.section}>
                  <Text style={styles.label}>Promo Code</Text>
                  <Text style={styles.label}>{item.VoucherNo || "N/A"}</Text>
                </View>
                <View style={styles.section}>
                  <Text style={styles.label}>Delivery Date</Text>
                  <Text style={styles.label}>
                    {formatDate(item.DeliveredDate)}
                  </Text>
                </View>
                <View style={styles.section}>
                  <Text style={styles.label}>Payment Mode</Text>
                  <Text style={styles.label}>
                    {item.CartPaymentMethod === "COD"
                      ? "Cash On Delivery"
                      : item.CartPaymentMethod === "CARDONDELIVERY"
                        ? "Debit Card Payment"
                        : "N/A"}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  width: "100%",
                  height: height * 0.12,
                  borderBottomColor: "rgba(37,37,37,0.06)",
                  borderBottomWidth: 1,
                  paddingHorizontal: 15,
                  paddingVertical: 5,
                }}
              >
                <View style={styles.section}>
                  <Text style={styles.label}>Amount</Text>
                  <Text style={styles.label2}>
                    {item.SubTotal} {item.Currency}
                  </Text>
                </View>
                <View style={styles.section}>
                  <Text style={styles.label}>Discount</Text>
                  <Text style={[styles.label2, { color: "red" }]}>
                    -{item.DiscountAmount} {item.Currency}
                  </Text>
                </View>
                <View style={styles.section}>
                  <Text style={styles.label}>Delivery Fee</Text>
                  <Text style={styles.label2}>
                    {item.DeliveryCharge} {item.Currency}
                  </Text>
                </View>
              </View>

              <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalLabel}>
                  {item.Total} {item.Currency}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
  },
  scrollViewMain: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  scrollView: {
    backgroundColor: "#F6F6F6",
  },
  ListOuterView: {
    backgroundColor: "#F6F6F6",
    marginVertical: 7,
    width: "100%",
    height: height * 0.09,
    alignSelf: "center",
    borderRadius: 15,
    flexDirection: "row",
  },
  ImageView: {
    backgroundColor: "#ffffff",
    width: "20%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    overflow: "hidden",
  },
  DetailsView: {
    width: "80%",
    height: "100%",
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ProductDetailsView: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    justifyContent: "center",
    paddingLeft: 5,
  },
  nameText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#252525",
  },
  weightText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#B5B5B5",
  },
  rateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#133051",
  },
  dottedLine: {
    borderTopWidth: 1.02,
    borderTopColor: "#B5B5B5",
    borderStyle: "dashed",
    width: "88%",
    textAlign: "center",
  },
  section: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 7,
  },
  label: {
    fontWeight: "400",
    fontSize: 16,
  },
  label2: {
    fontWeight: "400",
    fontSize: 17,
  },
  totalSection: {
    width: "100%",
    height: height * 0.05,
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 7,
    paddingHorizontal: 15,
  },
  totalLabel: {
    fontWeight: "600",
    fontSize: 21,
  },
});

export default SubstitutionOrderDetails;
