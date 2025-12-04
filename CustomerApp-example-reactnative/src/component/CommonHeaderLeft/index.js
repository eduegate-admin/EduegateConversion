import { useNavigation } from "@react-navigation/native";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { View } from "react-native";
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const client = process.env.CLIENT;
  
const CommonHeaderLeft = props => {
  const navigation = useNavigation();

  const handleClick = () => {
    if (props.type === 'back') {
      if (props.action) {
        props.action();
      } else {
        navigation.goBack();
      }
    } else {
      null
    }
  };

  return (
    <View >
      <TouchableOpacity style={styles.padding} onPress={handleClick}>
        <Image
          source={
            props.type === "back"
              ? require(`../../assets/images/client/${client}/arrow-left.png`)
              : null
          }
          style={styles.image} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  padding: {
    paddingLeft: wp('4.72%'),
  },
  image: { width:  wp('6.66%'), height:  wp('6.67%'), resizeMode: "contain" },
});

export default CommonHeaderLeft;
