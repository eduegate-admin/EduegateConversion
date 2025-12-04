import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  TouchableOpacity,
  Text,
  Image,
  View,
} from "react-native";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";
import { useCallContext } from "../../../AppContext/CallContext";
import useLanguageSwitch from "../../../hooks/useLanguageSwitch";

const client = process.env.CLIENT;

const IconWithOutBackground = () => {
  // const { callContext } = useCallContext();
  const [styles, setStyle] = useState(ClientStyles(client, "Welcome"));
  const {
    callContext,
    // loadUserData,
    fetchIPAddress,
    // createCallContextObject,
    storeCallContext,
  } = useCallContext();
  const { changeLanguage, isChanging } = useLanguageSwitch({
    navigateAfterChange: "",
  });
  useFocusEffect(
    useCallback(() => {
      // loadUserData();
      fetchIPAddress();
      // createCallContextObject();
      storeCallContext();
    }, [])
  );

  useEffect(() => {
    const clientStyle = ClientStyles(client, "Welcome");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, [client]);

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageView}>
          <Image
            source={require(
              `../../../assets/images/client/${client}/main-logo.png`
            )}
            resizeMode="contain"
            style={styles.image}
          />
        </View>

        {/*Btns*/}
        <View style={styles.ButtonContainer}>
          <Text style={styles.Text}>Select your Language</Text>
          <View style={styles.ButtonView}>
            <TouchableOpacity
              onPress={() => changeLanguage("en")}
              style={[styles.button, { backgroundColor: "#58BB47" }]}
              disabled={isChanging}
            >
              <Text style={[styles.ButtonText, { color: "white" }]}>
                English
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => changeLanguage("ar")}
              style={[styles.button, { backgroundColor: "white" }]}
              disabled={isChanging}
            >
              <Text style={[styles.ButtonText, { color: "#58BB47" }]}>
                عربي
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default IconWithOutBackground;
