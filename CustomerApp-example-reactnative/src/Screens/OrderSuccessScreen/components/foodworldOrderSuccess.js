import { View, Text, Image } from "react-native";
import React from "react";
import CustomButton from "../../../component/CustomButton";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const OrderSuccessFoodWorld = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();


  return (
    <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
      <Image
        style={{ width: 120, height: 120, resizeMode: "contain", bottom: 180 }}
        source={require("../../../assets/images/client/foodworld/image 50.png")}
      />
      <View style={{ justifyContent: "center", alignItems: "center", bottom: 180 }}>
        <Text
          style={{ fontSize: 35, fontWeight: 700, color: '#133051' }}
        >
          {t("your_order_placed")}
        </Text>
        <Text
          style={{ fontSize: 35, fontWeight: 700, color: '#133051' }}
        >
          {t("successfully")}
        </Text>
      </View>

      <CustomButton
        buttonText="Order History"
        handleButtonPress={() => navigation.navigate("Order")}
        position="absolute"
        bottom={0.15}
        Radius={15}
        Width={0.89}
        Height={0.065}
        fontSize={0.05}
        type="normal"
      />
      <TouchableOpacity
        onPress={() => navigation.navigate("Home")}
        style={{ justifyContent: "center", alignItems: "center", bottom: 100, position: "absolute" }}
      >
        <Text style={{ fontSize: 20, fontWeight: 600, color: '#68B054' }}> {t("back_to_home")}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OrderSuccessFoodWorld;
