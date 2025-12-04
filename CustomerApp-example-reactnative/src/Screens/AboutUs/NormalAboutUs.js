import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  widthPercentageToDP,
} from "react-native-responsive-screen";
import CustomHeader from "../../component/CustomHeader";
import CommonHeaderLeft from "../../component/CommonHeaderLeft";
import { RFValue } from "react-native-responsive-fontsize";
import pageServices from "../../services/pageServices";
import RenderHTML from "react-native-render-html";
import { useTranslation } from "react-i18next";
import appSettings from "../../../Client/appSettings";

const client = process.env.CLIENT;

const AboutUs = (props) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const conditionalHeaderProps = appSettings[client]?.conditionalHeaderProps
  const { t } = useTranslation();
 useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        conditionalHeaderProps ? (
          <CustomHeader
            title={t("about_us")}
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
            title={t("about_us")}
            leftComponent={<CommonHeaderLeft type="back" />}
            color="#000000"
            elevation={1}
          />
        )
        ),
       
    });
     GetAboutUs();
  }, [t]);

  const GetAboutUs = async () => {
    try {
      setLoading(true);
      const pageID = 10;
      const response = await pageServices.GetStaticPage(pageID);

      if (!response.data) {
        console.error("Error", "Failed to get AboutUs data.");
      }
      setData(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("AboutUs Data fetching failed:", error);
    }
  };
  // console.log("data", data);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: hp("5%"),
          alignItems: "center",
        }}
      >
        {loading ? (
          <View style={styles.indicatorContainer}>
            <ActivityIndicator size="large" color="#1D9ADC" />
          </View>
        ) : (
          data && (
            <View style={styles.card}>
              <Image
                source={require(
                  `../../assets/images/client/${client}/Logo_home_header.png`
                )}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.divider}>
                <RenderHTML
                  contentWidth={widthPercentageToDP("100%")}
                  source={{ html: data }}
                  tagsStyles={{
                    p: {
                      fontSize: 16,
                      textAlign: "justify",
                      fontWeight: "400",
                      fontFamily: "Poppins-Regular",
                      color: "#333",
                    },
                    h3: {
                      fontSize: 20,
                      fontWeight: "400",
                      fontFamily: "Poppins-Regular",
                      marginVertical: 8,
                      textAlign: "justify",
                    },
                    li: { marginBottom: 6 },
                  }}
                />
              </View>
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    // not used for scrollable root anymore
    backgroundColor: "#fff",
    width: wp("100%"),
    alignItems: "center",
  },
  indicatorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: wp("100%"),
    height: hp("100%"),
  },
  card: {
    width: wp("91.11%"),
    backgroundColor: "#fff",
    borderRadius: 20,
    marginTop: hp("1.88%"),
    marginBottom: hp("15%"),
    padding: wp("4.44%"),
    shadowColor: "#A5A5A5",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  logo: {
    marginTop: hp("3.88%"),
    width: wp("25.56%"),
    height: hp("3.88%"),
    alignSelf: "center",
    marginBottom: hp("4.5%"),
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: "#1D9ADC",
    backgroundColor: "#fff",
    paddingTop: hp("2.5%"),
    marginBottom: hp("5%"),
  },
  description: {
    fontSize: RFValue(14),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    // lineHeight: hp("2.8%"),
    color: "#444",
    textAlign: "justify",
  },
});

export default AboutUs;
