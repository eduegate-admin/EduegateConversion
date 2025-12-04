import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { Image, Text, View } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import CommonHeaderLeft from "../component/CommonHeaderLeft";
import CustomHeader from "../component/CustomHeader";
import CommonHeaderRight from "../component/CommonHeaderRight";

const UnderConstruction = ({ title }) => {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        <CustomHeader
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight/>}
        />
      ),
    });
  }, []);
  return (
    <View
      style={{
        width: "100%",
        height: hp("100%"),
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        style={{
          resizeMode: "contain",
          width: wp("100%"),
          height: hp("100%"),
          bottom: hp("10%"),
        }}
        source={require("../../assets/Construction.png")}
      />
      <Text
        style={{
          fontFamily: "Poppins-Medium",
          fontSize: RFValue(16),
          fontWeight: "600",
          color: "#B2B2B2",
          position: "absolute",
          bottom: hp("35%"),
        }}
      >
        Under Construction
      </Text>
    </View>
  );
};

export default UnderConstruction;
