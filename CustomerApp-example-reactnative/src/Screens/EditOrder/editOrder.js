import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Skeleton } from "moti/skeleton";
import { LinearGradient } from "expo-linear-gradient";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import CustomHeader from "../../component/CustomHeader";
import CommonHeaderLeft from "../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../component/CommonHeaderRight";

const client = process.env.CLIENT;
const EditOrder = (props) => {
  const order = props.route.params?.order || {};
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        <CustomHeader
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
      title: "Edit Order",
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.gradientButton}>
        <Modal transparent={true} animationType="fade" visible={{}}>
          <View
            style={{
              width: wp("100%"),
              height: hp("100%"),
              backgroundColor: "rgba(255, 255, 255, 0.3)",
            }}
          ></View>
        </Modal>
        <ScrollView
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={styles.ScrollView}
        >
          <View style={styles.contentHeader}>
            {order?.OrderDetails?.map((item) => {
              return (
                <>
                  {loading ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: "#E0E0E0",
                        backgroundColor: "#fff",
                        borderRadius: 12,
                        marginBottom: 10,
                        marginHorizontal: 12,
                      }}
                    >
                      {/* Product Image Skeleton */}
                      <Skeleton
                        height={60}
                        width={60}
                        radius={10}
                        colorMode="light"
                      />

                      {/* Text Info Skeleton */}
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Skeleton
                          height={14}
                          width={"70%"}
                          radius={4}
                          colorMode="light"
                        />
                        <Skeleton
                          height={12}
                          width={"50%"}
                          radius={4}
                          colorMode="light"
                          style={{ marginTop: 6 }}
                        />
                        <Skeleton
                          height={16}
                          width={60}
                          radius={4}
                          colorMode="light"
                          style={{ marginTop: 10 }}
                        />
                      </View>

                      {/* Quantity Button Skeleton */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: "#D3D3D3",
                          borderRadius: 6,
                          paddingHorizontal: 8,
                          height: 32,
                        }}
                      >
                        <Skeleton
                          height={16}
                          width={16}
                          radius={4}
                          colorMode="light"
                        />
                        <Skeleton
                          height={16}
                          width={20}
                          radius={4}
                          colorMode="light"
                          style={{ marginHorizontal: 6 }}
                        />
                        <Skeleton
                          height={16}
                          width={16}
                          radius={4}
                          colorMode="light"
                        />
                      </View>
                    </View>
                  ) : (
                    <>
                      <View style={styles.ListOuterView} key={item.SKUID}>
                        <View style={styles.ImageView}>
                          <Image
                            style={styles.image}
                            source={{ uri: item.ProductLargeImageUrl }}
                          />
                        </View>
                        <View style={styles.DetailsView}>
                          <View style={styles.NameView}>
                            <Text style={styles.nameText}>
                              {item.ProductName}
                            </Text>
                            <Text style={styles.weightText}>
                              {item.ProductWeight}
                            </Text>
                          </View>
                          <View style={styles.PriceCommonView}>
                            <View style={styles.PriceView}>
                              <Text style={styles.rateText}>
                                {item.UnitPrice} {order.Currency}
                              </Text>
                            </View>

                            <View style={styles.ProductQuantityView}>
                              <TouchableOpacity
                                style={{
                                  paddingVertical: hp(0.5),
                                  paddingHorizontal: wp(2.5),
                                }}
                                onPress={() => { }}
                              >
                                <Text style={[styles.QuantityChanger]}>-</Text>
                              </TouchableOpacity>
                              <Text style={styles.quantity}>
                                {item.Quantity}
                              </Text>
                              <TouchableOpacity
                                style={{
                                  paddingVertical: hp(0.5),
                                  paddingHorizontal: wp(2.5),
                                }}
                                onPress={() => { }}
                              >
                                <Text style={[styles.QuantityChanger]}>+</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    </>
                  )}
                </>
              );
            })}
          </View>
          {/* <BillSummaryCard cart={cart} loading={loading} /> */}
        </ScrollView>
        {loading ? (
          // 🔸 Skeleton Header Placeholder
          <View style={[styles.ButtonCommonView]}>
            <Skeleton width={70} height={40} radius={10} colorMode="light" />
            <Skeleton
              width={200}
              height={60}
              radius={10}
              style={{ marginTop: 8 }}
              colorMode="light"
            />
          </View>
        ) : (
          <View style={[styles.ButtonCommonView]}>
            <TouchableOpacity
              style={styles.quantityTouchable}
              onPress={() => { }}
            >
              <View style={styles.addToCartButton}>
                <LinearGradient
                  colors={["#1D9ADC", "#0B489A"]}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton2}
                >
                  <Text style={styles.addToCartText}>Save Changes</Text>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    width: wp("100%"),
    // height: hp("100%"),
    // paddingBottom: 50,
    // zIndex: 1,
  },
  gradientButton: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  ScrollView: {
    // backgroundColor: "blue",
    // paddingBottom: 190,
    width: wp("100%"),
    justifyContent: "center",
    paddingBottom: hp("20%"),
    alignItems: "center",
  },
  contentHeader: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    width: wp("91.11%"),
    // height: hp("21.11%"),
    padding: wp("2"),
    marginTop: hp("1.2"),
    shadowColor: "#A9A9A9",
    elevation: 3,
    paddingHorizontal: wp("5%"),
  },
  contentHeaderText: {
    fontSize: RFValue(16),
    fontWeight: "600",
    lineHeight: 50,
    // left: 14,
    color: "#525252",
    fontFamily: "Poppins-SemiBold",
  },
  ListOuterView: {
    // backgroundColor: "green",
    width: wp("91.11%"),
    height: hp("14%"),
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopColor: "#EFEFEF",
    borderTopWidth: 1,
    alignSelf: "center",
    paddingHorizontal: wp("4.44%"), // added horizontal padding
  },

  ImageView: {
    // backgroundColor: "#000",
    width: wp("21.67%"),
    height: hp("9.625%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: wp("3.33%"),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E9E9E9",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    borderRadius: 20,
  },
  DetailsView: {
    // backgroundColor: "red",
    // paddingVertical: 15,
    width: "70%",
    height: hp("10%"),
    // borderRadius: 20,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  NameView: {
    // backgroundColor: "#FFF",
    width: "100%",
    height: "60%",
  },
  PriceCommonView: {
    // backgroundColor: "#000",
    width: "100%",
    height: hp("6%"),
    // bottom:0,
    // borderRadius: 20,
    flexDirection: "row",
    // justifyContent: "center",
    // paddingLeft: 15,
    alignItems: "center",
  },
  nameText: {
    fontSize: RFValue(14),
    fontWeight: "500",
    color: "#252525",
    fontFamily: "Poppins-Regular",
  },
  weightText: {
    fontSize: 17,
    fontWeight: 600,
    color: "#B5B5B5",
  },
  rateText: {
    fontSize: RFValue(16),
    fontWeight: "600",
    color: "#525252",
    bottom: 0,
    fontFamily: "Poppins-SemiBold",
  },
  PriceView: {
    backgroundColor: "#FFFFFF",
    width: "50%",
    height: "80%",
    flexDirection: "row",
    alignItems: "center",
  },
  ProductQuantityView: {
    backgroundColor: "#ffffffff",
    width: wp("25%"),
    height: hp("3.875%"),
    paddingHorizontal: wp("1%"),
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1D9ADC",
  },
  QuantityChanger: {
    textAlign: "center",
    color: "#1D9ADC",
    fontSize: RFValue(18),
    lineHeight: Platform.OS === "android" ? 18 : 0,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  quantity: {
    textAlign: "center",
    color: "#1D9ADC",
    fontSize: RFValue(14),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    alignItems: "end",
    lineHeight: Platform.OS === "android" ? 14 : 0,
  },
  ButtonCommonView: {
    width: wp("100%"),
    height: hp("8%"),
    justifyContent: "space-between",
    flexDirection: "row",
    backgroundColor: "#ffffffff",
    alignItems: "center",
    position: "absolute",
    bottom: hp("0%"),
    paddingHorizontal: wp("4.44%"),
  },
  quantityTouchable: {
    // backgroundColor: "#000",
    width: wp("91.11%"),
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    // marginRight:wp("4.44%"),
  },
  // gradientButton: {
  //   width: "100%",
  //   height: "100%",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   borderRadius: 10,
  //   overflow: "hidden",
  // },
  gradientButton2: {
    width: wp("91.11%"),
    height: "75%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    // overflow: "hidden",
    // backgroundColor: "#000",
  },
  addToCartButton: {
    width: wp("58.39%"),
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    // paddingHorizontal: 26,
    // marginBottom: 7,
    borderRadius: 10,
    // backgroundColor: colors.green,
  },
  addToCartText: {
    color: "white",
    fontSize: RFValue(14, 800),
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
  },
  TotalTextView: {
    // backgroundColor: "#000",
    // width: wp("20%"),
    // height: "60%",
    //  position: 'relative',
    // paddingLeft: -wp("4.44%"),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  TotalText: {
    color: "#525252",
    fontWeight: "600",
    fontSize: RFValue(16),
    fontFamily: "Poppins-SemiBold",
    // left: 20,
  },
  EmptyContainer: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 15,
    width: wp("91.11%"),
    height: hp("79.11%"),
    padding: wp("2"),
    marginTop: hp("1.2"),
    shadowColor: "#A9A9A9",
    elevation: 3,
    paddingHorizontal: wp("5%"),
    marginBottom: hp("8.5%"),
  },
  emptyText: {
    fontSize: RFValue(14),
    fontWeight: "600",
    // lineHeight: 50,
    // left: 14,
    color: "#3D3D3D99",
    fontFamily: "Poppins-Regular",
  },
  emptyText2: {
    fontSize: RFValue(11),
    fontWeight: "600",
    bottom: hp("0.5"),
    // left: 14,
    color: "#B2B2B2",
    fontFamily: "Poppins-Regular",
  },
  EmptyImage: {
    resizeMode: "contain",
    width: wp("15.28%"),
    height: hp("6.875%"),
    marginBottom: hp("1"),
  },
  ShopButton: {
    marginTop: hp("2.5"),
    backgroundColor: "#FFFFFF",
    width: wp("43%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
  },
  gradientButton3: {
    width: wp("43%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    overflow: "hidden",
  },
  shopButtonGradient: {
    width: wp("43%"),
    height: hp("6%"),
    alignItems: "center",
    justifyContent: "center",
    // paddingHorizontal: 26,
    marginBottom: 7,
    borderRadius: 10,
    // backgroundColor: colors.green,
  },
});

export default EditOrder;
