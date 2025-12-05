import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../constants/theme';
import { BottomMenu } from '../components/BottomMenu';

export const Transport = () => {
    const navigation = useNavigation();
    const [studentName, setStudentName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Reload data when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            setIsLoading(true);
            const selectedWard = await AsyncStorage.getItem('selectedWard');
            if (selectedWard) {
                const ward = JSON.parse(selectedWard);
                setStudentName(`${ward.FirstName} ${ward.LastName}`);
            }
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDriverDetails = () => {
        navigation.navigate('DriverDetails' as never);
    };

    const handleBusRoute = () => {
        Alert.alert('Info', 'Bus Route feature coming soon!');
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transport</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Selected Student Card */}
                <View style={styles.studentCard}>
                    <View style={styles.studentInfo}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {studentName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.studentDetails}>
                            <Text style={styles.studentLabel}>Selected student</Text>
                            <Text style={styles.studentName}>{studentName || 'Student'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.changeButton}
                        onPress={() => navigation.navigate('MyWards' as never)}
                    >
                        <Text style={styles.changeButtonText}>Change</Text>
                    </TouchableOpacity>
                </View>

                {/* Options Grid */}
                <View style={styles.optionsCard}>
                    <View style={styles.optionsGrid}>
                        {/* Driver Details */}
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={handleDriverDetails}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: '#AF70FF' }]}>
                                <Text style={styles.iconText}>🚌</Text>
                            </View>
                            <Text style={styles.optionLabel}>Driver Details</Text>
                        </TouchableOpacity>

                        {/* Bus Route */}
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={handleBusRoute}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: '#97DA77' }]}>
                                <Text style={styles.iconText}>📍</Text>
                            </View>
                            <Text style={styles.optionLabel}>Bus Route</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoIcon}>ℹ️</Text>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>Transport Information</Text>
                        <Text style={styles.infoText}>
                            View driver details and bus route information for the selected student's transportation.
                        </Text>
                    </View>
                </View>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    studentCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    studentDetails: {
        flex: 1,
    },
    studentLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    studentName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    changeButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    changeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
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

export default Transport;
