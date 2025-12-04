import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  Image,
  TextInput,
  ActivityIndicator,
  Platform,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CustomButton from "../../../component/CustomButton";
import { useCart } from "../../../AppContext/CartContext";
import CheckoutService from "../../../services/checkoutService";
import OrderService from "../../../services/orderService";
import UserService from "../../../services/UserService";
import AddressService from "../../../services/addressService";
import { useTranslation } from "react-i18next";
import PaymentMethod from "../../../component/PaymentMethods";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import { RFValue } from "react-native-responsive-fontsize";
import Toast from "react-native-toast-message";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import CustomHeader from "../../../component/CustomHeader";
import { Skeleton } from "moti/skeleton";
import LocationAndAddressCard from "../../../component/LocationAndAddressCard";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";
import appSettings from "../../../../Client/appSettings";

const client = process.env.CLIENT;

const NormalCheckout = (props) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { cart, updateCart } = useCart();
  const [address, setAddress] = useState("");
  const [delivery, setDelivery] = useState("");
  const [payment, setPayment] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [orderNote, setOrderNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [hasVoucher, setHasVoucher] = useState(false);
  const [bringChange, setBringChange] = useState(false);
  const [changeAmount, setChangeAmount] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [styles, setStyle] = useState(ClientStyles(client, "Checkout"));
  const conditionalHeaderProps = appSettings[client]?.conditionalHeaderProps;

  // Validate mandatory fields for proceed button
  const isProceedEnabled = useMemo(() => {
    if (client === "almadina") {
      // Check if address is selected
      const hasAddress =
        address &&
        (typeof address === "object"
          ? Object.keys(address).length > 0
          : address.length > 0);

      // Check if delivery option is selected
      const hasDelivery = selectedDelivery !== null;

      // Check if time slot is selected (if time slots exist for selected delivery)
      const selectedDeliveryData =
        delivery && Array.isArray(delivery)
          ? delivery.find((d) => d.DeliveryTypeID === selectedDelivery)
          : null;
      const availableTimeSlots =
        selectedDeliveryData?.TimeSlots?.filter((slot) => !slot.Disabled) || [];
      const hasTimeSlots = availableTimeSlots.length > 0;
      const hasTimeSlotSelected = hasTimeSlots
        ? selectedTimeSlot !== null
        : true;

      // Check if payment method is selected
      const hasPayment = selectedPayment !== null;

      return hasAddress && hasDelivery && hasTimeSlotSelected && hasPayment;
    }
    // For other clients, always enable if not loading
    return true;
  }, [
    client,
    address,
    selectedDelivery,
    selectedTimeSlot,
    selectedPayment,
    delivery,
  ]);

  useEffect(() => {
    const clientStyle = ClientStyles(client, "Checkout");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, [client]);

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) =>
        conditionalHeaderProps ? (
          <CustomHeader
            title={t("checkout_title")}
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
        ) : (
          <CustomHeader
            title={options.title || route.name}
            leftComponent={<CommonHeaderLeft type="back" />}
            rightComponent={<CommonHeaderRight />}
          />
        ),
      title: t("checkout_title"),
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        await fetchAddress();
        await handlePaymentSection();
        if (client === "benchmarkfoods") {
          handleDeliverySelection(3);
        }
      };
      load();
    }, [])
  );

  const fetchAddress = async () => {
    try {
      const response = await AddressService.getShippingAddress();
      const resp = await CheckoutService.getDeliveryType();
      const respUser = await UserService.getUserDetails();

      if (!response.data && !resp.data && !respUser.data) {
        throw new Error("Unexpected API response structure");
      }
      setDelivery(resp.data);
      const addressData =
        response?.data && Object.keys(response.data).length > 0
          ? response.data
          : respUser?.data.Contacts;

      const selectedAddress = Array.isArray(addressData) ? addressData[0] : addressData;
      setAddress(selectedAddress);
      
      // Update cart with fetched address immediately
      if (selectedAddress && selectedAddress.ContactID && cart && cart.ShoppingCartID) {
        await updateAddressInCartWithData(selectedAddress);
      }
    } catch (error) {
      console.error("Error fetching API data:", error.message);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  // ⚡ Optimized delivery selection (instant UI + async API)
  const handleDeliverySelection = useCallback(async (deliveryTypeID) => {
    setSelectedDelivery(deliveryTypeID);
    setSelectedTimeSlot(null);

    try {
      const payload = {
        DeliveryTypeID: deliveryTypeID,
        DeliveryTypeTimeSlotMapID: null,
      };
      const response = await CheckoutService.updateCartDelivery(payload);
      if (!response?.data) {
        console.warn("Failed to update delivery type on backend");
      }
    } catch (error) {
      console.error("Error updating Delivery in cart:", error.message);
    }
  }, []);

  const handlePaymentSection = async () => {
    try {
      const response = await CheckoutService.getPaymentMethod();
      if (response.data) {
        setPayment(response.data);
        setLoading(false);
      } else {
        throw new Error("Failed to fetch payment methods");
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error.message);
    }
  };

  const updateAddressInCartWithData = async (addressData) => {
    if (!addressData || !addressData.ContactID) return;
    if (!cart || !cart.ShoppingCartID) return;
    try {
      const payload = {
        CashChange: null,
        ContactID: addressData.ContactID,
        DevicePlatorm: "",
        DeviceVersion: "",
        IsCartLevelBranch: true,
        OrderNote: null,
        PostObject: "",
        SelectedPaymentOption: "",
        SelectedShippingAddress: addressData.ContactID,
        ShoppingCartID: cart.ShoppingCartID,
        VoucherAmount: cart.VoucherValue || 0,
        VoucherNo: "",
        WalletAmount: 0,
      };
      const response = await AddressService.updateAddressInShoppingCart(payload);
      console.log("Address updated in cart:", response);
    } catch (error) {
      console.error("Error updating address in cart with data:", error.message);
    }
  };

  const updateAddressInCart = async () => {
    if (!address || !address.ContactID) return;
    if (!cart || !cart.ShippingAddressID) return;
    try {
      const payload = {
        CashChange: null,
        ContactID: address.ContactID,
        DevicePlatorm: "",
        DeviceVersion: "",
        IsCartLevelBranch: true,
        OrderNote: null,
        PostObject: "",
        SelectedPaymentOption: "",
        SelectedShippingAddress: cart.ShippingAddressID,
        ShoppingCartID: cart.ShoppingCartID,
        VoucherAmount: cart.VoucherValue,
        VoucherNo: "",
        WalletAmount: 0,
      };
      await AddressService.updateAddressInShoppingCart(payload);
    } catch (error) {
      console.error("Error updating address in cart:", error.message);
    }
  };

  const handleVoucherApply = async () => {
    if (!voucherCode.trim()) {
      Toast.show({
        type: "error",
        text1: t("Please enter voucher code"),
        position: "top",
        visibilityTime: 1500,
      });
      return;
    }

    try {
      setIsLoading(true);

      // Prepare payload for voucher validation
      const payload = {
        CashChange: null,
        ContactID: address?.ContactID || null,
        DevicePlatorm: Platform.OS,
        DeviceVersion: "",
        IsCartLevelBranch: true,
        OrderNote: orderNote || null,
        PostObject: "",
        SelectedPaymentOption: selectedPayment || "",
        SelectedShippingAddress: cart?.ShippingAddressID || null,
        ShoppingCartID: cart?.ShoppingCartID || null,
        VoucherAmount: 0,
        VoucherNo: voucherCode.trim(),
        WalletAmount: 0,
      };

      // Validate voucher through API
      const response = await CheckoutService.applyVoucher(payload);

      // Check if voucher is valid
      if (response && response.status === 200 && response.data) {
        const responseData = response.data;

        // Check if voucher was successfully applied
        if (
          responseData.StatusCode === 200 ||
          responseData.Success === true ||
          responseData.VoucherValue > 0
        ) {
          setVoucherApplied(true);
          Toast.show({
            type: "success",
            text1: t("Voucher applied successfully"),
            text2: responseData.VoucherValue
              ? `Discount: ${responseData.VoucherValue} ${cart?.Currency || "AED"}`
              : "",
            position: "top",
            visibilityTime: 2000,
          });
          await updateCart();
        } else {
          // Voucher is invalid
          Toast.show({
            type: "error",
            text1: t("Invalid voucher code"),
            text2:
              responseData.Message ||
              responseData.ErrorMessage ||
              t("Please check your voucher code"),
            position: "top",
            visibilityTime: 2000,
          });
          setVoucherCode("");
        }
      } else {
        Toast.show({
          type: "error",
          text1: t("Invalid voucher code"),
          text2: t("Please check your voucher code"),
          position: "top",
          visibilityTime: 2000,
        });
        setVoucherCode("");
      }
    } catch (error) {
      console.error("Voucher validation error:", error);
      Toast.show({
        type: "error",
        text1: t("Invalid voucher code"),
        text2:
          error.response?.data?.Message ||
          error.message ||
          t("Please check your voucher code"),
        position: "top",
        visibilityTime: 2000,
      });
      setVoucherCode("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeSlotSelection = (slotId) => {
    setSelectedTimeSlot(slotId);
  };

  const handleOrderGeneration = async (selectedPayment) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (!address || !address.AddressLine1) {
        Toast.show({
          type: "error",
          text1: t("Add your address"),
          position: "top",
          visibilityTime: 1500,
        });
        setIsLoading(false);
        return;
      }

      if (client !== "benchmarkfoods" && !selectedDelivery) {
        Toast.show({
          type: "error",
          text1: t("Select your delivery option"),
          position: "top",
          visibilityTime: 1500,
        });
        setIsLoading(false);
        return;
      }

      if (!selectedPayment) {
        Toast.show({
          type: "error",
          text1: t("Select your payment"),
          position: "top",
          visibilityTime: 1500,
        });
        setIsLoading(false);
        return;
      }

      const payload = {
        CashChange: changeAmount || null,
        ContactID: address?.ContactID || null,
        DevicePlatorm: Platform.OS,
        DeviceVersion: Platform.Version?.toString(),
        IsCartLevelBranch: true,
        OrderNote: orderNote || null,
        PostObject: "",
        SelectedPaymentOption: selectedPayment,
        SelectedShippingAddress: cart?.ShippingAddressID || null,
        ShoppingCartID: cart?.ShoppingCartID || null,
        VoucherAmount: cart?.VoucherValue || 0,
        VoucherNo: voucherApplied ? voucherCode : "",
        WalletAmount: 0,
      };

      const response = await CheckoutService.validationBeforePayment(payload);
      const orderResp = await OrderService.generateOrder(payload);

      if (response?.status && orderResp?.data) {
        navigation.navigate("Drawer", {
          screen: "OrderSuccessScreen",
          params: { ORresponse: orderResp.data },
        });
        (async () => {
          try {
            await updateCart();
          } finally {
            setIsLoading(false);
          }
        })();
      } else {
        Toast.show({
          type: "error",
          text1: t("Order failed"),
          text2: t("Please try again."),
          position: "top",
          visibilityTime: 2000,
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("❌ Error generating order:", error.message);
      Toast.show({
        type: "error",
        text1: t("Something went wrong"),
        text2: error.message || "",
        position: "top",
        visibilityTime: 2000,
      });
      setIsLoading(false);
    }
  };

  // ✅ Memoized delivery option item
  const DeliveryOptionItem = React.memo(
    ({ item, selectedDelivery, onSelect }) => (
      <Pressable
        onPress={() => onSelect(item.DeliveryTypeID)}
        style={({ pressed }) => [
          styles.deliveryOptionItem,
          selectedDelivery === item.DeliveryTypeID &&
            styles.deliveryOptionItemSelected,
          pressed && { opacity: 0.85 },
        ]}
      >
        <View
          style={[
            styles.radioButton,
            selectedDelivery === item.DeliveryTypeID &&
              styles.radioButtonSelected,
          ]}
        >
          {selectedDelivery === item.DeliveryTypeID && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
        <Text
          style={[
            styles.deliveryOptionText,
            selectedDelivery === item.DeliveryTypeID &&
              styles.deliveryOptionTextSelected,
          ]}
        >
          {item.DeliveryTypeName}
        </Text>
      </Pressable>
    )
  );

  return (
    <>
      <View style={[styles.container || styles.Container, { height: "100%" }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={[
            styles.ScrollView,
            client === "almadina" && { paddingBottom: hp("18%") },
          ]}
        >
          {client === "almadina" ? (
            <>
              {/* 1. Delivery Address Section */}
              <View style={almadinaStyles.sectionContainer}>
                <Text style={almadinaStyles.sectionTitle}>
                  DELIVERED TO{" "}
                  <Text style={almadinaStyles.requiredAsterisk}>*</Text>
                </Text>
                {loading ? (
                  <Skeleton
                    height={120}
                    width={"100%"}
                    radius={12}
                    colorMode="light"
                  />
                ) : (
                  <View style={almadinaStyles.addressCard}>
                    <View style={almadinaStyles.addressHeader}>
                      <View style={almadinaStyles.addressIconContainer}>
                        <Image
                          source={require("../../../assets/images/client/benchmarkfoods/location_icon.png")}
                          style={almadinaStyles.locationIconImage}
                        />
                      </View>
                      <View style={almadinaStyles.addressContent}>
                        <Text style={almadinaStyles.addressName}>
                          {(address?.FirstName ?? "") +
                            " " +
                            (address?.LastName ?? "")}
                        </Text>
                        <Text
                          style={almadinaStyles.addressText}
                          numberOfLines={2}
                        >
                          {address?.AddressLine1 || address?.Address || ""}
                          {address?.AddressLine2
                            ? `, ${address.AddressLine2}`
                            : ""}
                        </Text>
                        {address?.PhoneNumber && (
                          <Text style={almadinaStyles.addressPhone}>
                            📞 {address.PhoneNumber}
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => navigation.navigate("AddressSwitch", {
                           fromCheckout: true ,
                           Currentaddress:`${address.ContactID}`

                          })}
                        style={almadinaStyles.editIconButton}
                      >
                        <Image
                          source={require("../../../assets/images/client/benchmarkfoods/edit.png")}
                          style={almadinaStyles.editIcon}
                        />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("Address")}
                      style={almadinaStyles.addAddressButton}
                    >
                      <Text style={almadinaStyles.addAddressButtonText}>
                        + Add New Address
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* 2. Delivery Options with Time Slots */}
              <View style={almadinaStyles.sectionContainer}>
                <Text style={almadinaStyles.sectionTitle}>
                  DELIVERY OPTIONS{" "}
                  <Text style={almadinaStyles.requiredAsterisk}>*</Text>
                </Text>
                {loading ? (
                  <Skeleton
                    height={120}
                    width={"100%"}
                    radius={10}
                    colorMode="light"
                  />
                ) : (
                  <View style={almadinaStyles.deliveryCard}>
                    {delivery &&
                      Array.isArray(delivery) &&
                      delivery.length > 0 &&
                      delivery
                        .filter(
                          (item) =>
                            item.DeliveryTypeName &&
                            item.DeliveryTypeName.trim() !== ""
                        )
                        .map((item) => (
                          <TouchableOpacity
                            key={item.DeliveryTypeID}
                            onPress={() =>
                              handleDeliverySelection(item.DeliveryTypeID)
                            }
                            style={[
                              almadinaStyles.deliveryOption,
                              selectedDelivery === item.DeliveryTypeID &&
                                almadinaStyles.deliveryOptionSelected,
                            ]}
                          >
                            <View style={almadinaStyles.radioOuter}>
                              {selectedDelivery === item.DeliveryTypeID && (
                                <View style={almadinaStyles.radioInner} />
                              )}
                            </View>
                            <Text
                              style={[
                                almadinaStyles.deliveryText,
                                selectedDelivery === item.DeliveryTypeID &&
                                  almadinaStyles.deliveryTextSelected,
                              ]}
                            >
                              {item.DeliveryTypeName}
                            </Text>
                          </TouchableOpacity>
                        ))}

                    {/* Time Slots */}
                    {(() => {
                      const deliveryArray = Array.isArray(delivery)
                        ? delivery
                        : [];
                      const selectedDeliveryObj = deliveryArray.find(
                        (d) => d.DeliveryTypeID === selectedDelivery
                      );
                      const availableSlots =
                        selectedDeliveryObj?.TimeSlots?.filter(
                          (slot) => !slot.Disabled
                        ) || [];

                      return (
                        selectedDelivery &&
                        availableSlots.length > 0 && (
                          <View style={almadinaStyles.timeSlotsContainer}>
                            <Text style={almadinaStyles.timeSlotLabel}>
                              Select Time Slot:{" "}
                              <Text style={almadinaStyles.requiredAsterisk}>
                                *
                              </Text>
                            </Text>
                            <View style={almadinaStyles.timeSlotsRow}>
                              {availableSlots.map((slot, index) => {
                                const slotId =
                                  slot.DeliveryTypeTimeSlotMapIID ||
                                  slot.DeliveryTypeTimeSlotMapID ||
                                  slot.TimeSlotID;
                                const timeRange = `${slot.TimeFrom} - ${slot.TimeTo}`;

                                return (
                                  <TouchableOpacity
                                    key={slotId || `slot-${index}`}
                                    onPress={() =>
                                      handleTimeSlotSelection(slotId)
                                    }
                                    style={[
                                      almadinaStyles.timeSlotOption,
                                      selectedTimeSlot === slotId &&
                                        almadinaStyles.timeSlotOptionSelected,
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        almadinaStyles.timeSlotText,
                                        selectedTimeSlot === slotId &&
                                          almadinaStyles.timeSlotTextSelected,
                                      ]}
                                    >
                                      {timeRange}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          </View>
                        )
                      );
                    })()}
                  </View>
                )}
              </View>

              {/* 3. Apply Voucher */}
              <View style={almadinaStyles.sectionContainer}>
                <Text style={almadinaStyles.sectionTitle}>
                  {t("APPLY VOUCHER")}
                </Text>
                <View style={almadinaStyles.voucherCard}>
                  <View style={almadinaStyles.voucherCheckboxContainer}>
                    <TouchableOpacity
                      onPress={() => {
                        setHasVoucher(!hasVoucher);
                        if (hasVoucher) {
                          setVoucherCode("");
                          setVoucherApplied(false);
                        }
                      }}
                      style={almadinaStyles.voucherCheckboxRow}
                    >
                      <View style={almadinaStyles.checkboxOuter}>
                        {hasVoucher && (
                          <Text style={almadinaStyles.checkmark}>✓</Text>
                        )}
                      </View>
                      <Text style={almadinaStyles.voucherCheckboxText}>
                        {t("I have a voucher code")}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {hasVoucher && (
                    <View style={almadinaStyles.voucherInputContainer}>
                      <TextInput
                        style={almadinaStyles.voucherInput}
                        placeholder={t("Enter voucher code")}
                        placeholderTextColor="#999"
                        value={voucherCode}
                        onChangeText={setVoucherCode}
                        editable={!voucherApplied}
                      />
                      <TouchableOpacity
                        onPress={handleVoucherApply}
                        disabled={!voucherCode.trim() || voucherApplied}
                        style={[
                          almadinaStyles.voucherButton,
                          (!voucherCode.trim() || voucherApplied) &&
                            almadinaStyles.voucherButtonDisabled,
                        ]}
                      >
                        <Text
                          style={[
                            almadinaStyles.voucherButtonText,
                            (!voucherCode.trim() || voucherApplied) &&
                              almadinaStyles.voucherButtonTextDisabled,
                          ]}
                        >
                          {voucherApplied ? t("Applied") : t("Apply")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              {/* 4. Order Note */}
              <View style={almadinaStyles.sectionContainer}>
                <Text style={almadinaStyles.sectionTitle}>
                  {t("Order Notes")}
                </Text>
                <View style={almadinaStyles.orderNoteCard}>
                  <TextInput
                    style={almadinaStyles.orderNoteInput}
                    placeholder={t("Add instructions for your order...")}
                    placeholderTextColor="#999"
                    value={orderNote}
                    onChangeText={setOrderNote}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>

              {/* 5. Amount Details */}
              <View style={almadinaStyles.sectionContainer}>
                <Text style={almadinaStyles.sectionTitle}>
                  {t("Amount Details")}
                </Text>
                {loading ? (
                  <Skeleton
                    height={150}
                    width={"100%"}
                    radius={10}
                    colorMode="light"
                  />
                ) : (
                  <View style={almadinaStyles.amountCard}>
                    <View style={almadinaStyles.amountRow}>
                      <Text style={almadinaStyles.amountLabel}>
                        Cart Total:
                      </Text>
                      <Text style={almadinaStyles.amountValue}>
                        {(cart?.SubTotal || 0).toFixed(2)}{" "}
                        {cart?.Currency || "AED"}
                      </Text>
                    </View>
                    <View style={almadinaStyles.amountRow}>
                      <Text style={almadinaStyles.amountLabel}>
                        Delivery Fee:
                      </Text>
                      <Text style={almadinaStyles.amountValue}>
                        {(cart?.DeliveryCharge || 0).toFixed(2)}{" "}
                        {cart?.Currency || "AED"}
                      </Text>
                    </View>
                    {voucherApplied && cart?.VoucherValue > 0 && (
                      <View style={almadinaStyles.amountRow}>
                        <Text
                          style={[
                            almadinaStyles.amountLabel,
                            { color: "#68B054" },
                          ]}
                        >
                          Voucher Discount:
                        </Text>
                        <Text
                          style={[
                            almadinaStyles.amountValue,
                            { color: "#68B054" },
                          ]}
                        >
                          -{(cart?.VoucherValue || 0).toFixed(2)}{" "}
                          {cart?.Currency || "AED"}
                        </Text>
                      </View>
                    )}
                    <View style={almadinaStyles.divider} />
                    <View style={almadinaStyles.amountRow}>
                      <Text style={almadinaStyles.totalLabel}>Total:</Text>
                      <Text style={almadinaStyles.totalValue}>
                        {(cart?.Total || 0).toFixed(2)}{" "}
                        {cart?.Currency || "AED"}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* 6. Payment Method */}
              <View style={almadinaStyles.sectionContainer}>
                <Text style={almadinaStyles.sectionTitle}>
                  {t("PAYMENT METHOD")}{" "}
                  <Text style={almadinaStyles.requiredAsterisk}>*</Text>
                </Text>
                {loading ? (
                  <Skeleton
                    height={200}
                    width={"100%"}
                    radius={10}
                    colorMode="light"
                  />
                ) : (
                  <View style={almadinaStyles.paymentCard}>
                    {payment &&
                      payment.length > 0 &&
                      payment
                        .filter(
                          (item) =>
                            !item.PaymentMethodName.toLowerCase().includes(
                              "voucher"
                            )
                        )
                        .map((item) => {
                          // Determine display name and icon based on payment method
                          let displayName = item.PaymentMethodName;
                          let iconSource = null;

                          const paymentNameLower =
                            item.PaymentMethodName.toLowerCase();

                          if (
                            paymentNameLower.includes("cash") ||
                            paymentNameLower.includes("cod")
                          ) {
                            displayName = "Cash On Delivery";
                            iconSource = require("../../../assets/images/client/almadina/money-2.png");
                          } else if (
                            paymentNameLower.includes("debit") ||
                            paymentNameLower.includes("card") ||
                            paymentNameLower.includes("tap")
                          ) {
                            displayName = "Tap/Card On Delivery";
                            iconSource = require("../../../assets/images/client/almadina/card.png");
                          } else if (
                            paymentNameLower.includes("online") ||
                            paymentNameLower.includes("link") ||
                            paymentNameLower.includes("pay")
                          ) {
                            displayName = "Pay Online Via Link";
                            iconSource = require("../../../assets/images/client/almadina/pay_via_Link.png");
                          } else {
                            // Fallback for any other payment methods
                            iconSource = require("../../../assets/images/client/almadina/card.png");
                          }

                          return (
                            <View key={item.PaymentMethodID}>
                              <TouchableOpacity
                                onPress={() => {
                                  setSelectedPayment(item.PaymentMethodID);
                                  
                                  // Set payment message for all payment methods
                                  
                                  // Define payment method name in lowercase for comparison
                                  const currentPaymentNameLower = item.PaymentMethodName.toLowerCase();
                                  
                                  // Get API message if available
                                  const apiMessage = item.Message || item.Description || item.Instructions;
                                  let messageToShow = "";
                                  
                                  // Determine message based on payment method
                                  if (currentPaymentNameLower.includes("online") || 
                                      currentPaymentNameLower.includes("link") || 
                                      currentPaymentNameLower.includes("pay")) {
                                    messageToShow = apiMessage || "We will send a unique payment link via WhatsApp after your order is packed.";
                                  } else if (currentPaymentNameLower.includes("cash") || 
                                             currentPaymentNameLower.includes("cod") ||
                                             currentPaymentNameLower.includes("delivery")) {
                                    messageToShow = apiMessage || "Pay with cash when your order is delivered to your doorstep. Our delivery team will collect the payment upon arrival.";
                                  } else if (currentPaymentNameLower.includes("card") || 
                                             currentPaymentNameLower.includes("tap") ||
                                             currentPaymentNameLower.includes("debit") ||
                                             currentPaymentNameLower.includes("credit")) {
                                    messageToShow = apiMessage || "Pay with your debit/credit card or tap to pay when your order is delivered. Our delivery team carries a portable card reader.";
                                  } else {
                                    // For any other payment methods
                                    messageToShow = apiMessage || `${item.PaymentMethodName} payment method selected. Payment details will be provided during checkout process.`;
                                  }
                                  
                                  setPaymentMessage(messageToShow);
                                }}
                                style={[
                                  almadinaStyles.paymentOption,
                                  selectedPayment === item.PaymentMethodID &&
                                    almadinaStyles.paymentOptionSelected,
                                ]}
                              >
                                <View style={almadinaStyles.paymentLeft}>
                                  <Image
                                    source={iconSource}
                                    style={almadinaStyles.paymentIconImage}
                                  />
                                  <Text style={almadinaStyles.paymentText}>
                                    {displayName}
                                  </Text>
                                </View>
                                <View
                                  style={[
                                    almadinaStyles.radioOuter,
                                    selectedPayment === item.PaymentMethodID &&
                                      almadinaStyles.radioOuterSelected,
                                  ]}
                                >
                                  {selectedPayment === item.PaymentMethodID && (
                                    <View style={almadinaStyles.radioInner} />
                                  )}
                                </View>
                              </TouchableOpacity>
                              

                            </View>
                          );
                        })}

                    {/* Payment Method Information Message */}
                    {paymentMessage && (
                      <View style={almadinaStyles.paymentMessageContainer}>
                        <View style={almadinaStyles.paymentMessageHeader}>
                          <Image
                            source={(() => {
                              const selectedPaymentMethod = Array.isArray(payment) ? payment.find(p => p.PaymentMethodID === selectedPayment) : null;
                              const paymentName = selectedPaymentMethod?.PaymentMethodName?.toLowerCase() || '';
                              if (paymentName.includes('cash') || paymentName.includes('cod')) {
                                return require("../../../assets/images/client/almadina/money-2.png");
                              }
                              if (paymentName.includes('debit') || paymentName.includes('card') || paymentName.includes('tap')) {
                                return require("../../../assets/images/client/almadina/card.png");
                              }
                              if (paymentName.includes('online') || paymentName.includes('link') || paymentName.includes('pay')) {
                                return require("../../../assets/images/client/almadina/pay_via_Link.png");
                              }
                              return require("../../../assets/images/client/almadina/card.png");
                            })()}
                            style={almadinaStyles.paymentMessageIconImage}
                          />
                          <Text style={almadinaStyles.paymentMessageTitle}>
                            {(() => {
                              const selectedPaymentMethod = Array.isArray(payment) ? payment.find(p => p.PaymentMethodID === selectedPayment) : null;
                              const paymentName = selectedPaymentMethod?.PaymentMethodName?.toLowerCase() || '';
                              if (paymentName.includes('cash') || paymentName.includes('cod')) return 'Cash On Delivery';
                              if (paymentName.includes('debit') || paymentName.includes('card') || paymentName.includes('tap')) return 'Tap/Card On Delivery';
                              if (paymentName.includes('online') || paymentName.includes('link') || paymentName.includes('pay')) return 'Pay Online Via Link';
                              return 'Payment Method';
                            })()}
                          </Text>
                        </View>
                        <Text style={almadinaStyles.paymentMessageText}>
                          {paymentMessage}
                        </Text>
                      </View>
                    )}

                    {/* Bring Change Option for Cash on Delivery */}
                    {(() => {
                      const selectedPaymentMethod = Array.isArray(payment) ? payment.find(
                        (p) => p.PaymentMethodID === selectedPayment
                      ) : null;
                      const isCashPayment =
                        selectedPaymentMethod?.PaymentMethodName.toLowerCase().includes(
                          "cash"
                        ) ||
                        selectedPaymentMethod?.PaymentMethodName.toLowerCase().includes(
                          "cod"
                        );

                      return (
                        selectedPayment &&
                        isCashPayment && (
                          <View style={almadinaStyles.bringChangeContainer}>
                            <Text style={almadinaStyles.bringChangeTitle}>
                              {t("Do you need change?")}
                            </Text>
                            <View style={almadinaStyles.changeAmountsRow}>
                              {[50, 100, 200, 500, 1000].map((amount) => (
                                <TouchableOpacity
                                  key={amount}
                                  onPress={() =>
                                    setChangeAmount(amount.toString())
                                  }
                                  style={[
                                    almadinaStyles.changeAmountOption,
                                    changeAmount === amount.toString() &&
                                      almadinaStyles.changeAmountOptionSelected,
                                  ]}
                                >
                                  <Text
                                    style={[
                                      almadinaStyles.changeAmountText,
                                      changeAmount === amount.toString() &&
                                        almadinaStyles.changeAmountTextSelected,
                                    ]}
                                  >
                                    {amount} {cart?.Currency || "AED"}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                            <TouchableOpacity
                              onPress={() => setChangeAmount("")}
                              style={[
                                almadinaStyles.noChangeOption,
                                changeAmount === "" &&
                                  almadinaStyles.noChangeOptionSelected,
                              ]}
                            >
                              <Text
                                style={[
                                  almadinaStyles.noChangeText,
                                  changeAmount === "" &&
                                    almadinaStyles.noChangeTextSelected,
                                ]}
                              >
                                {t("No change needed")}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )
                      );
                    })()}
                  </View>
                )}
              </View>
            </>
          ) : client === "benchmarkfoods" ? (
            <>
              <LocationAndAddressCard address={address} loading={loading} />

              {loading ? (
                <Skeleton
                  height={180}
                  width={"100%"}
                  radius={8}
                  colorMode="light"
                />
              ) : (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t("order_notes")}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t("enter_order_notes")}
                    placeholderTextColor="#888"
                    value={orderNote}
                    onChangeText={setOrderNote}
                    multiline
                  />
                </View>
              )}

              <PaymentMethod
                payment={payment}
                selectedPayment={selectedPayment}
                setSelectedPayment={setSelectedPayment}
                loading={loading}
              />
            </>
          ) : (
            <>
              <LocationAndAddressCard address={address} loading={loading} />

              {loading ? (
                <View
                  style={{ paddingHorizontal: wp("5.5%"), marginTop: hp("2%") }}
                >
                  <Skeleton
                    width={"40%"}
                    height={20}
                    radius={6}
                    colorMode="light"
                  />
                </View>
              ) : (
                <Text style={styles.sectionHeader}>
                  {" "}
                  {t("delivery_options")}
                </Text>
              )}

              {loading ? (
                <View style={styles.deliveryOptionsCard}>
                  <View style={styles.skeletonDeliveryOption}>
                    <Skeleton
                      width={24}
                      height={24}
                      radius={12}
                      colorMode="light"
                    />
                    <View style={{ marginLeft: wp("3%"), flex: 1 }}>
                      <Skeleton
                        width={"70%"}
                        height={18}
                        radius={6}
                        colorMode="light"
                      />
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.deliveryOptionsCard}>
                  {delivery &&
                    delivery.length > 0 &&
                    delivery
                      .filter((item) => item.DeliveryTypeName)
                      .map((item) => (
                        <DeliveryOptionItem
                          key={item.DeliveryTypeID}
                          item={item}
                          selectedDelivery={selectedDelivery}
                          onSelect={handleDeliverySelection}
                        />
                      ))}
                </View>
              )}

              <PaymentMethod
                payment={payment}
                selectedPayment={selectedPayment}
                setSelectedPayment={setSelectedPayment}
                loading={loading}
              />
            </>
          )}
        </ScrollView>



        {client === "benchmarkfoods" ? (
          <View style={styles.quantityTouchable}>
            {loading ? (
              <View style={{ width: "100%", alignItems: "center" }}>
                <Skeleton
                  height={50}
                  width={"100%"}
                  radius={8}
                  colorMode="light"
                />
              </View>
            ) : (
              <TouchableOpacity
                disabled={isLoading}
                onPress={() => handleOrderGeneration(selectedPayment)}
                style={[styles.addToCartButton, isLoading && { opacity: 0.6 }]}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#1D9ADC", "#0B489A"]}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.addToCartText}>{t("confirm")}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        ) : client === "almadina" ? (
          <TouchableOpacity
            disabled={isLoading || !isProceedEnabled}
            onPress={() => handleOrderGeneration(selectedPayment)}
            style={[
              almadinaStyles.proceedButton,
              (isLoading || !isProceedEnabled) &&
                almadinaStyles.proceedButtonDisabled,
            ]}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  almadinaStyles.proceedButtonText,
                  !isProceedEnabled && almadinaStyles.proceedButtonTextDisabled,
                ]}
              >
                {t("Proceed to Payment")}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <CustomButton
            buttonText={t("proceed_to_payment")}
            handleButtonPress={() => handleOrderGeneration(selectedPayment)}
            position="absolute"
            bottom={0.08}
            Radius={15}
            Width={"90%"}
            Height={"6%"}
            fontSize={RFValue(15, 800)}
            loading={isLoading}
            disabled={isLoading}
            type="normal"
          />
        )}
      </View>
    </>
  );
};

const almadinaStyles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: wp("4.44%"),
    marginBottom: hp("2%"),
  },
  sectionTitle: {
    fontSize: RFValue(12, 800),
    fontWeight: "700",
    color: "#525252",
    fontFamily: "Poppins-SemiBold",
    marginBottom: hp("1%"),
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: wp("4%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: hp("1.5%"),
  },
  addressIconContainer: {
    marginRight: wp("3%"),
    justifyContent: "center",
    alignItems: "center",
  },
  locationIconImage: {
    width: 24,
    height: 24,
    tintColor: "#68B054",
  },
  addressContent: {
    flex: 1,
  },
  addressName: {
    fontSize: RFValue(15, 800),
    fontWeight: "700",
    color: "#333",
    fontFamily: "Poppins-Bold",
    marginBottom: hp("0.5%"),
  },
  addressText: {
    fontSize: RFValue(13, 800),
    color: "#666",
    fontFamily: "Poppins-Regular",
    lineHeight: RFValue(18, 800),
    marginBottom: hp("0.5%"),
  },
  addressPhone: {
    fontSize: RFValue(13, 800),
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  editIconButton: {
    padding: wp("2%"),
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    width: 20,
    height: 20,
    tintColor: "#68B054",
  },
  addAddressButton: {
    borderWidth: 1.5,
    borderColor: "#68B054",
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: hp("1.5%"),
    alignItems: "center",
    justifyContent: "center",
  },
  addAddressButtonText: {
    fontSize: RFValue(14, 800),
    color: "#68B054",
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
  },
  addressCardWrapper: {
    transform: [{ scale: 1 }],
  },
  deliveryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: wp("4%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("3%"),
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: hp("1%"),
  },
  deliveryOptionSelected: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#68B054",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#999",
    alignItems: "center",
    justifyContent: "center",
    marginRight: wp("3%"),
  },
  radioOuterSelected: {
    borderColor: "#68B054",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#68B054",
  },
  deliveryText: {
    fontSize: RFValue(14, 800),
    color: "#525252",
    fontFamily: "Poppins-Regular",
    flex: 1,
  },
  deliveryTextSelected: {
    color: "#68B054",
    fontWeight: "600",
  },
  voucherCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: wp("4%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voucherCheckboxContainer: {
    marginBottom: hp("1.5%"),
  },
  voucherCheckboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  voucherCheckboxText: {
    fontSize: RFValue(14, 800),
    color: "#333",
    fontFamily: "Poppins-Regular",
  },
  voucherInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  voucherInput: {
    flex: 1,
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("1.2%"),
    fontSize: RFValue(14, 800),
    fontFamily: "Poppins-Regular",
    color: "#333",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginRight: wp("2%"),
  },
  voucherButton: {
    backgroundColor: "#68B054",
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("1.2%"),
    borderRadius: 8,
  },
  voucherButtonDisabled: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
  },
  voucherButtonText: {
    color: "#FFFFFF",
    fontSize: RFValue(14, 800),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  voucherButtonTextDisabled: {
    color: "#999999",
  },
  orderNoteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: wp("3%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderNoteInput: {
    fontSize: RFValue(14, 800),
    fontFamily: "Poppins-Regular",
    color: "#333",
    minHeight: hp("10%"),
    maxHeight: hp("12%"),
    textAlignVertical: "top",
    paddingTop: hp("1%"),
  },
  amountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: wp("4%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("1%"),
  },
  amountLabel: {
    fontSize: RFValue(13, 800),
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  amountValue: {
    fontSize: RFValue(13, 800),
    color: "#333",
    fontFamily: "Poppins-Medium",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: hp("1%"),
  },
  totalLabel: {
    fontSize: RFValue(16, 800),
    color: "#333",
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
  },
  totalValue: {
    fontSize: RFValue(16, 800),
    color: "#68B054",
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
  },
  paymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: wp("3%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp("1.8%"),
    paddingHorizontal: wp("3%"),
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: hp("1%"),
  },
  paymentOptionSelected: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#68B054",
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: wp("3%"),
  },
  paymentIconImage: {
    width: 32,
    height: 32,
    marginRight: wp("3%"),
    resizeMode: "contain",
  },
  paymentText: {
    fontSize: RFValue(14, 800),
    color: "#333",
    fontFamily: "Poppins-Medium",
  },
  bringChangeContainer: {
    marginTop: hp("1.5%"),
    paddingTop: hp("1.5%"),
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  bringChangeTitle: {
    fontSize: RFValue(14, 800),
    fontWeight: "600",
    color: "#333",
    fontFamily: "Poppins-SemiBold",
    marginBottom: hp("1.5%"),
  },
  changeAmountsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: hp("1%"),
  },
  changeAmountOption: {
    width: "48%",
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("3%"),
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: hp("1%"),
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  changeAmountOptionSelected: {
    backgroundColor: "#E8F5E9",
    borderColor: "#68B054",
  },
  changeAmountText: {
    fontSize: RFValue(13, 800),
    color: "#525252",
    fontFamily: "Poppins-Regular",
  },
  changeAmountTextSelected: {
    color: "#68B054",
    fontWeight: "600",
  },
  noChangeOption: {
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("3%"),
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  noChangeOptionSelected: {
    backgroundColor: "#E8F5E9",
    borderColor: "#68B054",
  },
  noChangeText: {
    fontSize: RFValue(13, 800),
    color: "#525252",
    fontFamily: "Poppins-Regular",
  },
  noChangeTextSelected: {
    color: "#68B054",
    fontWeight: "600",
  },
  bringChangeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1%"),
  },
  checkboxOuter: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#68B054",
    alignItems: "center",
    justifyContent: "center",
    marginRight: wp("2%"),
  },
  checkmark: {
    color: "#68B054",
    fontSize: 14,
    fontWeight: "bold",
  },
  bringChangeText: {
    fontSize: RFValue(13, 800),
    color: "#333",
    fontFamily: "Poppins-Regular",
  },
  changeInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("1%"),
    fontSize: RFValue(14, 800),
    fontFamily: "Poppins-Regular",
    color: "#333",
    marginTop: hp("0.5%"),
  },
  timeSlotsContainer: {
    marginTop: hp("2%"),
    paddingTop: hp("2%"),
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  timeSlotLabel: {
    fontSize: RFValue(13, 800),
    fontWeight: "600",
    color: "#333",
    fontFamily: "Poppins-SemiBold",
    marginBottom: hp("1%"),
  },
  timeSlotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  timeSlotOption: {
    width: "48%",
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("3%"),
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: hp("1%"),
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  timeSlotOptionSelected: {
    backgroundColor: "#E8F5E9",
    borderColor: "#68B054",
  },
  timeSlotText: {
    fontSize: RFValue(13, 800),
    color: "#525252",
    fontFamily: "Poppins-Regular",
  },
  timeSlotTextSelected: {
    color: "#68B054",
    fontWeight: "600",
  },
  proceedButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#68B054",
    marginHorizontal: wp("4.44%"),
    marginBottom: hp("10%"),
    borderRadius: 12,
    paddingVertical: hp("1.8%"),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  proceedButtonInline: {
    backgroundColor: "#68B054",
    borderRadius: 12,
    paddingVertical: hp("1.8%"),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginTop: hp("1%"),
  },
  proceedButtonText: {
    color: "#FFFFFF",
    fontSize: RFValue(16, 800),
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
  },
   proceedButtonDisabled: {
   backgroundColor: "#595a59ff",
   opacity: 0.7,
 },
 proceedButtonTextDisabled: {
   color: "#ffffffff",
 },
  requiredAsterisk: {
    color: "#FF0000",
    fontSize: RFValue(14, 800),
    fontWeight: "700",
  },
  // Modern Payment Info Card Styles
  paymentInfoCard: {
    backgroundColor: "#F8FFFE",
    borderRadius: 16,
    marginTop: hp("1.5%"),
    marginHorizontal: wp("1%"),
    padding: wp("4%"),
    borderWidth: 1,
    borderColor: "#E0F2F1",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  paymentInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1.5%"),
  },
  paymentInfoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("3%"),
  },
  paymentInfoIconText: {
    fontSize: RFValue(16, 800),
  },
  paymentInfoTitle: {
    fontSize: RFValue(14, 800),
    fontWeight: "600",
    color: "#1B5E20",
    fontFamily: "Poppins-SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  paymentInfoMessage: {
    fontSize: RFValue(14, 800),
    color: "#2E7D32",
    fontFamily: "Poppins-Medium",
    lineHeight: RFValue(20, 800),
    marginBottom: hp("2%"),
    backgroundColor: "#FFFFFF",
    padding: wp("3.5%"),
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  paymentInfoFeatures: {
    flexDirection: "column",
    gap: hp("0.8%"),
  },
  paymentFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: hp("0.8%"),
    paddingHorizontal: wp("3%"),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8F5E9",
  },
  paymentFeatureIcon: {
    fontSize: RFValue(14, 800),
    color: "#4CAF50",
    fontWeight: "700",
    marginRight: wp("2.5%"),
    width: 20,
    textAlign: "center",
  },
  paymentFeatureText: {
    fontSize: RFValue(12, 800),
    color: "#388E3C",
    fontFamily: "Poppins-Medium",
    flex: 1,
  },
  // Payment Message Styles
  paymentMessageContainer: {
    backgroundColor: "#F8FFFE",
    marginTop: hp("2%"),
    marginHorizontal: wp("4%"),
    padding: wp("4%"),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0F2F1",
  },
  paymentMessageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1%"),
  },
  paymentMessageIconImage: {
    width: 24,
    height: 24,
    marginRight: wp("2%"),
    resizeMode: "contain",
  },
  paymentMessageTitle: {
    fontSize: RFValue(14, 800),
    fontWeight: "600",
    color: "#1B5E20",
    fontFamily: "Poppins-SemiBold",
  },
  paymentMessageText: {
    fontSize: RFValue(13, 800),
    color: "#2E7D32",
    fontFamily: "Poppins-Medium",
    lineHeight: RFValue(18, 800),
    backgroundColor: "#FFFFFF",
    padding: wp("3%"),
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#4CAF50",
  },
});

export default NormalCheckout;
