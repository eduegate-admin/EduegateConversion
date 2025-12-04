import React from "react";
import { View, Text, Image, StyleSheet, Platform, Linking } from "react-native";
import { useTranslation } from "react-i18next";
import appSettings from "../../../Client/appSettings";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import CustomButton from "../../component/CustomButton";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../../AppContext/AppContext";

const client = process.env.CLIENT;

const ForceUpdate = () => {
  const { t } = useTranslation();
  const AppSettings = appSettings[client];
  const navigation = useNavigation();
    const { token ,appUpdate} = useAppContext();
    const handleUpdate = () => {
    const appStoreUrl = AppSettings.appStoreURL;
    const playStoreUrl = AppSettings.playstoreURL;

    const url = Platform.OS === "ios" ? appStoreUrl : playStoreUrl;

    Linking.openURL(url).catch(() => {
      alert(t("unable_to_open_store"));
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.Header}>
        <Image
          source={require(`../../assets/images/client/${client}/icon.png`)}
          style={styles.logo}
        />
        <Text style={styles.title}>{AppSettings.FUSName}</Text>
        <Image
        //   source={require(`../../assets/images/client/${client}/icon.png`)}
          style={styles.logo}
        />
      </View>

      <Text style={styles.heading}>{t("new_update_available")}</Text>
      <Text style={styles.description}>{AppSettings.FUSDescription}</Text>

      <Image
        source={require("../../assets/images/client/update.png")}
        style={styles.rocket}
      />

      <View style={styles.buttonContainer}>
         <CustomButton
            buttonColor={"#28a745"}
            handleButtonPress={handleUpdate}
            buttonText={t("update_latest_app")}
            buttonTextColor={"#FFF"}
            Width={"65%"}
            Height={"6.2%"}
            Radius={25}
            type={"normal"}
            fontSize={RFValue(14,800)}
          />
           <CustomButton
            buttonColor={"#28a745"}
            handleButtonPress={() => navigation.navigate(token ? "Drawer" : "Login")}
            buttonText={t("no_thanks")}
            buttonTextColor={"#FFF"}
            Width={"55%"}
            Height={"6.2%"}
            Radius={25}
            type={"normal"}
            fontSize={RFValue(14,800)}
            disabled={appUpdate?.major}
          />
      </View>
    </View>
  );
};
export default ForceUpdate;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // alignItems: "center",
    paddingHorizontal: wp("4.44%"),
    // justifyContent: "center",
  },
  Header:{
    width: wp("91.11%"),
    height: wp("16.67%"),
    // backgroundColor: "#d13030ff",
    flexDirection:"row",
    justifyContent:"space-around",
    alignItems:"center"
  },
  logo: {
    // backgroundColor: "#140b0bff",
    width: wp("13.67%"),
    height: wp("13.67%"),
    resizeMode: "contain",
  },
  title: {
    fontSize: RFValue(18,800),
    fontWeight: "500",
    color: "red",
    textAlign: "center",
    fontFamily:"Poppins-Medium"
  },
  heading: {
    fontSize: RFValue(20,800),
    fontWeight: "500",
    marginTop: hp("5%"),
    textAlign: "center",
    color: "#525252",
    fontFamily:"Poppins-SemiBold"
  },
  description: {
    fontSize: RFValue(14,800),
    color: "#525252",
    fontWeight: "400",
    textAlign: "center",
    marginTop:  hp("2.5%"),
    fontFamily:"Poppins-Regular"

  },
  rocket: {
    alignSelf:"center",
    width: wp("85%"),
    height: hp("38.25%"),
    resizeMode: "contain",
    marginVertical:  hp("5%"),
  },
  buttonContainer: {
    flexDirection:"column",
    justifyContent:"space-between",
    marginTop:  hp("3%"),
    width: wp("91.11%"),
    height: hp("13.2%"),
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginBottom: 12,
    width: "70%",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    width: "70%",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
