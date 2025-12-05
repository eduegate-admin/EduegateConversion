import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { studentService } from '../services/student/studentService';
import { theme } from '../constants/theme';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';

export const Circulars = () => {
    const navigation = useNavigation();
    const [circulars, setCirculars] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCirculars();
    }, []);

    const loadCirculars = async () => {
        try {
            setIsLoading(true);
            const data = await studentService.getCirculars();
            setCirculars(data);
        } catch (error) {
            console.error('Failed to load circulars', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (url: string, fileName: string) => {
        try {
            const localFile = `${RNFS.DocumentDirectoryPath}/${fileName}`;
            const options = {
                fromUrl: url,
                toFile: localFile,
            };

            await RNFS.downloadFile(options).promise;

            if (Platform.OS === 'android') {
                await FileViewer.open(localFile, { showOpenWithDialog: true });
            } else {
                await FileViewer.open(localFile);
            }

        } catch (error) {
            console.error('File download/open error:', error);
            Alert.alert('Error', 'Failed to download or open file.');
        }
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
                <Text style={styles.headerTitle}>Circular</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {circulars.length > 0 ? (
                    circulars.map((circular, index) => (
                        <View key={index} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.schoolName}>{circular.School}</Text>
                            </View>
                            <View style={styles.cardBody}>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Circular No</Text>
                                    <Text style={styles.separator}>:</Text>
                                    <Text style={styles.value}>{circular.CircularCode}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Title</Text>
                                    <Text style={styles.separator}>:</Text>
                                    <Text style={styles.value}>{circular.Title}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>School</Text>
                                    <Text style={styles.separator}>:</Text>
                                    <Text style={styles.value}>{circular.School}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Class</Text>
                                    <Text style={styles.separator}>:</Text>
                                    <Text style={styles.value}>{circular.Class}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Section</Text>
                                    <Text style={styles.separator}>:</Text>
                                    <Text style={styles.value}>{circular.Section}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Circular Date</Text>
                                    <Text style={styles.separator}>:</Text>
                                    <Text style={styles.value}>{circular.CircularDate}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Expiry date</Text>
                                    <Text style={styles.separator}>:</Text>
                                    <Text style={styles.value}>{circular.ExpiryDate}</Text>
                                </View>

                                <View style={styles.messageContainer}>
                                    <Text style={styles.messageText}>{circular.Message?.replace(/<[^>]+>/g, '')}</Text>
                                </View>

                                {circular.CircularAttachmentMaps && circular.CircularAttachmentMaps.length > 0 && (
                                    <View style={styles.attachmentsContainer}>
                                        <Text style={styles.attachmentLabel}>Attachments</Text>
                                        {circular.CircularAttachmentMaps.map((attachment: any, i: number) => (
                                            <TouchableOpacity
                                                key={i}
                                                style={styles.downloadButton}
                                                onPress={() => handleDownload(attachment.AttachmentReferenceID, attachment.AttachmentDescription)} // Assuming ID is URL for now, logic might need adjustment based on actual API
                                            >
                                                <Text style={styles.downloadButtonText}>{attachment.AttachmentDescription}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>Circular not found, please try again later.</Text>
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
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 20,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardHeader: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    schoolName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    cardBody: {
        padding: 20,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        width: 100,
        fontSize: 14,
        color: '#666',
    },
    separator: {
        width: 20,
        fontSize: 14,
        color: '#666',
    },
    value: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    messageContainer: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 5,
        marginTop: 15,
        marginBottom: 15,
    },
    messageText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    attachmentsContainer: {
        marginTop: 10,
    },
    attachmentLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    downloadButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    downloadButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666',
    },
});

export default Circulars;
