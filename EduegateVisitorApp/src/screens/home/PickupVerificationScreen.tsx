import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const PickupVerificationScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pickup Verification</Text>
            <Text>Scan QR Code / Barcode</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});
