import React, { useEffect, useState } from "react";
import {
  Text,
  Image,
  View,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";
import CustomButton from "../../../component/CustomButton";
import useLanguageSwitch from "../../../hooks/useLanguageSwitch";
import { RFValue } from "react-native-responsive-fontsize";
import appSettings from "../../../../Client/appSettings";
const { width, height } = Dimensions.get("screen");
const client = process.env.CLIENT;

const IconWithBackground = () => {
  const { width, height } = Dimensions.get("screen");
  const [styles, setStyle] = useState(ClientStyles(client, "Welcome"));
  const navigation = useNavigation();
  const ClientName=appSettings?.[client]?.FUSName;
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
    <View>
      <Image
        style={styles.Image}
        source={require("../../../assets/images/client/almadina/bg_welcome.jpg")}
      />
      {/* <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
        }}
      > */}
      {/* <View style={styles.MainContainer}> */}
      <View style={styles.commonView}>
        {/* <View style={styles.logoView}> */}
        {/* <Image style={[styles.logo,{ width: width * 0.2,}]} source={Images.icon} /> */}
        {/* <Image style={styles.logo} source={Images.logo} /> */}
        {/* </View> */}
        <View style={styles.TextView}>
          <Text
            style={[
              styles.WelcomeText,
              { fontWeight: "600", paddingBottom: height * 0.02 },
            ]}
          >
            Welcome
          </Text>
          <Text style={styles.welcomeMessage}>
            Welcome to{" "}
            <Text style={styles.clientName}>
              {ClientName}!
            </Text>{" "}
            Easy shopping, delivered fresh. Let's get started!
          </Text>
        </View>
        <View style={styles.ButtonView}>
          <Text style={styles.Text}>Select your Language</Text>
          <View style={styles.ButtonContainer}>
            <CustomButton
              borderColor={"#61AD4E"}
              buttonColor={"#61AD4E"}
              buttonText={"English"}
              buttonTextColor={"#fff"}
              borderWidth={1}
              handleButtonPress={() => changeLanguage("en")}
              Width={"40%"}
              Height={"6%"}
              Radius={10}
              fontSize={RFValue(15)}
              type={"normal"}
            />
            <CustomButton
              borderColor={"#61AD4E"}
              buttonColor={"#fff"}
              buttonText={"العربية"}
              buttonTextColor={"#61AD4E"}
              borderWidth={1}
              handleButtonPress={() => changeLanguage("ar")}
              Width={"40%"}
              Height={"6%"}
              Radius={10}
              fontSize={RFValue(16)}
              type={"normal"}
            />
          </View>
          <Text
            style={[
              styles.WelcomeText,
              {
                fontSize: width * 0.035 && height * 0.016,
                color: "#868889",
                lineHeight: 100,
              },
            ]}
          >
            Let’s Start Our Journey...
          </Text>
        </View>
      </View>
      {/* </View> */}
      {/* </ScrollView> */}
      {/* </ImageBackground> */}
    </View>
  );
};

// const styles = StyleSheet.create({
// Image: {
//     width: '100%',
//     height: height * 0.5, // Half of screen height
//     resizeMode: 'cover',
//   },
//   commonView: {
//     width: width,
//     height: height * 0.5, // Half of screen height
//     // flexDirection: "column",
//     // justifyContent: "space-between",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     backgroundColor: "#F4F5F9",
//     marginTop: 0,
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
//   TextView : {
//     width: '100%',
//     paddingHorizontal: 25,
//     paddingTop: 20,
//     paddingBottom: 30,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   WelcomeText: {
//     fontSize: height*0.065 && width* 0.085,lineHeight:45
//  },
//   welcomeMessage: {
//     fontSize: RFValue(16, 812),
//     color: '#666',
//     textAlign: 'center',
//     lineHeight: 24,
//     fontFamily: 'Poppins-Regular',
//   },
//   clientName: {
//     fontSize: RFValue(18, 812),
//     color: '#333',
//     fontFamily: 'Poppins-SemiBold',
//     fontWeight: '600',
//   },
//   ButtonView: {
//     // backgroundColor: "#cddc39",
//     width: width,
//     height: height * 0.20,
//     flexDirection: "column",
//     justifyContent: "center",
//     alignItems:"center",
//     // paddingHorizontal: width * 0.07,
//     // paddingTop: 100,
//   },

//   ButtonContainer: {
//     width: width,
//     flexDirection: "row",
//     paddingTop: 25,
//     // backgroundColor: "blue",
//     justifyContent: "space-between",
//     // marginBottom: -20,
//     paddingHorizontal: width * 0.07,
//   },
//   Text: { fontSize: width * 0.043 && height*0.02,color: "#000",lineHeight:28, fontWeight: "600" },
// });

export default IconWithBackground;
