import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import CustomHeader from "../../component/CustomHeader";
import CommonHeaderLeft from "../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../component/CommonHeaderRight";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import UserService from "../../services/UserService";
import appSettings from "../../../Client/appSettings";
import ClientStyles from "../../Styles/StyleLoader/ClientStyles";

const client = process.env.CLIENT;

const DeleteAccount = () => {
  const { t } = useTranslation();
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteAccountMessage, setDeleteAccountMessage] = useState("");
  const [styles, setStyle] = useState(ClientStyles(client, "DeleteAccount"));
  const conditionalHeaderProps = appSettings[client]?.conditionalHeaderProps;
  const customcolor = appSettings[client]?.customcolor;
  const Gradient = appSettings[client]?.Gradient;
  const navigation = useNavigation();
  const [selected, setSelected] = useState({
    reason1: false,
    reason2: false,
    other: false,
  });



   useEffect(() => {
      const clientStyle = ClientStyles(client, "DeleteAccount");
      if (clientStyle) {
        setStyle(clientStyle);
      } else {
        console.error("Client settings not found");
      }
    }, [client]);

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        conditionalHeaderProps ? (
          <CustomHeader
            title={t("delete_account")}
            leftComponent={<CommonHeaderLeft type="back" />}
            elevation={0}
            borderBottomLeftRadius={0}
            borderBottomRightRadius={0}
            // dbgcolor="#12a14f"
            backgroundColor="#12a14f"
            // showCustomIcons={true}
            hideicon={true}
            color="#FFFFFF"
          />
        ) : <CustomHeader
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
      title: t("delete_account"),
    });
  }, [t]);

  useEffect(() => {
    if (selected?.other) {
      setDeleteAccountMessage(deleteReason);
    }
  }, [deleteReason, selected?.other]);

  // console.log("deleteAccountMessage", deleteAccountMessage);

  const handleDeleteAccountRequest = async () => {
    const payload = {
      Message: deleteAccountMessage,
    };
    try {
      const response = await UserService.deleteAccountRequest(payload);
      // console.log("delete account response", response.data);
      if (
        response.data?.Message ===
        t("delete_account_success")
      ) {
        Toast.show({
          type: "success",
          text1: response.data?.Message,
          text2: "",
          position: "top",
          visibilityTime: 2000,
        });
        navigation.navigate("Drawer", { screen: "Footer" });
        return;
      }
      Toast.show({
        type: "error",
        text1: response.data?.Message,
        text2: "",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  return (
    <View
      style={{
        height: hp("100%"),
        paddingTop: hp("3.16%"),
        paddingHorizontal: wp("4.44%"),
        backgroundColor: "#FFFFFF",
      }}
    >
      <View
        style={{
          width: wp("91.11%"),
          height: hp("80.875%"),
          backgroundColor: "white",
          elevation: 5,
          shadowColor: "#A5A5A580",
          borderRadius: 20,
          flexDirection: "column",
          paddingHorizontal: wp("4.44%"),
        }}
      >
        <View
          style={{
            width: wp("85.5%"),
            height: hp("6.37%"),
            flexDirection: "column",
            justifyContent: "center",
            marginTop: hp("1.5%"),
          }}
        >
          <TouchableOpacity>
            <Text
              style={{
                fontFamily: "Poppins-Regular",
                fontWeight: "400",
                fontStyle: "normal",
                fontSize: RFValue(14, 800),
                color: "#525252",
                fontFamily: "Poppins-Medium",
                fontWeight: "500",
                fontSize: RFValue(14, 800),
                lineHeight: RFValue(14, 800),
              }}
            >
              {t("delete_account_question")}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            width: wp("82.77%"),
            height: hp("6.37%"),
            flexDirection: "row",
            gap: wp("2.77%"),
            alignItems: "center",
            borderBottomWidth: 2,
            borderColor: "#EFEFEF",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setSelected((prevState) => ({
                ...prevState,
                reason1: true,
                reason2: false,
                other: false,
              }));
              setDeleteAccountMessage(t("using_different_account"));
            }}
          >
            <Image
              style={{
                resizeMode: "contain",
                width: wp("6.67%"),
                height: hp("3%"),
                tintColor: (!Gradient && selected?.reason1) ? customcolor ?  "#12a14f" : "#58BB47" : undefined    //gradient for benchmark customcolor for dot ae
              }}
              source={
                selected?.reason1
                  ? require(
                    `../../assets/images/client/${client}/ActiveButton.png`
                  )
                  : require(
                    `../../assets/images/client/foodworld/whitebutton.png`
                  )
              }
            />
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: "Poppins-Regular",
              fontWeight: "400",
              fontStyle: "normal",
              fontSize: RFValue(14, 800),
              color: "#525252",
              marginTop: hp("0.5%"),
            }}
          >
            {t("using_different_account")}
          </Text>
        </View>

        <View
          style={{
            width: wp("82.77%"),
            height: hp("6.37%"),
            flexDirection: "row",
            gap: wp("2.77%"),
            alignItems: "center",
            borderBottomWidth: 2,
            borderColor: "#EFEFEF",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setSelected((prevState) => ({
                ...prevState,
                reason1: false,
                reason2: true,
                other: false,
              }));
              setDeleteAccountMessage(t("privacy_concern"));
            }}
          >
            <Image
              style={{
                resizeMode: "contain",
                width: wp("6.67%"),
                height: hp("3%"),
                tintColor: (!Gradient && selected?.reason2) ? customcolor ?  "#12a14f" : "#58BB47" : undefined
              }}
              source={
                selected?.reason2
                  ? require(
                    `../../assets/images/client/${client}/ActiveButton.png`
                  )
                  : require(
                    `../../assets/images/client/foodworld/whitebutton.png`
                  )
              }
            />
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: "Poppins-Regular",
              fontWeight: "400",
              fontStyle: "normal",
              fontSize: RFValue(14, 800),
              color: "#525252",
              marginTop: hp("0.5%"),
            }}
          >
            {t("privacy_concern")}
          </Text>
        </View>

        <View
          style={{
            width: wp("82.77%"),
            height: hp("6.37%"),
            flexDirection: "row",
            gap: wp("2.77%"),
            alignItems: "center",
            borderBottomWidth: 2,
            borderColor: "#EFEFEF",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setSelected((prevState) => ({
                ...prevState,
                reason2: false,
                reason1: false,
                other: true,
              }));
              // setDeleteAccountMessage(deleteReason);
            }}
          >
            <Image
              style={{
                resizeMode: "contain",
                width: wp("6.67%"),
                height: hp("3%"),
                tintColor: (!Gradient && selected?.other) ? customcolor ?  "#12a14f" : "#58BB47" : undefined
              }}
              source={
                selected?.other
                  ? require(
                    `../../assets/images/client/${client}/ActiveButton.png`
                  )
                  : require(
                    `../../assets/images/client/foodworld/whitebutton.png`
                  )
              }
            />
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: "Poppins-Regular",
              fontWeight: "400",
              fontStyle: "normal",
              fontSize: RFValue(14, 800),
              color: "#525252",
              marginTop: hp("0.5%"),
            }}
          >
            {t("other")}
          </Text>
        </View>
        {selected?.other && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("write_your_reason")}</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor="#888"
              value={deleteReason}
              onChangeText={setDeleteReason}
              multiline={true}
            />
          </View>
        )}

        {/* Delete button */}
        <TouchableOpacity
          style={[
            styles.deleteButon,
            { marginTop: selected?.other ? hp("18.7%") : hp("36.875%") },
          ]}
          onPress={handleDeleteAccountRequest}
        >
          {Gradient ? (
            <LinearGradient
              colors={["#1D9ADC", "#0B489A"]}
              start={{ x: 1, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: wp("79.72%"),
                height: hp("6%"),
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <Text style={styles.Button1}>{t("send_request")}</Text>
            </LinearGradient>
          ) : (
            <View style={styles.ButtonContainer}>
              <Text style={styles.Button1}>{t("send_request")}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.ButtonContainer}
        >
          {/* <LinearGradient
            colors={["#1D9ADC", "#0B489A"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: wp("79.72%"),
              height: hp("6%"),
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
              overflow: "hidden",
            }}
          > */}
          <Text style={styles.Button2}>{t("back_to_settings")}</Text>
          {/* </LinearGradient> */}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// const styles = StyleSheet.create({
//   inputContainer: {
//     width: wp("82.77%"),
//     alignItems: "center",
//     marginTop: hp("3.375%"),
//     height: hp("14.75%"),
//   },
//   label: {
//     position: "absolute",
//     top: -hp("1.5%"),
//     left: wp("10%"),
//     backgroundColor: "#FFFFFF",
//     paddingHorizontal: wp("1.5%"),
//     fontSize: RFValue(14),
//     fontWeight: "400",
//     fontFamily: "Poppins-Regular",
//     color: "#525252",
//     zIndex: 1,
//   },
//   ButtonContainer: {
//     width: 300, // Fixed width in points
//     maxWidth: wp("90%"), // Maximum width as percentage of screen width
//     minWidth: 250, // Minimum width to prevent it from getting too small
//     height: hp("6%"),
//     minHeight: 44, // Minimum touch target size for better accessibility
//     alignSelf: 'center', // Center the button in its container
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: hp("1%"),
//     borderRadius: 10,
//     borderColor: colors.green,
//     borderWidth: 1,
//     backgroundColor: colors.green,
//     paddingHorizontal: 16, // Add some horizontal padding
//   },
//   Button1: {
//     color: "#FFFFFF",
//     fontSize: RFValue(14),
//     fontWeight: "600",
//     fontFamily: "Poppins-SemiBold",
//   },
//   Button2: {
//     color: "#FFFFFF",
//     fontSize: RFValue(14),
//     fontWeight: "600",
//     fontFamily: "Poppins-SemiBold",
//   },
//   input: {
//     width: wp("91.11%"),
//     height: hp("14.75%"),
//     backgroundColor: "#FFFFFF",
//     borderRadius: 10,
//     fontSize: RFValue(14),
//     borderWidth: 1,
//     borderColor: "#ccc",
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//   },
//   deleteButon: {
//     width: wp("82.72%"),
//     height: hp("6%"),
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: hp("36.875%"),
//     borderRadius: 10,
//   },

// });

export default DeleteAccount;
