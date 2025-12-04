import {
  View,
  Text,
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import OrderService from "../../services/orderService";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const { width, height } = Dimensions.get("screen");
const Comment = ({ ID, UserName }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState("");
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const referenceID = ID;

  useFocusEffect(
    useCallback(() => {
      fetchComments();
    }, [ID])
  );
  // console.log(ID);
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;

    return `${day}-${month}-${year}, ${formattedHours}:${
      minutes < 10 ? "0" : ""
    }${minutes} ${ampm}`;
  };

  const fetchComments = async () => {
    setMessages("");
    try {
      const entityTypeID = 5;

      const response = await OrderService.GetComments(
        entityTypeID,
        referenceID
      );
      const fetchedMessages = response.data.map((item, index) => ({
        id: `${item.CreatedDate}-${index}`,
        commentID: item.CommentID || item.CommentIID,
        user: item.Username,
        text: item.CommentText,
        image: null,
        contentID: item?.ContentID,
        createdBy: item.CreatedBy,
      }));
      const validContentIDs = response.data
        .map((item) => item?.ContentID)
        .filter((id) => id);
      fetchImages(validContentIDs, fetchedMessages);
    } catch (error) {
      console.error("Error fetching fetchComments data:", error);
    }
  };

  const fetchImages = async (ContentIDs, fetchedMessages) => {
    try {
      const imageResponses = await Promise.all(
        ContentIDs.map(async (contentID) => {
          try {
            const response = await OrderService.ReadContentsByID(contentID);
            // console.log(response.data);
            return {
              contentID,
              imageData: response.data,
            };
          } catch (error) {
            console.error(
              `Error fetching image for ContentID ${contentID}:`,
              error
            );
            return { contentID, imageData: null };
          }
        })
      );

      const updatedMessages = fetchedMessages.map((msg) => {
        const imageEntry = imageResponses.find(
          (entry) => entry.contentID === msg.contentID
        );
        if (imageEntry && imageEntry.imageData) {
          return {
            ...msg,
            image: `data:image/jpeg;base64,${imageEntry.imageData}`,
          };
        }
        return msg;
      });

      setMessages(updatedMessages);
    } catch (error) {
      console.error("Error in fetchImages:", error);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          t("permission_denied") || "Permission Denied",
          t("gallery_permission_denied") || "Permission to access gallery was denied."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImage(uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        t("error") || "Error",
        t("failed_to_pick_image") || "Failed to select image. Please try again."
      );
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          t("permission_denied") || "Permission Denied",
          t("camera_permission_denied") || "Permission to access camera was denied."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImage(uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert(
        t("error") || "Error",
        t("failed_to_take_photo") || "Failed to take photo. Please try again."
      );
    }
  };

  const handleSubmit = async (entityTypeID, referenceID) => {
    try {
      if (!comment && !image) return;
      setDisabled(true);
      
      const payload = {
        CommentText: comment.trim(),
        EntityType: entityTypeID,
        ReferenceID: referenceID,
        Username: UserName,
      };

      const response = await OrderService.SaveComment(payload);

      if (response.data) {
        // If there's an image, upload it separately
        if (image) {
          try {
            // Here you would upload the image to the server
            // For now, we'll just clear it
            console.log("Image upload would happen here:", image);
          } catch (imageError) {
            console.error("Error uploading image:", imageError);
          }
        }
        
        setComment("");
        setImage(null);
        await fetchComments();
      }
    } catch (error) {
      console.error("Error in submit:", error);
      Alert.alert(
        t("error") || "Error",
        t("failed_to_send_message") || "Failed to send message. Please try again."
      );
    } finally {
      setDisabled(false);
    }
  };

  const handleClear = () => {
    setComment("");
    setImage(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      {/* Messages List */}
      <ScrollView 
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={RFValue(60, 800)} color="#CCCCCC" />
            <Text style={styles.emptyText}>
              {t("no_messages_yet") || "No messages yet"}
            </Text>
            <Text style={styles.emptySubtext}>
              {t("start_conversation") || "Start a conversation about this order"}
            </Text>
          </View>
        ) : (
          [...messages].reverse().map((msg) => (
            <View key={msg.id} style={styles.messageRow}>
              <View style={styles.avatar}>
                <Ionicons name="person-circle" size={RFValue(32, 800)} color="#27ae60" />
              </View>
              <View style={styles.messageBubble}>
                <Text style={styles.username}>{msg.user}</Text>
                {msg.text ? (
                  <Text style={styles.messageText}>{msg.text}</Text>
                ) : null}
                {msg.image ? (
                  <Image
                    source={{ uri: msg.image }}
                    style={styles.messageImage}
                    resizeMode="cover"
                  />
                ) : null}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Input Section */}
      <View style={styles.inputSection}>
        {/* Image Preview */}
        {image && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setImage(null)}
            >
              <Ionicons name="close-circle" size={RFValue(24, 800)} color="#FE5656" />
            </TouchableOpacity>
          </View>
        )}

        {/* Input Row */}
        <View style={styles.inputRow}>
          {/* Attachment Buttons */}
          <View style={styles.attachmentButtons}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={pickImage}
              activeOpacity={0.7}
            >
              <Ionicons name="image-outline" size={RFValue(22, 800)} color="#27ae60" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={takePhoto}
              activeOpacity={0.7}
            >
              <Ionicons name="camera-outline" size={RFValue(22, 800)} color="#27ae60" />
            </TouchableOpacity>
          </View>

          {/* Text Input */}
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={t("type_your_message") || "Type your message..."}
              placeholderTextColor="#999999"
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={500}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {(comment || image) && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={RFValue(20, 800)} color="#666666" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!comment && !image) && styles.sendButtonDisabled
              ]}
              onPress={() => handleSubmit(5, referenceID)}
              disabled={(!comment && !image) || disabled}
              activeOpacity={0.8}
            >
              {disabled ? (
                <Ionicons name="hourglass-outline" size={RFValue(20, 800)} color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={RFValue(20, 800)} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  // Messages Section
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: wp("4%"),
    paddingTop: hp("2%"),
    paddingBottom: hp("2%"),
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp("15%"),
  },
  emptyText: {
    fontSize: RFValue(16, 800),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#666666",
    marginTop: hp("2%"),
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: RFValue(12, 800),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    color: "#999999",
    marginTop: hp("0.5%"),
    textAlign: "center",
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: hp("2%"),
    alignItems: "flex-start",
  },
  avatar: {
    marginRight: wp("3%"),
    marginTop: hp("0.5%"),
  },
  messageBubble: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: wp("3%"),
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  username: {
    fontSize: RFValue(13, 800),
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
    color: "#27ae60",
    marginBottom: hp("0.5%"),
  },
  messageText: {
    fontSize: RFValue(13, 800),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    color: "#333333",
    lineHeight: RFValue(20, 800),
  },
  messageImage: {
    width: "100%",
    height: hp("30%"),
    borderRadius: 8,
    marginTop: hp("1%"),
  },

  // Input Section
  inputSection: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1.5%"),
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imagePreview: {
    width: wp("30%"),
    height: hp("12%"),
    borderRadius: 8,
    marginBottom: hp("1%"),
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -hp("0.8%"),
    right: -wp("2%"),
    backgroundColor: "#FFFFFF",
    borderRadius: wp("5%"),
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  attachmentButtons: {
    flexDirection: "row",
    marginRight: wp("2%"),
  },
  attachButton: {
    width: wp("10%"),
    height: wp("10%"),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F9F4",
    borderRadius: wp("5%"),
    marginRight: wp("2%"),
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    borderRadius: 20,
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1%"),
    minHeight: hp("5%"),
    maxHeight: hp("12%"),
  },
  textInput: {
    fontSize: RFValue(13, 800),
    fontFamily: "Poppins-Regular",
    color: "#333333",
    paddingVertical: 0,
  },
  actionButtons: {
    flexDirection: "row",
    marginLeft: wp("2%"),
  },
  clearButton: {
    width: wp("10%"),
    height: wp("10%"),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: wp("5%"),
    marginRight: wp("2%"),
  },
  sendButton: {
    width: wp("12%"),
    height: wp("12%"),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#27ae60",
    borderRadius: wp("6%"),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sendButtonDisabled: {
    backgroundColor: "#CCCCCC",
    elevation: 0,
  },
});

export default Comment;
