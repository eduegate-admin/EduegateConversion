import { View, Text, Image, StyleSheet } from "react-native";
import React from "react";
import CustomButton from "../../../component/CustomButton";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import BillSummaryCard from "../../../component/BillSummaryCard";

const client = process.env.CLIENT;

const NormalOrderSuccess = (props) => {
  const data = props.route.params.ORresponse
  // console.log("ORresponse FULL DATA:",JSON.stringify(data, null, 2));
    console.log("HasRewards:", data?.HasRewards);
    console.log("showRewards:", data?.showRewards);
    console.log("rewardMessage:", data?.rewardMessage);
    console.log("Rewards:", data?.Rewards);
    console.log("RewardPoints:", data?.RewardPoints);
  
  const navigation = useNavigation();
  const { t } = useTranslation();

  // Format payment method for display
  const formatPaymentMethod = (method) => {
    const methodMap = {
      'COD': 'Cash on Delivery',
      'PAYONLINEVIALINK': 'Pay Online via Link',
      'CARDONDELIVERY': 'Card on Delivery'
    };
    return methodMap[method] || method;
  };

  // Get payment method from orderHistory array
  const paymentMethod = data?.orderHistory?.[0]?.PaymentMethod;
  const formattedPaymentMethod = paymentMethod ? formatPaymentMethod(paymentMethod) : paymentMethod;

  // Transform data with formatted payment method
  const formattedData = {
    ...data,
    PaymentMethod: formattedPaymentMethod,
    PaymentMethodName: formattedPaymentMethod,
    PaymentActualMethodName: formattedPaymentMethod,
    PaymentMethodText: formattedPaymentMethod,
    orderHistory: data?.orderHistory ? data.orderHistory.map(order => ({
      ...order,
      PaymentMethod: formattedPaymentMethod,
      PaymentMethodText: formattedPaymentMethod,
      CartPaymentMethod: formattedPaymentMethod
    })) : []
  };

  // console.log("Original PaymentMethod:", paymentMethod);
  // console.log("Formatted PaymentMethod:", formattedPaymentMethod);
  // console.log("Checking formattedData.PaymentMethodText:", formattedData.PaymentMethodText);
  // console.log("Checking formattedData.PaymentMethodName:", formattedData.PaymentMethodName);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Image
          style={styles.successIcon}
          source={require(`../../../assets/images/client/${client}/OrderSucess.png`)}
        />
        
        <View style={styles.titleContainer}>
          <Text style={[styles.titleText, { color: client === "almadina" ? "#68B054" : "#133051" }]}>
            {t("your_order_placed")}
          </Text>
          <Text style={[styles.titleText, { color: client === "almadina" ? "#68B054" : "#133051" }]}>
            {t("successfully")}
          </Text>
        </View>

        {client === "almadina" ? (
          <BillSummaryCard cart={formattedData} visibleFields={["OrderNumber", "Delivery", "PaymentMethod", "CartTotal", "Total"]} backgroundColor="#E8F5E9" />
        ) : (
          <BillSummaryCard cart={formattedData} visibleFields={["CartID", "OrderNumber", "DeliveryMethod","subTotal","DeliveryCharge","AdditionalCharges"]} />
        )}

        {/* Rewards message - static display for almadina client */}
        {/* Condition removed: (data?.HasRewards || data?.showRewards || data?.rewardMessage || data?.Rewards || data?.RewardPoints > 0) */}
        {client === "almadina" && (
          <View style={styles.rewardsContainer}>
            <View style={styles.rewardsIconContainer}>
              <Text style={styles.rewardsIcon}>⭐</Text>
            </View>
            <Text style={styles.rewardsText}>
              Your Plus Rewards Points for this order will be added to your account within 24 hours of delivery.
            </Text>
          </View>
        )}
      </View>

      {client === "almadina" ? (
        <View style={styles.almadinaButtonContainer}>
          <TouchableOpacity
            style={styles.myOrdersButton}
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: "Footer", params: { screen: "Order" } }],
            })}
          >
            <Text style={styles.myOrdersText}>My orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.keepShoppingButton}
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: "Footer", params: { screen: "HomeScreen" } }],
            })}
          >
            <Text style={styles.keepShoppingText}>Keep shopping</Text>
          </TouchableOpacity>
        </View>
      ) : client === "benchmarkfoods" ? (
        <View  style={{ width: wp("91.11%"),
        alignSelf: "center",
        marginVertical: hp("4%"),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: hp("2%"),
        paddingBottom: hp("7%"),
        marginTop: hp("2%"),}}>
          <TouchableOpacity
            style={styles.quantityTouchable}
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: "Footer", params: { screen: "HomeScreen" } }],
            })}
          >
            <View style={styles.addToCartButton}>
              <LinearGradient
                colors={["#1D9ADC", "#0B489A"]}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Text style={styles.addToCartText}>Home Screen</Text>
              </LinearGradient>
            </View>

          </TouchableOpacity>
                    <TouchableOpacity
            style={styles.quantityTouchable}
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: "Footer", params: { screen: "Order" } }],
            })}
          >
            <View style={styles.addToCartButton}>
              <LinearGradient
                colors={["#1D9ADC", "#0B489A"]}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Text style={styles.addToCartText}>Order History</Text>
              </LinearGradient>
            </View>

          </TouchableOpacity>

        </View>
      ) : (
        <>
          <CustomButton
            buttonText="Order History"
            handleButtonPress={() => navigation.navigate("Order")}
            position="absolute"
            bottom={0.15}
            Radius={15}
            Width={"50%"}
            Height={"5%"}
            fontSize={14}
            type="normal"
            buttonTextColor={"#FFF"}
            buttonColor={"#68B054"}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate("Footer", {
              screen: "Home"
            })}
            style={{
              justifyContent: "center",
              alignItems: "center",
              bottom: 100,
              position: "absolute",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: 600, color: "#68B054" }}>
              {t("back_to_home")}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: hp("5%"),
  },
  successIcon: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: hp("3%"),
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  titleText: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
  },
  quantityTouchable: {
    // backgroundColor: "#FFFFFF",
    width: wp("43.33%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
    // marginTop:43.33,
  },
  gradientButton: {
    width: wp("43.33%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    // marginTop: 20,
    overflow: "hidden",
  },
  addToCartButton: {
    width: wp("43.33%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
    // paddingHorizontal: 26,
    marginBottom: 7,
    borderRadius: 10,
    // backgroundColor: colors.green,
  },
  addToCartText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  almadinaButtonContainer: {
    width: wp("91.11%"),
    alignSelf: "center",
    marginVertical: hp("4%"),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: hp("2%"),
    paddingBottom: hp("1%"),
    marginTop: hp("2%"),
  },
  myOrdersButton: {
    width: wp("43.33%"),
    height: hp("5.54%"),
    backgroundColor: "#68B054",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  myOrdersText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  keepShoppingButton: {
    width: wp("43.33%"),
    height: hp("5.54%"),
    backgroundColor: "#68B054",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  keepShoppingText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  rewardsContainer: {
    backgroundColor: "#D9EDF7",
    borderRadius: 10,
    padding: 15,
    width: wp("91.11%"),
    alignSelf: "center",
    marginTop: hp("-1%"),
    marginBottom: hp("1%"),
    flexDirection: "row",
    alignItems: "center",
  },
  rewardsIconContainer: {
    marginRight: 10,
  },
  rewardsIcon: {
    fontSize: 24,
  },
  rewardsText: {
    flex: 1,
    color: "#31708F",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    lineHeight: 20,
  },
});

export default NormalOrderSuccess;
