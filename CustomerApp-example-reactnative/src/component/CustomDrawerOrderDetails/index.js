import { useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import OrderService from "../../services/orderService";
import CustomButton from "../CustomButton";
import QuantitySelector from "../QuantitySelector/Quantity";
import SquareCheckbox from "../checkbox/checkbox";
import styles from "./style";

const CustomDrawerOrderDetails = (props) => {
  const navigation = props.navigation;
  const { t } = useTranslation();

  const route = useRoute();
  const data = route.params?.Data;
  const currency = route.params?.currency;
  const cartID = route.params?.cartID;
  const time = route.params?.time;
  const Data = Array.isArray(data) && data.find((item) => item);
  const SKUs = Array.isArray(data) && data.find((item) => item.SKUs);
  // console.log("data", Data);

  const [quantity, setQuantities] = useState({});
  const [selectedItem, setSelectedItem] = useState({});
  const [selectedSkus, setSelectedSkus] = useState({});
  const [skuid, setskuid] = useState({});

  const selectedSKUDetails = Object.entries(skuid)
    .filter(([skuMapID, isSelected]) => isSelected)
    .map(([skuMapID]) => ({
      SKUMapID: Number(skuMapID), // Convert to number
      Quantity: quantity[skuMapID] || 1,
    }));

  // console.log("SelectedSKUDetails", selectedSKUDetails);

  const toggleSkuSelection = (skuKey, SKUID) => {
    setskuid((prev) => ({
      ...prev,
      [SKUID]: !prev[SKUID],
    }));
    setSelectedSkus((prev) => ({
      ...prev,
      [skuKey]: !prev[skuKey],
    }));
  };

  // console.log(skuid);

  useEffect(() => {
    if (Array.isArray(data)) {
      const initialQuantities = {};
      data.forEach((item, index) => {
        if (Array.isArray(item.SKUs)) {
          item.SKUs.forEach((sku, skuIndex) => {
            const key = `${sku.SKUID}`;
            initialQuantities[key] = 1;
          });
        }
      });
      setQuantities(initialQuantities);
    }
  }, [data]);

  const handleSelect = (index) => {
    setSelectedItem((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const CartActivityAction = async () => {
    try {
      const payload = [
        {
          StatusID: "2",
          CartActivityID: SKUs.ShoppingCartActivityLogIID,
          Notes: null,
          SelectedSKUDetails: selectedSKUDetails.map((item) => ({
            SKUMapID: item.SKUMapID,
            Quantity: item.Quantity,
          })),
        },
      ];
      // console.log("payload",payload)

      const response = await OrderService.getCartActivitiesAction(payload);
      if (response.data) {
        await OrderService.getCartActivities(cartID);
        setskuid({});
        setSelectedSkus({});
        setSelectedItem({});
        setQuantities((prev) => {
          const newQuantities = {};
          Object.keys(prev).forEach((key) => {
            newQuantities[key] = 1;
          });
          return newQuantities;
        });
        // console.log(response.data)
        navigation.closeDrawer();
        route.params?.onSubmit && route.params?.onSubmit();
      }
    } catch (error) {
      console.error("Error fetching CartActivityAction data:", error);
    }
  };

  return (
    <View style={styles.Container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={styles.commonMargin}
      >
        <View style={styles.buttonView}>
          <CustomButton
            buttonColor={"green"}
            handleButtonPress={CartActivityAction}
            buttonText={"Submit"}
            buttonTextColor={"#FFF"}
            Width={"25%"}
            Height={"5%"}
            Radius={10}
            type={"normal"}
          />
        </View>

        <View style={styles.NoteView}>
          <Text style={styles.NoteText}>{t("select_product_suggestion")}</Text>
        </View>

        {Array.isArray(data) &&
          data.map((item, index) => (
            <View key={index}>
              <View style={styles.SubProductView}>
                <View style={styles.SubProductDetailView}>
                  <Image
                    style={styles.image}
                    source={{ uri: item.CartItemImage }}
                  />
                  <View style={styles.SubProductNameView}>
                    <Text style={styles.NoteText}>{item.CartItem}</Text>
                    <Text
                      style={[
                        styles.NoteText,
                        { color: "green", marginTop: 10, fontSize: 14 },
                      ]}
                    >
                      {item.Question}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.buttonView,
                    { justifyContent: "flex-start", margin: 5 },
                  ]}
                >
                  <CustomButton
                    buttonColor={"orange"}
                    buttonText={"Pending"}
                    buttonTextColor={"#000"}
                    Width={"25%"}
                    Height={"5%"}
                    Radius={20}
                    type={"normal"}
                  />
                </View>
              </View>

              {/* Dropdown */}
              <View style={styles.dropDownMainView}>
                <Text
                  style={[styles.PriceText, { fontSize: 20, lineHeight: 60 }]}
                >
                  Suggestion List
                </Text>
                <TouchableOpacity
                  onPress={() => handleSelect(index)}
                  style={[styles.dropDownMainView, { right: 10 }]}
                >
                  <Image
                    style={styles.dropDownImg}
                    source={
                      selectedItem[index]
                        ? require("../../assets/images/client/almadina/down-arrow-dropDown.png")
                        : require("../../assets/images/client/almadina/right-arrow-dropDown.png")
                    }
                  />
                </TouchableOpacity>
              </View>

              {selectedItem[index] && Array.isArray(item.SKUs) && (
                <>
                  {item.SKUs.map((ele, skuIndex) => {
                    const skuKey = `${index}-${skuIndex}`;
                    const SKUID = ele.SKUID;

                    return (
                      <View key={skuKey} style={styles.ProductView}>
                        <View style={styles.ProductDetailView}>
                          {time >= "1799" ? (
                            <SquareCheckbox
                              checked={selectedSkus[skuKey]}
                              onChange={() => toggleSkuSelection(skuKey, SKUID)}
                            />
                          ) : null}

                          <Image
                            style={styles.image}
                            source={{ uri: ele.ProductListingImage }}
                          />
                          <View style={styles.productNameView}>
                            <View style={styles.NameView}>
                              <Text style={styles.NameText}>
                                {ele.ProductName}
                              </Text>
                              <Text style={styles.ADDText}>
                                {ele.AdditionalInfo1}
                              </Text>
                              <Text style={styles.PriceText}>
                                {ele.ProductPrice !== 0
                                  ? ele.ProductPrice
                                  : null}
                                {ele.ProductPrice !== 0 ? currency : null}
                              </Text>
                            </View>
                            <View style={styles.quantityButton}>
                              <QuantitySelector
                                quantity={quantity[SKUID]}
                                setQuantity={(newQty) =>
                                  setQuantities((prev) => ({
                                    ...prev,
                                    [SKUID]: newQty,
                                  }))
                                }
                              />
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })}

                  {/* Accept/Reject Buttons */}
                  <View
                    style={[
                      styles.buttonView,
                      { paddingTop: 10, marginRight: 15 },
                    ]}
                  >
                    <View style={[styles.buttonView, { marginRight: 5 }]}>
                      <CustomButton
                        buttonColor={"#fff"}
                        buttonText={"Accept"}
                        buttonTextColor={"green"}
                        Width={"25%"}
                        Height={"5%"}
                        Radius={1}
                        type={"normal"}
                        borderColor={"green"}
                        borderWidth={1}
                      />
                    </View>
                    <View style={[styles.buttonView, { marginLeft: 5 }]}>
                      <CustomButton
                        buttonColor={"#fff"}
                        buttonText={"Reject"}
                        buttonTextColor={"red"}
                        Width={"25%"}
                        Height={"5%"}
                        Radius={1}
                        type={"normal"}
                        borderColor={"red"}
                        borderWidth={1}
                      />
                    </View>
                  </View>
                </>
              )}
            </View>
          ))}
      </ScrollView>
    </View>
  );
};

export default CustomDrawerOrderDetails;
