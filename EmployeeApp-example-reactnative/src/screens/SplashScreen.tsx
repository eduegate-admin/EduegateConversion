import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, StatusBar} from 'react-native';
import {Text} from 'react-native-paper';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({onFinish}: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Animate logo appearance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to login after 2.5 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>👨‍💼</Text>
        </View>
        <Text style={styles.appName}>Employee Management</Text>
        <Text style={styles.appTagline}>iTrade Employee Portal</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </Animated.View>

      <Animated.View style={[styles.footer, {opacity: fadeAnim}]}>
        <Text style={styles.footerText}>Powered by Skien Suite</Text>
        <Text style={styles.copyright}>© 2025 All Rights Reserved</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    fontSize: 60,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  appTagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 5,
  },
  version: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 5,
  },
  copyright: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
