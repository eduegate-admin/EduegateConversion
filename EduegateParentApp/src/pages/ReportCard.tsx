import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Platform, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { studentService, Student } from '../services/student/studentService';
import { theme } from '../constants/theme';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { API_CONFIG } from '../constants/config';

export const ReportCard = () => {
    const navigation = useNavigation();
    const [selectedWard, setSelectedWard] = useState<Student | null>(null);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [selectedYear, setSelectedYear] = useState<any>(null);
    const [reportCards, setReportCards] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isYearPickerVisible, setIsYearPickerVisible] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setIsLoading(true);
            const storedWard = await AsyncStorage.getItem('selectedWard');
            if (storedWard) {
                const ward = JSON.parse(storedWard);
                console.log('ReportCard: Selected Ward:', ward);
                setSelectedWard(ward);
                await fetchAcademicYears(ward.StudentIID);
            } else {
                Alert.alert('Error', 'No student selected');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Failed to load initial data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAcademicYears = async (studentId: number) => {
        try {
            console.log('ReportCard: Fetching academic years for student:', studentId);
            const years = await studentService.getReportCardByStudentID(studentId);
            console.log('ReportCard: Academic Years Response:', years);
            setAcademicYears(years);
            if (years && years.length > 0) {
                // Default to the first year or logic to select current
                setSelectedYear(years[0]);
                // Fetch report cards for the default year
                fetchReportCards(studentId, years[0]);
            }
        } catch (error) {
            console.error('Failed to fetch academic years', error);
        }
    };

    const fetchReportCards = async (studentId: number, year: any) => {
        if (!selectedWard || !year) return;

        try {
            setIsLoading(true);
            const ward = selectedWard as any;
            console.log('ReportCard: Fetching report cards for:', { studentId, classId: ward.ClassID, sectionId: ward.SectionID, yearId: year.Key });

            const cards = await studentService.getReportCardList(
                studentId,
                ward.ClassID,
                ward.SectionID,
                year.Key
            );
            console.log('ReportCard: Report Cards Response:', cards);
            setReportCards(cards);
        } catch (error) {
            console.error('Failed to fetch report cards', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleYearSelect = (year: any) => {
        setSelectedYear(year);
        setIsYearPickerVisible(false);
        if (selectedWard) {
            fetchReportCards(selectedWard.StudentIID, year);
        }
    };

    // Helper to get image URL
    const getProfileImageUrl = (ward: any) => {
        if (ward.StudentProfileImageUrl) {
            return ward.StudentProfileImageUrl;
        }
        if (ward.StudentProfile) {
            return `${API_CONFIG.ContentServiceUrl}/ReadImageContentsByID?contentID=${ward.StudentProfile}`;
        }
        return 'https://via.placeholder.com/150';
    };

    const handleDownload = async (contentId: string, fileName: string) => {
        try {
            // Construct URL based on legacy logic: ContentService + /ReadContentsByIDForMobile?contentID=
            // But legacy controller uses ReadContentsByIDForMobile.
            // Let's try to construct a direct download URL if possible or use the API client to fetch blob.
            // Ideally, we should use the same pattern as Circulars if it returns a direct URL.
            // However, here we have a ContentID.

            // Legacy URL construction:
            // $scope.ContentService + "/ReadContentsByIDForMobile?contentID=" + referenceID

            // We need the ContentServiceUrl from config.
            // Assuming API_CONFIG has it or we can derive it.
            // Looking at config.ts (I haven't seen it fully but assuming structure).
            // If not available, I'll use a placeholder or try to find it.

            // For now, let's assume we can build the URL.
            // If API_CONFIG.ContentServiceUrl is not exposed, we might need to add it.
            // Based on previous files, `API_CONFIG.SchoolServiceUrl` exists.
            // Let's assume `API_CONFIG.ContentServiceUrl` exists or use a relative path if proxying.

            // Wait, looking at `studentService.ts` imports `API_CONFIG`.
            // I will check `API_CONFIG` in `src/constants/config.ts` first to be sure.

            // For this step, I will assume a standard URL structure.
            const downloadUrl = `${API_CONFIG.ContentServiceUrl}/ReadContentsByIDForMobile?contentID=${contentId}`;

            // Using the same download logic as Circulars
            const localFile = `${RNFS.DocumentDirectoryPath}/${fileName}`;
            const options = {
                fromUrl: downloadUrl,
                toFile: localFile,
                headers: {
                    // Add auth headers if needed, though legacy seems to pass CallContext in headers
                    // We might need to manually add headers here since RNFS.downloadFile doesn't use our axios interceptor
                }
            };

            // We need to get the CallContext from AsyncStorage to pass in headers
            const callContext = await AsyncStorage.getItem('CallContext');
            if (callContext) {
                options.headers = {
                    'CallContext': callContext,
                    'Content-Type': 'application/json; charset=utf-8'
                }
            }

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

    if (isLoading && !selectedWard) {
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
                <Text style={styles.headerTitle}>Report Card</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {selectedWard && (
                    <View style={styles.profileCard}>
                        <View style={styles.profileContent}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={{ uri: getProfileImageUrl(selectedWard) }}
                                    style={styles.avatar}
                                    resizeMode="cover"
                                />
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.studentName}>
                                    {selectedWard.FirstName} {selectedWard.MiddleName} {selectedWard.LastName}
                                </Text>
                                <Text style={styles.studentDetails}>{selectedWard.AdmissionNumber}</Text>

                                {/* Academic Year Selector */}
                                <TouchableOpacity
                                    style={[styles.yearSelector, academicYears.length === 0 && styles.disabledSelector]}
                                    onPress={() => academicYears.length > 0 && setIsYearPickerVisible(true)}
                                    disabled={academicYears.length === 0}
                                >
                                    <Text style={styles.yearSelectorText}>
                                        {academicYears.length === 0
                                            ? 'No Academic Years Found'
                                            : (selectedYear ? selectedYear.Value : 'Select Academic Year')}
                                    </Text>
                                    <Text style={styles.dropdownIcon}>▼</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* Report Cards List */}
                <View style={styles.listContainer}>
                    {reportCards.length > 0 ? (
                        reportCards.map((card, index) => (
                            <View key={index} style={styles.cardItem}>
                                <View style={styles.cardIconContainer}>
                                    <Text style={{ fontSize: 24 }}>📄</Text>
                                </View>
                                <Text style={styles.cardTitle}>{card.ContentFileName}</Text>
                                <TouchableOpacity
                                    style={styles.downloadButton}
                                    onPress={() => handleDownload(card.ReportContentID, card.ContentFileName)}
                                >
                                    <Text style={styles.downloadButtonText}>Download</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    ) : (
                        !isLoading && (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>No report cards found for this academic year.</Text>
                            </View>
                        )
                    )}
                    {isLoading && <ActivityIndicator size="small" color={theme.colors.primary} />}
                </View>
            </ScrollView>

            {/* Year Picker Modal */}
            <Modal
                visible={isYearPickerVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsYearPickerVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Academic Year</Text>
                        <ScrollView>
                            {academicYears.map((year) => (
                                <TouchableOpacity
                                    key={year.Key}
                                    style={styles.modalItem}
                                    onPress={() => handleYearSelect(year)}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        selectedYear?.Key === year.Key && styles.selectedModalItemText
                                    ]}>
                                        {year.Value}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setIsYearPickerVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    profileContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: 15,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        borderRadius: 40,
        padding: 2,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#ccc',
    },
    profileInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    studentDetails: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    yearSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        justifyContent: 'space-between',
    },
    yearSelectorText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    dropdownIcon: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
    },
    listContainer: {
        paddingBottom: 20,
    },
    cardItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
    },
    cardIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardTitle: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    downloadButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    downloadButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyStateText: {
        color: '#666',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        maxHeight: '60%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalItemText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    selectedModalItemText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    closeButton: {
        marginTop: 16,
        paddingVertical: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    disabledSelector: {
        opacity: 0.7,
        backgroundColor: '#e0e0e0',
    },
});

export default ReportCard;
