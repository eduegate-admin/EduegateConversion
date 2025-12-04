import { useTranslation } from "react-i18next";
import { Image, Text, TouchableOpacity, View } from "react-native";

import ClientStyles from "../../Styles/StyleLoader/ClientStyles";
import { useEffect, useState } from "react";
import PaymentMethodsSkeleton from "../Skeleton/PaymentMethodsSkeleton";

const client = process.env.CLIENT;

const PaymentMethod = ({
  payment,
  selectedPayment,
  setSelectedPayment,
  loading,
}) => {
  const { t } = useTranslation();
  const [styles, setStyle] = useState(ClientStyles(client, "PaymentMethod"));

  useEffect(() => {
    const clientStyle = ClientStyles(client, "PaymentMethod");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, [client]);

  const handlePaymentSelection = (paymentMethodID) => {
    setSelectedPayment(paymentMethodID);
  };

  return (
    <>
      {loading ? (
        <PaymentMethodsSkeleton />
      ) : (
        payment &&
        payment.length > 0 && (
          <View style={styles.contentHeader}>
            <Text style={styles.contentHeaderText}>{t("payment_method")}</Text>
          </View>
        )
      )}
      <View style={styles.paymentMethod}>
        <View style={styles.AddressView}>
          {loading
            ? null
            : payment &&
              payment.length > 0 &&
              payment
                .filter((item) => item.PaymentMethodID)
                .map((item, index, filteredArray) => {
                  const isLastItem = index === filteredArray.length - 1;
                  return item.PaymentMethodID === 13 ? null : (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.AddressTextView,
                        isLastItem && styles.lastPaymentItem,
                        selectedPayment === item.PaymentMethodID && styles.selectedPaymentItem,
                      ]}
                      onPress={() =>
                        handlePaymentSelection(item.PaymentMethodID)
                      }
                      activeOpacity={0.7}
                    >
                      {client === "benchmarkfoods" && (
                        <View style={styles.ButtonImageView}>
                          <Image
                            style={styles.buttonImage}
                            source={
                              item.PaymentMethodID === 13
                                ? null
                                : selectedPayment === item.PaymentMethodID
                                  ? (() => {
                                      try {
                                        return require(
                                          `../../assets/images/client/${client}/ActiveButton.png`
                                        );
                                      } catch {
                                        return require("../../assets/images/client/foodworld/ActiveButton.png");
                                      }
                                    })()
                                  : require("../../assets/images/client/foodworld/whitebutton.png")
                            }
                          />
                        </View>
                      )}
                      <View style={styles.iconView}>
                        <Image
                          style={styles.iconImage}
                          source={
                            item.PaymentMethodID === 5
                              ? (() => {
                                  try {
                                    return require(
                                      `../../assets/images/client/${client}/money-2.png`
                                    );
                                  } catch {
                                    return require("../../assets/images/client/foodworld/money-2.png");
                                  }
                                })()
                              : item.PaymentMethodID === 12
                                ? (() => {
                                    try {
                                      return require(
                                        `../../assets/images/client/${client}/card.png`
                                      );
                                    } catch {
                                      return require("../../assets/images/client/foodworld/card.png");
                                    }
                                  })()
                                : item.PaymentMethodID === 20
                                  ? (() => {
                                      try {
                                        return require(
                                          `../../assets/images/client/${client}/pay_via_Link.png`
                                        );
                                      } catch {
                                        return require("../../assets/images/client/foodworld/pay_via_Link.png");
                                      }
                                    })()
                                  : item.PaymentMethodID === 13
                                    ? null
                                    : null
                          }
                        />
                      </View>
                      <View style={styles.payTextView}>
                        <Text style={styles.paymentTypeText}>
                          {item.PaymentMethodID === 5
                            ? "Cash On Delivery"
                            : item.PaymentMethodID === 12
                              ? "Debit Card Payment"
                              : item.PaymentMethodID === 20
                                ? "Pay via Online"
                                : null}
                        </Text>
                      </View>
                      {(client === "foodworld" || client === "almadina") && (
                        <View style={styles.ButtonImageView}>
                          <Image
                            style={styles.buttonImage}
                            source={
                              item.PaymentMethodID === 13
                                ? null
                                : selectedPayment === item.PaymentMethodID
                                  ? (() => {
                                      try {
                                        return require(
                                          `../../assets/images/client/${client}/ActiveButton.png`
                                        );
                                      } catch {
                                        return require("../../assets/images/client/foodworld/ActiveButton.png");
                                      }
                                    })()
                                  : require("../../assets/images/client/foodworld/whitebutton.png")
                            }
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
        </View>
      </View>
    </>
  );
};

export default PaymentMethod;

// const styles = StyleSheet.create({
//  contentHeader: {
//     paddingHorizontal: wp("3.5%"),
//     marginTop: hp("1.2%"),
//     marginBottom: hp("0.8%"),
//   },
//   contentHeaderText: {
//     marginBottom: hp("0.5%"),
//     fontSize: RFValue(12, 800),
//     fontWeight: "600",
//     color: colors.textSecondary,
//     fontFamily: "Poppins-SemiBold",
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },
//   paymentMethod: {
//     // backgroundColor: colors.background,
//          backgroundColor:"transparent",

//     // backgroundColor: "red",
//     marginHorizontal: wp("3.5%"),
//     marginBottom: hp("1.2%"),
//     borderRadius: 12,
//     overflow: "hidden",
//     // elevation: 2,
//     // shadowColor: colors.shadow,
//     // shadowOffset: { width: 0, height: 2 },
//     // shadowOpacity: 0.08,
//     // shadowRadius: 6,
//   },
//   AddressView: {
//     width: "100%",
//   },
// AddressTextView: {
//   paddingVertical: hp("2.5%"),
//   paddingHorizontal: wp("4%"),
//   flexDirection: "row",
//   alignItems: "center",
//   borderRadius: 12,
//     padding: wp("2.5%"),
//   // Subtle shadow for that floating white card effect
//   shadowColor: '#000',
//   shadowOffset: { width: 0, height: 3 },
//   shadowOpacity: 0.08,
//   shadowRadius: 8,
//   elevation: 2, // slightly more lift for Android

//   // Optional smoothness (light border to blend with shadow)
//   borderWidth: 0.2,
//   borderColor: 'rgba(0,0,0,0.05)',

//   backgroundColor: "#fff",

//   marginVertical: hp("0.3%"),
//   borderBottomWidth: 0.5,
//   borderBottomColor: colors.border,
// },

//   lastPaymentItem: {
//     borderBottomWidth: 0,
//   },
//   selectedPaymentItem: {
//     backgroundColor: colors.primaryLight || "#F0F7FF",
//   },
//   AddressTextHead: {
//     fontSize: RFValue(14, 800),
//     fontWeight: "700",
//     textAlign: "left",
//     color: colors.textHeading,
//     fontFamily: "Poppins-Bold",
//   },
//   AddressText: {
//     fontSize: RFValue(13, 800),
//     fontWeight: "600",
//     textAlign: "left",
//     color: colors.textHeading,
//     fontFamily: "Poppins-SemiBold",
//   },
//   paymentTypeText: {
//     fontSize: RFValue(14, 800),
//     fontWeight: "500",
//     color: colors.textPrimary,
//     fontFamily: "Poppins-Medium",
//   },
//   buttonImage: {
//     resizeMode: "contain",
//     width: 20,
//     height: 20,
//     tintColor: colors.primary,
//   },
//   iconImage: {
//     resizeMode: "contain",
//     width: 22,
//     height: 22,
//   },
//   ButtonImageView: {
//     width: 20,
//     height: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     marginLeft: "auto",
//   },
//   iconView: {
//     width: 22,
//     height: 22,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: wp("3%"),
//   },
//   payTextView: {
//     flex: 1,
//     justifyContent: "center",
//   },
// });






