import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { studentService, Student } from '../services/student/studentService';
import { theme } from '../constants/theme';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { API_CONFIG } from '../constants/config';

interface Assignment {
    Title: string;
    Subject: { Value: string };
    Description: string;
    StartDate: string;
    DateOfSubmission: string;
    AssignmentType: { Value: string };
    AssignmentAttachmentMaps: any[];
    DaysLeft?: string;
    DaysLeftNum?: number;
}

export const Assignments = () => {
    const navigation = useNavigation();
    const [selectedWard, setSelectedWard] = useState<Student | null>(null);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [expandedAssignments, setExpandedAssignments] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isSubjectPickerVisible, setIsSubjectPickerVisible] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setIsLoading(true);
            const storedWard = await AsyncStorage.getItem('selectedWard');
            if (storedWard) {
                const ward = JSON.parse(storedWard);
                setSelectedWard(ward);
                await fetchSubjects(ward.StudentIID);
                await fetchAssignments(ward.StudentIID);
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

    const fetchSubjects = async (studentId: number) => {
        try {
            const subjectList = await studentService.getStudentSubjectList(studentId);
            setSubjects(subjectList);
        } catch (error) {
            console.error('Failed to fetch subjects', error);
        }
    };

    const fetchAssignments = async (studentId: number, subjectId?: number) => {
        try {
            setIsLoading(true);
            const assignmentList = await studentService.getAssignments(studentId, subjectId);

            // Calculate days left for each assignment
            const processedAssignments = assignmentList.map(assignment => ({
                ...assignment,
                ...calculateDaysLeft(assignment.DateOfSubmission)
            }));

            setAssignments(processedAssignments);
        } catch (error) {
            console.error('Failed to fetch assignments', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateDaysLeft = (dueDate: string): { DaysLeft: string; DaysLeftNum: number } => {
        if (!dueDate) return { DaysLeft: 'No due date', DaysLeftNum: -1 };

        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);

        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let text: string;
        if (diffDays > 0) {
            text = `${diffDays} days left`;
        } else if (diffDays === 0) {
            text = 'Due today';
        } else {
            text = 'Past Due';
        }

        return { DaysLeft: text, DaysLeftNum: diffDays };
    };

    const handleSubjectSelect = (subject: any) => {
        setSelectedSubject(subject);
        setIsSubjectPickerVisible(false);
        if (selectedWard) {
            fetchAssignments(selectedWard.StudentIID, subject.Key);
        }
    };

    const toggleAssignment = (index: number) => {
        const newExpanded = new Set(expandedAssignments);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedAssignments(newExpanded);
    };

    const handleDownload = async (contentId: string, fileName: string) => {
        try {
            const downloadUrl = `${API_CONFIG.ContentServiceUrl}/ReadContentsByIDForMobile?contentID=${contentId}`;
            const localFile = `${RNFS.DocumentDirectoryPath}/${fileName}`;

            const callContext = await AsyncStorage.getItem('CallContext');
            const options: any = {
                fromUrl: downloadUrl,
                toFile: localFile,
                headers: {}
            };

            if (callContext) {
                options.headers = {
                    'CallContext': callContext,
                    'Content-Type': 'application/json; charset=utf-8'
                };
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

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    };

    const getDaysLeftColor = (daysLeftNum?: number) => {
        if (daysLeftNum === undefined || daysLeftNum === null) return '#666';
        if (daysLeftNum < 0) return '#999'; // Past due - muted
        if (daysLeftNum < 3) return '#f44336'; // Danger - red
        if (daysLeftNum >= 3) return '#ff9800'; // Warning - orange
        return '#666';
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
                <Text style={styles.headerTitle}>Assignments</Text>
            </View>

            {/* Subject Filter */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.subjectSelector, subjects.length === 0 && styles.disabledSelector]}
                    onPress={() => subjects.length > 0 && setIsSubjectPickerVisible(true)}
                    disabled={subjects.length === 0}
                >
                    <Text style={styles.subjectSelectorText}>
                        {subjects.length === 0
                            ? 'No Subjects Found'
                            : (selectedSubject ? selectedSubject.Value : 'Select subject')}
                    </Text>
                    <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {assignments.length > 0 ? (
                    assignments.map((assignment, index) => (
                        <View key={index} style={styles.assignmentCard}>
                            <View style={styles.assignmentHeader}>
                                <View style={styles.assignmentInfo}>
                                    <Text style={styles.assignmentTitle}>{assignment.Title}</Text>
                                    <Text style={styles.assignmentSubject}>{assignment.Subject?.Value || ''}</Text>
                                    <Text style={styles.assignmentDescription} numberOfLines={expandedAssignments.has(index) ? undefined : 2}>
                                        {assignment.Description}
                                    </Text>
                                </View>
                                <View style={styles.assignmentActions}>
                                    <Text style={styles.assignmentDate}>{formatDate(assignment.StartDate)}</Text>
                                    <TouchableOpacity onPress={() => toggleAssignment(index)}>
                                        <Text style={styles.viewAllText}>View All</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {expandedAssignments.has(index) && (
                                <View style={styles.assignmentDetails}>
                                    <Text style={styles.detailsDescription}>{assignment.Description}</Text>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Date of submission:</Text>
                                        <Text style={styles.detailValue}>{formatDate(assignment.DateOfSubmission)}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Assignment type:</Text>
                                        <Text style={styles.detailValue}>{assignment.AssignmentType?.Value || ''}</Text>
                                    </View>

                                    {assignment.AssignmentAttachmentMaps && assignment.AssignmentAttachmentMaps.length > 0 && (
                                        <View style={styles.attachmentsSection}>
                                            <Text style={styles.attachmentsTitle}>Attachments</Text>
                                            {assignment.AssignmentAttachmentMaps.map((attachment, attIndex) => (
                                                attachment.AttachmentReferenceID && (
                                                    <View key={attIndex} style={styles.attachmentItem}>
                                                        <Text style={styles.attachmentIcon}>📄</Text>
                                                        <Text style={styles.attachmentName}>{attachment.AttachmentName}</Text>
                                                        <TouchableOpacity
                                                            style={styles.downloadBtn}
                                                            onPress={() => handleDownload(attachment.AttachmentReferenceID, attachment.AttachmentName)}
                                                        >
                                                            <Text style={styles.downloadBtnText}>Download</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                )
                                            ))}
                                        </View>
                                    )}
                                </View>
                            )}

                            {assignment.DaysLeft && (
                                <Text style={[styles.daysLeftText, { color: getDaysLeftColor(assignment.DaysLeftNum) }]}>
                                    {assignment.DaysLeft}
                                </Text>
                            )}
                        </View>
                    ))
                ) : (
                    !isLoading && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateTitle}>Not found!</Text>
                            <Text style={styles.emptyStateText}>Assignments not found, please try again later.</Text>
                        </View>
                    )
                )}
                {isLoading && <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />}
            </ScrollView>

            {/* Subject Picker Modal */}
            <Modal
                visible={isSubjectPickerVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsSubjectPickerVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Subject</Text>
                        <ScrollView>
                            {subjects.map((subject) => (
                                <TouchableOpacity
                                    key={subject.Key}
                                    style={styles.modalItem}
                                    onPress={() => handleSubjectSelect(subject)}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        selectedSubject?.Key === subject.Key && styles.selectedModalItemText
                                    ]}>
                                        {subject.Value}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setIsSubjectPickerVisible(false)}
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
    filterContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    subjectSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        justifyContent: 'space-between',
    },
    subjectSelectorText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    dropdownIcon: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
    },
    disabledSelector: {
        opacity: 0.7,
        backgroundColor: '#e0e0e0',
    },
    content: {
        padding: 20,
    },
    assignmentCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    assignmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    assignmentInfo: {
        flex: 1,
        marginRight: 12,
    },
    assignmentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    assignmentSubject: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
    },
    assignmentDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    assignmentActions: {
        alignItems: 'flex-end',
    },
    assignmentDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    viewAllText: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    assignmentDetails: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    detailsDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 20,
    },
    detailRow: {
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    detailValue: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    attachmentsSection: {
        marginTop: 12,
    },
    attachmentsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    attachmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    attachmentIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    attachmentName: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    downloadBtn: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    downloadBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    daysLeftText: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'right',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
        backgroundColor: '#fff3cd',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ffc107',
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#856404',
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#856404',
        textAlign: 'center',
    },
    loader: {
        marginTop: 20,
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
});

export default Assignments;
