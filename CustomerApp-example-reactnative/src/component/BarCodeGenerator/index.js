import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import JsBarcode from "jsbarcode";
import { SvgXml } from "react-native-svg";
import {
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const BarcodeGenerator = ({ value, width, height }) => {
  const [barcodeXml, setBarcodeXml] = useState("");

  useEffect(() => {
    try {
      // Create a temporary SVG element in memory
      const svgNode = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      JsBarcode(svgNode, value, {
        format: "CODE128",
        width: 2,
        height: height,
        displayValue: false,
        margin: 0,
      });

      const xml = new XMLSerializer().serializeToString(svgNode);
      setBarcodeXml(xml);
    } catch (error) {
      console.log("Barcode generation error:", error);
    }
  }, [value]);

  if (!barcodeXml) return null;

  return (
    <>
      <View style={styles.container}>
        <SvgXml xml={barcodeXml} width={width} height={height} />
      </View>
      <Text style={styles.cardNumberText}>{value}</Text>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingBottom: hp("0.5%"),
    paddingTop: hp("1%"),
  },
  cardNumberText: {
    fontSize: RFValue(10, 800),
    color: "#252525",
    fontWeight: "600",
    letterSpacing: 2,
    bottom: hp("1.5%"),
    textAlign: "center",
  },
});

export default BarcodeGenerator;
