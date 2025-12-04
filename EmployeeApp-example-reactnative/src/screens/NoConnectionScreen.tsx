import React from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';
import {Text, Button, Card} from 'react-native-paper';

interface NoConnectionScreenProps {
  onRetry?: () => void;
}

export default function NoConnectionScreen({
  onRetry,
}: NoConnectionScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />

      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.icon}>📡</Text>
            <Text variant="headlineMedium" style={styles.title}>
              No Internet Connection
            </Text>
            <Text variant="bodyLarge" style={styles.message}>
              Please check your internet connection and try again.
            </Text>

            <View style={styles.instructionsContainer}>
              <Text variant="titleSmall" style={styles.instructionsTitle}>
                Troubleshooting Tips:
              </Text>
              <Text variant="bodyMedium" style={styles.instruction}>
                • Check if Wi-Fi or mobile data is enabled
              </Text>
              <Text variant="bodyMedium" style={styles.instruction}>
                • Try turning airplane mode on and off
              </Text>
              <Text variant="bodyMedium" style={styles.instruction}>
                • Move to an area with better signal
              </Text>
              <Text variant="bodyMedium" style={styles.instruction}>
                • Restart your device if problem persists
              </Text>
            </View>

            {onRetry && (
              <Button
                mode="contained"
                onPress={onRetry}
                style={styles.retryButton}
                icon="refresh">
                Try Again
              </Button>
            )}
          </Card.Content>
        </Card>

        <Text variant="bodySmall" style={styles.offlineNote}>
          Some features may be available offline. Check the app menu for
          offline-capable functions.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 12,
    elevation: 4,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  icon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  instructionsContainer: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 8,
    marginBottom: 30,
  },
  instructionsTitle: {
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instruction: {
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  retryButton: {
    minWidth: 200,
  },
  offlineNote: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});
