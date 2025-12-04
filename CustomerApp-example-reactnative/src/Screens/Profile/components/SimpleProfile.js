import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import CustomHeader from "../../../component/CustomHeader";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import { useNavigation } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import { RFValue } from "react-native-responsive-fontsize";
import UserService from "../../../services/UserService";
import AddressService from "../../../services/addressService";
import { useTranslation } from "react-i18next";
import CustomButton from "../../../component/CustomButton";
import RenderHTML from "react-native-render-html";
import pageServices from "../../../services/pageServices";
import appSettings from "../../../../Client/appSettings";

export default function SimpleProfile() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [areas, setAreas] = useState([]);
  const [showAreaPicker, setShowAreaPicker] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsHtml, setTermsHtml] = useState("");
  const [termsLoading, setTermsLoading] = useState(false);
  const client = process.env.CLIENT;

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        <CustomHeader
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
      title: t("personal_settings") || "Personal Settings",
    });
    GetUser(); // This will now fetch areas after getting user data
  }, [t]);

  // Load Terms when modal opens or language changes
  useEffect(() => {
    if (showTermsModal) {
      loadTerms();
    }
  }, [showTermsModal, i18n.language]);

  const GetUser = async () => {
    try {
      const respUser = await UserService.getUserDetails();
      // console.log("user data", respUser);

      setUser(respUser?.data);
      setFirstName(respUser?.data?.Customer?.FirstName || "");
      setLastName(respUser?.data?.Customer?.LastName || "");
      setPhone(respUser?.data?.Customer?.TelephoneNumber || "");
      setEmail(respUser?.data?.LoginEmailID || "");
      
      // Fetch areas after user data is loaded if cityID exists
      if (respUser?.data?.Customer?.CityID) {
        await fetchAreas(respUser?.data?.Customer?.CityID);
      } else {
        // Fetch all areas if no cityID
        await fetchAreas();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchAreas = async (cityID = null) => {
    try {
      const response = await AddressService.GetAreaByCityID(cityID);
      const data = response?.data || [];
      
      // Format the data for the dropdown
      const formattedAreas = [
        { label: "--Select Area--", value: "" },
        ...data.map((area) => ({
          label: area.Name || area.AreaName,
          value: area.ID || area.AreaID,
        })),
      ];
      
      setAreas(formattedAreas);
      
      // Set selected area if user already has one
      if (user?.Customer?.AreaID) {
        setSelectedArea(user.Customer.AreaID);
      }
    } catch (error) {
      console.error("Error fetching Areas:", error);
      setAreas([{ label: "--Select Area--", value: "" }]);
    }
  };

  const handleContinue = async () => {
    if (!firstName.trim()) {
      Toast.show({
        type: "error",
        text1: t("validation_error"),
        text2: t("first_name_required"),
        position: "top",
      });
      return;
    }

    if (!phone.trim()) {
      Toast.show({
        type: "error",
        text1: t("validation_error"),
        text2: t("phone_required"),
        position: "top",
      });
      return;
    }

    if (!selectedArea) {
      Toast.show({
        type: "error",
        text1: t("validation_error"),
        text2: t("area_required"),
        position: "top",
      });
      return;
    }

    if (!agreeToTerms) {
      Toast.show({
        type: "error",
        text1: t("validation_error"),
        text2: t("agree_to_terms"),
        position: "top",
      });
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        ...user,
        LoginEmailID: email,
        MobileNumber: phone,
        Customer: {
          ...user.Customer,
          FirstName: firstName,
          LastName: lastName,
        },
        Area: selectedArea,
      };

      const response = await AddressService.SavePersonalSettings(payload);

      if (response?.status === 200) {
        Toast.show({
          type: "success",
          text1: t("success"),
          text2: t("profile_updated_successfully"),
          position: "top",
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: "error",
          text1: t("error"),
          text2: t("update_failed"),
          position: "top",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("something_went_wrong"),
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTerms = async () => {
    try {
      setTermsLoading(true);
      const lang = i18n?.language || "en";
      const termsIDEn = appSettings[client]?.TermsIDEn;
      const termsIDAr = appSettings[client]?.TermsIDAr;
      const id = lang?.startsWith("ar") ? termsIDAr : termsIDEn;

      if (!id) {
        setTermsHtml(
          '<p style="font-size:16px;color:#555;">Terms & Conditions are not configured for this client.</p>'
        );
        return;
      }

      const response = await pageServices.GetStaticPage(id);
      const htmlData =
        typeof response?.data === "string"
          ? response.data
          : typeof response?.data?.Data === "string"
          ? response.data.Data
          : typeof response?.data?.html === "string"
          ? response.data.html
          : typeof response?.data?.content === "string"
          ? response.data.content
          : "";

      setTermsHtml(
        htmlData ||
          '<p style="font-size:16px;color:#555;">No content found.</p>'
      );
    } catch (error) {
      console.error("Terms loading failed:", error);
      setTermsHtml(
        '<p style="font-size:16px;color:#c00;">Unable to load content. Please try again later.</p>'
      );
    } finally {
      setTermsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.body}>
        {/* First Name */}
        <Text style={styles.label}>
          {t("first_name") || "First name"}
          <Text style={styles.required}> *</Text>
        </Text>
        <View style={styles.commonViewInput}>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder={t("enter_first_name") || "Enter first name"}
          />
        </View>

        {/* Last Name */}
        <Text style={styles.label}>{t("last_name") || "Last Name"}</Text>
        <View style={styles.commonViewInput}>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder={t("enter_last_name") || "Enter last name"}
          />
        </View>

        {/* Email */}
        <Text style={styles.label}>{t("email") || "Email"}</Text>
        <View style={styles.commonViewInput}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder={t("enter_email") || "Enter email"}
          />
        </View>

        {/* Phone */}
        <Text style={styles.label}>
          {t("telephone_mobile") || "Telephone/mobile"}
          <Text style={styles.required}> *</Text>
        </Text>
        <View style={styles.commonViewInput}>
          <TextInput
            style={[styles.input, styles.phoneInput]}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={15}
            placeholder={t("enter_phone") || "Enter phone number"}
            editable={false}
          />
        </View>

        {/* Area Dropdown */}
        <Text style={styles.label}>
          {t("area") || "Area"}
          <Text style={styles.required}> *</Text>
        </Text>
        <View style={styles.commonViewInput}>
          <TouchableOpacity
            style={styles.pickerContainer}
            onPress={() => setShowAreaPicker(true)}
          >
            <Text style={styles.pickerText}>
              {areas.find((a) => a.value === selectedArea)?.label ||
                "--Select Area--"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity onPress={() => setAgreeToTerms(!agreeToTerms)}>
            <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
              {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>
            {t("i_agree_to_the") || "I agree to the"}{" "}
            <TouchableOpacity onPress={() => setShowTermsModal(true)}>
              <Text style={styles.termsLink}>
                {t("terms_and_conditions") || "Terms and Conditions"}
              </Text>
            </TouchableOpacity>
          </Text>
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <CustomButton
            buttonText={t("continue") || "Continue"}
            buttonColor={"#28A745"}
            buttonTextColor={"#fff"}
            handleButtonPress={handleContinue}
            Radius={15}
            Width={"80 %"}
            Height={"5.5%"}
            fontSize={RFValue(12)}
            type="normal"
            disabled={isLoading}
          />
        </View>
      </ScrollView>

      {/* Area Picker Modal */}
      <Modal
        visible={showAreaPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAreaPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAreaPicker(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={areas}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedArea(item.value);
                    setShowAreaPicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Terms & Conditions Modal */}
      <Modal
        visible={showTermsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.termsModalContent}>
            <View style={styles.termsHeader}>
              <Text style={styles.termsTitle}>
                {t("terms_and_conditions") || "Terms and Conditions"}
              </Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                <Text style={styles.termsClose}>X</Text>
              </TouchableOpacity>
            </View>

            {termsLoading ? (
              <View style={{ paddingVertical: hp("2%"), alignItems: "center" }}>
                <ActivityIndicator size="large" color="#1D9ADC" />
              </View>
            ) : (
              <ScrollView style={styles.termsBody}>
                <RenderHTML
                  contentWidth={wp("100%")}
                  source={{ html: termsHtml }}
                  tagsStyles={{
                    body: { fontFamily: "Poppins-Regular", color: "#222", lineHeight: 26 },
                    p: {
                      fontSize: 16,
                      textAlign: "justify",
                      fontWeight: "400",
                      fontFamily: "Poppins-Regular",
                      color: "#222",
                      lineHeight: 26,
                      marginTop: 4,
                      marginBottom: 12,
                      letterSpacing: 0.2,
                    },
                    h1: {
                      fontSize: 24,
                      fontWeight: "600",
                      fontFamily: "Poppins-SemiBold",
                      marginTop: 4,
                      marginBottom: 16,
                      textAlign: "left",
                      color: "#111",
                      letterSpacing: 0.3,
                    },
                    h2: {
                      fontSize: 20,
                      fontWeight: "600",
                      fontFamily: "Poppins-SemiBold",
                      marginTop: 24,
                      marginBottom: 12,
                      textAlign: "left",
                      color: "#111",
                    },
                    h3: {
                      fontSize: 18,
                      fontWeight: "500",
                      fontFamily: "Poppins-Medium",
                      marginTop: 20,
                      marginBottom: 10,
                      textAlign: "left",
                      color: "#222",
                    },
                    ul: { paddingLeft: 0, marginLeft: 0, marginBottom: 18 },
                    ol: { paddingLeft: 0, marginLeft: 0, marginBottom: 18 },
                    li: {
                      fontSize: 15,
                      lineHeight: 24,
                      marginBottom: 8,
                      paddingLeft: 24,
                      position: "relative",
                      fontFamily: "Poppins-Regular",
                      color: "#333",
                    },
                    a: { color: "#1D9ADC", textDecorationLine: "underline", fontWeight: "500" },
                    strong: { fontFamily: "Poppins-SemiBold", fontWeight: "600", color: "#111" },
                  }}
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  body: {
    padding: wp("4.44%"),
  },
  commonViewInput: {
    marginTop: hp("1.2%"),
    marginBottom: hp("3.5%"),
  },
  label: {
    fontSize: RFValue(14, 800),
    fontFamily: "Poppins-Medium",
    fontWeight: "500",
    color: "#525252",
  },
  required: { color: "red" },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1.5%"),
    fontSize: RFValue(14),
    fontFamily: "Poppins-Regular",
    color: "#000000",
    backgroundColor: "#FFFFFF",
  },
  phoneInput: {
    backgroundColor: "#F5F5F5",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1.5%"),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },
  pickerText: {
    fontSize: RFValue(14),
    fontFamily: "Poppins-Regular",
    color: "#000000",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp("2%"),
    marginBottom: hp("1%"),
  },
  checkbox: {
    width: wp("6%"),
    height: wp("6%"),
    borderWidth: 2,
    borderColor: "#FF8C00",
    borderRadius: 4,
    marginRight: wp("2.5%"),
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#FF8C00",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: RFValue(12),
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: RFValue(12),
    color: "#757575",
    fontFamily: "Poppins-Regular",
    flex: 1,
  },
  termsLink: {
    color: "#D32F2F",
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: hp("50%"),
    paddingVertical: hp("2%"),
  },
  modalItem: {
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("5%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalItemText: {
    fontSize: RFValue(14),
    fontFamily: "Poppins-Regular",
    color: "#000000",
  },
  buttonContainer: {
    width: "100%",
    marginTop: hp("2%"),
  },
  termsModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: wp("5%"),
    marginVertical: hp("10%"),
    maxHeight: hp("70%"),
    paddingBottom: hp("1.5%"),
  },
  termsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("1.5%"),
  },
  termsTitle: {
    fontSize: RFValue(14),
    fontFamily: "Poppins-Medium",
    color: "#333",
  },
  termsClose: {
    fontSize: RFValue(16),
    color: "#28A745",
    fontFamily: "Poppins-Bold",
    width: wp("8%"),
    height: wp("8%"),
    borderRadius: wp("4%"),
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: wp("8%"),
  },
  termsBody: {
    paddingHorizontal: wp("5%"),
    paddingTop: hp("1.5%"),
  },
  termsText: {
    fontSize: RFValue(12),
    color: "#444",
    fontFamily: "Poppins-Regular",
    lineHeight: RFValue(18),
  },
});