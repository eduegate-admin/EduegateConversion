import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    Image,
    Switch,
    TextInput,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { apiClient } from '../../services/api/client';
import { API_CONFIG } from '../../constants/config';
import { theme } from '../../constants/theme';
import { authService } from '../../services/auth/authService';

interface ParentWithLatestMessage {
    LoginID: number;
    ParentIID: number;
    GuardianFirstName?: string;
    GuardianLastName?: string;
    FatherFirstName: string;
    FatherMiddleName?: string;
    FatherLastName: string;
    Student: {
        StudentIID: number;
        StudentFullName: string;
        StudentProfileImageUrl?: string;
    };
    LastMessageText?: string;
    LastMessageDate?: string;
    UnreadCommentsCount: number;
}

interface ParentDetail {
    LoginID: number;
    ParentIID?: number;
    GuardianFirstName?: string;
    GuardianLastName?: string;
    FatherFirstName: string;
    FatherMiddleName?: string;
    FatherLastName: string;
    Student: {
        StudentIID: number;
        StudentFullName: string;
        StudentProfileImageUrl?: string;
    };
}

export const InboxScreen: React.FC = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState<'chats' | 'broadcast'>('chats');
    const [communicationEnabled, setCommunicationEnabled] = useState(false);
    const [parentsList, setParentsList] = useState<ParentWithLatestMessage[]>([]);
    const [allParents, setAllParents] = useState<ParentDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedParents, setSelectedParents] = useState<number[]>([]);
    const [savedBroadcasts, setSavedBroadcasts] = useState<any[]>([]);

    useFocusEffect(
        useCallback(() => {
            loadInitialData();
        }, [])
    );

    const loadInitialData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                checkCommunicationStatus(),
                loadParentWithLatestMessages(),
                loadAllParents(),
                loadBroadcasts(),
            ]);
        } catch (error) {
            console.error('Error loading inbox data:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkCommunicationStatus = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            const loginID = currentUser?.loginID || 0;

            const response = await apiClient.get<boolean>(
                `${API_CONFIG.CommunicationServiceUrl}/GetIsEnableCommunication?loginID=${loginID}`
            );
            setCommunicationEnabled(response.data || false);
        } catch (error) {
            console.error('Error checking communication status:', error);
        }
    };

    const loadParentWithLatestMessages = async () => {
        try {
            const response = await apiClient.get<ParentWithLatestMessage[]>(
                `${API_CONFIG.CommunicationServiceUrl}/GetParentsWithLatestMessageByTeacherLoginID`
            );
            const parentsList = Array.isArray(response.data) ? response.data : [];
            setParentsList(parentsList);
        } catch (error) {
            console.error('Error loading parents with messages:', error);
            setParentsList([]);
        }
    };

    const loadAllParents = async () => {
        try {
            const response = await apiClient.get<ParentDetail[]>(
                `${API_CONFIG.CommunicationServiceUrl}/GetParentDetailsByTeacherLoginID`
            );
            const parentsList = Array.isArray(response.data) ? response.data : [];
            setAllParents(parentsList);
        } catch (error) {
            console.error('Error loading all parents:', error);
            setAllParents([]);
        }
    };

    const loadBroadcasts = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            const loginID = currentUser?.loginID || 0;

            const response = await apiClient.get<any[]>(
                `${API_CONFIG.CommunicationServiceUrl}/GetBroadcastDetailsByUserId?userId=${loginID}`
            );
            setSavedBroadcasts(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error loading broadcasts:', error);
            setSavedBroadcasts([]);
        }
    };

    const handleToggleCommunication = async (enabled: boolean) => {
        try {
            const currentUser = await authService.getCurrentUser();
            const loginID = currentUser?.loginID || 0;

            await apiClient.post(
                `${API_CONFIG.CommunicationServiceUrl}/MarkEnableCommunication?LoginID=${loginID}&enableCommunication=${enabled}`,
                {}
            );
            setCommunicationEnabled(enabled);
        } catch (error) {
            console.error('Error toggling communication:', error);
        }
    };

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            await loadInitialData();
        } finally {
            setRefreshing(false);
        }
    };

    const handleChatClick = (parent: ParentWithLatestMessage) => {
        const parentName = parent.GuardianFirstName
            ? `${parent.GuardianFirstName} ${parent.GuardianLastName}`
            : `${parent.FatherFirstName} ${parent.FatherMiddleName || ''} ${parent.FatherLastName}`.trim();

        (navigation as any).navigate('Message', {
            RecieverID: parent.LoginID,
            ParentName: parentName,
            StudentID: parent.Student.StudentIID,
            StudentName: parent.Student.StudentFullName,
        });
    };

    const handleParentSelect = (parentID: number) => {
        setSelectedParents(prev =>
            prev.includes(parentID)
                ? prev.filter(id => id !== parentID)
                : [...prev, parentID]
        );
    };

    const formatLastMessage = (text?: string) => {
        if (!text) return 'No messages yet';
        return text.length > 50 ? text.substring(0, 50) + '...' : text;
    };

    const getParentName = (parent: ParentWithLatestMessage | ParentDetail) => {
        if (parent.GuardianFirstName) {
            return `${parent.GuardianFirstName} ${parent.GuardianLastName}`;
        }
        return `${parent.FatherFirstName} ${parent.FatherMiddleName || ''} ${parent.FatherLastName}`.trim();
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (msgDate.getTime() === today.getTime()) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (msgDate.getTime() === yesterday.getTime()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
        }
    };

    const filteredParents = allParents.filter(parent => {
        const search = searchText.toLowerCase();
        const fullName = `${parent.GuardianFirstName || parent.FatherFirstName} ${parent.GuardianLastName || parent.FatherLastName} ${parent.Student.StudentFullName}`.toLowerCase();
        return fullName.includes(search);
    });

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Communications</Text>
            <View style={{ width: 24 }} />
        </View>
    );

    const renderCommunicationToggle = () => (
        <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Enable Communication</Text>
            <Switch
                value={communicationEnabled}
                onValueChange={handleToggleCommunication}
                trackColor={{ false: '#767577', true: '#81c784' }}
                thumbColor={communicationEnabled ? '#4caf50' : '#f4f3f4'}
            />
        </View>
    );

    const renderTabBar = () => (
        <View style={styles.tabBar}>
            <TouchableOpacity
                style={[styles.tab, activeTab === 'chats' && styles.activeTab]}
                onPress={() => setActiveTab('chats')}
            >
                <Text style={[styles.tabText, activeTab === 'chats' && styles.activeTabText]}>
                    Chats
                </Text>
                {activeTab === 'chats' && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, activeTab === 'broadcast' && styles.activeTab]}
                onPress={() => setActiveTab('broadcast')}
            >
                <Text style={[styles.tabText, activeTab === 'broadcast' && styles.activeTabText]}>
                    Broadcast
                </Text>
                {activeTab === 'broadcast' && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
        </View>
    );

    const renderSearchBox = () => (
        <View style={styles.searchContainer}>
            <TextInput
                style={styles.searchInput}
                placeholder="Search by name..."
                placeholderTextColor="#8D8D8D"
                value={searchText}
                onChangeText={setSearchText}
            />
        </View>
    );

    const renderParentMessage = (parent: ParentWithLatestMessage, index: number) => (
        <TouchableOpacity
            key={`${parent.LoginID}-${parent.ParentIID}-${parent.Student.StudentIID}`}
            style={styles.parentMessageCard}
            onPress={() => handleChatClick(parent)}
        >
            <Image
                source={{
                    uri: parent.Student.StudentProfileImageUrl || 'https://via.placeholder.com/54',
                }}
                style={styles.avatar}
            />
            <View style={styles.messageContent}>
                <Text style={styles.parentName}>{getParentName(parent)}</Text>
                <Text style={styles.lastMessage}>{formatLastMessage(parent.LastMessageText)}</Text>
            </View>
            <View style={styles.messageRightContent}>
                <Text style={styles.time}>{formatTime(parent.LastMessageDate)}</Text>
                {parent.UnreadCommentsCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{parent.UnreadCommentsCount}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderAllParents = (parent: ParentDetail, index: number) => (
        <TouchableOpacity
            key={parent.LoginID}
            style={styles.allParentsCard}
            onPress={() => handleChatClick(parent as any)}
        >
            <Image
                source={{
                    uri: parent.Student.StudentProfileImageUrl || 'https://via.placeholder.com/54',
                }}
                style={styles.avatar}
            />
            <View style={styles.messageContent}>
                <Text style={styles.parentName}>{getParentName(parent)}</Text>
                <Text style={styles.parentContactName}>{parent.Student.StudentFullName}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderBroadcastList = (broadcast: any, index: number) => (
        <TouchableOpacity key={index} style={styles.broadcastCard}>
            <View style={styles.broadcastIcon}>
                <Text style={styles.broadcastIconText}>📢</Text>
            </View>
            <View style={styles.broadcastContent}>
                <Text style={styles.broadcastName}>{broadcast.BroadcastName}</Text>
                <Text style={styles.broadcastParticipants}>
                    {broadcast.Participants?.slice(0, 2).map((p: any) => p.StudentName).join(', ')}
                    {broadcast.Participants?.length > 2 && ` +${broadcast.Participants.length - 2} Others`}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderBroadcastParents = (parent: ParentDetail, index: number) => (
        <View key={parent.LoginID} style={styles.broadcastParentCard}>
            <TouchableOpacity
                style={styles.checkbox}
                onPress={() => handleParentSelect(parent.LoginID)}
            >
                <View style={[
                    styles.checkboxInner,
                    selectedParents.includes(parent.LoginID) && styles.checkboxChecked
                ]}>
                    {selectedParents.includes(parent.LoginID) && (
                        <Text style={styles.checkmark}>✓</Text>
                    )}
                </View>
            </TouchableOpacity>
            <Image
                source={{
                    uri: parent.Student.StudentProfileImageUrl || 'https://via.placeholder.com/54',
                }}
                style={styles.avatar}
            />
            <View style={styles.messageContent}>
                <Text style={styles.parentName}>{parent.Student.StudentFullName}</Text>
                <Text style={styles.parentContactName}>{getParentName(parent)}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}

            {renderCommunicationToggle()}
            {renderTabBar()}

            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === 'chats' ? (
                    <View>
                        {renderSearchBox()}

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Parent Messages</Text>
                        </View>

                        {parentsList.length > 0 ? (
                            <View>
                                {parentsList.map((parent, index) => renderParentMessage(parent, index))}
                            </View>
                        ) : (
                            <Text style={styles.emptyText}>No parent messages yet</Text>
                        )}

                        <View style={styles.allParentsHeader}>
                            <Text style={styles.sectionTitle}>All Parents</Text>
                            <TouchableOpacity onPress={onRefresh}>
                                <Text style={styles.refreshLink}>Refresh</Text>
                            </TouchableOpacity>
                        </View>

                        {allParents.length > 0 ? (
                            <View>
                                {allParents.map((parent, index) => renderAllParents(parent, index))}
                            </View>
                        ) : (
                            <Text style={styles.emptyText}>No parents available</Text>
                        )}
                    </View>
                ) : (
                    <View>
                        <View style={styles.broadcastHeader}>
                            <Text style={styles.sectionTitle}>Broadcasts</Text>
                        </View>

                        {savedBroadcasts.length > 0 && (
                            <View>
                                <Text style={styles.subsectionTitle}>Saved Lists</Text>
                                {savedBroadcasts.map((broadcast, index) => renderBroadcastList(broadcast, index))}
                            </View>
                        )}

                        {renderSearchBox()}

                        <Text style={styles.subsectionTitle}>Select Parents for Broadcast</Text>
                        {filteredParents.length > 0 ? (
                            <View>
                                {filteredParents.map((parent, index) => renderBroadcastParents(parent, index))}
                            </View>
                        ) : (
                            <Text style={styles.emptyText}>No parents found</Text>
                        )}

                        {selectedParents.length > 0 && (
                            <TouchableOpacity style={styles.saveBroadcastButton}>
                                <Text style={styles.saveBroadcastButtonText}>
                                    Save Broadcast ({selectedParents.length})
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        fontSize: 24,
        color: '#1F2937',
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    toggleLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2F2F2F',
    },
    tabBar: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        gap: 24,
    },
    tab: {
        paddingVertical: 8,
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#2D76B9',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2F2F2F',
    },
    activeTabText: {
        color: '#2D76B9',
    },
    tabUnderline: {
        height: 3,
        backgroundColor: '#2D76B9',
        marginTop: 8,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    searchContainer: {
        marginBottom: 16,
    },
    searchInput: {
        backgroundColor: '#ECECEC',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 12,
        color: '#2F2F2F',
    },
    sectionHeader: {
        marginTop: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2F2F2F',
    },
    subsectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2F2F2F',
        marginTop: 16,
        marginBottom: 12,
    },
    parentMessageCard: {
        flexDirection: 'row',
        backgroundColor: '#F1F8FF',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        alignItems: 'center',
    },
    allParentsCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        alignItems: 'center',
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        marginRight: 12,
    },
    messageContent: {
        flex: 1,
    },
    parentName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2F2F2F',
        marginBottom: 4,
    },
    lastMessage: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 2,
    },
    parentContactName: {
        fontSize: 12,
        color: '#666666',
    },
    messageRightContent: {
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
    },
    time: {
        fontSize: 10,
        color: '#2F2F2F',
        marginBottom: 8,
    },
    unreadBadge: {
        backgroundColor: '#6F3C9F',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#fff',
    },
    allParentsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 12,
    },
    refreshLink: {
        fontSize: 12,
        color: '#2D76B9',
        fontWeight: '500',
    },
    emptyText: {
        fontSize: 12,
        color: '#999999',
        textAlign: 'center',
        marginVertical: 24,
    },
    broadcastHeader: {
        marginTop: 16,
        marginBottom: 12,
    },
    broadcastCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF3CD',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        alignItems: 'center',
    },
    broadcastIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    broadcastIconText: {
        fontSize: 24,
    },
    broadcastContent: {
        flex: 1,
    },
    broadcastName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2F2F2F',
        marginBottom: 4,
    },
    broadcastParticipants: {
        fontSize: 12,
        color: '#666666',
    },
    broadcastParentCard: {
        flexDirection: 'row',
        backgroundColor: '#F1F8FF',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        alignItems: 'center',
    },
    checkbox: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    checkboxInner: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#2D76B9',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    checkboxChecked: {
        backgroundColor: '#2D76B9',
    },
    checkmark: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
    },
    saveBroadcastButton: {
        backgroundColor: '#6F3C9F',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 24,
        marginBottom: 32,
        alignItems: 'center',
    },
    saveBroadcastButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default InboxScreen;
