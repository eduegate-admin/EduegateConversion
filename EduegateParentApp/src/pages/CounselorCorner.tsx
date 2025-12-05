import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { studentService } from '../services/student/studentService';
import { theme } from '../constants/theme';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { API_CONFIG } from '../constants/config';

interface CounselorAttachment {
    AttachmentReferenceID: string;
    AttachmentName: string;
}

interface Counselor {
    ShortTitle: string;
    Student: string;
    Title: string;
    CounselorHubEntryDate: string;
    CounselorHubExpiryDate: string;
    Message: string;
    CounselorHubAttachments: CounselorAttachment[];
}

export const CounselorCorner = () => {
    const navigation = useNavigation();
    const [counselors, setCounselors] = useState<Counselor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

    useEffect(() => {
        loadCounselorData();
    }, []);

    const loadCounselorData = async () => {
        try {
            setIsLoading(true);
            const data = await studentService.getCounselorList();
            setCounselors(data);
        } catch (error) {
            console.error('Failed to load counselor data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadFile = async (attachmentId: string, attachmentName: string) => {
        try {
            setDownloadingFile(attachmentId);

            // Get file URL
            const fileUrl = `${API_CONFIG.ContentServiceUrl}/ReadContentsByIDForMobile?contentID=${attachmentId}`;

            // Create downloads directory if it doesn't exist
            const downloadDir = `${RNFS.DownloadDirectoryPath}/EduegateParentApp`;
            await RNFS.mkdir(downloadDir);

            // Download file
            const downloadPath = `${downloadDir}/${attachmentName}`;
            const downloadResult = await RNFS.downloadFile({
                fromUrl: fileUrl,
                toFile: downloadPath,
            }).promise;

            if (downloadResult.statusCode === 200) {
                Alert.alert('Success', 'File downloaded successfully', [
                    {
                        text: 'Open',
                        onPress: () => {
                            FileViewer.open(downloadPath)
                                .catch(error => {
                                    console.error('Error opening file:', error);
                                    Alert.alert('Error', 'Could not open file');
                                });
                        },
                    },
                    { text: 'OK' },
                ]);
            } else {
                Alert.alert('Error', 'Failed to download file');
            }
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', 'Failed to download file');
        } finally {
            setDownloadingFile(null);
        }
    };

    const stripHtmlTags = (html: string) => {
        if (!html) return '';

        // Remove HTML tags
        let text = html.replace(/<[^>]*>/g, '');

        // Decode common HTML entities
        text = text
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");

        // Remove extra whitespace and empty lines
        text = text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');

        return text;
    };

    const CounselorCard = ({ counselor }: { counselor: Counselor }) => (
        <View style={styles.counselorCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.shortTitle}>{counselor.ShortTitle}</Text>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoGrid}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Counsellor No</Text>
                        <Text style={styles.infoColon}>:</Text>
                        <Text style={styles.infoValue}>{counselor.Student}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Title</Text>
                        <Text style={styles.infoColon}>:</Text>
                        <Text style={styles.infoValue}>{counselor.Title}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Counsellor Date</Text>
                        <Text style={styles.infoColon}>:</Text>
                        <Text style={styles.infoValue}>{counselor.CounselorHubEntryDate}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Expiry date</Text>
                        <Text style={styles.infoColon}>:</Text>
                        <Text style={styles.infoValue}>{counselor.CounselorHubExpiryDate}</Text>
                    </View>
                </View>

                {/* Message Section */}
                <View style={styles.messageSection}>
                    <Text style={styles.messageText}>{stripHtmlTags(counselor.Message)}</Text>
                </View>

                {/* Attachments */}
                {counselor.CounselorHubAttachments && counselor.CounselorHubAttachments.length > 0 && (
                    <View style={styles.attachmentsSection}>
                        <Text style={styles.attachmentsLabel}>Attachments</Text>
                        <View style={styles.attachmentsList}>
                            {counselor.CounselorHubAttachments.map((attachment, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.attachmentButton}
                                    onPress={() => downloadFile(attachment.AttachmentReferenceID, attachment.AttachmentName)}
                                    disabled={downloadingFile === attachment.AttachmentReferenceID}
                                >
                                    {downloadingFile === attachment.AttachmentReferenceID ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <Text style={styles.downloadIcon}>⬇</Text>
                                            <Text style={styles.attachmentName}>{attachment.AttachmentName}</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        </View>
    );

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
                <Text style={styles.headerTitle}>Counsellor</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {counselors.length > 0 ? (
                    counselors.map((counselor, index) => (
                        <CounselorCard key={index} counselor={counselor} />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>⚠️</Text>
                        <View style={styles.emptyTextContainer}>
                            <Text style={styles.emptyTitle}>Not found!</Text>
                            <Text style={styles.emptyMessage}>Counsellor list not found, please try again later.</Text>
                        </View>
                    </View>
                )}
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        padding: 16,
    },
    counselorCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        overflow: 'hidden',
    },
    cardHeader: {
        backgroundColor: theme.colors.primary,
        padding: 16,
    },
    shortTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    cardBody: {
        padding: 20,
    },
    infoGrid: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    infoLabel: {
        width: 120,
        fontSize: 14,
        color: '#666',
    },
    infoColon: {
        width: 36,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    infoValue: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    messageSection: {
        backgroundColor: '#f8f8f8',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    messageText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        lineHeight: 20,
    },
    attachmentsSection: {
        marginTop: 8,
    },
    attachmentsLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    attachmentsList: {
        gap: 8,
    },
    attachmentButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    downloadIcon: {
        fontSize: 16,
        color: '#fff',
    },
    attachmentName: {
        flex: 1,
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    emptyState: {
        backgroundColor: '#ffebee',
        borderRadius: 12,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f44336',
    },
    emptyIcon: {
        fontSize: 48,
        marginRight: 16,
    },
    emptyTextContainer: {
        flex: 1,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#d32f2f',
        marginBottom: 4,
    },
    emptyMessage: {
        fontSize: 14,
        color: '#d32f2f',
    },
});

export default CounselorCorner;
