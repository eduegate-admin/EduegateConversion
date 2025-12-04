import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
  Clipboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import { RFValue } from "react-native-responsive-fontsize";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";

import CustomHeader from "../../component/CustomHeader";
import CommonHeaderLeft from "../../component/CommonHeaderLeft";
import { useCallContext } from "../../AppContext/CallContext";
import apiClient from "../../services/apiClient";
import appSettings from "../../../Client/appSettings";

const client = process.env.CLIENT;

export default function Referral() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { callContext } = useCallContext();
  const [referralCode, setReferralCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  
  const conditionalHeaderProps = appSettings[client]?.conditionalHeaderProps;
  const THEME_GREEN = "#25A55F";

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        conditionalHeaderProps ? (
          <CustomHeader
            title={t("refer_and_earn")}
            leftComponent={<CommonHeaderLeft type="back" />}
            elevation={0}
            borderBottomLeftRadius={0}
            borderBottomRightRadius={0}
            backgroundColor="#12a14f"
            showCustomIcons={true}
            hideicon={true}
            color="#FFFFFF"
          />
        ) : (
          <CustomHeader
            title={t("refer_and_earn")}
            leftComponent={<CommonHeaderLeft type="back" />}
            color="#000000"
            elevation={1}
          />
        )
      ),
    });
  }, [t]);

  // Reset sharing state on screen focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSharing(false);
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!callContext) {
          console.warn("CallContext not ready yet");
          return;
        }

        const response = await apiClient.get('/Marketing/ReferFriendToken', {
          headers: {
            CallContext: JSON.stringify(callContext),
          }
        });

        if (mounted) {
          setReferralCode(response.data);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Refer token error:", err);
        if (mounted) {
          setLoading(false);
          Toast.show({
            type: "error",
            text1: t("error"),
            text2: t("unable_to_load_referral_code"),
          });
        }
      }
    };

    if (callContext) {
      load();
    }
    
    return () => {
      mounted = false;
    };
  }, [callContext]);

  const copyToClipboard = (text) => {
    if (!text) {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("no_referral_code_available"),
      });
      return;
    }
    
    Clipboard.setString(text);
    Toast.show({
      type: "success",
      text1: t("copied"),
      text2: t("referral_code_copied_to_clipboard"),
      visibilityTime: 2000,
    });
  };

  const onShare = async () => {
    if (sharing || loading || !callContext) return;
    
    try {
      setSharing(true);

      const response = await apiClient.get('/Marketing/GetReferralInfo', {
        headers: {
          CallContext: JSON.stringify(callContext),
        }
      });

      const result = response.data;

      const messageParts = [];
      if (result.Subject) messageParts.push(result.Subject);
      if (result.Message) messageParts.push(result.Message);
      if (result.Url) messageParts.push(result.Url);

      const shareResult = await Share.share(
        {
          title: result.Subject || "Refer a friend",
          message: messageParts.join("\n\n"),
          url: result.Url,
        },
        {
          dialogTitle: result.Subject || "Refer a friend",
        }
      );

      if (shareResult.action === Share.sharedAction) {
        Toast.show({
          type: "success",
          text1: t("success"),
          text2: t("referral_shared_successfully"),
          visibilityTime: 2000,
        });
      }
    } catch (err) {
      if (err.message !== 'User did not share') {
        console.warn("Share error:", err);
        Toast.show({
          type: "error",
          text1: t("error"),
          text2: t("unable_to_share_referral_link"),
        });
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.textHeaderContainer}>
        <Text style={styles.mainTitle}>{t("refer_and_earn")}</Text>
        <Text style={styles.subTitle}>
          {t("send_a_referral_link_to_your_friends")}
        </Text>
      </View>

      {/* Referral Code Card */}
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="gift-outline" size={60} color={THEME_GREEN} />
        </View>

        <Text style={styles.cardTitle}>{t("your_referral_code")}</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={THEME_GREEN} />
          </View>
        ) : (
          <View style={styles.codeContainer}>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{referralCode ?? "—"}</Text>
            </View>
            <TouchableOpacity
              onPress={() => copyToClipboard(referralCode)}
              style={styles.copyButton}
              disabled={!referralCode}
            >
              <Ionicons name="copy-outline" size={24} color={referralCode ? THEME_GREEN : "#CCC"} />
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.infoText}>
          {t("share_your_code_with_friends_and_earn_rewards")}
        </Text>
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          onPress={onShare}
          disabled={sharing || loading || !referralCode}
          style={[
            styles.referButton,
            { backgroundColor: THEME_GREEN },
            (sharing || loading || !referralCode) && styles.disabledButton,
          ]}
        >
          {sharing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="share-social-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.referButtonText}>{t("refer_now")}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: wp("4.5%"),
    paddingTop: hp("2%"),
  },
  textHeaderContainer: {
    marginBottom: hp("3%"),
  },
  mainTitle: {
    fontSize: RFValue(16),
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
    color: "#000",
    marginBottom: hp("0.5%"),
  },
  subTitle: {
    fontSize: RFValue(12),
    fontFamily: "Poppins-Regular",
    fontWeight: "400",
    color: "#666",
    lineHeight: 20,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: wp("5%"),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: hp("2%"),
  },
  iconContainer: {
    marginBottom: hp("2%"),
  },
  cardTitle: {
    fontSize: RFValue(14),
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
    color: "#333",
    marginBottom: hp("2%"),
  },
  loadingContainer: {
    paddingVertical: hp("3%"),
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  codeBox: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: wp("6%"),
    paddingVertical: hp("1.5%"),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    marginRight: wp("3%"),
  },
  codeText: {
    fontSize: RFValue(18),
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
    color: "#25A55F",
    letterSpacing: 2,
  },
  copyButton: {
    padding: wp("2%"),
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  infoText: {
    fontSize: RFValue(11),
    fontFamily: "Poppins-Regular",
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: wp("5%"),
  },
  actionBar: {
    marginBottom: hp("4%"),
    paddingVertical: 10,
  },
  referButton: {
    width: "100%",
    height: hp("6%"),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  referButtonText: {
    color: "#ffffff",
    fontSize: RFValue(14),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
});