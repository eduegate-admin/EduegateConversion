import React, { useEffect, useState } from "react";
import {
  Text,
  ImageBackground,
  Image,
  View,
  ScrollView,
  Dimensions,
} from "react-native";
import Images from "../../../assets/Images";
import { useNavigation } from "@react-navigation/native";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";
import CustomButton from "../../../component/CustomButton";
import useLanguageSwitch from "../../../hooks/useLanguageSwitch";

const client = process.env.CLIENT;

const IconWithBackground_Scroll = () => {
  const { width, height } = Dimensions.get("screen");
  const [styles, setStyle] = useState(ClientStyles(client, "Welcome"));
  const navigation = useNavigation();
  const { changeLanguage, isChanging } = useLanguageSwitch({
    navigateAfterChange: "",
  });

  useEffect(() => {
    const clientStyle = ClientStyles(client, "Welcome");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, [client]);

  return (
    <ImageBackground
      style={styles.ImageBackground}
      source={require("../../../assets/images/client/almadina/Web_Photo_Editor.jpg")}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* <View style={styles.MainContainer}> */}
        <View style={styles.commonView}>
          <View style={styles.logoView}>
            <Image
              style={[styles.logo, { width: width * 0.2 }]}
              source={Images.icon}
            />
            <Image style={styles.logo} source={Images.logo} />
          </View>

          <View style={styles.ButtonView}>
            <Text style={styles.Text}>Select your Language</Text>
            <View style={styles.ButtonContainer}>
              <CustomButton
                buttonColor={"#2b9348"}
                buttonText={"English"}
                buttonTextColor={"#ffffff"}
                handleButtonPress={() => changeLanguage("en")}
                Width={0.4}
                Height={0.055}
                Radius={5}
                fontSize={0.04}
                type={"normal"}
              />
              <CustomButton
                buttonColor={"#e53935"}
                buttonText={"عربي"}
                buttonTextColor={"#fffffF"}
                handleButtonPress={() => changeLanguage("ar")}
                Width={0.4}
                Height={0.055}
                Radius={5}
                fontSize={0.06}
                type={"normal"}
              />
            </View>
          </View>
        </View>
        {/* </View> */}
      </ScrollView>
    </ImageBackground>
  );
};

export default IconWithBackground_Scroll;

// style part
// import { Dimensions, StyleSheet } from "react-native";
// import colors from "../../../config/colors";
// import BtnStyle from "../../../component/ButtonStyle";
// const { width, height } = Dimensions.get("screen");
// const WelcomeStyle = StyleSheet.create({
//   ImageBackground: {
//     width: width,
//     height: height,
//     resizeMode: "contain",
//   },
//   // MainContainer: {
//   //   width: width,
//   // },
//   commonView: {
//     width: width,
//     // height:height,
//     flexDirection: "column",
//     justifyContent: "space-between",
//     borderTopLeftRadius: 40,
//     borderTopRightRadius: 40,
//     backgroundColor: "#FFFFFF",
//     marginTop: 250,
//   },
//   logoView: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     width: width,
//     height: height * 0.25,
//     alignItems: "center",
//     // backgroundColor:"red",
//     paddingHorizontal: width * 0.07,
//   },
//   logo: {
//     // backgroundColor:"green",
//     width: width * 0.66,
//     height: height * 0.25,
//     resizeMode: "contain",
//   },
//   ButtonView: {
//     // backgroundColor: "#cddc39",
//     width: width,
//     height: height * 0.55,
//     flexDirection: "column",
//     justifyContent: "center",
//     alignItems:"center",
//     // paddingHorizontal: width * 0.07,
//     paddingTop: 100,
//   },
//   ButtonContainer: {
//     width: width,
//     flexDirection: "row",
//     // paddingTop: 50,
//     // backgroundColor: "blue",
//     justifyContent: "space-between",
//     paddingHorizontal: width * 0.07,
//   },
//   Text: { fontSize: width*0.045, lineHeight: 70, fontWeight: "600" },
//   Buttons: {
//     // flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   BtnStyle: {
//     ...BtnStyle.ButtonStyle,
//     backgroundColor: colors.green,
//   },
// });

// export default WelcomeStyle;
