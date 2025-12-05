import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { studentService, Student } from '../services/student/studentService';
import { theme } from '../constants/theme';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { API_CONFIG } from '../constants/config';
import { BottomMenu } from '../components/BottomMenu';

interface Note {
    Title: string;
    Subject: { Value: string };
    Date1String: string;
    AgendaTopicMap: Array<{
        LectureCode: string;
        Topic: string;
    }>;
    AgendaTaskMap: Array<{
        Task?: string;
        AttachmentName: string;
        AttachmentReferenceID: string;
    }>;
}

export const Notes = () => {
    const navigation = useNavigation();
    const [selectedWard, setSelectedWard] = useState<Student | null>(null);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubjectPickerVisible, setIsSubjectPickerVisible] = useState(false);
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

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
                await fetchNotes(ward.StudentIID);
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

    const fetchNotes = async (studentId: number, subjectId?: number, date?: Date) => {
        try {
            setIsLoading(true);
            let dateString: string | undefined = undefined;
            if (date) {
                // Format as DD/MM/YYYY
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                dateString = `${day}/${month}/${year}`;
            }

            const notesList = await studentService.getNotes(studentId, subjectId, dateString);
            setNotes(notesList);
        } catch (error) {
            console.error('Failed to fetch notes', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubjectSelect = (subject: any) => {
        setSelectedSubject(subject);
        setIsSubjectPickerVisible(false);
        if (selectedWard) {
            fetchNotes(selectedWard.StudentIID, subject.Key, selectedDate || undefined);
        }
    };

    const handleDateSelect = (daysAgo: number) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        setSelectedDate(date);
        setIsDatePickerVisible(false);
        if (selectedWard) {
            fetchNotes(selectedWard.StudentIID, selectedSubject?.Key, date);
        }
    };

    const clearDateFilter = () => {
        setSelectedDate(null);
        setIsDatePickerVisible(false);
        if (selectedWard) {
            fetchNotes(selectedWard.StudentIID, selectedSubject?.Key, undefined);
        }
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

    const formatDateDisplay = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
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
                <Text style={styles.headerTitle}>Notes</Text>
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterItem, subjects.length === 0 && styles.disabledSelector]}
                    onPress={() => subjects.length > 0 && setIsSubjectPickerVisible(true)}
                    disabled={subjects.length === 0}
                >
                    <Text style={styles.filterText}>
                        {subjects.length === 0
                            ? 'No Subjects Found'
                            : (selectedSubject ? selectedSubject.Value : 'Select subject')}
                    </Text>
                    <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.filterItem}
                    onPress={() => setIsDatePickerVisible(true)}
                >
                    <Text style={styles.filterText}>
                        {selectedDate ? formatDateDisplay(selectedDate) : 'Select Date'}
                    </Text>
                    <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {notes.length > 0 ? (
                    notes.map((note, index) => (
                        <View key={index} style={styles.noteCard}>
                            <View style={styles.noteHeader}>
                                <Text style={styles.noteTitle}>{note.Title}</Text>
                                <Text style={styles.noteSubject}>{note.Subject?.Value || ''}</Text>
                            </View>

                            <View style={styles.noteBody}>
                                <View style={styles.dateRow}>
                                    <Text style={styles.dateIcon}>📅</Text>
                                    <View style={styles.dateInfo}>
                                        <Text style={styles.dateLabel}>Date:</Text>
                                        <Text style={styles.dateValue}>{note.Date1String}</Text>
                                    </View>
                                </View>

                                {/* Topic/Chapter Details */}
                                {note.AgendaTopicMap && note.AgendaTopicMap.map((topic, topicIndex) => (
                                    <View key={topicIndex} style={styles.topicRow}>
                                        <Text style={styles.topicIcon}>📝</Text>
                                        <View style={styles.topicInfo}>
                                            <Text style={styles.topicLabel}>Chapter</Text>
                                            <Text style={styles.topicCode}>{topic.LectureCode}</Text>
                                            <Text style={styles.topicName}>{topic.Topic}</Text>
                                        </View>
                                    </View>
                                ))}

                                {/* Attachments */}
                                {note.AgendaTaskMap && note.AgendaTaskMap.length > 0 && (
                                    <View style={styles.attachmentsSection}>
                                        {note.AgendaTaskMap.map((task, taskIndex) => (
                                            task.AttachmentReferenceID && (
                                                <TouchableOpacity
                                                    key={taskIndex}
                                                    style={styles.attachmentBtn}
                                                    onPress={() => handleDownload(task.AttachmentReferenceID, task.AttachmentName)}
                                                >
                                                    <Text style={styles.attachmentIcon}>📎</Text>
                                                    <Text style={styles.attachmentText}>{task.AttachmentName}</Text>
                                                </TouchableOpacity>
                                            )
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                    ))
                ) : (
                    !isLoading && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateTitle}>Not found!</Text>
                            <Text style={styles.emptyStateText}>No notes details found.</Text>
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

            {/* Date Picker Modal */}
            <Modal
                visible={isDatePickerVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsDatePickerVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Date</Text>
                        <ScrollView>
                            <TouchableOpacity style={styles.modalItem} onPress={() => handleDateSelect(0)}>
                                <Text style={styles.modalItemText}>Today</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalItem} onPress={() => handleDateSelect(1)}>
                                <Text style={styles.modalItemText}>Yesterday</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalItem} onPress={() => handleDateSelect(7)}>
                                <Text style={styles.modalItemText}>Last 7 Days</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalItem} onPress={() => handleDateSelect(30)}>
                                <Text style={styles.modalItemText}>Last 30 Days</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalItem} onPress={clearDateFilter}>
                                <Text style={[styles.modalItemText, { color: theme.colors.primary }]}>Clear Filter</Text>
                            </TouchableOpacity>
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setIsDatePickerVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        flexDirection: 'column',
        gap: 10,
    },
    filterItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        justifyContent: 'space-between',
    },
    filterText: {
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
    noteCard: {
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
    noteHeader: {
        backgroundColor: theme.colors.primary,
        padding: 16,
    },
    noteTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    noteSubject: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    noteBody: {
        padding: 16,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    dateIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    dateInfo: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 2,
    },
    dateValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    topicRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f8f8f8',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    topicIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    topicInfo: {
        flex: 1,
    },
    topicLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    topicCode: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    topicName: {
        fontSize: 14,
        color: '#666',
    },
    attachmentsSection: {
        marginTop: 8,
    },
    attachmentBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    attachmentIcon: {
        fontSize: 18,
        marginRight: 12,
        color: '#fff',
    },
    attachmentText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
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

export default Notes;
