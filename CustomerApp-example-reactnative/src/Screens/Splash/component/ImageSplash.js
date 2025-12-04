import React, { useCallback, useState } from "react";
import { View, Image } from "react-native";
import Images from "../../../assets/Images";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";

const client = process.env.CLIENT;

const ImageSplash = ({ onFinish }) => {
  const [styles, setStyle] = useState(ClientStyles(client, "Splash"));
  const navigation = useNavigation();

   useFocusEffect(
    useCallback(() => {
      const clientStyle = ClientStyles(client, "Splash");
      if (clientStyle) {
        setStyle(clientStyle);
      } else {
        console.error("Client settings not found");
      }

      const timer = setTimeout(() => {
         onFinish(); 
      }, 2000);

      // Clear timeout if screen is unfocused before 2 seconds
      return () => clearTimeout(timer);
    }, [navigation])
  );

  return (
    <View style={styles.container}>
      <Image resizeMode="contain" source={Images.icon} style={styles.icon} />
      <Image resizeMode="contain" source={Images.logo} style={styles.logo} />
    </View>
  );
};

export default ImageSplash;