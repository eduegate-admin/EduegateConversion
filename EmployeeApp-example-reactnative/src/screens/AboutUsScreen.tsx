import React from 'react';
import {View, StyleSheet, ScrollView, StatusBar} from 'react-native';
import {Text, Card, IconButton} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

export default function AboutUsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" />

      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor="white"
          size={24}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>About Us</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.logoCard}>
          <Card.Content style={styles.logoContent}>
            <Text style={styles.logoIcon}>👨‍💼</Text>
            <Text variant="headlineMedium" style={styles.appName}>
              Employee Management
            </Text>
            <Text variant="bodyMedium" style={styles.tagline}>
              iTrade Employee Portal
            </Text>
            <Text variant="bodySmall" style={styles.version}>
              Version 1.0.0
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Our Mission
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              To empower employees with efficient tools for order management,
              inventory tracking, and seamless collaboration. We strive to
              deliver excellence in retail operations through innovative
              technology solutions.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              About iTrade
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              iTrade is a leading provider of retail management solutions,
              serving businesses across the UAE and Middle East. With over 26
              trusted clients including Al Madina Hypermarket, Empire, and Food
              World, we deliver comprehensive employee management and
              e-commerce solutions.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Features
            </Text>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📦</Text>
              <Text variant="bodyMedium" style={styles.featureText}>
                Real-time order management and tracking
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text variant="bodyMedium" style={styles.featureText}>
                Inventory and stock management
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💰</Text>
              <Text variant="bodyMedium" style={styles.featureText}>
                Point of Sale (POS) operations
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📍</Text>
              <Text variant="bodyMedium" style={styles.featureText}>
                Employee location tracking
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📱</Text>
              <Text variant="bodyMedium" style={styles.featureText}>
                Mobile-first responsive design
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Powered By
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Skien Suite - Comprehensive business management platform providing
              end-to-end solutions for retail, e-commerce, and enterprise
              operations.
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            © 2025 iTrade & Skien Suite
          </Text>
          <Text variant="bodySmall" style={styles.footerText}>
            All Rights Reserved
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    backgroundColor: '#1976d2',
    paddingTop: 45,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    margin: 0,
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  logoCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 4,
  },
  logoContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  appName: {
    fontWeight: 'bold',
    color: '#1976d2',
    textAlign: 'center',
  },
  tagline: {
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  version: {
    color: '#999',
    marginTop: 5,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  bodyText: {
    color: '#666',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    color: '#666',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    color: '#999',
    marginBottom: 4,
  },
});
