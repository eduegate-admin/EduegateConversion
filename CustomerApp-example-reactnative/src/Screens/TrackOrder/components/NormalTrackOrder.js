import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import CustomHeader from "../../../component/CustomHeader";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import appSettings from "../../../../Client/appSettings";
import OrderService from "../../../services/orderService";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get('window');

const NormalTrackOrder = (props) => {
  const ID = props.route.params.orderId;
  const navigation = useNavigation();
  const conditionalHeaderProps = appSettings[process.env.CLIENT]?.conditionalHeaderProps;
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        conditionalHeaderProps ? (
          <CustomHeader
            title={"Track Order"}
            leftComponent={<CommonHeaderLeft type="back" />}
            elevation={0}
            borderBottomLeftRadius={0}
            borderBottomRightRadius={0}
            backgroundColor="#27ae60"
            showCustomIcons={true}
            hideicon={true}
            color="#FFFFFF"
          />
        ) : (
          <CustomHeader
            title={options.title || route.name}
            leftComponent={<CommonHeaderLeft type="back" />}
            rightComponent={<CommonHeaderRight />}
          />
        )
      ),
      title: "Track Order",
    });
    fetchOrderDetails();
  }, [ID]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await OrderService.getOrderHistoryDetails(ID);
      if (response.data && response.data.length > 0) {
        console.log("=== TRACK ORDER API DATA ===");
        console.log("Full Response:", JSON.stringify(response.data[0], null, 2));
        console.log("\n=== DRIVER FIELDS ===");
        console.log("DriverName:", response.data[0].DriverName);
        console.log("DriverMobile:", response.data[0].DriverMobile);
        console.log("DriverPhone:", response.data[0].DriverPhone);
        console.log("DriverContact:", response.data[0].DriverContact);
        console.log("DriverContactNumber:", response.data[0].DriverContactNumber);
        console.log("\n=== LOCATION FIELDS ===");
        console.log("CurrentLocation:", response.data[0].CurrentLocation);
        console.log("DriverLocation:", response.data[0].DriverLocation);
        console.log("Area:", response.data[0].Area);
        console.log("AreaName:", response.data[0].AreaName);
        console.log("\n=== DELIVERY ADDRESS ===");
        console.log("DeliveryAddress:", response.data[0].DeliveryAddress);
        
        setOrderData(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Extract address coordinates if available
  const getMapRegion = () => {
    const lat = orderData?.DeliveryAddress?.Latitude || orderData?.Latitude || 25.276987;
    const lng = orderData?.DeliveryAddress?.Longitude || orderData?.Longitude || 55.296249;
    
    return {
      latitude: typeof lat === 'string' ? parseFloat(lat) : lat,
      longitude: typeof lng === 'string' ? parseFloat(lng) : lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  };

  // Safe string converter
  const toStr = (val) => {
    if (val === null || val === undefined || val === "") return "";
    if (typeof val === 'object') return "";
    return String(val).trim();
  };

  // Format delivery address
  const getDeliveryAddress = () => {
    const addr = orderData?.DeliveryAddress || orderData?.CustomerAddress || {};
    const parts = [];
    
    if (addr.AddressLine1) parts.push(toStr(addr.AddressLine1));
    if (addr.AddressLine2) parts.push(toStr(addr.AddressLine2));
    if (addr.Area || addr.AreaName) parts.push(toStr(addr.Area || addr.AreaName));
    if (addr.City || addr.CityName) parts.push(toStr(addr.City || addr.CityName));
    
    return parts.filter(Boolean).join(", ") || "Address not available";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={styles.loadingText}>Loading tracking information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={getMapRegion()}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          <Marker
            coordinate={{
              latitude: getMapRegion().latitude,
              longitude: getMapRegion().longitude,
            }}
            title="Delivery Location"
            description={getDeliveryAddress()}
          >
            <View style={styles.markerContainer}>
              <MaterialCommunityIcons name="map-marker" size={40} color="#27ae60" />
            </View>
          </Marker>
        </MapView>

        {/* Locate Me Button */}
        <View style={styles.locateMeButton}>
          <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#27ae60" />
        </View>
      </View>

      {/* Delivery Details Section */}
      <ScrollView 
        style={styles.detailsContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Delivery details</Text>

          {/* Current Location */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Current Location</Text>
            <Text style={styles.detailValue}>
              {orderData?.CurrentLocation || 
               orderData?.DriverLocation ||
               orderData?.Area || 
               orderData?.AreaName ||
               ""}
            </Text>
          </View>

          {/* Driver Name */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Driver Name</Text>
            <Text style={styles.detailValue}>
              {orderData?.DriverName || ""}
            </Text>
          </View>

          {/* Contact Number - Driver's number only */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Contact Number</Text>
            <Text style={styles.detailValue}>
              {orderData?.DriverMobile || 
               orderData?.DriverPhone || 
               orderData?.DriverContact ||
               orderData?.DriverContactNumber || 
               ""}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: hp("2%"),
    fontSize: RFValue(14),
    color: "#666666",
    fontFamily: "Poppins-Regular",
  },
  
  // Map Section
  mapContainer: {
    height: hp("50%"),
    width: wp("100%"),
    position: "relative",
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  locateMeButton: {
    position: "absolute",
    bottom: hp("2%"),
    right: wp("4%"),
    backgroundColor: "#FFFFFF",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  // Details Section
  detailsContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: hp("3%"),
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: wp("5%"),
    paddingTop: hp("3%"),
  },
  sectionTitle: {
    fontSize: RFValue(16),
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
    color: "#212121",
    marginBottom: hp("2.5%"),
    letterSpacing: 0.3,
  },
  
  // Detail Rows
  detailRow: {
    marginBottom: hp("2.5%"),
    paddingBottom: hp("2%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailLabel: {
    fontSize: RFValue(11),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    color: "#9E9E9E",
    marginBottom: hp("0.8%"),
    letterSpacing: 0.2,
  },
  detailValue: {
    fontSize: RFValue(14),
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#212121",
    lineHeight: RFValue(20),
  },

  // Address Section
  addressSection: {
    marginTop: hp("1%"),
    marginBottom: hp("2%"),
  },
  addressLabel: {
    fontSize: RFValue(12),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    color: "#757575",
    marginBottom: hp("0.5%"),
  },
  addressText: {
    fontSize: RFValue(13),
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#212121",
    lineHeight: RFValue(20),
  },

  // Status Info
  statusInfo: {
    marginTop: hp("2%"),
    paddingTop: hp("2%"),
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("1%"),
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: hp("1%"),
  },
  statusText: {
    fontSize: RFValue(13),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#27ae60",
    marginLeft: 8,
  },
  estimatedTime: {
    fontSize: RFValue(12),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    color: "#666666",
    marginTop: hp("0.5%"),
  },
});

export default NormalTrackOrder;
