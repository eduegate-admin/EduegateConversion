import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import CustomHeader from "../../component/CustomHeader";
import CommonHeaderLeft from "../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../component/CommonHeaderRight";
import UserService from "../../services/UserService";
import colors from "../../config/colors";

export default function NormalWallet() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        <CustomHeader
          title={t("my_wallet") || "My wallet"}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
    });
    fetchWalletData();
  }, [t]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await UserService.getUserDetails();
      
      if (response?.data) {
        setUserDetails(response.data);
        // Extract wallet balance from user details
        // Adjust the path based on your actual API response structure
        const balance = response.data?.WalletBalance || 
                       response.data?.Customer?.WalletBalance || 
                       response.data?.Wallet?.Balance || 0;
        setWalletBalance(balance);
        
        // Extract transactions if available
        const transactionList = response.data?.Transactions || 
                               response.data?.WalletTransactions || 
                               [];
        setTransactions(transactionList);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `AED ${parseFloat(amount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Balance Header */}
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceLabel}>Your wallet balance:</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(walletBalance)}</Text>
      </View>

      {/* Transactions Section */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.transactionsTitle}>Transactions</Text>
        
        <ScrollView 
          style={styles.transactionsList}
          contentContainerStyle={styles.transactionsListContent}
          showsVerticalScrollIndicator={false}
        >
          {transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <View key={index} style={styles.transactionCard}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description || transaction.Description || "Transaction"}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {transaction.date || transaction.Date || ""}
                  </Text>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  transaction.type === "credit" || transaction.Amount > 0 
                    ? styles.creditAmount 
                    : styles.debitAmount
                ]}>
                  {transaction.type === "credit" || transaction.Amount > 0 ? "+" : "-"}
                  {formatCurrency(Math.abs(transaction.Amount || transaction.amount || 0))}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <View style={styles.walletIconContainer}>
                <Image
                  source={require("../../assets/images/wallet-icon.png")}
                  style={styles.walletIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.emptyStateText}>No transaction in your wallet.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  balanceHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: RFValue(13),
    color: "#757575",
    fontWeight: "600",
    marginBottom: hp(0.8),
    letterSpacing: 0.3,
  },
  balanceAmount: {
    fontSize: RFValue(38),
    fontWeight: "bold",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  transactionsContainer: {
    flex: 1,
    paddingTop: hp(2.5),
    backgroundColor: "#F5F5F5",
  },
  transactionsTitle: {
    fontSize: RFValue(16),
    color: "#1A1A1A",
    fontWeight: "bold",
    paddingHorizontal: wp(5),
    marginBottom: hp(2),
    letterSpacing: 0.2,
  },
  transactionsList: {
    flex: 1,
  },
  transactionsListContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(3),
  },
  transactionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp(2.2),
    paddingHorizontal: wp(4.5),
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: hp(1.8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  transactionInfo: {
    flex: 1,
    marginRight: wp(3),
  },
  transactionDescription: {
    fontSize: RFValue(14),
    color: "#1A1A1A",
    fontWeight: "600",
    marginBottom: hp(0.6),
    letterSpacing: 0.1,
  },
  transactionDate: {
    fontSize: RFValue(11.5),
    color: "#9E9E9E",
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  transactionAmount: {
    fontSize: RFValue(15),
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  creditAmount: {
    color: colors.success || "#27ae60",
  },
  debitAmount: {
    color: colors.error || "#FE5656",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: hp(12),
    paddingHorizontal: wp(10),
  },
  walletIconContainer: {
    width: wp(40),
    height: wp(40),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(3),
    backgroundColor: "#FFF8F0",
    borderRadius: wp(20),
    padding: wp(5),
  },
  walletIcon: {
    width: "75%",
    height: "75%",
    tintColor: "#A68B6C",
  },
  emptyStateText: {
    fontSize: RFValue(14),
    color: "#616161",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: RFValue(20),
    letterSpacing: 0.2,
  },
});
