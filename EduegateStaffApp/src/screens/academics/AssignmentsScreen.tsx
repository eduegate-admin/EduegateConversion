import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    RefreshControl,
    ActivityIndicator,
    FlatList,
    Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../../services/api/client';
import { API_CONFIG } from '../../constants/config';
import { theme } from '../../constants/theme';

interface Assignment {
    AssignmentID: number;
    Subject: { Value: string };
    Class: { Value: string };
    Section: { Value: string };
    Title: string;
    Description: string;
    StartDate: string;
    FreezeDate: string;
    DateOfSubmission: string;
    AssignmentType: { Value: string };
    AssignmentStatus: { Value: string };
    AssignmentAttachmentMaps?: Array<{
        AttachmentReferenceID: number;
        AttachmentName: string;
    }>;
}

const { width } = Dimensions.get('window');

const SUBJECT_COLORS: { [key: string]: string } = {
    'English': '#60A5FA',
    'Qatar History': '#34D399',
    'Math': '#F87171',
    'Science': '#FBBF24',
    'Arabic': '#A78BFA',
    'Islamic': '#06B6D4',
};

export const AssignmentsScreen: React.FC = () => {
    const navigation = useNavigation();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadAssignments();
        }, [])
    );

    const loadAssignments = async (isRefresh: boolean = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await apiClient.get(
                `${API_CONFIG.SchoolServiceUrl}/GetAssignmentsForTeacher`
            );

            const data = Array.isArray(response.data) ? response.data : [];
            setAssignments(data);
        } catch (error) {
            console.error('Error loading assignments:', error);
            setAssignments([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        loadAssignments(true);
    };

    const getSubjectColor = (subject: string): string => {
        return SUBJECT_COLORS[subject] || '#9CA3AF';
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Assignment details</Text>
            <View style={{ width: 24 }} />
        </View>
    );

    const AssignmentCard = ({ assignment }: { assignment: Assignment }) => {
        const isExpanded = expandedId === assignment.AssignmentID;
        const bgColor = getSubjectColor(assignment.Subject.Value);

        return (
            <View style={styles.cardWrapper}>
                <TouchableOpacity
                    style={styles.card}
                    onPress={() =>
                        setExpandedId(isExpanded ? null : assignment.AssignmentID)
                    }
                >
                    {/* Card Header */}
                    <View style={styles.cardHeader}>
                        <View
                            style={[
                                styles.subjectBadge,
                                { backgroundColor: bgColor },
                            ]}
                        >
                            <Text style={styles.subjectBadgeText}>
                                {assignment.Subject.Value}
                            </Text>
                        </View>
                    </View>

                    {/* Basic Info */}
                    <View style={styles.cardContent}>
                        <InfoRow
                            label="Class"
                            value={`${assignment.Class.Value} (${assignment.Section.Value})`}
                        />
                        <InfoRow label="Title" value={assignment.Title} />
                        <InfoRow
                            label="Description"
                            value={assignment.Description}
                            multiline
                        />
                    </View>

                    {/* Expanded Content */}
                    {isExpanded && (
                        <View style={styles.expandedContent}>
                            <View style={styles.expandedHeader}>
                                <Text style={styles.expandedTitle}>
                                    Additional Details
                                </Text>
                            </View>

                            <InfoRow
                                label="Start Date"
                                value={formatDate(assignment.StartDate)}
                            />
                            <InfoRow
                                label="Freeze Date"
                                value={formatDate(assignment.FreezeDate)}
                            />
                            <InfoRow
                                label="Date of Submission"
                                value={formatDate(assignment.DateOfSubmission)}
                            />
                            <InfoRow
                                label="Assignment Type"
                                value={assignment.AssignmentType.Value}
                            />
                            <InfoRow
                                label="Assignment Status"
                                value={assignment.AssignmentStatus.Value}
                            />

                            {/* Attachments */}
                            {assignment.AssignmentAttachmentMaps &&
                                assignment.AssignmentAttachmentMaps.length > 0 && (
                                    <View style={styles.attachmentsSection}>
                                        <Text style={styles.attachmentsTitle}>
                                            Attachments
                                        </Text>
                                        {assignment.AssignmentAttachmentMaps.map(
                                            (attachment, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={styles.attachmentItem}
                                                >
                                                    <Text style={styles.attachmentIcon}>
                                                        📎
                                                    </Text>
                                                    <Text
                                                        style={styles.attachmentName}
                                                        numberOfLines={1}
                                                    >
                                                        {attachment.AttachmentName}
                                                    </Text>
                                                </TouchableOpacity>
                                            )
                                        )}
                                    </View>
                                )}
                        </View>
                    )}

                    {/* View More Button */}
                    <View style={styles.cardFooter}>
                        <TouchableOpacity
                            style={styles.viewButton}
                            onPress={() =>
                                setExpandedId(isExpanded ? null : assignment.AssignmentID)
                            }
                        >
                            <Text style={styles.viewButtonText}>
                                {isExpanded ? 'View Less' : 'View More'}
                            </Text>
                            <Text
                                style={[
                                    styles.viewButtonArrow,
                                    { transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] },
                                ]}
                            >
                                {' ▼'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Assignments</Text>
            <Text style={styles.emptyMessage}>
                You don't have any assignments yet
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderHeader()}

            <FlatList
                data={assignments}
                renderItem={({ item }) => <AssignmentCard assignment={item} />}
                keyExtractor={(item, index) => `${item.AssignmentID}-${index}`}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
                contentContainerStyle={
                    assignments.length === 0
                        ? { flex: 1 }
                        : { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 }
                }
                ListEmptyComponent={renderEmptyState}
                scrollEnabled={true}
            />
        </View>
    );
};

interface InfoRowProps {
    label: string;
    value: string;
    multiline?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, multiline = false }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoColon}>:</Text>
        <Text
            style={[styles.infoValue, multiline && { flex: 1 }]}
            numberOfLines={multiline ? undefined : 1}
        >
            {value}
        </Text>
    </View>
);

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
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    cardWrapper: {
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardHeader: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    subjectBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    subjectBadgeText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    cardContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 10,
        alignItems: 'flex-start',
    },
    infoLabel: {
        fontSize: 13,
        color: '#9CA3AF',
        fontWeight: '500',
        width: 90,
    },
    infoColon: {
        fontSize: 13,
        color: '#9CA3AF',
        fontWeight: '500',
        width: 16,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        flex: 0.5,
    },
    expandedContent: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        backgroundColor: '#F9FAFB',
    },
    expandedHeader: {
        marginBottom: 12,
    },
    expandedTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    attachmentsSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    attachmentsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    attachmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
        backgroundColor: '#fff',
        borderRadius: 6,
        marginBottom: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    attachmentIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    attachmentName: {
        fontSize: 12,
        color: '#1F2937',
        fontWeight: '500',
        flex: 1,
    },
    cardFooter: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        alignItems: 'flex-end',
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: theme.colors.primary,
        borderRadius: 6,
    },
    viewButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    viewButtonArrow: {
        color: '#fff',
        fontSize: 12,
        marginLeft: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyMessage: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
});

export default AssignmentsScreen;
