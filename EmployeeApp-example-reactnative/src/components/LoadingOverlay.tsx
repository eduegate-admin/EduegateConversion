import React from 'react';
import {View, StyleSheet, ActivityIndicator, Modal} from 'react-native';
import {Text} from 'react-native-paper';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  transparent = false,
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent>
      <View
        style={[
          styles.overlay,
          transparent && styles.transparentOverlay,
        ]}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#1976d2" />
          {message && (
            <Text variant="bodyMedium" style={styles.message}>
              {message}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transparentOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    minWidth: 150,
  },
  message: {
    marginTop: 15,
    color: '#333',
    textAlign: 'center',
  },
});

export default LoadingOverlay;
