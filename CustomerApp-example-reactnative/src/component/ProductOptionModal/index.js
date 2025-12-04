import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import { useTranslation } from "react-i18next";

const ProductOptionModal = ({
  visible,
  onClose,
  product,
  options,
  onAddToCart,
}) => {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState(null);

  // Debug logging
  React.useEffect(() => {
    if (visible && options) {
      console.log('ProductOptionModal - Options:', JSON.stringify(options, null, 2));
    }
  }, [visible, options]);

  const handleAddToCart = () => {
    if (!selectedOption) {
      return;
    }
    onAddToCart(selectedOption);
    setSelectedOption(null);
    onClose();
  };

  const handleCancel = () => {
    setSelectedOption(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>Choose</Text>

            <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
              {options?.map((option, index) => {
                // Support both formats: {id, name} and {Key, Value}
                const optionId = option.id || option.Value || index;
                const optionName = (option.name || option.Key || '').trim();
                
                return (
                  <TouchableOpacity
                    key={optionId}
                    style={styles.optionRow}
                    onPress={() => setSelectedOption({ id: optionId, name: optionName })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.radioContainer}>
                      <View
                        style={[
                          styles.radioOuter,
                          selectedOption?.id === optionId &&
                            styles.radioOuterSelected,
                        ]}
                      >
                        {selectedOption?.id === optionId && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        selectedOption?.id === optionId &&
                          styles.optionTextSelected,
                      ]}
                    >
                      {optionName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.addButton,
                  !selectedOption && styles.addButtonDisabled,
                ]}
                onPress={handleAddToCart}
                activeOpacity={0.8}
                disabled={!selectedOption}
              >
                <Text style={styles.addButtonText}>Add to cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: wp("85%"),
    maxHeight: hp("70%"),
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  content: {
    paddingHorizontal: wp("5%"),
    paddingTop: hp("3%"),
    paddingBottom: hp("2.5%"),
  },
  title: {
    fontSize: RFValue(18),
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: hp("2.5%"),
  },
  optionsContainer: {
    maxHeight: hp("40%"),
    marginBottom: hp("2%"),
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp("1.8%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  radioContainer: {
    marginRight: wp("4%"),
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D0D0D0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  radioOuterSelected: {
    borderColor: "#4CAF50",
    borderWidth: 2.5,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: "#4CAF50",
  },
  optionText: {
    fontSize: RFValue(14),
    color: "#333333",
    fontWeight: "500",
    flex: 1,
  },
  optionTextSelected: {
    color: "#1A1A1A",
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp("2%"),
    gap: wp("3%"),
  },
  button: {
    flex: 1,
    paddingVertical: hp("1.6%"),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  cancelButtonText: {
    fontSize: RFValue(13),
    color: "#666666",
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#4CAF50",
  },
  addButtonDisabled: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: RFValue(13),
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default ProductOptionModal;
