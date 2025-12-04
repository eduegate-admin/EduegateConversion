import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "moti/skeleton";

const PaymentMethodsSkeleton = () => (
  <>
    <View style={styles.header}>
      <Skeleton width={"70%"} height={30} radius={6} colorMode="light" />
    </View>
    <View style={styles.list}>
      {[1, 2, 3].map((_, index) => (
        <View key={index} style={styles.row}>
          <Skeleton width={30} height={30} radius={8} colorMode="light" />
          <View style={styles.textCol}>
            <Skeleton width={"70%"} height={20} radius={6} colorMode="light" />
          </View>
          <Skeleton width={20} height={20} radius={10} colorMode="light" />
        </View>
      ))}
    </View>
  </>
);

const styles = StyleSheet.create({
  header: {
    marginLeft: 15,
    flex: 1,
    marginTop: "7%",
    marginBottom: "5%",
  },
  list: {
    width: "100%",
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
  },
  textCol: {
    marginLeft: 15,
    flex: 1,
  },
});

export default PaymentMethodsSkeleton;
