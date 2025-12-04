import React, { useEffect, useState } from "react";
import {
  Image,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";


import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";
const client = process.env.CLIENT;

const Search_with_cam = (props) => {
    const [styles, setStyle] = useState(ClientStyles(client, "SearchBar"));

  useEffect(() => {
    const clientStyle = ClientStyles(client, "SearchBar");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, []);
  const {
    placeholder,
    onChangeText,
    value,
    handleClick,
    editable,
    onSubmitEditing,
  } = props;
  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleClick} style={styles.Container}>
          <View style={styles.innerView}>
            <Image
              source={require(`../../../assets/images/client/${client}/searchbar-icon.png`)}
              style={styles.Icon}
            />
            <TextInput
              placeholder={
                placeholder ? placeholder : "Find your needs here..."
              }
              placeholderTextColor={"#B2B2B2"}
              value={value}
              style={styles.textInput}
              selectionColor={"#133051"}
              onChangeText={(text) => onChangeText(text)}
              onPress={handleClick}
              editable={editable}
              returnKeyType="search"
              onSubmitEditing={onSubmitEditing}
            />
          </View>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.camView}>
          <Image
            source={require(`../../../assets/images/client/${client}/Filter-Icon.png`)}
            style={styles.FilterIcon}
          />
        </TouchableOpacity> */}
      </View>
    </>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     width: wp("100%"),
//     marginVertical: hp("1.8%"),
//     paddingHorizontal: wp("4.44%"),
//     height: hp("6%"),
//     // backgroundColor: "green",
//   },
//   Container: {
//     borderWidth: 0.5,
//     borderColor: "#FFF",
//     justifyContent: "space-between",
//     alignItems: "center",
//     flexDirection: "row",
//     borderRadius: 16,
//     paddingLeft: wp("4.44%"),
//     // width: wp("72.5%"), if cam needed
//     width: wp("91.11%"), //if cam not needed

//     height: hp("6.25%"),
//     backgroundColor: "#FFF",
//     shadowColor: "#8E8E9E",
//     elevation: 5,
//   },
//   camView: {
//     borderWidth: 0.5,
//     borderColor: "#FFF",
//     // justifyContent: "space-between",
//     alignItems: "center",
//     flexDirection: "row",
//     borderRadius: 16,
//     // paddingHorizontal: 15,
//     width: wp("13.89%"),
//     height: hp("6.25%"),
//     justifyContent: "center",
//     backgroundColor: "#FFF",
//     shadowColor: "#8E8E9E",
//     elevation: 5,
//   },
//   Icon: {
//     width: wp("5.56%"),
//     height: hp("2.5%"),
//     resizeMode: "contain",
//   },
//   FilterIcon: {
//     width: wp("6.67%"),
//     height: hp("3%"),
//     resizeMode: "contain",
//     // backgroundColor:"#000"
//   },
//   innerView: {
//     flexDirection: "row",
//     // paddingHorizontal: wp("1%"),
//     marginRight: wp("2%"),
//     alignItems: "center",
//     // backgroundColor: "red",
//   },
//   textInput: {
//     flex: 1,
//     fontSize: RFValue(14),
//     fontWeight: "regular",
//     left: wp("1.39%"),
//     color: "#525252",
//   },
// });

export default Search_with_cam;
