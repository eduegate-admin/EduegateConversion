import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import ClientStyles from "../../../Styles/StyleLoader/ClientStyles";
import appSettings from "../../../../Client/appSettings";
const client = process.env.CLIENT;

const Search_with_without_scan = (props) => {
    const [styles, setStyle] = useState(ClientStyles(client, "SearchBar"));

  useEffect(() => {
    const clientStyle = ClientStyles(client, "SearchBar");
    if (clientStyle) {
      setStyle(clientStyle);
    } else {
      console.error("Client settings not found");
    }
  }, []);
  const AppSettings = appSettings[client];
  const SearchPanel = AppSettings.SearchPanel;

  const { Filter, placeholder, onChangeText, handleFilter, editable = true, handleClick, value, onClear } = { ...props };
  
  return (
    <>


      <View style={[Filter ? styles.newContainer : styles.container]}>
        <TouchableOpacity
          style={[Filter ? styles.newStyle : styles.search]}
          onPress={!editable && handleClick ? handleClick : undefined}
          disabled={editable}
        >
          <View style={styles.innerView}>
            <Image
              source={require(`../../../assets/images/client/${client}/searchbar-icon.png`)}
              style={styles.searchIcon}
            />
            {editable ? (
              <TextInput
                placeholder={placeholder ? placeholder : "Find your needs here..."}
                placeholderTextColor={"#133051"}
                style={styles.textInput}
                selectionColor={"#133051"}
                onChangeText={(text) => onChangeText && onChangeText(text)}
                value={value}
                editable={editable}
              />
            ) : (
              <Text style={styles.placeholderText}>
                {placeholder ? placeholder : "Find your needs here..."}
              </Text>
            )}
            {value && value.length > 0 && onClear && (
              <TouchableOpacity onPress={onClear} style={styles.clearButton}>
                <Text style={styles.clearText}>✕</Text>
              </TouchableOpacity>
            )}
            {!SearchPanel && !value && (
              <Image
                source={require("../../../assets/images/client/foodworld/searchbar-scan.png")}
                style={styles.scanIcon}
              />
            )}
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleFilter}>
          {Filter ? (
            <Image
              source={require("../../../assets/images/client/foodworld/Filter-Icon.png")}
              style={styles.FilterIcon}
            />
          ) : null}
        </TouchableOpacity>

      </View>

    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: '100%',
    paddingBottom: 10,
    padding: 10,

  },
  newContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: '100%',
    paddingBottom: 20,
    paddingHorizontal: 15,



  },
  search: {
    borderWidth: 0,
    borderColor: "transparent",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 13,
    marginBottom: -2,
    paddingHorizontal: 15,
    width: "100%",
    height: 40,


    backgroundColor: "#dddddd"
  },
  newStyle: {
    borderWidth: 0,
    borderColor: "transparent",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 16,
    paddingHorizontal: 15,

    width: "80%",
    height: 46,
  },
  innerView: {
    flexDirection: "row",
    alignItems: "center",

  },
  searchIcon: {
    width: 26,
    height: 26,
    marginLeft: 15,
    resizeMode: "contain",
    tintColor: "#797979",

  },
  FilterIcon: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: 300,
    // width: 60,
    marginLeft: 10,
    paddingBottom: 8,
    color: "#000",

  },
  placeholderText: {
    flex: 1,
    fontSize: 13,
    fontWeight: 300,
    marginLeft: 3,
    // color: "#133051",
    color: "#797979",
    fontFamily: "Mulish-Regular",
  },
  scanIcon: {
    width: 45,
    height: 45,
    resizeMode: "contain",
    marginLeft: 15,
  },
  clearButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  clearText: {
    fontSize: 20,
    color: "#797979",
    fontWeight: "500",
  },
  Scan: {
    fontSize: 18,
    color: "black",
  },
});

export default Search_with_without_scan;
