import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function CustomPop({
  visible,
  onClose,
  onConfirm,
  title = "Confirm Logout",
  message = "Are you sure you want to log out?",
  confirmText = "Yes",
  cancelText = "Cancel",
  GradientColor = true
}) {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, styles.cancelButton]}
            >
              {GradientColor ? (
                <LinearGradient
                  colors={["#1D9ADC", "#0B489A"]}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.customText}>{cancelText}</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.buttonText}>{cancelText}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              style={[styles.button, styles.logoutConfirmButton]}
            >
              {GradientColor ? (
                <LinearGradient
                  colors={["#1D9ADC", "#0B489A"]}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.customText}>{confirmText}</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.buttonText}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    marginRight: 10,
  },
  logoutConfirmButton: {
  },
  gradientButton: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    backgroundColor: "#4CAF50", // Green background color
    width: "100%",
    textAlign: "center",
    paddingVertical: 10,
    borderRadius: 8,
    overflow: "hidden"
  },
  customText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
