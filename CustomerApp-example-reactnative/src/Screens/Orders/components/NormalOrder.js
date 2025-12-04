import { FlatList, TouchableOpacity, Linking, Alert, Modal, Animated, ScrollView } from "react-native";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import CustomButton from "../../../component/CustomButton";
import { useCallContext } from "../../../AppContext/CallContext";
import OrderService from "../../../services/orderService";
import { useTranslation } from "react-i18next";
import { RFValue } from "react-native-responsive-fontsize";
import CustomHeader from "../../../component/CustomHeader";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import {
  widthPercentageToDP as wp,
  
} from "react-native-responsive-screen";// import { Skeleton } from "moti/skeleton"; // no longer used; using custom skeletons
import {
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import appSettings from "../../../../Client/appSettings";
import { LinearGradient } from "expo-linear-gradient";
import { OrderListSkeleton } from "../../../component/Skeleton";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";

const client = process.env.CLIENT;

// Blinking Status Step Component
const BlinkingStatusStep = ({ isActive, children }) => {
  const blinkAnim = new Animated.Value(1);

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isActive]);

  return (
    <Animated.View style={{ opacity: isActive ? blinkAnim : 1 }}>
      {children}
    </Animated.View>
  );
};

const NormalOrder = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { callContext } = useCallContext();
  const [order, setOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const Order_ReorderButton = appSettings[client]?.Order_ReorderButton !== false; // Show by default unless explicitly disabled
  const conditionalHeaderProps = appSettings[client]?.conditionalHeaderProps;

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        
        conditionalHeaderProps ? (
          <CustomHeader
            title={t("my_orders")}
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
      title: t("my_orders"),
    });
    OrderHistory();
    
    // Set up auto-refresh polling every 30 seconds
    const interval = setInterval(() => {
      OrderHistory(true); // Silent refresh
    }, 30000);
    
    setRefreshInterval(interval);
    
    // Cleanup on unmount
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

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

  // Comprehensive status resolver - handles both ID-based and text-based status
  const resolveOrderStatus = (order) => {
    const textStatus = order.StatusTransaction || order.Status;
    const jobStatusID = parseInt(order.JobStatusID);
    const operationStatusID = parseInt(order.OperationStatusID);
    
    // PRIORITY 0: Check for cancelled and failed FIRST (highest priority)
    if (textStatus) {
      const lowerStatus = textStatus.toLowerCase().trim();
      
      if (lowerStatus.includes("cancel")) {
        return "Order Cancelled";
      }
      
      if (lowerStatus.includes("fail")) {
        return "Failed";
      }
    }
    
    // PRIORITY 1: JobStatusID-based status (HIGHEST PRIORITY)
    const hasValidJobStatusID = !isNaN(jobStatusID);
    
    if (hasValidJobStatusID) {
      if (jobStatusID === 5) {
        return "Delivered";
      }
      if (jobStatusID === 4) {
        return "Shipped";
      }
      if (jobStatusID === 3) {
        return "Packed";
      }
      if (jobStatusID === 2) {
        return "Picked";
      }
      if (jobStatusID === 1) {
        return "Order Placed";
      }
    }
    
    // PRIORITY 2: OperationStatusID-based status
    const hasValidOperationStatusID = !isNaN(operationStatusID);
    
    if (hasValidOperationStatusID) {
      if (operationStatusID === 3) {
        return "Picked";
      }
      if (operationStatusID === 2) {
        return "Packed";
      }
      if (operationStatusID === 1) {
        return "Order Placed";
      }
    }
    
    // PRIORITY 3: Text-based status (LOWEST PRIORITY - fallback only)
    if (textStatus) {
      const lowerStatus = textStatus.toLowerCase().trim();
      
      const textStatusMap = {
        "delivered": "Delivered",
        "deliverd": "Delivered",
        "shipped": "Shipped",
        "shiped": "Shipped",
        "picked": "Picked",
        "packed": "Packed",
        "new": "Order Placed",
        "order placed": "Order Placed",
        "order places": "Order Placed",
        "processed": "Shipped",
        "in process": "Packed"
      };
      
      if (textStatusMap[lowerStatus]) {
        return textStatusMap[lowerStatus];
      }
    }
    
    // Final fallback
    return textStatus || "Order Placed";
  };

  const getStatusColor = (status) => {
    // Return appropriate color based on order status
    if (!status) return "#FFA726";
    
    const lowerStatus = status.toLowerCase().trim();
    
    switch (lowerStatus) {
      case "new":
      case "order places":
      case "order placed":
        return "#FFA726"; // Orange
      case "picked":
        return "#AB47BC"; // Purple
      case "packed":
      case "in process":
        return "#5C6BC0"; // Indigo
      case "shiped":
      case "shipped":
      case "processed":
        return "#2196F3"; // Blue
      case "deliverd":
      case "delivered":
        return "#27ae60"; // Green
      case "cancelled":
      case "order cancelled":
      case "order_cancelled":
        return "#EF5350"; // Red
      case "failed":
        return "#FF5722"; // Deep Orange
      default:
        return "#9E9E9E"; // Gray
    }
  };

  const getStatusBgColor = (status) => {
    // Return appropriate background color based on order status
    if (!status) return '#FFF3E0';
    
    const lowerStatus = status.toLowerCase().trim();
    
    switch (lowerStatus) {
      case "new":
      case "order places":
      case "order placed":
        return '#FFF3E0'; // Light Orange
      case "picked":
        return '#F3E5F5'; // Light Purple
      case "packed":
      case "in process":
        return '#E8EAF6'; // Light Indigo
      case "shiped":
      case "shipped":
      case "processed":
        return '#E3F2FD'; // Light Blue
      case "deliverd":
      case "delivered":
        return '#E8F5E9'; // Light Green
      case "cancelled":
      case "order cancelled":
      case "order_cancelled":
        return '#FFEBEE'; // Light Red
      case "failed":
        return '#FBE9E7'; // Light Deep Orange
      default:
        return '#F5F5F5'; // Light Gray
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return "clock-outline";
    
    const lowerStatus = status.toLowerCase().trim();
    
    switch (lowerStatus) {
      case "new":
      case "order places":
      case "order placed":
        return "clock-outline";
      case "picked":
        return "hand-back-right-outline";
      case "packed":
      case "in process":
        return "package";
      case "shiped":
      case "shipped":
      case "processed":
        return "truck-fast";
      case "deliverd":
      case "delivered":
        return "check-circle";
      case "cancelled":
      case "order cancelled":
      case "order_cancelled":
        return "close-circle";
      case "failed":
        return "alert-circle";
      default:
        return "information";
    }
  };

  const getStatusDisplayText = (status) => {
    if (!status) return "Order Placed";
    
    switch (status) {
      case "Order places":
        return "Order Placed";
      case "Order Placed":
        return "Order Placed";
      case "picked":
        return "Picked";
      case "Picked":
        return "Picked";
      case "packed":
        return "Packed";
      case "Packed":
        return "Packed";
      case "in process":
        return "Packed";
      case "shiped":
        return "Shipped";
      case "Shipped":
        return "Shipped";
      case "processed":
        return "Shipped";
      case "deliverd":
        return "Delivered";
      case "Delivered":
        return "Delivered";
      case "Cancelled":
        return "Order Cancelled";
      default:
        return status;
    }
  };

  const OrderHistory = async (silentRefresh = false) => {
    try {
      if (!silentRefresh) {
        setLoading(true);
      }

      const response = await OrderService.getOrderHistory();
      if (!response.data) {
        throw new Error("Failed to fetch cart data");
      }
      const orderData = response.data;
      setOrder(orderData);
    } catch (error) {
      console.error("Error fetching cart data:", error);
    } finally {
      if (!silentRefresh) {
        setTimeout(() => setLoading(false), 800);
      }
    }
  };

  // console.log("order", order);

  const handleReorder = async (item) => {
    // console.log("to be ordered details", item);
    if (!item?.TransactionOrderIID) {
      // console.log("transcationOrderIID is not available");
      return;
    }

    try {
      const response = await OrderService.ReOrder(
        "",
        item?.TransactionOrderIID
      );
      if (response.status !== 200) {
        Toast.show({
          type: "error",
          text1: t("error") || "Error",
          text2: t("failed_to_reorder") || "Failed to reorder. Please try again.",
          position: "top",
          visibilityTime: 2000,
        });
        return;
      }
      Toast.show({
        type: "success",
        text1: t("success") || "Success",
        text2: t("items_added_to_cart") || "Items added to cart successfully!",
        position: "top",
        visibilityTime: 2000,
      });
      navigation.navigate("Drawer", {
        screen: "Footer",
        params: { screen: "Cart" },
      });
    } catch (error) {
      console.error("Failed to reorder:", error);
      Toast.show({
        type: "error",
        text1: t("error") || "Error",
        text2: error?.message || t("something_went_wrong") || "Something went wrong",
        position: "top",
        visibilityTime: 2000,
      });
    }
  };

  const handleChatSupport = async (orderItem) => {
    // Open in-app chat modal
    setSelectedOrder(orderItem);
    setChatModalVisible(true);
  };

  const handleShowStatusActivities = (orderItem) => {
    setSelectedOrderStatus(orderItem);
    setStatusModalVisible(true);
  };

  const RenderItem = ({ item, index }) => {
    // Use comprehensive status resolver (handles both ID and text-based)
    const statusText = resolveOrderStatus(item);
    
    const statusColor = getStatusColor(statusText);
    const statusBgColor = getStatusBgColor(statusText);
    const statusIcon = getStatusIcon(statusText);
    const displayStatus = statusText; // Use the resolved status

    return (
      <View key={index} style={styles.orderCard}>
        {/* Order Header with ID, Status, and Chat Icon */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderIdLabel}>{t("order_id") || "Order ID"}:</Text>
            <Text style={styles.orderIdValue}>{item.TransactionNo || "N/A"}</Text>
            <TouchableOpacity 
              style={[styles.statusBadge, { backgroundColor: statusBgColor }]}
              activeOpacity={0.7}
              onPress={() => handleShowStatusActivities(item)}
            >
              <Icon name={statusIcon} size={RFValue(12, 800)} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {displayStatus}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.chatButton}
            activeOpacity={0.8}
            onPress={() => handleChatSupport(item)}
          >
            <Icon name="message-text-outline" size={RFValue(20, 800)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Order Information Section */}
        <View style={styles.orderInfoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("date") || "Date"}:</Text>
            <Text style={styles.infoValue}>{formatDate(item.TransactionDate)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("total_price") || "Total Price"}:</Text>
            <Text style={styles.priceValue}>
              {item.Total ? parseFloat(item.Total).toFixed(2) : "0.00"} {item.Currency || "AED"}
            </Text>
          </View>
          
          {item.DeliveryAddress && (
            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>{t("address") || "Address"}</Text>
              <Text style={styles.addressValue} numberOfLines={2}>
                {(() => {
                  const addr = item.DeliveryAddress;
                  // Check if it's already a string
                  if (typeof addr === 'string') return addr;
                  
                  // If it's an object, format it
                  if (typeof addr === 'object' && addr !== null) {
                    const toStr = (val) => {
                      if (val === null || val === undefined || val === "") return "";
                      if (typeof val === 'object') return "";
                      return String(val).trim();
                    };
                    
                    const parts = [];
                    if (addr.AddressLine1) parts.push(toStr(addr.AddressLine1));
                    if (addr.AddressLine2) parts.push(toStr(addr.AddressLine2));
                    if (addr.Street) parts.push(toStr(addr.Street));
                    if (addr.Area || addr.AreaName) parts.push(toStr(addr.Area || addr.AreaName));
                    if (addr.City || addr.CityName) parts.push(toStr(addr.City || addr.CityName));
                    
                    return parts.filter(Boolean).join(", ") || "Address details available";
                  }
                  
                  return "Address details available";
                })()}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons Section */}
        <View style={styles.actionButtonsContainer}>
          {Order_ReorderButton && (
            <TouchableOpacity
              style={styles.reorderButton}
              onPress={() => handleReorder(item)}
              activeOpacity={0.8}
            >
              <Icon name="refresh" size={RFValue(14, 800)} color="#757575" style={styles.buttonIcon} />
              <Text style={styles.reorderButtonText}>{t("reorder") || "Reorder!!"}</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.trackButton,
              styles.trackButtonDisabled
            ]}
            onPress={() => {
              // Track Order functionality disabled
            }}
            disabled={true}
            activeOpacity={0.8}
          >
            <Icon 
              name="map-marker-outline" 
              size={RFValue(14, 800)} 
              color="#BDBDBD"
              style={styles.buttonIcon} 
            />
            <Text style={[
              styles.trackButtonText,
              styles.trackButtonTextDisabled
            ]}>{t("track_order") || "Track your Order"}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => {
              navigation.navigate("OrderDetails", {
                orderId: item.TransactionOrderIID,
              });
            }}
            activeOpacity={0.8}
          >
            <Icon name="eye-outline" size={RFValue(14, 800)} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.viewDetailsButtonText}>{t("view_details") || "View Details"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  if (loading) {
    return (
      <View style={styles.mainContainer}>
        <OrderListSkeleton />
      </View>
    );
  }
  return (
    <View style={styles.mainContainer}>
      {order.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="package-variant" size={RFValue(80, 800)} color="#CCCCCC" />
          <Text style={styles.emptyTitle}>{t("no_orders") || "No Orders Yet"}</Text>
          <Text style={styles.emptySubtitle}>
            {t("no_orders_message") || "Your order history will appear here"}
          </Text>
          <TouchableOpacity
            style={styles.startShoppingButton}
            onPress={() => {
              navigation.navigate("Drawer", {
                screen: "Footer",
                params: { screen: "Home" },
              });
            }}
            activeOpacity={0.8}
          >
            <Icon name="cart-outline" size={RFValue(18, 800)} color="#FFFFFF" style={styles.shopButtonIcon} />
            <Text style={styles.startShoppingText}>{t("start_shopping") || "Start Shopping"}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={order}
          keyExtractor={(item, index) => 
            item.TransactionOrderIID?.toString() || `order-${index}`
          }
          renderItem={RenderItem}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Chat Modal */}
      <Modal
        visible={chatModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setChatModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setChatModalVisible(false)}
            >
              <Icon name="close" size={RFValue(24, 800)} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {t("order_chat") || "Order Chat"} - {selectedOrder?.TransactionNo}
            </Text>
          </View>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <Comment 
                ID={selectedOrder.TransactionOrderIID} 
                UserName={callContext?.Name || "Customer"}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Status Activities Modal */}
      <Modal
        visible={statusModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.statusModalOverlay}>
          <View style={styles.statusModalContainer}>
            {/* Header */}
            <View style={styles.statusModalHeader}>
              <Text style={styles.statusModalTitle}>{t("order_status") || "Order Status"}</Text>
              <TouchableOpacity
                style={styles.statusCloseButton}
                onPress={() => setStatusModalVisible(false)}
                activeOpacity={0.7}
              >
                <Icon name="close" size={RFValue(20, 800)} color="#757575" />
              </TouchableOpacity>
            </View>

            {/* Activities Timeline */}
            {selectedOrderStatus && (
              <ScrollView 
                style={styles.statusTimelineContainer}
                showsVerticalScrollIndicator={false}
              >
                {/* Order ID and Date */}
                <View style={styles.statusOrderInfo}>
                  <Text style={styles.statusOrderId}>
                    {t("order_id") || "Order ID"}: {selectedOrderStatus.TransactionNo || "N/A"}
                  </Text>
                  <Text style={styles.statusOrderDate}>
                    {formatDate(selectedOrderStatus.TransactionDate)}
                  </Text>
                </View>

                {/* Timeline */}
                <View style={styles.timeline}>
                  {(() => {
                    // Use the SAME resolveOrderStatus function to get consistent status
                    const normalizedCurrentStatus = resolveOrderStatus(selectedOrderStatus);
                    
                    const statusOrder = ["Order Placed", "Picked", "Packed", "Shipped", "Delivered"];
                    const currentIndex = statusOrder.indexOf(normalizedCurrentStatus);

                    const isStatusActive = (status) => {
                      const checkIndex = statusOrder.indexOf(status);
                      return checkIndex !== -1 && currentIndex >= checkIndex;
                    };

                    const isCurrentStatus = (status) => {
                      return normalizedCurrentStatus === status;
                    };

                    if (normalizedCurrentStatus === "Cancelled") {
                      // Show cancelled flow
                      return (
                        <>
                          {/* Order Placed */}
                          <View style={styles.timelineStep}>
                            <View style={styles.stepRow}>
                              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                                <Icon name="check" size={14} color="#fff" />
                              </View>
                              <View style={styles.stepContent}>
                                <Text style={[styles.stepText, styles.stepTextActive]}>
                                  {t("order_placed") || "Order Placed"}
                                </Text>
                              </View>
                            </View>
                            <View style={[styles.stepLine, styles.stepLineActive]} />
                          </View>

                          {/* Cancelled */}
                          <View style={styles.timelineStep}>
                            <View style={styles.stepRow}>
                              <BlinkingStatusStep isActive={true}>
                                <View style={[styles.stepCircle, styles.stepCircleCancelled]}>
                                  <Icon name="close" size={14} color="#fff" />
                                </View>
                              </BlinkingStatusStep>
                              <View style={styles.stepContent}>
                                <Text style={[styles.stepText, { color: "#EF5350" }]}>
                                  {t("order_cancelled") || "Order Cancelled"}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </>
                      );
                    }

                    // Normal flow
                    return (
                      <>
                        {/* 1. Order Placed */}
                        <View style={styles.timelineStep}>
                          <View style={styles.stepRow}>
                            <BlinkingStatusStep isActive={isCurrentStatus("Order Placed")}>
                              <View style={[
                                styles.stepCircle,
                                isStatusActive("Order Placed") && styles.stepCircleActive
                              ]}>
                                <Icon
                                  name="clock-outline"
                                  size={14}
                                  color={isStatusActive("Order Placed") ? "#fff" : "#BDBDBD"}
                                />
                              </View>
                            </BlinkingStatusStep>
                            <View style={styles.stepContent}>
                              <Text style={[
                                styles.stepText,
                                isStatusActive("Order Placed") && styles.stepTextActive
                              ]}>
                                {t("order_placed") || "Order Placed"}
                              </Text>
                            </View>
                          </View>
                          <View style={[
                            styles.stepLine,
                            isStatusActive("Picked") && styles.stepLineActive
                          ]} />
                        </View>

                        {/* 2. Picked */}
                        <View style={styles.timelineStep}>
                          <View style={styles.stepRow}>
                            <BlinkingStatusStep isActive={isCurrentStatus("Picked")}>
                              <View style={[
                                styles.stepCircle,
                                isStatusActive("Picked") && styles.stepCircleActive
                              ]}>
                                <Icon
                                  name="hand-back-right-outline"
                                  size={14}
                                  color={isStatusActive("Picked") ? "#fff" : "#BDBDBD"}
                                />
                              </View>
                            </BlinkingStatusStep>
                            <View style={styles.stepContent}>
                              <Text style={[
                                styles.stepText,
                                isStatusActive("Picked") && styles.stepTextActive
                              ]}>
                                {t("picked") || "Picked"}
                              </Text>
                            </View>
                          </View>
                          <View style={[
                            styles.stepLine,
                            isStatusActive("Packed") && styles.stepLineActive
                          ]} />
                        </View>

                        {/* 3. Packed */}
                        <View style={styles.timelineStep}>
                          <View style={styles.stepRow}>
                            <BlinkingStatusStep isActive={isCurrentStatus("Packed")}>
                              <View style={[
                                styles.stepCircle,
                                isStatusActive("Packed") && styles.stepCircleActive
                              ]}>
                                <Icon
                                  name="package"
                                  size={14}
                                  color={isStatusActive("Packed") ? "#fff" : "#BDBDBD"}
                                />
                              </View>
                            </BlinkingStatusStep>
                            <View style={styles.stepContent}>
                              <Text style={[
                                styles.stepText,
                                isStatusActive("Packed") && styles.stepTextActive
                              ]}>
                                {t("packed") || "Packed"}
                              </Text>
                            </View>
                          </View>
                          <View style={[
                            styles.stepLine,
                            isStatusActive("Shipped") && styles.stepLineActive
                          ]} />
                        </View>

                        {/* 4. Shipped */}
                        <View style={styles.timelineStep}>
                          <View style={styles.stepRow}>
                            <BlinkingStatusStep isActive={isCurrentStatus("Shipped")}>
                              <View style={[
                                styles.stepCircle,
                                isStatusActive("Shipped") && styles.stepCircleActive
                              ]}>
                                <Icon
                                  name="truck-fast"
                                  size={14}
                                  color={isStatusActive("Shipped") ? "#fff" : "#BDBDBD"}
                                />
                              </View>
                            </BlinkingStatusStep>
                            <View style={styles.stepContent}>
                              <Text style={[
                                styles.stepText,
                                isStatusActive("Shipped") && styles.stepTextActive
                              ]}>
                                {t("shipped") || "Shipped"}
                              </Text>
                            </View>
                          </View>
                          <View style={[
                            styles.stepLine,
                            isStatusActive("Delivered") && styles.stepLineActive
                          ]} />
                        </View>

                        {/* 5. Delivered */}
                        <View style={styles.timelineStep}>
                          <View style={styles.stepRow}>
                            <BlinkingStatusStep isActive={isCurrentStatus("Delivered")}>
                              <View style={[
                                styles.stepCircle,
                                isStatusActive("Delivered") && styles.stepCircleActive
                              ]}>
                                <Icon
                                  name="check-circle"
                                  size={14}
                                  color={isStatusActive("Delivered") ? "#fff" : "#BDBDBD"}
                                />
                              </View>
                            </BlinkingStatusStep>
                            <View style={styles.stepContent}>
                              <Text style={[
                                styles.stepText,
                                isStatusActive("Delivered") && styles.stepTextActive
                              ]}>
                                {t("delivered") || "Delivered"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </>
                    );  
                  })()}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    width: wp("100%"),
  },
  listContent: {
    paddingTop: hp("1.5%"),
    paddingBottom: hp("20%"),
    paddingHorizontal: wp("4%"),
  },
  
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp("10%"),
  },
  emptyTitle: {
    fontSize: RFValue(18, 800),
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
    color: "#333333",
    marginTop: hp("2%"),
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: RFValue(13, 800),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    color: "#999999",
    marginTop: hp("1%"),
    textAlign: "center",
  },
  startShoppingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#27ae60",
    paddingVertical: hp("1.8%"),
    paddingHorizontal: wp("8%"),
    borderRadius: 12,
    marginTop: hp("3%"),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  shopButtonIcon: {
    marginRight: wp("2%"),
  },
  startShoppingText: {
    fontSize: RFValue(14, 800),
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
  },

  // Order Card Styles
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: hp("2%"),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    overflow: "hidden",
  },
  
  // Order Header Styles
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: wp("4%"),
    paddingTop: hp("2%"),
    paddingBottom: hp("1.5%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  orderHeaderLeft: {
    flex: 1,
    paddingRight: wp("3%"),
  },
  orderIdLabel: {
    fontSize: RFValue(10, 800),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    color: "#757575",
    marginBottom: hp("0.3%"),
  },
  orderIdValue: {
    fontSize: RFValue(14, 800),
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
    color: "#27ae60",
    marginBottom: hp("1%"),
    letterSpacing: 0.3,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.5%"),
    borderRadius: 6,
    alignSelf: "flex-start",
    gap: 4,
  },
  statusText: {
    fontSize: RFValue(10, 800),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#1976D2",
    marginLeft: 4,
  },
  chatButton: {
    width: wp("11%"),
    height: wp("11%"),
    backgroundColor: "#27ae60",
    borderRadius: wp("5.5%"),
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  // Order Information Section
  orderInfoSection: {
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("2%"),
  },
  infoRow: {
    marginBottom: hp("1.2%"),
  },
  infoLabel: {
    fontSize: RFValue(11, 800),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    color: "#757575",
    marginBottom: hp("0.3%"),
  },
  infoValue: {
    fontSize: RFValue(12, 800),
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#333333",
    lineHeight: RFValue(18, 800),
  },
  priceValue: {
    fontSize: RFValue(16, 800),
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
    color: "#000000",
    lineHeight: RFValue(22, 800),
  },
  addressContainer: {
    marginTop: hp("0.5%"),
  },
  addressLabel: {
    fontSize: RFValue(11, 800),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    color: "#757575",
    marginBottom: hp("0.3%"),
  },
  addressValue: {
    fontSize: RFValue(11, 800),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    color: "#666666",
    lineHeight: RFValue(16, 800),
  },

  // Action Buttons Container
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp("2%"),
    paddingVertical: hp("1.5%"),
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  buttonIcon: {
    marginRight: wp("0.5%"),
  },
  
  // Reorder Button
  reorderButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("1%"),
    justifyContent: "center",
    alignItems: "center",
    minHeight: hp("5%"),
    marginHorizontal: wp("0.5%"),
  },
  reorderButtonText: {
    fontSize: RFValue(10, 800),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#757575",
    textAlign: "center",
  },
  
  // Track Order Button
  trackButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("1%"),
    justifyContent: "center",
    alignItems: "center",
    minHeight: hp("5%"),
    marginHorizontal: wp("0.5%"),
  },
  trackButtonText: {
    fontSize: RFValue(10, 800),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#757575",
    textAlign: "center",
  },
  trackButtonDisabled: {
    opacity: 0.5,
    backgroundColor: "#F5F5F5",
  },
  trackButtonTextDisabled: {
    color: "#BDBDBD",
  },
  
  // View Details Button
  viewDetailsButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#27ae60",
    borderRadius: 8,
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("1%"),
    justifyContent: "center",
    alignItems: "center",
    minHeight: hp("5%"),
    marginHorizontal: wp("0.5%"),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  viewDetailsButtonText: {
    fontSize: RFValue(10, 800),
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
    textAlign: "center",
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("2%"),
    backgroundColor: "#27ae60",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  closeButton: {
    width: wp("10%"),
    height: wp("10%"),
    backgroundColor: "#FFFFFF",
    borderRadius: wp("5%"),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("3%"),
  },
  modalTitle: {
    fontSize: RFValue(16, 800),
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
    flex: 1,
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  // Status Modal Styles
  statusModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  statusModalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: hp("75%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  statusModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("2%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  statusModalTitle: {
    fontSize: RFValue(16, 800),
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
    color: "#212121",
  },
  statusCloseButton: {
    padding: wp("2%"),
  },
  statusTimelineContainer: {
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("2%"),
    paddingBottom: hp("4%"),
  },
  statusOrderInfo: {
    backgroundColor: "#F5F5F5",
    padding: wp("4%"),
    borderRadius: 8,
    marginBottom: hp("2%"),
  },
  statusOrderId: {
    fontSize: RFValue(13, 800),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#27ae60",
    marginBottom: hp("0.5%"),
  },
  statusOrderDate: {
    fontSize: RFValue(11, 800),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    color: "#757575",
  },
  timeline: {
    paddingVertical: hp("1%"),
  },
  timelineStep: {
    marginBottom: hp("1%"),
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F5F5F5",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    backgroundColor: "#27ae60",
    borderColor: "#27ae60",
  },
  stepCircleCancelled: {
    backgroundColor: "#EF5350",
    borderColor: "#EF5350",
  },
  stepContent: {
    flex: 1,
    marginLeft: 12,
    paddingTop: 2,
  },
  stepText: {
    fontSize: RFValue(12, 800),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#9E9E9E",
  },
  stepTextActive: {
    color: "#212121",
  },
  stepSubtext: {
    fontSize: RFValue(10, 800),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    color: "#BDBDBD",
    marginTop: 2,
  },
  stepLine: {
    width: 2,
    height: 28,
    backgroundColor: "#E0E0E0",
    marginLeft: 13,
    marginVertical: 3,
  },
  stepLineActive: {
    backgroundColor: "#27ae60",
  },
});

export default NormalOrder;
