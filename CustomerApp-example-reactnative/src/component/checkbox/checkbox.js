import React from "react";
import { TouchableOpacity, View, StyleSheet, Image } from "react-native";

const SquareCheckbox = ({ checked, onChange }) => {
  return (
    <TouchableOpacity onPress={onChange} style={styles.Container}>
      <View
        style={[styles.Box, { backgroundColor: checked ? "red" : "white" }]}
      >
        {checked && (
          <Image
            style={styles.Checked}
            source={require("../../assets/images/client/almadina/checkbox-tick.png")}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  Container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  Box: {
    height: 20,
    width: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#555",
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
  },
  Checked: {
    resizeMode: "contain",
    height: 25,
    width: 25,
  },
});

export default SquareCheckbox;
