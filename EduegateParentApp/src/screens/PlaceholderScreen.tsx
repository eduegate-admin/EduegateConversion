import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { theme } from '../constants/theme';

export const PlaceholderScreen = () => {
    const route = useRoute();
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Screen: {route.name}</Text>
            <Text style={styles.subText}>Coming Soon</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 10,
    },
    subText: {
        fontSize: 16,
        color: '#666',
    },
});
