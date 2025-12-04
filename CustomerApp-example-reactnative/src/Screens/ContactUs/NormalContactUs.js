import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator, I18nManager, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import CustomHeader from "../../component/CustomHeader";
import CommonHeaderLeft from "../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../component/CommonHeaderRight";
import appSettings from "../../../Client/appSettings";
import pageServices from "../../services/pageServices";
import RenderHTML from "react-native-render-html";

const client = process.env.CLIENT;

const ContactUs = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const conditionalHeaderProps = appSettings[client]?.conditionalHeaderProps;
   const  ContactPageId =appSettings[client]?.ContactPageId;
  const Number = appSettings[client].whatsapp;
  const mail = appSettings[client].mail;
  const isRTL = I18nManager.isRTL;

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        
        conditionalHeaderProps ? (
          <CustomHeader
            title={t("contact_us")}
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
          title={t("contact_us")}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
    });
    GetContactUs();
  }, [t]);

  const GetContactUs = async () => {
    try {
      setLoading(true);
      const pageID = ContactPageId;
      const response = await pageServices.GetStaticPage(pageID);
    

      if (!response.data) {
        console.error("Error", "Failed to get ContactUs data.");
      }
      setData(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("ContactUs Data fetching failed:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {loading ? (
          <View style={styles.indicatorContainer}>
            <ActivityIndicator size="large" color="#1D9ADC" />
          </View>
        ) : (
          data && (
            <View style={styles.card}>
              <RenderHTML
                contentWidth={wp("90%")}
                source={{ html: data }}
                enableCSSInlineProcessing={false}
                tagsStyles={{
                  p: {
                    fontSize: 14,
                    lineHeight: 20,
                    color: "#333",
                    fontFamily: "Poppins-Regular",
                    marginBottom: 8,
                    textAlign: isRTL ? "right" : "left",
                    writingDirection: isRTL ? "rtl" : "ltr",
                  },
                  strong: {
                    fontFamily: "Poppins-SemiBold",
                    fontSize: 15,
                    color: "#222",
                  },
                  a: {
                    color: "#1D9ADC",
                    fontSize: 14,
                    fontFamily: "Poppins-Regular",
                    textDecorationLine: "none",
                  },
                  hr: {
                    borderBottomWidth: 1,
                    borderBottomColor: "#eee",
                    marginVertical: 12,
                  },
                  img: {
                    width: 18,
                    height: 18,
                    marginRight: isRTL ? 0 : 10,
                    marginLeft: isRTL ? 10 : 0,
                  },
                  div: {
                    textAlign: isRTL ? "right" : "left",
                  },
                  h1: {
                    textAlign: isRTL ? "right" : "left",
                  },
                  h2: {
                    textAlign: isRTL ? "right" : "left",
                  },
                  h3: {
                    textAlign: isRTL ? "right" : "left",
                  },
                  h4: {
                    textAlign: isRTL ? "right" : "left",
                  },
                }}
                classesStyles={{
                  "contact-center": {
                    flexDirection: isRTL ? "row-reverse" : "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  },
                }}
                onLinkPress={(evt, href) => {
                  if (href.startsWith("mailto:") || href.startsWith("tel:")) {
                    Linking.openURL(href);
                  } else {
                    Linking.openURL(href);
                  }
                }}
              />
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flexGrow: 1,
    padding: wp("4%"),
  },
  indicatorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: wp("100%"),
    height: hp("100%"),
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
});

export default ContactUs;
