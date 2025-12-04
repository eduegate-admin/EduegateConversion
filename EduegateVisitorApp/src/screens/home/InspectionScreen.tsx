import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const InspectionScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Inspection</Text>
            <Text>Inspection Details</Text>
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
