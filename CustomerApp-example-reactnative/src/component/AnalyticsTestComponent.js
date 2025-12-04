import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAnalytics } from "../hooks/useAnalytics";

/**
 * Analytics Test Component
 * This component can be used to test analytics functionality
 * Remove or comment out this file in production builds
 */
const AnalyticsTestComponent = () => {
  const analytics = useAnalytics();

  useEffect(() => {
    // Test analytics initialization
    console.log("🧪 Analytics Test Component Mounted");
  }, []);

  const testBasicEvent = () => {
    analytics.trackCustomEvent("test_basic_event", {
      test_parameter: "test_value",
      timestamp: new Date().toISOString(),
    });
  };

  const testEcommerceEvent = () => {
    analytics.trackProductView({
      id: "TEST_PRODUCT_123",
      name: "Test Product",
      category: "Test Category",
      price: 99.99,
      currency: "AED",
    });
  };

  const testUserEvent = () => {
    analytics.trackLogin("test");
  };

  const testSearchEvent = () => {
    analytics.trackSearch("test search query", "test category");
  };

  const testCartEvent = () => {
    analytics.trackAddToCart(
      {
        id: "TEST_PRODUCT_456",
        name: "Test Cart Product",
        category: "Test Category",
        price: 149.99,
        currency: "AED",
      },
      2
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Analytics Test Panel</Text>
      <Text style={styles.subtitle}>Check console for event logs</Text>

      <TouchableOpacity style={styles.button} onPress={testBasicEvent}>
        <Text style={styles.buttonText}>Test Basic Event</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testEcommerceEvent}>
        <Text style={styles.buttonText}>Test Product View</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testUserEvent}>
        <Text style={styles.buttonText}>Test Login Event</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testSearchEvent}>
        <Text style={styles.buttonText}>Test Search Event</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testCartEvent}>
        <Text style={styles.buttonText}>Test Add to Cart</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Open browser console to see analytics events being tracked
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f0f0f0",
    margin: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 15,
    color: "#666",
    fontStyle: "italic",
  },
});

export default AnalyticsTestComponent;
