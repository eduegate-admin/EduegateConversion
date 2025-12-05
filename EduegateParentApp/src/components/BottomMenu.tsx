import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';

// Custom Icons
const HomeIcon = ({ fill = "#fff", stroke = "none" }: { fill?: string, stroke?: string }) => (
    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <Path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill={fill} stroke={stroke} strokeWidth={stroke !== "none" ? "2" : "0"} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const ChatIcon = ({ fill = "none", stroke = "#fff" }: { fill?: string, stroke?: string }) => (
    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill={fill} />
        <Path d="M8 10h8" />
        <Path d="M8 14h4" />
    </Svg>
);

const UserIcon = ({ fill = "none", stroke = "#fff" }: { fill?: string, stroke?: string }) => (
    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill={fill} />
        <Circle cx="12" cy="7" r="4" fill={fill} />
    </Svg>
);

export const BottomMenu = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();

    const getIconColor = (routeName: string) => {
        const isActive = route.name === routeName;
        // Logic: specific styles often wanted for Active vs Inactive
        // For Home: Active = Fill White, Inactive = Stroke White (Transparent fill)
        // For Others: Active = Fill White? Or just Bold?
        // Based on Figma:
        // Home Active: Filled White
        // Home Inactive: Outline White
        // Chat Active: Filled White
        // Chat Inactive: Outline White

        return isActive ? "#fff" : "none"; // Fill
    };

    const getStrokeColor = (routeName: string) => {
        // If filled, usually we don't need stroke, or stroke matches.
        // If inactive (transparent fill), we need white stroke.
        const isActive = route.name === routeName;
        return isActive ? "#fff" : "#fff";
    };

    // Helper to render Home Icon correctly based on state
    const renderHomeIcon = () => {
        const isActive = route.name === 'Home';
        return isActive ? <HomeIcon fill="#fff" stroke="none" /> : <HomeIcon fill="none" stroke="#fff" />;
    };

    // Helper for Chat
    const renderChatIcon = () => {
        const isActive = route.name === 'Communications';
        // Note: The chat icon paths specifically are strokes. Filling them might look weird unless designed for it. 
        // Let's assume Active = Bold Stroke or maybe Filled background? 
        // Creating a filled variation if needed. For now using same logic.
        return isActive ? <ChatIcon fill="#fff" stroke="#fff" /> : <ChatIcon fill="none" stroke="#fff" />;
    };

    // Helper for User
    const renderUserIcon = () => {
        const isActive = route.name === 'MyWards';
        return isActive ? <UserIcon fill="#fff" stroke="#fff" /> : <UserIcon fill="none" stroke="#fff" />;
    };

    return (
        <View style={styles.bottomMenuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Home')}>
                {renderHomeIcon()}
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Communications')}>
                {renderChatIcon()}
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyWards')}>
                {renderUserIcon()}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomMenuContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: '#6F3C9F',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 10,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        elevation: 10,
        zIndex: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    menuItem: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        width: 60,
        height: 60,
    },
});
