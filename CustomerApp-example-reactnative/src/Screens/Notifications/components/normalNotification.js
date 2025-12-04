import {
  View,
  Text,
  Switch,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import PushNotificationService from "../../../services/pushNotificationService";
import CustomButton from "../../../component/CustomButton";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import CustomHeader from "../../../component/CustomHeader";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import appSettings from "../../../../Client/appSettings";

const NormalNotification = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [isEnabled, setIsEnabled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const conditionalHeaderProps = appSettings[process.env.CLIENT]?.conditionalHeaderProps;

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        conditionalHeaderProps ? (
          <CustomHeader
            title={t("notifications")}
            leftComponent={<CommonHeaderLeft type="back" />}
            elevation={0}
            borderBottomLeftRadius={0}
            borderBottomRightRadius={0}
            // dbgcolor="#12a14f"
            backgroundColor="#12a14f"
            showCustomIcons={true}
            hideicon={true}
            color="#FFFFFF"
          />
        ) : <CustomHeader
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
      title: "Notifications",
    });
  }, []);

  const toggleSwitch = () => {
    setIsEnabled((prev) => !prev);
  };

  useEffect(() => {
    fetchNotifications(1);
    setPage(1);
    setHasMore(true);
  }, [isEnabled]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedTime = `${formattedHours}:${
      minutes < 10 ? "0" : ""
    }${minutes} ${ampm}`;

    return { date: formattedDate, time: formattedTime };
  };

  const fetchNotifications = async (requestedPage = 1, append = false) => {
    try {
      let response;

      if (!isEnabled) {
        response = await PushNotificationService.GetUnReadPushNotifications();
        setNotifications(response?.data || []);
        setHasMore(false);
      } else {
        response =
          await PushNotificationService.GetAllPushNotifications(requestedPage);

        if (response?.data?.length > 0) {
          setNotifications((prev) =>
            append ? [...prev, ...response.data] : response.data
          );
          setPage(requestedPage);
          setHasMore(response.data.length >= 10);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleMore = async () => {
    if (!isEnabled) return;
    const nextPage = page + 1;
    await fetchNotifications(nextPage, true);
  };

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  useEffect(() => {
    fetchNotifications(1);
  }, [isEnabled]);

  return (
    <View style={styles.container}>
      <View style={styles.HeaderPortion}>
        <View style={styles.SwitchView}>
          <Text style={styles.viewAll}>{t("view_all")}</Text>
          <Switch
            trackColor={{ false: "#d3d3d3", true: "#a8e6cf" }}
            thumbColor={isEnabled ? "#00C853" : "#f4f3f4"}
            ios_backgroundColor="#d3d3d3"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
        <View style={styles.DotView}>
          <View style={styles.Dot}></View>
          <Text style={styles.UnReadText}>{t("unreadMessage")}</Text>
        </View>
      </View>
      <View style={styles.contentView}>
        <View style={styles.notificationView}>
          {notifications && notifications.length > 0 ? (
            <ScrollView
              contentContainerStyle={{ paddingBottom: 80 }}
              showsVerticalScrollIndicator={false}
            >
              {notifications.map((item, index) => (
                <View key={index}>
                  <Text
                    style={[
                      styles.labelViewAll,
                      { marginLeft: wp("4.44%"), marginTop: hp("2%") },
                    ]}
                  >
                    {formatDate(item.NotificationDate).date}
                  </Text>
                  <Text
                        style={[
                          styles.labelViewAll,
                          {
                            marginRight: 18,
                            marginBottom: hp("%")
                           
                          },
                        ]}
                      >
                        {formatDate(item.NotificationDate).time}
                      </Text>
                  <View style={styles.ListOuterView}>
                    <View style={styles.ImageView}>
                      <Image
                        style={styles.image}
                        source={require("../../../assets/images/client/almadina/notification.png")}
                      />
                    </View>
                    <View style={styles.DetailsView}>
                      <View style={styles.ProductDetailsView}>
                        <Text style={styles.Message}>{item.Message}</Text>
                      </View>
                      
                    </View>
                  </View>
                </View>
              ))}

              {isEnabled && hasMore && (
                <View style={styles.buttonView}>
                  <CustomButton
                    buttonText="More"
                    handleButtonPress={handleMore}
                    Width={0.85}
                    Height={0.06}
                    Radius={8}
                    fontSize={0.04}
                    type="normal"
                    borderColor={"#61AD4E"}
                  />
                </View>
              )}
            </ScrollView>
          ) : (
            <Text style={{ color: "#000", fontSize: 16, textAlign: "center" }}>
              {t("noNotifications")}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    // backgroundColor: "red",
  },
  HeaderPortion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp("4.44%"),
    borderBottomWidth: 1,
    borderBottomColor: "lightgray",
    elevation: 0.5,
    backgroundColor: "#FFFFFF",
    height: hp("7%"),
  },
  SwitchView: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelViewAll: {
    // backgroundColor:"#d40c0cff",
    marginRight: 8,
    fontSize: RFValue(14, 800),
    color: "#000",
    fontWeight: "800",
  },
  UnReadText: {
    fontSize: RFValue(14, 800),
    color: "#000",
    fontWeight: "500",
    fontFamily: "Poppins-Regular",
  },
  DotView: {
    height: "100%",
    flexDirection: "row",
    justifyContent: "Space-around",
    textAlign: "center",
    alignItems: "center",
  },
  Dot: {
    padding: 5,
    color: "lightblue",
    backgroundColor: "lightblue",
    borderRadius: 50,
    marginRight: wp("2%"),
  },
  contentView: {
    marginTop: "2%",
    alignSelf: "center",
    alignItems: "center",
    width: "100%",
    height: "91.5%",
    // backgroundColor: "#000",
    // borderRadius:15,
  },
  notificationView: {
    width: "95%",
    borderRadius: 15,
    backgroundColor: "#ffffff",
  },
  ListOuterView: {
    backgroundColor: "#FFFFFF",
    marginVertical: 5,
    width: "95%",
    height: 95,
    alignSelf: "center",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "lightgray",
  },
  ImageView: {
    // backgroundColor: "green",
    resizeMode: "contain",
    width: "23%",
    height: "100%",
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
    borderRadius: 20,
    overflow: "hidden",
  },
  image: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
    borderRadius: 20,
    justifyContent: "center",
  },
  DetailsView: {
    // backgroundColor: "#000",
    paddingVertical: 15,
    width: "77%",
    height: "100%",
    // borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ProductDetailsView: {
    backgroundColor: "#FFFFFF",
    width: "75%",
    height: "100%",
    // borderRadius: 20,
    // justifyContent: "center",
    paddingLeft: 15,
  },
  Message: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
    backgroundColor: "#FFFFFF",
  },
  buttonView: {
    marginTop: 20,
  },
});

export default NormalNotification;
