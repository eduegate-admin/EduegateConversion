import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../constants/theme';

interface PlaceholderScreenProps {
    screenName: string;
    message?: string;
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({
    screenName,
    message
}) => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.icon}>🚧</Text>
                <Text style={styles.title}>{screenName}</Text>
                <Text style={styles.subtitle}>Coming Soon</Text>
                {message && (
                    <Text style={styles.message}>{message}</Text>
                )}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        padding: 24,
    },
    icon: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.dark,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.gray[600],
        marginBottom: 16,
    },
    message: {
        fontSize: 14,
        color: theme.colors.gray[500],
        textAlign: 'center',
        marginBottom: 24,
    },
    button: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PlaceholderScreen;
