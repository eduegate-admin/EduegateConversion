import { View, Text, Dimensions, Image, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import CustomButton from "../CustomButton";
import { useNavigation } from "@react-navigation/native";
const { width, height } = Dimensions.get("screen");

const SubstitutionView = (props) => {
  const navigation = useNavigation();
  const data = props.data;
  const cartID = props.cartID;
 const currency = props.currency; 
 const onSubmit = props.onSubmit; 
  const count = data.map((item) => item.CartItem)?.length;
  const message = data.map((item) => item.Message)
  // console.log("subData", cartID);

//   const initialSeconds = 2400;
  const [secondsLeft, setSecondsLeft] = useState(2100);

  useEffect(() => {
    if (secondsLeft === 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    // Cleanup
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };


  const SubstitutionProducts = () => {
    navigation.navigate('OrderDetailsDrawer', { 
        Data: data, currency : currency ,time : secondsLeft ,cartID : cartID , onSubmit : onSubmit,
      } );
      navigation.openDrawer();
  };

  return (
    <View
      style={{
        width: width * 0.95,
        height: height * 0.18,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        borderRadius: 20,
        elevation: 10,
        borderWidth: 2,
        borderColor: "green",
        flexDirection: "column",
        overflow: "hidden",
        marginBottom: 10,
      }}
    >
      <View
        style={{
          width: "100%",
          height: "50%",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            width: "70%",
            height: "100%",
            alignItems: "center",
            justifyContent: "space-around",
            flexDirection: "row",
            // backgroundColor: "blue",
          }}
        >
          <Image
            style={styles.image}
            source={require("../../assets/images/client/almadina/Replace.png")}
          />
          <Text style={styles.replaceText}>{message[0]}</Text>
        </View>
        <View
          style={{
            width: "30%",
            height: "80%",
            // backgroundColor: "green",
            alignItems: "center",
            alignSelf: "center",
            justifyContent: "space-around",
            flexDirection: "column",
          }}
        >
          <Text style={styles.CountText}>Expires in</Text>
          <Text
            style={[
              styles.CountText,
              {
                color: "red",
                padding: 5,
                paddingHorizontal: 15,
                borderWidth: 2,
                borderRadius: 10,
                borderColor: "red",
                backgroundColor: "pink",
              },
            ]}
          >
            {formatTime(secondsLeft) <= "29:59" ? "Expired" : formatTime(secondsLeft)}
          </Text>
        </View>
      </View>
      <View
        style={{
          width: "100%",
          height: "50%",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            width: "30%",
            height: "80%",
            // backgroundColor: "yellow",
            alignItems: "center",
            alignSelf: "center",
            justifyContent: "space-around",
          }}
        >
          <Text style={styles.CountText}>Total Products</Text>
          <Text
            style={[
              styles.CountText,
              {
                color: "#61AD4E",
                padding: 2,
                paddingHorizontal: 8,
                borderWidth: 2,
                borderRadius: 50,
                borderColor: "#61AD4E",
              },
            ]}
          >
            {count}
          </Text>
        </View>
        <View
          style={{
            width: "50%",
            height: "100%",
            // backgroundColor: "brown",
            justifyContent: "space-around",
          }}
        >
          <CustomButton
            handleButtonPress={SubstitutionProducts}
            buttonColor={"green"}
            buttonText={"View suggestions"}
            buttonTextColor={"#FFF"}
            Width={"35%"}
            Height={"5%"}
            Radius={10}
            type={"normal"}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    resizeMode: "contain",
    width: 28,
    height: 28,
  },
  replaceText: {
    fontSize: 19,
    // color:"#61AD4E",
    fontWeight: "700",
  },
  CountText: {
    fontSize: 18,
    // color:"#61AD4E",
    fontWeight: "500",
  },
});
export default SubstitutionView;
