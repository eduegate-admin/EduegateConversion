import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import CustomHeader from "../../component/CustomHeader";
import CommonHeaderLeft from "../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../component/CommonHeaderRight";
import { useNavigation } from "@react-navigation/native";
import BarcodeGenerator from "../../component/BarCodeGenerator";
import appSettings from "../../../Client/appSettings";
import { RFValue } from "react-native-responsive-fontsize";
import LoyalityService from "../../services/LoyalityService";
import UserService from "../../services/UserService";

const client = process.env.CLIENT;

const PlusRewardsScreen = () => {
  const navigation = useNavigation();
  const [loyalty, setLoyalty] = useState({
    minRedeem: null,
    customerSettings: null,
    lastTransactions: null,
    userData: null,
  });

  // Static customer card number for barcode generation
  const customerCardNumber = "1700000207";
  const Appsettings = appSettings[client];
  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        <CustomHeader
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
    });
    fetchCardDetails();
  }, []);

  const fetchCardDetails = async () => {
    try {
      const [LoyalityResp, customerResp, TransationResp, userResp] = await Promise.all([
        LoyalityService.LoyaltyMinimumRedeem(),
        LoyalityService.GetCustomerSettings(),
        LoyalityService.GetCustomerLastTrnsactions(),
        UserService.getUserDetails(),
      ]);
      setLoyalty({
        minRedeem: LoyalityResp.data,
        customerSettings: customerResp.data,
        lastTransactions: TransationResp.data,
        userData: userResp.data,
      });
      console.log("LoyalityResp:", LoyalityResp.data);
      console.log("customerResp:", customerResp.data);
      console.log(" TransationResp:", TransationResp.data);
    } catch (error) {
      console.error("Fetch product error:", error);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, marginBottom: hp("10%") }}
    >
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.noCardText}>Your virtual Plus Rewards card</Text>
          <TouchableOpacity style={styles.linkCardBtn}>
            <Image
              source={require(
                `../../assets/images/client/almadina/clubcardbig.png`
              )}
              style={styles.clubCard}
            />
          </TouchableOpacity>
          <View
            style={{
              position: "absolute",
              top: hp("5%"),
              right: wp("10%"),
              aspectRatio: 1044 / 600,
              width: wp("40%"),
              height: "auto",
              justifyContent: "center",
            }}
          >
            <BarcodeGenerator
              value={customerCardNumber}
              width={"100%"}
              height={"80%"}
            />
          </View>
          <Text style={styles.clientURL}>{Appsettings?.ClientUrl}</Text>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.infoCard}>
            <Image
              source={require(
                `../../assets/images/client/almadina/coinstack.png`
              )}
              style={styles.coinstack}
            />
            <Text style={styles.cardValue}>{loyalty?.customerSettings?.CurrentLoyaltyPoints ?? 0.00} Points</Text>
          </View>

          <View style={styles.infoCard}>
            <Image
              source={require(`../../assets/images/client/almadina/dirham.png`)}
              style={styles.dirham}
            />
            <Text style={styles.cardValue}>{loyalty?.customerSettings?.RadeemAmount ?? 0.00} {Appsettings?.DefaultCurrency}</Text>
          </View>
        </View>

        <View style={styles.footerBox}>
          <Text style={styles.footerText}>
            Minimum Redeem value points is{" "}{loyalty?.minRedeem?.MinimumRedeemPoints ?? 0.00}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2DB84C",
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("4%"),
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: wp("4.5%"),
    fontWeight: "600",
  },
  centerContent: {
    alignItems: "center",
    marginVertical: hp("1.5%"),
  },
  noCardText: {
    fontSize: RFValue(16, 800),
    fontWeight: "500",
    fontFamily: "Poppins-Regular",
    color: "#B5B5B5",
    marginBottom: hp("1%"),
  },
  clientURL: {
    fontSize: RFValue(10, 800),
    fontFamily: "Poppins-Regular",
    color: "#252525",
    fontWeight: "400",
    letterSpacing: 1,
  },
  linkCardBtn: {
    flexDirection: "column",
    alignItems: "center",
  },
  linkCardText: {
    fontSize: wp("3.5%"),
    color: "#2DB84C",
    fontWeight: "500",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: hp("3%"),
  },
  infoCard: {
    width: wp("40%"),
    height: hp("15%"),
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  clubCard: {
    width: wp("91.11%"),
    height: "auto",
    aspectRatio: 1044 / 600,
    marginBottom: hp("1%"),
    resizeMode: "contain",
    borderRadius: 15,
    overflow: "hidden",
  },
  coinstack: {
    width: wp("16%"),
    height: wp("16%"),
    marginBottom: hp("1%"),
    // backgroundColor: "#000",
    resizeMode: "contain",
  },
  dirham: {
    width: wp("18%"),
    height: wp("18%"),
    // marginBottom: hp("1%"),
    // backgroundColor: "#000",
    resizeMode: "contain",
  },
  cardValue: {
    fontSize: RFValue(16, 800),
    fontWeight: "500",
    fontFamily: "Poppins-Regular",
    color: "#252525",
  },
  footerBox: {
    backgroundColor: "#f6f6f6",
    marginHorizontal: wp("5%"),
    marginTop: hp("5%"),
    padding: hp("1.5%"),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  footerText: {
    fontSize: RFValue(12, 800),
    fontWeight: "500",
    fontFamily: "Poppins-Regular",
    color: "#252525",
    textAlign: "center",
  },
});

export default PlusRewardsScreen;
