import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../constants/theme';
import { BottomMenu } from '../components/BottomMenu';

export const Communications = () => {
    const navigation = useNavigation();

    const handleTickets = () => {
        navigation.navigate('Tickets' as never);
    };

    const handleChats = () => {
        Alert.alert('Info', 'Chats feature coming soon!');
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Communications</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Options Card */}
                <View style={styles.optionsCard}>
                    <View style={styles.optionsGrid}>
                        {/* Tickets */}
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={handleTickets}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: '#708FFF' }]}>
                                <Text style={styles.iconText}>🎫</Text>
                            </View>
                            <Text style={styles.optionLabel}>Tickets</Text>
                        </TouchableOpacity>

                        {/* Chats */}
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={handleChats}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: '#708FFF' }]}>
                                <Text style={styles.iconText}>💬</Text>
                            </View>
                            <Text style={styles.optionLabel}>Chats</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoIcon}>ℹ️</Text>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>Communication Center</Text>
                        <Text style={styles.infoText}>
                            Manage support tickets and chat with teachers, counselors, and school administration.
                        </Text>
                    </View>
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            <BottomMenu />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 40,
        paddingBottom: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginRight: 15,
        padding: 5,
    },
    backArrow: {
        fontSize: 24,
        color: '#333',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    content: {
        padding: 16,
    },
    optionsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    optionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 24,
    },
    optionItem: {
        alignItems: 'center',
        flex: 1,
    },
    iconCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 2,
    },
    iconText: {
        fontSize: 40,
    },
    optionLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    infoBox: {
        backgroundColor: '#e3f2fd',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#2196f3',
    },
    infoIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1976d2',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        color: '#1976d2',
        lineHeight: 18,
    },
});

export default Communications;
