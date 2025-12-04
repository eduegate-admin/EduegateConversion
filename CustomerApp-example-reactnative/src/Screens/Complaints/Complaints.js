import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import { RFValue } from "react-native-responsive-fontsize";
import { useTranslation } from "react-i18next";
// Make sure you have this installed: npx expo install @expo/vector-icons
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker'; 

// Keeping your custom components
import CustomHeader from "../../component/CustomHeader";
import CommonHeaderLeft from "../../component/CommonHeaderLeft";
import appSettings from "../../../Client/appSettings";
const client = process.env.CLIENT;
export default function Complaints() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [complaintText, setComplaintText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const conditionalHeaderProps = appSettings[client]?.conditionalHeaderProps
  // Theme Color from screenshot (Green)
  const THEME_GREEN = "#25A55F"; 

   useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        conditionalHeaderProps ? (
          <CustomHeader
            title={t("complaints")}
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
            title={t("complaints")}
            leftComponent={<CommonHeaderLeft type="back" />}
            color="#000000"
            elevation={1}
          />
        )
      ),
    });
  }, [t]);

  const handleAttachFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setAttachments(prev => [...prev, {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
        }]);
        Toast.show({
          type: 'success',
          text1: t('success'),
          text2: 'File attached successfully',
          position: 'bottom',
          visibilityTime: 1500,
        });
      }
    } catch (err) {
      console.log('Error picking document:', err);
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: 'Failed to attach file',
        position: 'bottom',
        visibilityTime: 1500,
      });
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: t('permission_required'),
          text2: 'Camera permission is required',
          position: 'bottom',
          visibilityTime: 1500,
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
       mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        setAttachments(prev => [...prev, {
          uri: result.assets[0].uri,
          name: `photo-${Date.now()}.jpg`,
          type: 'image/jpeg',
        }]);
        Toast.show({
          type: 'success',
          text1: t('success'),
          text2: 'Photo captured successfully',
          position: 'bottom',
          visibilityTime: 1500,
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: 'Failed to capture photo',
        position: 'bottom',
        visibilityTime: 1500,
      });
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!complaintText.trim()) {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("please_enter_your_suggestion"),
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('message', complaintText);
      
      // Add attachments to form data
      attachments.forEach((file, index) => {
        formData.append('attachments', {
          uri: file.uri,
          name: file.name || `file-${index}`,
          type: file.type || 'application/octet-stream',
        });
      });

      console.log('Submitting complaint with', attachments.length, 'attachments');
      
      // Simulate API call
      setTimeout(() => {
        console.log("Complaint Sent:", complaintText);
        console.log("Attachments:", attachments);
        Toast.show({
          type: "success",
          text1: t("Thanks"),
          text2: t("for_your_feedback"),
        });
        setComplaintText("");
        setAttachments([]);
        setIsLoading(false);
        navigation.goBack();
      }, 1000);

    } catch (error) {
      console.error("Error sending complaint:", error);
      setIsLoading(false);
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: 'Failed to submit complaint',
        position: 'bottom',
        visibilityTime: 1500,
      });
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Title Section */}
      <View style={styles.textHeaderContainer}>
        <Text style={styles.mainTitle}>{t("your_opinion_matters")}</Text>
        <Text style={styles.subTitle}>
          {t("in_the_case_of_any_suggestions_and_comments_you_can_contact_us")}
        </Text>
      </View>

      {/* Large Text Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textArea}
          multiline={true}
          textAlignVertical="top"
          placeholder=""
          value={complaintText}
          onChangeText={setComplaintText}
        />
        
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {attachments.map((file, index) => (
              <View key={index} style={styles.attachmentItem}>
                <Ionicons 
                  name={file.type?.startsWith('image/') ? 'image' : 'document'} 
                  size={16} 
                  color="#666" 
                  style={styles.attachmentIcon}
                />
                <Text numberOfLines={1} style={styles.attachmentText}>
                  {file.name || `Attachment ${index + 1}`}
                </Text>
                <TouchableOpacity 
                  onPress={() => handleRemoveAttachment(index)}
                  style={styles.removeAttachment}
                >
                  <Ionicons name="close" size={16} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        {/* Left: Attachment Icons */}
        <View style={styles.iconGroup}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={handleAttachFile}
            disabled={isLoading}
          >
            <Ionicons name="attach" size={24} color={isLoading ? '#ccc' : THEME_GREEN} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={handleTakePhoto}
            disabled={isLoading}
          >
            <Ionicons name="camera" size={24} color={isLoading ? '#ccc' : THEME_GREEN} />
          </TouchableOpacity>
        </View>

        {/* Right: Send Button */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={isLoading || !complaintText.trim()}
          style={[
            styles.sendButton, 
            { 
              backgroundColor: (isLoading || !complaintText.trim()) ? '#ccc' : THEME_GREEN,
              opacity: (isLoading || !complaintText.trim()) ? 0.6 : 1,
            }
          ]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.sendButtonText}>{t("send")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    marginBottom: hp("2%"),
  },
  mainTitle: {
    fontSize: RFValue(16),
    fontFamily: "Poppins-SemiBold", // Assuming you have this font
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
  inputContainer: {
    flex: 1,
    marginBottom: hp("2%"),
  },
  textArea: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0", // Light gray border
    borderRadius: 4,
    padding: 15,
    fontSize: RFValue(14),
    fontFamily: "Poppins-Regular",
    color: "#000",
    backgroundColor: "#fff",
    // Shadow for slight elevation if needed
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("4%"), // Space from bottom
    paddingVertical: 10,
  },
  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginRight: 20, // Space between paperclip and camera
    padding: 5,
  },
  sendButton: {
    width: wp("35%"), // Adjust width as needed
    height: hp("5.5%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  sendButtonText: {
    color: "#ffffff",
    fontSize: RFValue(14),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  attachmentsContainer: {
    marginTop: hp("1.5%"),
    paddingTop: hp("1%"),
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  attachmentIcon: {
    marginRight: 10,
  },
  attachmentText: {
    flex: 1,
    marginRight: 10,
    color: "#333",
    fontSize: RFValue(12),
  },
  removeAttachment: {
    padding: 4,
  },
});