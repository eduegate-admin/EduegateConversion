import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService, VisitorDetails } from '../../services/auth/authService';
import { theme } from '../../constants/theme';
import LinearGradient from 'react-native-linear-gradient';

export const HomeScreen = () => {
    const navigation = useNavigation<any>();
    const [visitorDetails, setVisitorDetails] = useState<VisitorDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const details = await authService.getVisitorDetails();
            setVisitorDetails(details);
        } catch (error) {
            console.error('Failed to load visitor details', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
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
            {/* Header Section */}
            <View style={styles.header}>
                <LinearGradient
                    colors={[theme.colors.secondary, theme.colors.primary]}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.welcomeText}>Welcome</Text>
                            <Text style={styles.nameText}>
                                {visitorDetails?.VisitorFullName || 'Visitor'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                            <Text style={styles.logoutText}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Visitor ID Card */}
                <View style={styles.card}>
                    <View style={styles.cardBody}>
                        <View style={styles.profileContainer}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={require('../../assets/images/pearl_logo.png')} // Placeholder for profile image
                                    style={styles.avatar}
                                    resizeMode="contain"
                                />
                            </View>
                            <View style={styles.infoContainer}>
                                <Text style={styles.label}>Visitor ID</Text>
                                <Text style={styles.visitorId}>
                                    {visitorDetails?.VisitorNumber || 'N/A'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#28a745' }]}
                        onPress={() => navigation.navigate('PickupVerification')}
                    >
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Pickup Verification</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#fd7e14' }]}
                        onPress={() => navigation.navigate('Inspection')}
                    >
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Inspection</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
        height: 200,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
    },
    headerGradient: {
        flex: 1,
        padding: 24,
        paddingTop: 60,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    welcomeText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    nameText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    logoutText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    content: {
        padding: 24,
        marginTop: -60,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    cardBody: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        overflow: 'hidden',
    },
    avatar: {
        width: 50,
        height: 50,
    },
    infoContainer: {
        justifyContent: 'center',
    },
    label: {
        color: '#999',
        fontSize: 14,
        marginBottom: 4,
    },
    visitorId: {
        color: '#333',
        fontSize: 28,
        fontWeight: 'bold',
    },
    actionsContainer: {
        gap: 16,
    },
    actionButton: {
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 16,
    },
    actionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    actionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
