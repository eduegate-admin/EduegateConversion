import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  TextInput,
  Modal,
  Alert,
  Animated,
  Platform,
  Share,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import CustomHeader from "../../../component/CustomHeader";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import BillSummaryCard from "../../../component/BillSummaryCard";
import OrderService from "../../../services/orderService";
import CartService from "../../../services/cartService";
import Toast from "react-native-toast-message";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import appSettings from "../../../../Client/appSettings";
import { RFValue } from "react-native-responsive-fontsize";
import { Skeleton } from "moti/skeleton";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Comment from "../../../component/CommentSection/Comment";
import { useCart } from "../../../AppContext/CartContext";

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

const NormalOrderDetails = (props) => {
  const { t } = useTranslation();
  const ID = props.route.params.orderId;
  const navigation = useNavigation();
  const whatsapp = appSettings[client].whatsapp;
  const { updateCart } = useCart();
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedEmailOrder, setSelectedEmailOrder] = useState(null);
  const [customerEmail, setCustomerEmail] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(null);

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
  
  // Separate useEffect for polling to avoid conflicts
  useEffect(() => {
    if (!ID) return;
    
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Order Placed":
        return "#FFA726"; // Orange
      case "Picked":
        return "#AB47BC"; // Purple
      case "Packed":
        return "#5C6BC0"; // Indigo
      case "Shipped":
        return "#2196F3"; // Blue
      case "Delivered":
        return "#27ae60"; // Green
      case "Cancelled":
      case "Order Cancelled":
        return "#EF5350"; // Red
      case "Failed":
        return "#E53935"; // Dark Red
      default:
        return "#9E9E9E"; // Grey
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Order Placed":
        return "clock-outline";
      case "Picked":
        return "hand-back-right";
      case "Packed":
        return "package-variant";
      case "Shipped":
        return "truck-delivery";
      case "Delivered":
        return "check-circle";
      case "Cancelled":
      case "Order Cancelled":
        return "close-circle";
      case "Failed":
        return "alert-circle";
      default:
        return "information";
    }
  };

  // Convert resolved status to timeline level (1-5)
  const getTimelineLevel = (resolvedStatus) => {
    console.log(`>>> [getTimelineLevel] INPUT: "${resolvedStatus}" (Type: ${typeof resolvedStatus})`);
    
    const statusLevelMap = {
      "Order Placed": 1,
      "Picked": 2,
      "Packed": 3,
      "Shipped": 4,
      "Delivered": 5
    };
    
    const level = statusLevelMap[resolvedStatus] || 0;
    console.log(`>>> [getTimelineLevel] OUTPUT: Level ${level}`);
    console.log(`>>> [getTimelineLevel] Map keys:`, Object.keys(statusLevelMap));
    console.log(`>>> [getTimelineLevel] Exact match check: "${resolvedStatus}" === "Delivered":`, resolvedStatus === "Delivered");
    
    return level;
  };

  const OrderHistory = async (silentRefresh = false) => {
    if (!silentRefresh) {
      setLoading(true);
    }
    try {
      const response = await OrderService.getOrderHistoryDetails(ID);
      if (!response.data) throw new Error("Failed to fetch cart data");
      
      // Debug logs only on initial load, not silent refresh
      if (!silentRefresh) {
        console.log("Resolved Status:", resolveOrderStatus(response.data[0]));
      }
      setOrderDetails(response.data);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      if (!silentRefresh) {
        setLoading(false);
      }
    }
  };

  const handleReorder = async (order) => {
    if (!order?.TransactionOrderIID) {
      return;
    }

    try {
      const response = await OrderService.ReOrder("", order?.TransactionOrderIID);
      if (response.status !== 200) {
        Alert.alert(t("error") || "Error", t("failed_to_reorder") || "Failed to reorder");
        return;
      }
      // Navigate to cart without showing success alert
      navigation.navigate("Drawer", {
        screen: "Footer",
        params: { screen: "Cart" },
      });
    } catch (error) {
      console.log("failed to fetch", error);
      Alert.alert(t("error") || "Error", t("failed_to_reorder") || "Failed to reorder");
    }
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
        console.log(">>> [DETAILS] MATCHED: Cancelled");
        return "Cancelled";
      }
      
      if (lowerStatus.includes("fail")) {
        console.log(">>> [DETAILS] MATCHED: Failed");
        return "Failed";
      }
    }
    
    // PRIORITY 1: JobStatusID-based status (HIGHEST PRIORITY)
    const hasValidJobStatusID = !isNaN(jobStatusID);
    
    if (hasValidJobStatusID) {
      if (jobStatusID === 5) {
        console.log(">>> [DETAILS] MATCHED: JobStatusID=5 → Delivered");
        return "Delivered";
      }
      if (jobStatusID === 4) {
        console.log(">>> [DETAILS] MATCHED: JobStatusID=4 → Shipped");
        return "Shipped";
      }
      if (jobStatusID === 3) {
        console.log(">>> [DETAILS] MATCHED: JobStatusID=3 → Packed");
        return "Packed";
      }
      if (jobStatusID === 2) {
        console.log(">>> [DETAILS] MATCHED: JobStatusID=2 → Picked");
        return "Picked";
      }
      if (jobStatusID === 1) {
        console.log(">>> [DETAILS] MATCHED: JobStatusID=1 → Order Placed");
        return "Order Placed";
      }
    }
    
    // PRIORITY 2: OperationStatusID-based status
    const hasValidOperationStatusID = !isNaN(operationStatusID);
    
    if (hasValidOperationStatusID) {
      if (operationStatusID === 3) {
        console.log(">>> [DETAILS] MATCHED: OperationStatusID=3 → Picked");
        return "Picked";
      }
      if (operationStatusID === 2) {
        console.log(">>> [DETAILS] MATCHED: OperationStatusID=2 → Packed");
        return "Packed";
      }
      if (operationStatusID === 1) {
        console.log(">>> [DETAILS] MATCHED: OperationStatusID=1 → Order Placed");
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
        console.log(">>> [DETAILS] MATCHED text status:", lowerStatus, "→", textStatusMap[lowerStatus]);
        return textStatusMap[lowerStatus];
      }
    }
    
    // Final fallback
    console.log(">>> [DETAILS] NO MATCH - returning:", textStatus || "Order Placed");
    return textStatus || "Order Placed";
  };

  // Check if invoice actions are enabled (only for Delivered orders)
  const isInvoiceEnabled = (status) => {
    // Normalize status first
    const normalizeStatus = (s) => {
      if (!s) return "Order Placed";
      
      const lowerStatus = s.toLowerCase().trim();
      
      const statusMap = {
        "new": "Order Placed",
        "order places": "Order Placed",
        "picked": "Picked",
        "packed": "Packed",
        "in process": "Packed",
        "shiped": "Shipped",
        "shipped": "Shipped",
        "processed": "Shipped",
        "deliverd": "Delivered",
        "delivered": "Delivered",
        "cancelled": "Cancelled",
        "failed": "Failed"
      };
      return statusMap[lowerStatus] || s;
    };
    
    const normalizedStatus = normalizeStatus(status);
    return normalizedStatus === "Delivered";
  };

  const handleDownloadInvoice = async (order) => {
    if (!isInvoiceEnabled(order.StatusTransaction)) {
      Toast.show({
        type: "info",
        text1: t("info") || "Info",
        text2: t("invoice_available_after_delivery") || "Invoice will be available after delivery",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    }

    try {
      // Generate invoice URL - replace with your actual invoice endpoint
      const invoiceUrl = `${process.env.API_BASE_URL || ''}/invoice/${order.TransactionOrderIID}`;
      
      if (Platform.OS === 'web') {
        // For web, open in new tab
        window.open(invoiceUrl, '_blank');
      } else {
        // For mobile, open URL
        const supported = await Linking.canOpenURL(invoiceUrl);
        if (supported) {
          await Linking.openURL(invoiceUrl);
        } else {
          Toast.show({
            type: "error",
            text1: t("error") || "Error",
            text2: t("cannot_download_invoice") || "Cannot download invoice at this moment",
            position: "top",
            visibilityTime: 2000,
          });
        }
      }

      Toast.show({
        type: "success",
        text1: t("success") || "Success",
        text2: t("invoice_downloading") || "Invoice is being downloaded",
        position: "top",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Download invoice error:", error);
      Toast.show({
        type: "error",
        text1: t("error") || "Error",
        text2: t("failed_to_download_invoice") || "Failed to download invoice",
        position: "top",
        visibilityTime: 2000,
      });
    }
  };

  const handleEmailInvoice = async (order) => {
    if (!isInvoiceEnabled(order.StatusTransaction)) {
      Toast.show({
        type: "info",
        text1: t("info") || "Info",
        text2: t("invoice_available_after_delivery") || "Invoice will be available after delivery",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    }

    try {
      const callContext = await callContextCache.get();
      const email = callContext?.EmailID || order.CustomerEmail;
      
      if (!email) {
        Toast.show({
          type: "error",
          text1: t("error") || "Error",
          text2: t("email_not_found") || "Email address not found",
          position: "top",
          visibilityTime: 2000,
        });
        return;
      }

      // Show custom confirmation modal
      setCustomerEmail(email);
      setSelectedEmailOrder(order);
      setShowEmailModal(true);
    } catch (error) {
      console.error("Email invoice error:", error);
      Toast.show({
        type: "error",
        text1: t("error") || "Error",
        text2: t("failed_to_send_invoice") || "Failed to send invoice",
        position: "top",
        visibilityTime: 2000,
      });
    }
  };

  const confirmEmailInvoice = async () => {
    try {
      // Call email invoice API
      const response = await OrderService.emailInvoice(
        selectedEmailOrder.TransactionOrderIID,
        customerEmail
      );
      
      console.log("Email invoice response:", response);
      
      setShowEmailModal(false);
      Toast.show({
        type: "success",
        text1: t("success") || "Success",
        text2: `${t("invoice_sent_to") || "Invoice sent to"} ${customerEmail}`,
        position: "top",
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error("Email invoice error:", error);
      setShowEmailModal(false);
      Toast.show({
        type: "error",
        text1: t("error") || "Error",
        text2: t("failed_to_send_invoice") || "Failed to send invoice",
        position: "top",
        visibilityTime: 2000,
      });
    }
  };

  const handleTrackOrder = (order) => {
    if (order?.TransactionOrderIID) {
      navigation.navigate("TrackOrder", {
        orderId: order.TransactionOrderIID,
        status: order.StatusTransaction,
      });
    }
  };

  const handleCancelOrder = (order) => {
    if (!order?.TransactionOrderIID) return;
    setSelectedOrderToCancel(order);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!selectedOrderToCancel?.TransactionOrderIID) return;

    try {
      const response = await OrderService.CancelOrder(
        selectedOrderToCancel.TransactionOrderIID
      );
      if (response.status === 200) {
        // Update order status to Cancelled immediately
        setOrderDetails(prevOrders => 
          prevOrders.map(order => 
            order.TransactionOrderIID === selectedOrderToCancel.TransactionOrderIID
              ? { ...order, StatusTransaction: "Cancelled" }
              : order
          )
        );
        
        setShowCancelModal(false);
        setShowSuccessModal(true);
        
        // Auto dismiss after 3 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
          OrderHistory();
        }, 3000);
      } else {
        setShowCancelModal(false);
        Alert.alert(
          t("error") || "Error",
          t("failed_to_cancel_order") || "Failed to cancel order"
        );
      }
    } catch (error) {
      console.log("Cancel order error:", error);
      setShowCancelModal(false);
      Alert.alert(
        t("error") || "Error",
        t("something_went_wrong") || "Something went wrong"
      );
    }
  };

  const handleBuyAgain = async (product, orderCurrency) => {
    if (!product?.SKUID && !product?.ProductID) {
      Toast.show({
        type: "error",
        text1: t("error") || "Error",
        text2: "Product information not available",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    }

    try {
      const payload = {
        SKUID: product.SKUID || product.ProductID,
        Quantity: 1,
        Currency: orderCurrency || product.Currency,
        CartItemNote: "",
        MaximumQuantityInCart: 1,
        ProductOptionID: "",
      };

      const response = await CartService.addToCart(payload);
      
      if (response?.data?.operationResult === 1) {
        await updateCart();
        Toast.show({
          type: "success",
          text1: t("product_added_to_cart") || "Product added to cart",
          text2: t("go_to_cart_for_checkout") || "Go to cart for checkout",
          position: "top",
          visibilityTime: 2000,
        });
      } else if (response?.data?.operationResult === 2) {
        Toast.show({
          type: "error",
          text1: t("error") || "Error",
          text2: response?.data?.Message || t("the_requested_quantity_is_not_available_for_this_product") || "Product not available",
          position: "top",
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: "error",
          text1: t("error") || "Error",
          text2: response?.data?.Message || t("failed_to_add_to_cart") || "Failed to add to cart",
          position: "top",
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.error("Buy Again error:", error);
      Toast.show({
        type: "error",
        text1: t("error") || "Error",
        text2: t("failed_to_add_to_cart") || "Failed to add to cart",
        position: "top",
        visibilityTime: 2000,
      });
    }
  };

  // console.log("orderDetails", orderDetails);
  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollViewMain}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          // Skeleton Loading State
          <View>
            {/* Action Buttons Skeleton */}
            <View style={styles.actionButtonsGrid}>
              <View style={styles.actionButton}>
                <Skeleton height={18} width={18} radius={4} colorMode="light" />
                <Skeleton height={14} width="60%" radius={4} colorMode="light" style={{ marginTop: 4 }} />
              </View>
              <View style={styles.actionButton}>
                <Skeleton height={18} width={18} radius={4} colorMode="light" />
                <Skeleton height={14} width="60%" radius={4} colorMode="light" style={{ marginTop: 4 }} />
              </View>
              <View style={styles.actionButton}>
                <Skeleton height={18} width={18} radius={4} colorMode="light" />
                <Skeleton height={14} width="60%" radius={4} colorMode="light" style={{ marginTop: 4 }} />
              </View>
              <View style={styles.actionButton}>
                <Skeleton height={18} width={18} radius={4} colorMode="light" />
                <Skeleton height={14} width="60%" radius={4} colorMode="light" style={{ marginTop: 4 }} />
              </View>
            </View>

            {/* Reorder Button Skeleton */}
            <View style={[styles.reorderButton, { backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 }]}>
              <Skeleton height={20} width="40%" radius={4} colorMode="light" />
            </View>

            {/* Comments Section Skeleton */}
            <View style={styles.commentsSection}>
              <View style={styles.sectionHeader}>
                <Skeleton height={18} width="30%" radius={4} colorMode="light" />
                <Skeleton height={24} width={24} radius={4} colorMode="light" />
              </View>
            </View>

            {/* Activities Section Skeleton */}
            <View style={styles.activitiesSection}>
              <View style={styles.sectionHeader}>
                <Skeleton height={18} width="30%" radius={4} colorMode="light" />
                <Skeleton height={24} width={24} radius={4} colorMode="light" />
              </View>
            </View>

            {/* Order Details Card Skeleton */}
            <View style={styles.orderDetailsCard}>
              <View style={styles.orderDetailRow}>
                <Skeleton height={14} width="25%" radius={4} colorMode="light" />
                <Skeleton height={14} width="40%" radius={4} colorMode="light" />
              </View>
              <View style={[styles.orderDetailRow, { marginTop: 12 }]}>
                <Skeleton height={14} width="20%" radius={4} colorMode="light" />
                <Skeleton height={14} width="35%" radius={4} colorMode="light" />
              </View>
              <View style={[styles.orderDetailRow, { marginTop: 12 }]}>
                <Skeleton height={14} width="30%" radius={4} colorMode="light" />
                <Skeleton height={14} width="30%" radius={4} colorMode="light" />
              </View>
              <View style={[styles.orderDetailRow, { marginTop: 12 }]}>
                <Skeleton height={14} width="25%" radius={4} colorMode="light" />
                <Skeleton height={14} width="45%" radius={4} colorMode="light" />
              </View>
              <View style={[styles.orderDetailRow, { marginTop: 12 }]}>
                <Skeleton height={14} width="35%" radius={4} colorMode="light" />
                <Skeleton height={14} width="40%" radius={4} colorMode="light" />
              </View>
              <View style={{ marginTop: 16 }}>
                <Skeleton height={16} width="40%" radius={4} colorMode="light" style={{ marginBottom: 8 }} />
                <Skeleton height={14} width="90%" radius={4} colorMode="light" style={{ marginBottom: 4 }} />
                <Skeleton height={14} width="85%" radius={4} colorMode="light" style={{ marginBottom: 4 }} />
                <Skeleton height={14} width="60%" radius={4} colorMode="light" />
              </View>
            </View>

            {/* Order Items Skeleton */}
            <View style={styles.orderItemsSection}>
              {[1, 2].map((item) => (
                <View key={item} style={styles.orderItemCard}>
                  <Skeleton height={80} width={80} radius={8} colorMode="light" />
                  <View style={styles.orderItemDetails}>
                    <Skeleton height={16} width="90%" radius={4} colorMode="light" style={{ marginBottom: 8 }} />
                    <Skeleton height={14} width="40%" radius={4} colorMode="light" style={{ marginBottom: 4 }} />
                    <Skeleton height={14} width="50%" radius={4} colorMode="light" style={{ marginBottom: 8 }} />
                    <Skeleton height={32} width={100} radius={8} colorMode="light" />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          orderDetails.length > 0 &&
          orderDetails.map((order) => {
            const status = order.StatusTransaction;
            const resolvedStatus = resolveOrderStatus(order);
            const isOrderCancelled = resolvedStatus.toLowerCase().includes("cancelled");
            const isOrderDelivered = resolvedStatus === "Delivered";
            
            // Log resolved status for debugging timeline issue
            console.log("\n>>> [MAPPED ORDER] ===================");
            console.log(">>> [MAPPED ORDER] TransactionNo:", order.TransactionNo);
            console.log(">>> [MAPPED ORDER] JobStatusID (raw):", order.JobStatusID, "Type:", typeof order.JobStatusID);
            console.log(">>> [MAPPED ORDER] JobStatusID (parsed):", parseInt(order.JobStatusID));
            console.log(">>> [MAPPED ORDER] OperationStatusID:", order.OperationStatusID);
            console.log(">>> [MAPPED ORDER] Raw Status Text:", status);
            console.log(">>> [MAPPED ORDER] Resolved Status:", resolvedStatus);
            console.log(">>> [MAPPED ORDER] ===================");
            
            return (
              <View key={order.TransactionOrderIID}>
                
                {/* Action Buttons Grid */}
                <View style={styles.actionButtonsGrid}>
                  {/* Download Invoice */}
                  <TouchableOpacity 
                    style={[
                      styles.actionButton,
                      !isInvoiceEnabled(status) && styles.actionButtonDisabled
                    ]}
                    onPress={() => handleDownloadInvoice(order)}
                    activeOpacity={0.7}
                    disabled={!isInvoiceEnabled(status)}
                  >
                    <MaterialCommunityIcons 
                      name="download" 
                      size={18} 
                      color={isInvoiceEnabled(status) ? "#757575" : "#BDBDBD"} 
                    />
                    <Text style={[
                      styles.actionButtonText,
                      !isInvoiceEnabled(status) && styles.actionButtonTextDisabled
                    ]}>Download Invoice</Text>
                  </TouchableOpacity>

                  {/* Email Invoice */}
                  <TouchableOpacity 
                    style={[
                      styles.actionButton,
                      !isInvoiceEnabled(status) && styles.actionButtonDisabled
                    ]}
                    onPress={() => handleEmailInvoice(order)}
                    activeOpacity={0.7}
                    disabled={!isInvoiceEnabled(status)}
                  >
                    <MaterialCommunityIcons 
                      name="email-outline" 
                      size={18} 
                      color={isInvoiceEnabled(status) ? "#757575" : "#BDBDBD"} 
                    />
                    <Text style={[
                      styles.actionButtonText,
                      !isInvoiceEnabled(status) && styles.actionButtonTextDisabled
                    ]}>Email Invoice</Text>
                  </TouchableOpacity>

                  {/* Track Order - Always Disabled */}
                  <TouchableOpacity 
                    style={[
                      styles.actionButton,
                      styles.actionButtonDisabled
                    ]}
                    onPress={() => {}}
                    disabled={true}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons 
                      name="map-marker-path" 
                      size={18} 
                      color="#BDBDBD"
                    />
                    <Text style={[
                      styles.actionButtonText,
                      styles.actionButtonTextDisabled
                    ]}>Track your Order</Text>
                  </TouchableOpacity>

                  {/* Cancel Order */}
                  <TouchableOpacity 
                    style={[
                      styles.actionButton,
                      status === "Cancelled" && styles.actionButtonCancelled,
                      (status !== "Order places" && status !== "Cancelled") && styles.actionButtonDisabled
                    ]}
                    onPress={() => handleCancelOrder(order)}
                    disabled={status !== "Order places"}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons 
                      name={status === "Cancelled" ? "close-circle" : "close-circle-outline"}
                      size={18} 
                      color={status === "Cancelled" ? "#F57C00" : (status !== "Order places" ? "#BDBDBD" : "#757575")} 
                    />
                    <Text style={[
                      styles.actionButtonText,
                      status === "Cancelled" && styles.actionButtonTextCancelled,
                      (status !== "Order places" && status !== "Cancelled") && styles.actionButtonTextDisabled
                    ]}>
                      {status === "Cancelled" ? "Order Cancelled" : "Cancel order"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Reorder Button */}
                <TouchableOpacity 
                  style={styles.reorderButton}
                  onPress={() => handleReorder(order)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.reorderButtonText}>Reorder!!</Text>
                </TouchableOpacity>

                {/* Comments Section */}
                <View style={styles.commentsSection}>
                  <TouchableOpacity 
                    style={styles.sectionHeader}
                    onPress={() => setShowComments(!showComments)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.sectionHeaderText}>Comments</Text>
                    <MaterialCommunityIcons 
                      name={showComments ? "chevron-up" : "chevron-down"} 
                      size={24} 
                      color="#757575" 
                    />
                  </TouchableOpacity>
                  
                  {showComments && (
                    <View style={styles.commentsContent}>
                      <Comment 
                        ID={order.TransactionOrderIID}
                        UserName={order.CustomerName || "Customer"}
                      />
                    </View>
                  )}
                </View>

                {/* Activities Section */}
                <View style={styles.activitiesSection}>
                  <TouchableOpacity 
                    style={styles.sectionHeader}
                    onPress={() => setShowActivities(!showActivities)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.sectionHeaderText}>Activities</Text>
                    <MaterialCommunityIcons 
                      name={showActivities ? "chevron-up" : "chevron-down"} 
                      size={24} 
                      color="#757575" 
                    />
                  </TouchableOpacity>
                  
                  {showActivities && (
                    <View style={styles.activitiesContent}>
                      {/* Order Timeline */}
                      <View style={styles.timelineContainer}>
                        {(() => {
                          console.log("\n>>> [TIMELINE] =====================");
                          console.log(">>> [TIMELINE] Order Number:", order.TransactionNo);
                          console.log(">>> [TIMELINE] Raw JobStatusID:", order.JobStatusID);
                          console.log(">>> [TIMELINE] Raw OperationStatusID:", order.OperationStatusID);
                          console.log(">>> [TIMELINE] Raw StatusTransaction:", order.StatusTransaction);
                          console.log(">>> [TIMELINE] Resolved Status (Badge Label):", resolvedStatus);
                          
                          // CRITICAL: Timeline level MUST match the badge label
                          // Use the SAME resolved status to determine timeline progress
                          const currentLevel = getTimelineLevel(resolvedStatus);
                          
                          console.log(">>> [TIMELINE] Timeline Level:", currentLevel);
                          
                          // Determine active steps - all steps up to and including current are active
                          const isOrderPlacedActive = currentLevel >= 1;
                          const isPickedActive = currentLevel >= 2;
                          const isPackedActive = currentLevel >= 3;
                          const isShippedActive = currentLevel >= 4;
                          const isDeliveredActive = currentLevel >= 5;
                          
                          // Determine current (blinking) step - only the exact current level blinks
                          const isOrderPlacedCurrent = currentLevel === 1;
                          const isPickedCurrent = currentLevel === 2;
                          const isPackedCurrent = currentLevel === 3;
                          const isShippedCurrent = currentLevel === 4;
                          const isDeliveredCurrent = currentLevel === 5;
                          
                          console.log(">>> [TIMELINE] ==========================================");
                          console.log(">>> [TIMELINE] currentLevel value:", currentLevel, "Type:", typeof currentLevel);
                          console.log(">>> [TIMELINE] Calculation check: currentLevel >= 5 =", currentLevel >= 5);
                          console.log(">>> [TIMELINE] Calculation check: currentLevel === 5 =", currentLevel === 5);
                          console.log(">>> [TIMELINE] Active Steps:");
                          console.log("  - Order Placed (>=1):", isOrderPlacedActive, "| Current (===1):", isOrderPlacedCurrent);
                          console.log("  - Picked (>=2):", isPickedActive, "| Current (===2):", isPickedCurrent);
                          console.log("  - Packed (>=3):", isPackedActive, "| Current (===3):", isPackedCurrent);
                          console.log("  - Shipped (>=4):", isShippedActive, "| Current (===4):", isShippedCurrent);
                          console.log("  - Delivered (>=5):", isDeliveredActive, "| Current (===5):", isDeliveredCurrent);
                          console.log(">>> [TIMELINE] ==========================================")

                          if (resolvedStatus === "Cancelled") {
                            // Show cancelled flow
                            return (
                              <>
                                {/* Order Placed */}
                                <View style={styles.stepRow}>
                                  <View style={[styles.stepCircle, styles.stepCircleActive]}>
                                    <MaterialCommunityIcons name="check" size={14} color="#fff" />
                                  </View>
                                  <View style={styles.stepContent}>
                                    <Text style={[styles.stepText, styles.stepTextActive]}>
                                      Order Placed
                                    </Text>
                                  </View>
                                </View>
                                <View style={[styles.stepLine, styles.stepLineActive]} />

                                {/* Cancelled */}
                                <View style={styles.stepRow}>
                                  <BlinkingStatusStep isActive={true}>
                                    <View style={[styles.stepCircle, styles.stepCircleCancelled]}>
                                      <MaterialCommunityIcons name="close" size={14} color="#fff" />
                                    </View>
                                  </BlinkingStatusStep>
                                  <View style={styles.stepContent}>
                                    <Text style={[styles.stepText, { color: "#EF5350" }]}>
                                      Order Cancelled
                                    </Text>
                                  </View>
                                </View>
                              </>
                            );
                          }

                          // Normal flow
                          return (
                            <>
                              {/* 1. Order Placed */}
                              <View style={styles.stepRow}>
                                <BlinkingStatusStep isActive={isOrderPlacedCurrent}>
                                  <View style={[
                                    styles.stepCircle,
                                    isOrderPlacedActive && styles.stepCircleActive
                                  ]}>
                                    <MaterialCommunityIcons
                                      name="clock-outline"
                                      size={14}
                                      color={isOrderPlacedActive ? "#fff" : "#BDBDBD"}
                                    />
                                  </View>
                                </BlinkingStatusStep>
                                <View style={styles.stepContent}>
                                  <Text style={[
                                    styles.stepText,
                                    isOrderPlacedActive && styles.stepTextActive
                                  ]}>
                                    Order Placed
                                  </Text>
                                </View>
                              </View>
                              <View style={[
                                styles.stepLine,
                                isPickedActive && styles.stepLineActive
                              ]} />

                              {/* 2. Picked */}
                              <View style={styles.stepRow}>
                                <BlinkingStatusStep isActive={isPickedCurrent}>
                                  <View style={[
                                    styles.stepCircle,
                                    isPickedActive && styles.stepCircleActive
                                  ]}>
                                    <MaterialCommunityIcons
                                      name="hand-back-right-outline"
                                      size={14}
                                      color={isPickedActive ? "#fff" : "#BDBDBD"}
                                    />
                                  </View>
                                </BlinkingStatusStep>
                                <View style={styles.stepContent}>
                                  <Text style={[
                                    styles.stepText,
                                    isPickedActive && styles.stepTextActive
                                  ]}>
                                    Picked
                                  </Text>
                                </View>
                              </View>
                              <View style={[
                                styles.stepLine,
                                isPackedActive && styles.stepLineActive
                              ]} />

                              {/* 3. Packed */}
                              <View style={styles.stepRow}>
                                <BlinkingStatusStep isActive={isPackedCurrent}>
                                  <View style={[
                                    styles.stepCircle,
                                    isPackedActive && styles.stepCircleActive
                                  ]}>
                                    <MaterialCommunityIcons
                                      name="package"
                                      size={14}
                                      color={isPackedActive ? "#fff" : "#BDBDBD"}
                                    />
                                  </View>
                                </BlinkingStatusStep>
                                <View style={styles.stepContent}>
                                  <Text style={[
                                    styles.stepText,
                                    isPackedActive && styles.stepTextActive
                                  ]}>
                                    Packed
                                  </Text>
                                </View>
                              </View>
                              <View style={[
                                styles.stepLine,
                                isShippedActive && styles.stepLineActive
                              ]} />

                              {/* 4. Shipped */}
                              <View style={styles.stepRow}>
                                <BlinkingStatusStep isActive={isShippedCurrent}>
                                  <View style={[
                                    styles.stepCircle,
                                    isShippedActive && styles.stepCircleShipped
                                  ]}>
                                    <MaterialCommunityIcons
                                      name="truck-fast"
                                      size={14}
                                      color={isShippedActive ? "#fff" : "#BDBDBD"}
                                    />
                                  </View>
                                </BlinkingStatusStep>
                                <View style={styles.stepContent}>
                                  <Text style={[
                                    styles.stepText,
                                    isShippedActive && styles.stepTextShipped
                                  ]}>
                                    Shipped
                                  </Text>
                                </View>
                              </View>
                              <View style={[
                                styles.stepLine,
                                isDeliveredActive && styles.stepLineActive
                              ]} />

                              {/* 5. Delivered */}
                              <View style={styles.stepRow}>
                                <BlinkingStatusStep isActive={isDeliveredCurrent}>
                                  <View style={[
                                    styles.stepCircle,
                                    isDeliveredActive && styles.stepCircleDelivered
                                  ]}>
                                    <MaterialCommunityIcons
                                      name="check-circle"
                                      size={14}
                                      color={isDeliveredActive ? "#fff" : "#BDBDBD"}
                                    />
                                  </View>
                                </BlinkingStatusStep>
                                <View style={styles.stepContent}>
                                  <Text style={[
                                    styles.stepText,
                                    isDeliveredActive && styles.stepTextDelivered
                                  ]}>
                                    Delivered
                                  </Text>
                                </View>
                              </View>
                            </>
                          );
                        })()}
                      </View>
                    </View>
                  )}
                </View>

                {/* Order Details Card - Should be displayed first with order info */}
                <View style={styles.orderDetailsCard}>
                      <View style={styles.orderDetailRow}>
                        <Text style={styles.orderDetailLabel}>Order ID:</Text>
                        <Text style={styles.orderDetailValue} selectable>
                          {order.TransactionNo || order.OrderNumber || 'N/A'}
                        </Text>
                      </View>

                      <View style={styles.orderDetailRow}>
                        <Text style={styles.orderDetailLabel}>Status:</Text>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(resolvedStatus) + '20' }
                        ]}>
                          <MaterialCommunityIcons 
                            name={getStatusIcon(resolvedStatus)} 
                            size={16} 
                            color={getStatusColor(resolvedStatus)} 
                          />
                          <Text style={[
                            styles.statusBadgeText,
                            { color: getStatusColor(resolvedStatus) }
                          ]}>
                            {resolvedStatus}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.orderDetailRow}>
                        <Text style={styles.orderDetailLabel}>Date:</Text>
                        <View style={styles.dateBadge}>
                          <Text style={styles.dateText}>
                            {formatDate(order.TransactionDate)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.orderDetailRow}>
                        <Text style={styles.orderDetailLabel}>Total Price:</Text>
                        <Text style={styles.priceValue}>
                          {order.Total !== undefined && order.Total !== null 
                            ? `${parseFloat(order.Total).toFixed(2)} ${order.Currency || ''}` 
                            : (order.TransactionTotal !== undefined && order.TransactionTotal !== null
                                ? `${order.TransactionTotal} ${order.Currency || ''}`
                                : 'N/A')}
                        </Text>
                      </View>

                      {order.DeliveryMethod && (
                        <View style={styles.orderDetailRow}>
                          <Text style={styles.orderDetailLabel}>Delivery :</Text>
                          <Text style={styles.orderDetailValue}>
                            {order.DeliveryMethod}
                          </Text>
                        </View>
                      )}

                      {order.PaymentMethod && (
                        <View style={styles.orderDetailRow}>
                          <Text style={styles.orderDetailLabel}>Payment Method :</Text>
                          <Text style={styles.orderDetailValue}>
                            {order.PaymentMethod}
                          </Text>
                        </View>
                      )}

                      {(order.Charges !== undefined && order.Charges !== null) || 
                       (order.ServiceCharge !== undefined && order.ServiceCharge !== null) ||
                       (order.DeliveryCharge !== undefined && order.DeliveryCharge !== null) ? (
                        <View style={styles.orderDetailRow}>
                          <Text style={styles.orderDetailLabel}>Service charge:</Text>
                          <Text style={styles.orderDetailValue}>
                            {order.Charges !== undefined && order.Charges !== null
                              ? `${parseFloat(order.Charges).toFixed(2)} ${order.Currency || ''}`
                              : order.ServiceCharge !== undefined && order.ServiceCharge !== null
                                ? `${parseFloat(order.ServiceCharge).toFixed(2)} ${order.Currency || ''}`
                                : order.DeliveryCharge !== undefined && order.DeliveryCharge !== null
                                  ? `${parseFloat(order.DeliveryCharge).toFixed(2)} ${order.Currency || ''}`
                                  : ''}
                          </Text>
                        </View>
                      ) : null}

                      {(order.DeliveryAddress || order.CustomerAddress || order.Address || order.ShippingAddress) && (
                        <View style={styles.deliveryAddressSection}>
                          <Text style={styles.deliveryAddressLabel}>Delivery Address</Text>
                          
                          {(() => {
                            const addr = order.DeliveryAddress || order.CustomerAddress || order.Address || order.ShippingAddress || {};
                            const addressParts = [];
                            
                            // Helper to safely convert to string and check if valid
                            const toStr = (val) => {
                              if (val === null || val === undefined || val === "") return "";
                              if (typeof val === 'object') return "";
                              return String(val).trim();
                            };
                            
                            const isValid = (val) => {
                              return val !== null && val !== undefined && val !== "" && typeof val !== 'object';
                            };
                            
                            // Name
                            const firstName = toStr(addr.FirstName);
                            const lastName = toStr(addr.LastName);
                            const fullName = [firstName, lastName].filter(Boolean).join(" ");
                            if (fullName) {
                              addressParts.push(
                                <Text key="name" style={styles.deliveryAddressName}>{fullName}</Text>
                              );
                            }
                            
                            // Address Line 1 & 2
                            const line1 = toStr(addr.AddressLine1);
                            const line2 = toStr(addr.AddressLine2);
                            if (line1 || line2) {
                              const line = [line1, line2].filter(Boolean).join(" - ");
                              if (line) {
                                addressParts.push(
                                  <Text key="addressLines" style={styles.deliveryAddressText}>{line}</Text>
                                );
                              }
                            }
                            
                            // Building/House Number
                            const building = toStr(addr.BuildingNo);
                            if (building) {
                              addressParts.push(
                                <Text key="building" style={styles.deliveryAddressText}>House/Building No: {building}</Text>
                              );
                            }
                            
                            // Block
                            const block = toStr(addr.Block);
                            if (block) {
                              addressParts.push(
                                <Text key="block" style={styles.deliveryAddressText}>Block: {block}</Text>
                              );
                            }
                            
                            // Street
                            const street = toStr(addr.Street);
                            if (street) {
                              addressParts.push(
                                <Text key="street" style={styles.deliveryAddressText}>Street: {street}</Text>
                              );
                            }
                            
                            // Avenue
                            const avenue = toStr(addr.Avenue);
                            if (avenue) {
                              addressParts.push(
                                <Text key="avenue" style={styles.deliveryAddressText}>Avenue: {avenue}</Text>
                              );
                            }
                            
                            // Area
                            const area = toStr(addr.Area) || toStr(addr.AreaName);
                            if (area) {
                              addressParts.push(
                                <Text key="area" style={styles.deliveryAddressText}>Area: {area}</Text>
                              );
                            }
                            
                            // District
                            const district = toStr(addr.District);
                            if (district) {
                              addressParts.push(
                                <Text key="district" style={styles.deliveryAddressText}>District: {district}</Text>
                              );
                            }
                            
                            // City
                            const city = toStr(addr.City) || toStr(addr.CityName);
                            if (city) {
                              addressParts.push(
                                <Text key="city" style={styles.deliveryAddressText}>City: {city}</Text>
                              );
                            }
                            
                            // Landmark
                            const landmark = toStr(addr.LandMark);
                            if (landmark) {
                              addressParts.push(
                                <Text key="landmark" style={styles.deliveryAddressText}>Landmark: {landmark}</Text>
                              );
                            }
                            
                            // Mobile Number
                            const mobile = toStr(addr.MobileNo1);
                            if (mobile) {
                              const telCode = toStr(addr.TelephoneCode);
                              addressParts.push(
                                <Text key="mobile" style={styles.deliveryAddressPhone}>
                                  Mobile No: {telCode}{mobile}
                                </Text>
                              );
                            }
                            
                            return addressParts.length > 0 ? addressParts : (
                              <Text style={styles.deliveryAddressText}>No address available</Text>
                            );
                          })()}
                        </View>
                      )}

                      {/* Order Items List */}
                      {order?.OrderDetails && order.OrderDetails.length > 0 && (
                        <View style={styles.orderItemsSection}>
                          {order.OrderDetails.map((item, idx) => (
                            <View key={`${item.ProductID}-${idx}`} style={styles.orderItemCard}>
                              <Image
                                source={{ uri: item.ProductLargeImageUrl || item.ProductImageUrl }}
                                style={styles.orderItemImage}
                                resizeMode="cover"
                              />
                              <View style={styles.orderItemDetails}>
                                <Text style={styles.orderItemName} numberOfLines={2}>
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
                                
                                <View style={styles.orderItemMeta}>
                                  <Text style={styles.orderItemQuantity}>
                                    Quantity: {item.Quantity}
                                  </Text>
                                  <Text style={styles.orderItemPrice}>
                                    Price: {item.UnitPrice} {order.Currency}
                                  </Text>
                                </View>
                                <Text style={styles.orderItemTotal}>
                                  Total Price: {(parseFloat(item.UnitPrice) * item.Quantity).toFixed(2)} {order.Currency}
                                </Text>
                              </View>
                              <TouchableOpacity 
                                style={styles.buyAgainButton} 
                                activeOpacity={0.8}
                                onPress={() => handleBuyAgain(item, order.Currency)}
                              >
                                <Text style={styles.buyAgainText}>Buy again</Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}
                </View>

              </View>
            );
          })
        )}
      </ScrollView>

      {/* Cancel Order Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalContainer}>
            {/* Icon */}
            <View style={styles.cancelIconContainer}>
              <MaterialCommunityIcons 
                name="alert-circle-outline" 
                size={60} 
                color="#EF5350" 
              />
            </View>

            {/* Title */}
            <Text style={styles.cancelModalTitle}>
              {t("cancel_order") || "Cancel Order"}
            </Text>

            {/* Message */}
            <Text style={styles.cancelModalMessage}>
              {t("cancel_order_confirmation") || "Are you sure you want to cancel this order?"}
            </Text>

            {/* Warning */}
            <View style={styles.warningBox}>
              <MaterialCommunityIcons 
                name="information-outline" 
                size={18} 
                color="#FF6B6B" 
              />
              <Text style={styles.warningText}>
                {t("cancel_order_warning") || "This action cannot be undone. Your order will be cancelled immediately."}
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.cancelModalButtons}>
              <TouchableOpacity 
                style={styles.keepOrderButton}
                onPress={() => setShowCancelModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.keepOrderButtonText}>
                  {t("no_keep_order") || "No, Keep Order"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.confirmCancelButton}
                onPress={confirmCancelOrder}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmCancelButtonText}>
                  {t("yes_cancel") || "Yes, Cancel"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContainer}>
            {/* Success Icon with Animation */}
            <View style={styles.successIconContainer}>
              <View style={styles.successIconCircle}>
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={80} 
                  color="#27ae60" 
                />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.successModalTitle}>
              {t("success") || "Success!"}
            </Text>

            {/* Message */}
            <Text style={styles.successModalMessage}>
              {t("order_cancelled_successfully") || "Order cancelled successfully"}
            </Text>

            {/* Auto-dismiss indicator */}
            <View style={styles.autoDismissIndicator}>
              <MaterialCommunityIcons 
                name="clock-outline" 
                size={14} 
                color="#9E9E9E" 
              />
              <Text style={styles.autoDismissText}>
                Closing automatically...
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Email Invoice Confirmation Modal */}
      <Modal
        visible={showEmailModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEmailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.emailModalContainer}>
            {/* Email Icon */}
            <View style={styles.emailIconContainer}>
              <View style={styles.emailIconCircle}>
                <MaterialCommunityIcons 
                  name="email-outline" 
                  size={48} 
                  color="#27ae60" 
                />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.emailModalTitle}>
              {t("send_invoice") || "Send Invoice"}
            </Text>

            {/* Description */}
            <Text style={styles.emailModalDescription}>
              {t("send_invoice_description") || "Invoice will be sent to your registered email address"}
            </Text>

            {/* Email Address Display */}
            <View style={styles.emailDisplayContainer}>
              <MaterialCommunityIcons 
                name="email" 
                size={18} 
                color="#757575" 
              />
              <Text style={styles.emailDisplayText} numberOfLines={1}>
                {customerEmail}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.emailModalButtonsContainer}>
              <TouchableOpacity
                style={styles.emailModalCancelButton}
                onPress={() => setShowEmailModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.emailModalCancelText}>
                  {t("cancel") || "Cancel"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.emailModalConfirmButton}
                onPress={confirmEmailInvoice}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name="send" 
                  size={18} 
                  color="#FFFFFF" 
                  style={{ marginRight: wp("1%") }}
                />
                <Text style={styles.emailModalConfirmText}>
                  {t("send") || "Send"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollViewMain: {
    paddingHorizontal: wp("4%"),
    paddingTop: hp("2%"),
    paddingBottom: hp("12%"),
  },

  // Action Buttons Grid (Top buttons)
  actionButtonsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: hp("1.5%"),
  },
  actionButton: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("3%"),
    marginBottom: hp("1.5%"),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonDisabled: {
    backgroundColor: "#F5F5F5",
    borderColor: "#EEEEEE",
    opacity: 0.6,
  },
  actionButtonCancelled: {
    backgroundColor: "#FFE0B2",
    borderColor: "#FFB74D",
  },
  actionButtonText: {
    fontSize: RFValue(11),
    color: "#424242",
    fontWeight: "500",
    marginLeft: 6,
    textAlign: "center",
  },
  actionButtonTextDisabled: {
    color: "#BDBDBD",
  },
  actionButtonTextCancelled: {
    color: "#F57C00",
    fontWeight: "700",
  },

  // Reorder Button (Full width green)
  reorderButton: {
    backgroundColor: "#27ae60",
    borderRadius: 8,
    paddingVertical: hp("1.8%"),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp("1.5%"),
    shadowColor: "#27ae60",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  reorderButtonText: {
    color: "#FFFFFF",
    fontSize: RFValue(14),
    fontWeight: "700",
  },

  // Comments Section
  commentsSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: hp("1.5%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("4%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sectionHeaderText: {
    fontSize: RFValue(14),
    fontWeight: "600",
    color: "#212121",
  },
  commentsContent: {
    padding: wp("4%"),
  },

  // Activities Section
  activitiesSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: hp("1.5%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  activitiesContent: {
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1.5%"),
  },

  // Timeline Styles
  timelineContainer: {
    paddingVertical: hp("1%"),
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
  stepCircleShipped: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  stepCircleDelivered: {
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
    fontSize: RFValue(12),
    fontWeight: "600",
    color: "#9E9E9E",
  },
  stepTextActive: {
    color: "#212121",
  },
  stepTextShipped: {
    color: "#2196F3",
    fontWeight: "700",
  },
  stepTextDelivered: {
    color: "#27ae60",
    fontWeight: "700",
  },
  stepSubtext: {
    fontSize: RFValue(10),
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

  // Order Details Card (Bottom)
  orderDetailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: wp("4%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  orderDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp("1%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  statusRow: {
    alignItems: "flex-start",
  },
  orderDetailLabel: {
    fontSize: RFValue(12),
    color: "#757575",
    fontWeight: "400",
  },
  orderDetailValue: {
    fontSize: RFValue(12),
    color: "#212121",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: RFValue(11),
    fontWeight: "600",
    marginLeft: 5,
  },
  statusText: {
    fontSize: RFValue(11),
    fontWeight: "600",
    marginLeft: 5,
  },
  dateBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  dateText: {
    fontSize: RFValue(11),
    color: "#F57C00",
    fontWeight: "600",
  },
  priceValue: {
    fontSize: RFValue(14),
    color: "#27ae60",
    fontWeight: "700",
  },
  
  // Delivery Address Section
  deliveryAddressSection: {
    marginTop: hp("2%"),
    paddingTop: hp("2%"),
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  deliveryAddressLabel: {
    fontSize: RFValue(13),
    color: "#212121",
    fontWeight: "700",
    marginBottom: hp("1%"),
  },
  deliveryAddressName: {
    fontSize: RFValue(12),
    color: "#212121",
    fontWeight: "600",
    marginBottom: hp("0.5%"),
  },
  deliveryAddressText: {
    fontSize: RFValue(11),
    color: "#757575",
    lineHeight: RFValue(16),
  },
  deliveryAddressPhone: {
    fontSize: RFValue(11),
    color: "#212121",
    fontWeight: "600",
    marginTop: hp("0.5%"),
  },

  // Order Items Section
  orderItemsSection: {
    marginTop: hp("2%"),
    paddingTop: hp("2%"),
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  orderItemCard: {
    flexDirection: "row",
    marginBottom: hp("2%"),
    paddingBottom: hp("2%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  orderItemImage: {
    width: wp("20%"),
    height: wp("20%"),
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  orderItemDetails: {
    flex: 1,
    marginLeft: wp("3%"),
    justifyContent: "center",
  },
  orderItemName: {
    fontSize: RFValue(12),
    fontWeight: "600",
    color: "#212121",
    marginBottom: hp("0.5%"),
    lineHeight: RFValue(16),
  },
  orderItemMeta: {
    marginVertical: hp("0.3%"),
  },
  orderItemQuantity: {
    fontSize: RFValue(10),
    color: "#757575",
    marginBottom: hp("0.2%"),
  },
  orderItemPrice: {
    fontSize: RFValue(11),
    color: "#212121",
    fontWeight: "500",
  },
  orderItemTotal: {
    fontSize: RFValue(12),
    color: "#000000",
    fontWeight: "700",
    marginTop: hp("0.3%"),
  },
  buyAgainButton: {
    backgroundColor: "#27ae60",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("0.8%"),
    borderRadius: 6,
    alignSelf: "center",
    minWidth: wp("20%"),
    alignItems: "center",
  },
  buyAgainText: {
    fontSize: RFValue(10),
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // Cancel Order Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp("5%"),
  },
  cancelModalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingTop: hp("3%"),
    paddingBottom: hp("2.5%"),
    paddingHorizontal: wp("6%"),
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cancelIconContainer: {
    marginBottom: hp("2%"),
  },
  cancelModalTitle: {
    fontSize: RFValue(20),
    fontWeight: "700",
    color: "#212121",
    marginBottom: hp("1.5%"),
    textAlign: "center",
  },
  cancelModalMessage: {
    fontSize: RFValue(14),
    color: "#424242",
    textAlign: "center",
    marginBottom: hp("2%"),
    lineHeight: RFValue(20),
  },
  warningBox: {
    backgroundColor: "#FFF3E0",
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
    borderRadius: 8,
    padding: wp("4%"),
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: hp("3%"),
    width: "100%",
  },
  warningText: {
    fontSize: RFValue(12),
    color: "#D84315",
    marginLeft: wp("2%"),
    flex: 1,
    lineHeight: RFValue(18),
  },
  cancelModalButtons: {
    flexDirection: "row",
    width: "100%",
    gap: wp("3%"),
  },
  keepOrderButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingVertical: hp("1.8%"),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  keepOrderButtonText: {
    fontSize: RFValue(13),
    fontWeight: "600",
    color: "#424242",
  },
  confirmCancelButton: {
    flex: 1,
    backgroundColor: "#EF5350",
    borderRadius: 10,
    paddingVertical: hp("1.8%"),
    alignItems: "center",
    shadowColor: "#EF5350",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmCancelButtonText: {
    fontSize: RFValue(13),
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Success Modal
  successModalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingTop: hp("4%"),
    paddingBottom: hp("3%"),
    paddingHorizontal: wp("8%"),
    width: "85%",
    maxWidth: 350,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
  },
  successIconContainer: {
    marginBottom: hp("2%"),
  },
  successIconCircle: {
    backgroundColor: "#E8F5E9",
    borderRadius: 100,
    padding: wp("3%"),
    alignItems: "center",
    justifyContent: "center",
  },
  successModalTitle: {
    fontSize: RFValue(24),
    fontWeight: "700",
    color: "#27ae60",
    marginBottom: hp("1%"),
    textAlign: "center",
  },
  successModalMessage: {
    fontSize: RFValue(15),
    color: "#424242",
    textAlign: "center",
    marginBottom: hp("2.5%"),
    lineHeight: RFValue(22),
    paddingHorizontal: wp("2%"),
  },
  autoDismissIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingVertical: hp("0.8%"),
    paddingHorizontal: wp("4%"),
    borderRadius: 20,
    marginTop: hp("1%"),
  },
  autoDismissText: {
    fontSize: RFValue(11),
    color: "#9E9E9E",
    marginLeft: wp("1.5%"),
    fontStyle: "italic",
  },

  // Email Invoice Modal
  emailModalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingTop: hp("3.5%"),
    paddingBottom: hp("3%"),
    paddingHorizontal: wp("6%"),
    width: "90%",
    maxWidth: 380,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
  },
  emailIconContainer: {
    marginBottom: hp("2%"),
  },
  emailIconCircle: {
    backgroundColor: "#E8F5E9",
    borderRadius: 100,
    width: wp("20%"),
    height: wp("20%"),
    alignItems: "center",
    justifyContent: "center",
  },
  emailModalTitle: {
    fontSize: RFValue(22),
    fontWeight: "700",
    color: "#212121",
    marginBottom: hp("1%"),
    textAlign: "center",
  },
  emailModalDescription: {
    fontSize: RFValue(13),
    color: "#757575",
    textAlign: "center",
    marginBottom: hp("2.5%"),
    lineHeight: RFValue(20),
    paddingHorizontal: wp("2%"),
  },
  emailDisplayContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("4%"),
    marginBottom: hp("3%"),
    width: "100%",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  emailDisplayText: {
    fontSize: RFValue(14),
    color: "#212121",
    fontWeight: "600",
    marginLeft: wp("2%"),
    flex: 1,
  },
  emailModalButtonsContainer: {
    flexDirection: "row",
    width: "100%",
    gap: wp("3%"),
  },
  emailModalCancelButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: hp("1.8%"),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#BDBDBD",
  },
  emailModalCancelText: {
    fontSize: RFValue(15),
    fontWeight: "600",
    color: "#616161",
  },
  emailModalConfirmButton: {
    flex: 1,
    backgroundColor: "#27ae60",
    borderRadius: 12,
    paddingVertical: hp("1.8%"),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#27ae60",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emailModalConfirmText: {
    fontSize: RFValue(15),
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default NormalOrderDetails;

