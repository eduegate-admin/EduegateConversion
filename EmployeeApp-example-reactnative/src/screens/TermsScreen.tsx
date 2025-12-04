import React from 'react';
import {View, StyleSheet, ScrollView, StatusBar} from 'react-native';
import {Text, Card, IconButton} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

export default function TermsScreen() {
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
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.lastUpdated}>
              Last Updated: January 2025
            </Text>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              1. Acceptance of Terms
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              By accessing and using the iTrade Employee Management application,
              you accept and agree to be bound by the terms and provision of this
              agreement. If you do not agree to these terms, please do not use
              this application.
            </Text>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              2. Use License
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Permission is granted to use this application solely for authorized
              employee operations within your assigned organization. This license
              shall automatically terminate if you violate any of these
              restrictions.
            </Text>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              3. User Responsibilities
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              As an employee user, you agree to:
            </Text>
            <Text variant="bodyMedium" style={styles.bulletPoint}>
              • Keep your login credentials confidential and secure
            </Text>
            <Text variant="bodyMedium" style={styles.bulletPoint}>
              • Use the application only for legitimate business purposes
            </Text>
            <Text variant="bodyMedium" style={styles.bulletPoint}>
              • Not attempt to access unauthorized features or data
            </Text>
            <Text variant="bodyMedium" style={styles.bulletPoint}>
              • Report any security vulnerabilities to management
            </Text>
            <Text variant="bodyMedium" style={styles.bulletPoint}>
              • Comply with all company policies and procedures
            </Text>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              4. Data Privacy
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Your privacy is important to us. We collect and process personal
              data in accordance with applicable data protection laws. Employee
              data including location tracking, activity logs, and performance
              metrics may be monitored for business purposes.
            </Text>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              5. Location Services
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              This application may request access to your device's location
              services for features such as employee tracking, delivery routing,
              and geolocation logging. You may disable location services, but
              this may limit certain functionality.
            </Text>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              6. Intellectual Property
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              All content, features, and functionality are owned by Skien Suite
              and iTrade and are protected by international copyright, trademark,
              and other intellectual property laws.
            </Text>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              7. Disclaimer
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              The application is provided "as is" without any warranties, express
              or implied. We do not guarantee that the application will be
              error-free or uninterrupted.
            </Text>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              8. Limitation of Liability
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              In no event shall iTrade or Skien Suite be liable for any damages
              arising out of the use or inability to use the application.
            </Text>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              9. Modifications
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              We reserve the right to modify these terms at any time. Continued
              use of the application after changes constitutes acceptance of the
              modified terms.
            </Text>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              10. Termination
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              Your access to the application may be terminated immediately,
              without prior notice, for violation of these terms or upon
              termination of employment.
            </Text>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              11. Governing Law
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              These terms shall be governed by and construed in accordance with
              the laws of the United Arab Emirates.
            </Text>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              12. Contact Information
            </Text>
            <Text variant="bodyMedium" style={styles.bodyText}>
              For questions about these Terms and Conditions, please contact us
              at support@itrade.ae
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
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
  card: {
    margin: 20,
    borderRadius: 12,
    elevation: 2,
  },
  lastUpdated: {
    color: '#999',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sectionTitle: {
    color: '#1976d2',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  bodyText: {
    color: '#666',
    lineHeight: 24,
    marginBottom: 10,
  },
  bulletPoint: {
    color: '#666',
    lineHeight: 24,
    marginBottom: 5,
    paddingLeft: 10,
  },
  bottomSpacing: {
    height: 30,
  },
});
