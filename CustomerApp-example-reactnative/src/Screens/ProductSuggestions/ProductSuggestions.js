import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  ScrollView,
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import { RFValue } from "react-native-responsive-fontsize";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import CustomHeader from "../../component/CustomHeader";
import CommonHeaderLeft from "../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../component/CommonHeaderRight";
import CustomButton from "../../component/CustomButton";
import appSettings from "../../../Client/appSettings";

const client = process.env.CLIENT;

const ProductSuggest = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const conditionalHeaderProps = appSettings[client]?.conditionalHeaderProps;
  const THEME_GREEN = "#25A55F";

  const [productSuggestions, setProductSuggestions] = useState([
    { id: `${Date.now()}-0`, ProductName: '', Link: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        conditionalHeaderProps ? (
          <CustomHeader
            title={t("product_suggestions")}
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
            title={t("product_suggestions")}
            leftComponent={<CommonHeaderLeft type="back" />}
            rightComponent={<CommonHeaderRight />}
            color="#000000"
            elevation={1}
          />
        )
      ),
      title: t("product_suggestions"),
    });
  }, [t]);

  const addNewFields = () => {
    setProductSuggestions(prev => [...prev, { id: `${Date.now()}-${prev.length}`, ProductName: '', Link: '' }]);
  };

  const removeFields = index => {
    setProductSuggestions(prev => {
      const copy = [...prev];
      if (copy.length <= 1) return copy;
      copy.splice(index, 1);
      return copy;
    });
  };

  const updateField = (index, field, value) => {
    setProductSuggestions(prev => {
      const copy = [...prev];
      
      if (field === 'ProductName') {
        // Allow only letters, numbers, and spaces
        const filtered = value.replace(/[^a-zA-Z0-9 ]/g, "");
        copy[index] = { ...copy[index], [field]: filtered };
      } else if (field === 'Link') {
        // Remove emojis only (allow all other characters including special chars)
        const filtered = value.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, "");
        copy[index] = { ...copy[index], [field]: filtered };
      } else {
        copy[index] = { ...copy[index], [field]: value };
      }
      
      return copy;
    });
  };

  const buildMessage = suggestions => {
    return suggestions
      .map(s => `Product:${s.ProductName || ''};Link:${s.Link || ''}`)
      .join('');
  };

  const saveFeedback = async () => {
    if (!productSuggestions || productSuggestions.length === 0 || !productSuggestions[0].ProductName.trim()) {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("please_enter_your_suggestion"),
        position: "top",
      });
      return;
    }

    const message = buildMessage(productSuggestions);

    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      console.log("Product Suggestions Submitted:", productSuggestions);
      console.log("Formatted Message:", message);
      
      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("feedback_submitted"),
        position: "top",
      });
      
      setIsLoading(false);
      navigation.goBack();
    }, 1000);
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.suggestList}>
      <View style={styles.fieldWrap}>
        <Text style={styles.label}>
          {t("product_name")} <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={item.ProductName}
          onChangeText={text => updateField(index, 'ProductName', text)}
        />
      </View>
      <View style={styles.fieldWrap}>
        <Text style={styles.label}>{t("link_reference")}</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={item.Link}
          onChangeText={text => updateField(index, 'Link', text)}
          multiline
          textAlignVertical="top"
        />
      </View>

      {productSuggestions.length > 1 && (
        <TouchableOpacity style={styles.deleteBtn} onPress={() => removeFields(index)}>
          <Ionicons name="trash-outline" size={20} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.bigTitle}>{t("didn't_find_your_product")}</Text>
          <Text style={styles.subTitle}>{t("suggest_product")}</Text>
        </View>

        <View style={styles.formWrapper}>
          <FlatList
            data={productSuggestions}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.suggestListWrap}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.buttonsRow}>
          <CustomButton
            buttonText={`+ ${t("add")}`}
            buttonColor={"#E0E0E0"}
            buttonTextColor={"#333"}
            handleButtonPress={addNewFields}
            Radius={8}
            Width={"30%"}
            Height={"5.5%"}
            fontSize={RFValue(12)}
            type="normal"
          />

          <View style={{ width: wp("2%") }} />

          <CustomButton
            buttonText={t("submit")}
            buttonColor={THEME_GREEN}
            buttonTextColor={"#fff"}
            handleButtonPress={saveFeedback}
            Radius={8}
            Width={"55%"}
            Height={"5.5%"}
            fontSize={RFValue(12)}
            type="normal"
            disabled={isLoading}
            loading={isLoading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff' 
  },
  body: {
    padding: wp("4.44%"),
    paddingBottom: hp("3%"),
  },
  titleRow: { 
    marginBottom: hp("2.5%"),
  },
  bigTitle: { 
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

  formWrapper: { 
    flex: 1, 
    marginTop: hp("1%"),
  },
  suggestListWrap: {
    paddingBottom: hp("1%"),
  },

  suggestList: {
    backgroundColor: '#fff',
    paddingTop: hp("2%"),
    paddingHorizontal: wp("3%"),
    paddingBottom: hp("1.5%"),
    marginBottom: hp("2%"),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },

  fieldWrap: { 
    marginBottom: hp("1.5%"),
  },
  label: {
    fontSize: RFValue(14, 800),
    fontFamily: "Poppins-Medium",
    fontWeight: "500",
    color: "#525252",
    marginBottom: hp("0.8%"),
  },
  required: { 
    color: "red" 
  },
  input: {
    padding: wp("3%"),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#fff',
    minHeight: hp("5.5%"),
    fontSize: RFValue(12),
    fontFamily: "Poppins-Regular",
    color: "#000",
  },
  textarea: {
    minHeight: hp("10%"),
    textAlignVertical: 'top',
  },

  deleteBtn: {
    position: 'absolute',
    right: wp("2%"),
    top: hp("1%"),
    padding: wp("2%"),
    backgroundColor: '#fff',
    borderRadius: 20,
  
  },

  buttonsRow: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    marginTop: hp("2%"),
    width: wp("91.11%"),
  },
});

export default ProductSuggest;