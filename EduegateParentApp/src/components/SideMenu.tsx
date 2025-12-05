import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../constants/theme';

interface SideMenuProps {
    visible: boolean;
    onClose: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ visible, onClose }) => {
    const navigation = useNavigation();
    const [userName, setUserName] = React.useState('');
    const [biometricEnabled, setBiometricEnabled] = React.useState(false);
    const slideAnim = React.useRef(new Animated.Value(-300)).current;

    React.useEffect(() => {
        loadUserData();
    }, []);

    React.useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -300,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const loadUserData = async () => {
        try {
            const callContext = await AsyncStorage.getItem('callContext');
            if (callContext) {
                const context = JSON.parse(callContext);
                setUserName(context.UserName || 'User');
            }
        } catch (error) {
            console.error('Failed to load user data', error);
        }
    };

    const handleMenuItemPress = (screenName: string) => {
        onClose();
        setTimeout(() => {
            navigation.navigate(screenName as never);
        }, 300);
    };

    const handleSignOut = async () => {
        try {
            await AsyncStorage.multiRemove(['authToken', 'callContext', 'selectedWard']);
            onClose();
            setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' as never }],
                });
            }, 300);
        } catch (error) {
            console.error('Failed to sign out', error);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <Animated.View
                    style={[
                        styles.menuContainer,
                        { transform: [{ translateX: slideAnim }] }
                    ]}
                    onStartShouldSetResponder={() => true}
                >
                    <View style={styles.userView}>
                        <View style={styles.userBackground} />
                        <Text style={styles.userName}>{userName}</Text>
                    </View>

                    <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false}>
                        {/* Dashboard */}
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => handleMenuItemPress('Home')}
                        >
                            <View style={styles.menuIcon}>
                                <Text style={styles.iconText}>📊</Text>
                            </View>
                            <Text style={styles.menuTitle}>Dashboard</Text>
                        </TouchableOpacity>

                        {/* My Wards */}
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => handleMenuItemPress('MyWards')}
                        >
                            <View style={styles.menuIcon}>
                                <Text style={styles.iconText}>👨‍👩‍👧‍👦</Text>
                            </View>
                            <Text style={styles.menuTitle}>My wards</Text>
                        </TouchableOpacity>

                        {/* Allergy Details */}
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => handleMenuItemPress('AllergyDetails')}
                        >
                            <View style={styles.menuIcon}>
                                <Text style={styles.iconText}>🏥</Text>
                            </View>
                            <Text style={styles.menuTitle}>Allergy details</Text>
                        </TouchableOpacity>

                        {/* Profile */}
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => handleMenuItemPress('StudentProfile')}
                        >
                            <View style={styles.menuIcon}>
                                <Text style={styles.iconText}>👤</Text>
                            </View>
                            <Text style={styles.menuTitle}>Profile</Text>
                        </TouchableOpacity>

                        {/* Biometric Toggle */}
                        <View style={styles.menuItem}>
                            <View style={styles.menuIcon}>
                                <Text style={styles.iconText}>🔒</Text>
                            </View>
                            <View style={styles.biometricRow}>
                                <Text style={styles.menuTitle}>Enable Biometric</Text>
                                <Switch
                                    value={biometricEnabled}
                                    onValueChange={setBiometricEnabled}
                                    trackColor={{ false: '#767577', true: theme.colors.primary }}
                                    thumbColor={biometricEnabled ? '#fff' : '#f4f3f4'}
                                />
                            </View>
                        </View>

                        <View style={styles.separator} />

                        {/* Sign Out */}
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={handleSignOut}
                        >
                            <View style={styles.menuIcon}>
                                <Text style={styles.iconText}>🚪</Text>
                            </View>
                            <Text style={styles.menuTitle}>Sign out</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 280,
        backgroundColor: '#fff',
        elevation: 16,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    userView: {
        height: 120,
        justifyContent: 'flex-end',
        padding: 20,
        position: 'relative',
    },
    userBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.primary,
    },
    userName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        zIndex: 1,
    },
    menuContent: {
        flex: 1,
        paddingVertical: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    menuIcon: {
        width: 40,
        alignItems: 'center',
    },
    iconText: {
        fontSize: 20,
    },
    menuTitle: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
        marginLeft: 12,
    },
    biometricRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: 12,
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 8,
        marginHorizontal: 20,
    },
});

export default SideMenu;
