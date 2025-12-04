import { StyleSheet, Text, View, I18nManager } from "react-native";
import { useTranslation } from "react-i18next";
import React from "react";
import { Skeleton } from "moti/skeleton";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const BillSummaryCard = ({ cart, loading, visibleFields = [], backgroundColor = "#DEECFA" }) => {
  const { t, i18n } = useTranslation();
  const showField = (field) => visibleFields.includes(field);
  const isRTL = I18nManager.isRTL;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedTime = `${formattedHours}:${
      minutes < 10 ? "0" : ""
    }${minutes} ${ampm}`;

    return { date: formattedDate, time: formattedTime };
  };

  // console.log(cart);

  return (
    <>
      {loading ? (
        <View style={styles.paymentSection}>
          <Skeleton height={20} width="30%" radius={4} colorMode="light" />
          <View style={[styles.AmountView, { paddingTop: 20 }]}>
            <View style={styles.TextView}>
              <Skeleton height={15} width="35%" radius={4} colorMode="light" />
              <Skeleton height={15} width={60} radius={4} colorMode="light" />
            </View>

            <View style={[styles.TextView, { marginTop: 16 }]}>
              <Skeleton height={15} width="45%" radius={4} colorMode="light" />
              <Skeleton height={15} width={40} radius={4} colorMode="light" />
            </View>

            <View style={[styles.TextView, { marginTop: 16 }]}>
              <Skeleton height={18} width="30%" radius={4} colorMode="light" />
              <Skeleton height={18} width={70} radius={4} colorMode="light" />
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.paymentSection, { backgroundColor }]}>
          <Text style={[styles.Header, { textAlign: isRTL ? 'right' : 'left' }]}>{t("bill_summary")}</Text>
          {/* <View style={{ marginTop: 15 }}>
        <CustomTextInput placeholder={"Enter promo Code"} Apply={true} />
      </View> */}
          <View style={styles.AmountView}>
            {showField("CartID") && (
              <View style={[styles.TextView, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.Text, { fontWeight: "regular", textAlign: isRTL ? 'right' : 'left' }]}>
                  {t("cart_id_label")}
                </Text>
                <Text style={[styles.Text, { fontWeight: "500", textAlign: isRTL ? 'left' : 'right' }]}>
                  {cart.CartID}
                </Text>
              </View>
            )}
            {showField("OrderNumber") && (
              <View style={[styles.TextView, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.Text, { fontWeight: "regular", textAlign: isRTL ? 'right' : 'left' }]}>
                  {t("order_number")}
                </Text>
                <Text style={[styles.Text, { fontWeight: "500", textAlign: isRTL ? 'left' : 'right' }]}>
                  {cart.TransactionNo}
                </Text>
              </View>
            )}
            {showField("DeliveryDate") &&
              cart.orderHistory?.[0]?.TransactionDate !== null && (
                <View style={[styles.TextView, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={[styles.Text, { fontWeight: "regular", textAlign: isRTL ? 'right' : 'left' }]}>
                    {t("delivery_date")}
                  </Text>
                  <Text style={[styles.Text, { fontWeight: "500", textAlign: isRTL ? 'left' : 'right' }]}>
                    {formatDate(cart.orderHistory?.[0]?.TransactionDate ?? 0).date}
                  </Text>
                </View>
              )}
            {showField("subTotal") &&
              (cart?.SubTotal ?? cart?.orderHistory?.[0]?.SubTotal ?? 0) !==
                0 && (
                <View style={[styles.TextView, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={[styles.Text, { fontWeight: "regular", textAlign: isRTL ? 'right' : 'left' }]}>
                    {t("sub_total")}
                  </Text>
                  <Text style={[styles.Text, { fontWeight: "500", textAlign: isRTL ? 'left' : 'right' }]}>
                    {(
                      cart?.SubTotal ??
                      cart?.orderHistory?.[0]?.SubTotal ??
                      0
                    ).toFixed(2)}{" "}
                    {cart?.Currency ?? ""}
                  </Text>
                </View>
              )}
            {showField("DeliveryCharge") &&
              (cart?.orderHistory?.[0]?.DeliveryCharge ?? 0) !== 0 && (
                <View style={[styles.TextView, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={[styles.Text, { fontWeight: "regular", textAlign: isRTL ? 'right' : 'left' }]}>
                    {t("delivery_charge")}
                  </Text>
                  <Text style={[styles.Text, { fontWeight: "500", textAlign: isRTL ? 'left' : 'right' }]}>
                    {(cart?.orderHistory?.[0]?.DeliveryCharge ?? 0).toFixed(2)}{" "}
                    {cart?.Currency ?? ""}
                  </Text>
                </View>
              )}
            {showField("AdditionalCharges") &&
              (cart?.orderHistory?.[0]?.AdditionalCharges ?? 0) !== 0 && (
                <View style={[styles.TextView, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={[styles.Text, { fontWeight: "regular", textAlign: isRTL ? 'right' : 'left' }]}>
                    {t("additional_charges")}
                  </Text>
                  <Text style={[styles.Text, { fontWeight: "500", textAlign: isRTL ? 'left' : 'right' }]}>
                    {(cart?.orderHistory?.[0]?.AdditionalCharges ?? 0).toFixed(
                      2
                    )}{" "}
                    {cart?.Currency ?? ""}
                  </Text>
                </View>
              )}

            {showField("DeliveryMethod") && (
              <View style={[styles.TextView, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.Text, { fontWeight: "regular", textAlign: isRTL ? 'right' : 'left' }]}>
                  {t("delivery_method")}
                </Text>
                <Text style={[styles.Text, { fontWeight: "500", textAlign: isRTL ? 'left' : 'right' }]}>
                  {cart.PaymentMethodText || cart.PaymentMethodName}
                </Text>
              </View>
            )}
            {showField("Delivery") && (
              <View style={[styles.TextView, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.Text, { fontWeight: "regular", textAlign: isRTL ? 'right' : 'left' }]}>
                  Delivery :
                </Text>
                <Text style={[styles.Text, { fontWeight: "500", textAlign: isRTL ? 'left' : 'right' }]}>
                  {(() => {
                    const deliveryText = cart.DeliveryText || "Delivery by next day";
                    // Remove duplicate text if present (handle comma, space, or exact duplicates)
                    const parts = deliveryText.split(/[,\s]+/).filter(part => part.trim() !== '');
                    const uniqueParts = [...new Set(parts)];
                    return uniqueParts.join(' ');
                  })()}
                </Text>
              </View>
            )}
            {showField("PaymentMethod") && (
              <View style={[styles.TextView, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.Text, { fontWeight: "regular", textAlign: isRTL ? 'right' : 'left' }]}>
                  Payment Method :
                </Text>
                <Text style={[styles.Text, { fontWeight: "500", textAlign: isRTL ? 'left' : 'right' }]}>
                  {cart.PaymentMethodText || cart.PaymentMethodName || "Cash on Delivery"}
                </Text>
              </View>
            )}
            {showField("CartTotal") && (
              <View style={[styles.TextView, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.Text, { fontWeight: "regular", textAlign: isRTL ? 'right' : 'left' }]}>
                  CartTotal:
                </Text>
                <Text style={[styles.Text, { fontWeight: "500", textAlign: isRTL ? 'left' : 'right' }]}>
                  {(cart?.SubTotal ?? cart?.orderHistory?.[0]?.SubTotal ?? 0).toFixed(2)} {cart?.Currency ?? "AED"}
                </Text>
              </View>
            )}
            {showField("Charges") && cart?.Charges
              ? cart?.Charges?.filter((c) => (c?.Amount ?? 0) !== 0).map(
                  (c, index) => (
                    <View style={[styles.TextView, { flexDirection: isRTL ? 'row-reverse' : 'row' }]} key={index}>
                      <Text style={[styles.Text, { fontWeight: "regular", textAlign: isRTL ? 'right' : 'left' }]}>
                        {c?.Percentage ? `${c.Percentage}% ` : ""}
                        {c?.Description}
                      </Text>
                      <Text style={[styles.Text, { fontWeight: "500", textAlign: isRTL ? 'left' : 'right' }]}>
                        {(c?.Amount ?? 0).toFixed(2)} {cart?.Currency ?? ""}
                      </Text>
                    </View>
                  )
                )
              : cart?.CartCharges?.filter((c) => (c?.Amount ?? 0) !== 0).map(
                  (c, index) => (
                    <View style={[styles.TextView, { flexDirection: isRTL ? 'row-reverse' : 'row' }]} key={index}>
                      <Text style={[styles.Text, { fontWeight: "regular", textAlign: isRTL ? 'right' : 'left' }]}>
                        {c?.Percentage ? `${c.Percentage}% ` : ""}
                        {c?.Description}
                      </Text>
                      <Text style={[styles.Text, { fontWeight: "500", textAlign: isRTL ? 'left' : 'right' }]}>
                        {(c?.Amount ?? 0).toFixed(2)} {cart?.Currency ?? ""}
                      </Text>
                    </View>
                  )
                )}
            {showField("Total") && (
              <View
                style={[
                  styles.TextView,
                  {
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: "#FFFFFF",
                    marginTop: hp("2%"),
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.Text,
                    { fontSize: RFValue(14), fontFamily: "Poppins-Medium", textAlign: isRTL ? 'right' : 'left' },
                  ]}
                >
                  Total :
                </Text>
                <Text
                  style={[
                    styles.Text,
                    { fontSize: RFValue(14), fontFamily: "Poppins-Medium", textAlign: isRTL ? 'left' : 'right' },
                  ]}
                >
                  {(cart?.Total ?? cart?.orderHistory?.[0]?.Total ?? 0).toFixed(
                    2
                  )}{" "}
                  {cart?.Currency ?? "AED"}
                </Text>
              </View>
            )}
            {!showField("Total") && (
            <View
              style={[
                styles.TextView,
                {
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: "#FFFFFF",
                  marginTop: hp("2%"),
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <Text
                style={[
                  styles.Text,
                  { fontSize: RFValue(14), fontFamily: "Poppins-Medium", textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {t("total_bill")}
              </Text>
              <Text
                style={[
                  styles.Text,
                  { fontSize: RFValue(14), fontFamily: "Poppins-Medium", textAlign: isRTL ? 'left' : 'right' },
                ]}
              >
                {(cart?.Total ?? cart?.orderHistory?.[0]?.Total ?? 0).toFixed(
                  2
                )}{" "}
                {cart?.Currency ?? ""}
              </Text>
            </View>
            )}
          </View>
        </View>
      )}
    </>
  );
};
const styles = StyleSheet.create({
  paymentSection: {
    backgroundColor: "#DEECFA",
    marginVertical: hp("1.9%"),
    width: wp("91.11%"),
    // height: 208,
    alignSelf: "center",
    borderRadius: 15,
    flexDirection: "column",
    padding: wp("5.5%"),
    elevation: 5,
    shadowColor: "#A9A9A9",
  },
  Header: {
    color: "#525252",
    fontWeight: "600",
    fontSize: RFValue(17, 800),
    fontFamily: "Poppins-SemiBold",
  },
  AmountView: {
    width: wp("91.11%"),
    height: "auto",
    borderRadius: 15,
    alignSelf: "center",
    marginTop: hp("1.6%"),
    overflow: "hidden",
    paddingHorizontal: wp("5.5%"),
  },
  TextView: {
    justifyContent: "space-between",
    flexDirection: "row",
    // borderBottomColor: "#FFFFFF",
    // borderBottomWidth: 1,
    // paddingHorizontal: 20,
  },
  Text: {
    fontWeight: "600",
    textAlign: "center",
    color: "#525252",
    lineHeight: 30,
    fontSize: RFValue(12),
    fontFamily: "Poppins-Regular",
  },
});

export default BillSummaryCard;
