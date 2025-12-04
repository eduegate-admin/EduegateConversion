import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import colors from "../../config/colors";
import ClientStyles from "../../Styles/StyleLoader/ClientStyles";
import { useTranslation } from "react-i18next";


import { RFValue } from "react-native-responsive-fontsize";

const client = process.env.CLIENT;

const QuantitySelector = ({ quantity, setQuantity, onPress }) => {
  const [styles, setStyle] = useState(ClientStyles(client, "quantitySelector"));
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const clientStyle = ClientStyles(client, "quantitySelector");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, [client]);

  console.log("quantity", quantity);

  const onMinus = async () => {
    if (quantity > 0) {
      setLoading(true);
      try {
        await setQuantity(quantity - 1);
      } finally {
        setLoading(false);
      }
    }
  };

  const onPlus = async () => {
    setLoading(true);
    try {
      await setQuantity(quantity + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      await onPress();
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {quantity === 0 ? (
        client === "almadina" ? (
          <TouchableOpacity onPress={handleAdd} disabled={loading}>
            <View
              style={{
                paddingHorizontal: 26,
                paddingVertical: 7,
                borderRadius: 30,
                backgroundColor: colors.green,
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ color: "white", fontSize: RFValue(12) }}>
                  {t("add")}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ) : client === "foodworld" ? (
          <TouchableOpacity onPress={handleAdd} activeOpacity={0.7}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Image
                style={{
                  width: 27,
                  height: 27,
                  resizeMode: "contain",
                }}
                source={require("../../assets/images/client/foodworld/add-circle.png")}
              />
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.root}>
            <TouchableOpacity onPress={onMinus} style={styles.button}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    {
                      // bottom:wp("2.5%")
                    },
                  ]}
                >
                  -
                </Text>
              )}
            </TouchableOpacity>
            <Text style={styles.quantity}>{quantity}</Text>
            <TouchableOpacity onPress={onPlus} style={styles.button}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.buttonText]}>+</Text>
              )}
            </TouchableOpacity>
          </View>
        )
      ) : (
        <View style={styles.root}>
          <TouchableOpacity onPress={onMinus} style={styles.button}>
            <Text style={[styles.buttonText]}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity onPress={onPlus} style={styles.button}>
            <Text style={[styles.buttonText]}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    marginTop: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    // backgroundColor: 'yellow',
    marginRight:-9,
    borderRadius: 15,
    paddingVertical: 4,
    paddingLeft:4,
    zIndex: 1,
  },
  button: {
    aspectRatio: 1,
    minWidth: 27,
    borderRadius: 15,
    marginHorizontal: 4,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    includeFontPadding: false,
  },
  quantity: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.green,
    minWidth: 20,
    textAlign: 'center',
  }
});

export default QuantitySelector;
