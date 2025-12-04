import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    SafeAreaView,
    Alert,
    Modal,
    Pressable,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../../services/api/client';
import { API_CONFIG } from '../../constants/config';
import { theme } from '../../constants/theme';
import { authService } from '../../services/auth/authService';

interface LeaveType {
    Key: number;
    Value: string;
}

interface StaffLeaveApplication {
    LeaveApplicationIID?: number;
    StaffID?: number;
    EmployeeID?: number;
    LeaveTypeID?: number | LeaveType;
    FromDateString?: string;
    ToDateString?: string;
    Reason?: string;
    LeaveStatusID?: number;
}

interface DatePickerModalProps {
    isVisible: boolean;
    onClose: () => void;
    onDateSelect: (date: string) => void;
    currentDate: string;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
    isVisible,
    onClose,
    onDateSelect,
    currentDate,
}) => {
    const parts = currentDate?.split('/') || [new Date().getFullYear().toString(), '01', '01'];
    const [year, setYear] = useState(parts[0] || new Date().getFullYear().toString());
    const [month, setMonth] = useState(parts[1] || '01');
    const [day, setDay] = useState(parts[2] || '01');

    const handleConfirm = () => {
        const newDate = `${year}/${month}/${day}`;
        onDateSelect(newDate);
        onClose();
    };

    return (
        <Modal visible={isVisible} transparent animationType="slide">
            <View style={styles.datePickerOverlay}>
                <View style={styles.datePickerContent}>
                    <Text style={styles.datePickerTitle}>Select Date</Text>
                    <View style={styles.dateInputsRow}>
                        <View style={styles.dateInputGroup}>
                            <Text style={styles.dateInputLabel}>Year</Text>
                            <TextInput
                                style={styles.dateInputSmall}
                                value={year}
                                onChangeText={setYear}
                                placeholder="YYYY"
                                keyboardType="number-pad"
                                maxLength={4}
                            />
                        </View>
                        <View style={styles.dateInputGroup}>
                            <Text style={styles.dateInputLabel}>Month</Text>
                            <TextInput
                                style={styles.dateInputSmall}
                                value={month}
                                onChangeText={setMonth}
                                placeholder="MM"
                                keyboardType="number-pad"
                                maxLength={2}
                            />
                        </View>
                        <View style={styles.dateInputGroup}>
                            <Text style={styles.dateInputLabel}>Day</Text>
                            <TextInput
                                style={styles.dateInputSmall}
                                value={day}
                                onChangeText={setDay}
                                placeholder="DD"
                                keyboardType="number-pad"
                                maxLength={2}
                            />
                        </View>
                    </View>
                    <View style={styles.datePickerButtons}>
                        <TouchableOpacity
                            style={styles.datePickerCancel}
                            onPress={onClose}
                        >
                            <Text style={styles.datePickerCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.datePickerConfirm}
                            onPress={handleConfirm}
                        >
                            <Text style={styles.datePickerConfirmText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export const StaffLeaveScreen: React.FC = () => {
    const navigation = useNavigation();
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [application, setApplication] = useState<StaffLeaveApplication>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);
    const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadLeaveTypes();
        }, [])
    );

    const loadLeaveTypes = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get<LeaveType[]>(
                `${API_CONFIG.SchoolServiceUrl}/GetLeaveTypes`
            );
            setLeaveTypes(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error loading leave types:', error);
            Alert.alert('Error', 'Failed to load leave types');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    const validateForm = (): string | null => {
        if (!application.LeaveTypeID) {
            return 'Leave Type is required';
        }
        if (!application.Reason || application.Reason.trim() === '') {
            return 'Reason is required';
        }
        if (!application.FromDateString) {
            return 'From date is required';
        }
        if (!application.ToDateString) {
            return 'To date is required';
        }
        return null;
    };

    const checkDateConflict = async (
        employeeID: number,
        fromDate: string,
        toDate: string
    ) => {
        try {
            const response = await apiClient.post(
                `${API_CONFIG.SchoolServiceUrl}/CheckLeaveDateConflict`,
                {
                    EmployeeID: employeeID,
                    LeaveApplicationIID: application.LeaveApplicationIID || 0,
                    FromDate: fromDate,
                    ToDate: toDate,
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error checking date conflict:', error);
            return false;
        }
    };

    const handleSubmit = async () => {
        const validationError = validateForm();
        if (validationError) {
            Alert.alert('Validation Error', validationError);
            return;
        }

        try {
            setSubmitting(true);

            const currentUser = await authService.getCurrentUser();
            const employeeID = currentUser?.employeeID || application.EmployeeID || 0;

            // Parse dates for conflict check
            const parts = application.FromDateString!.split('/');
            const fromDate = `${parts[0]}-${parts[1]}-${parts[2]}`;
            const toParts = application.ToDateString!.split('/');
            const toDate = `${toParts[0]}-${toParts[1]}-${toParts[2]}`;

            // Check for date conflicts
            const hasConflict = await checkDateConflict(employeeID, fromDate, toDate);
            if (hasConflict) {
                Alert.alert(
                    'Conflict',
                    'You already have an approved or rejected leave for the selected date range.'
                );
                setSubmitting(false);
                return;
            }

            // Submit the application
            const leaveTypeID = typeof application.LeaveTypeID === 'object'
                ? application.LeaveTypeID.Key
                : application.LeaveTypeID;

            const response = await apiClient.post(
                `${API_CONFIG.SchoolServiceUrl}/SubmitStaffLeaveApplication`,
                {
                    LeaveApplicationIID: application.LeaveApplicationIID || 0,
                    EmployeeID: employeeID,
                    LeaveTypeID: leaveTypeID,
                    FromDateString: application.FromDateString,
                    ToDateString: application.ToDateString,
                    OtherReason: application.Reason,
                    LeaveStatusID: 1,
                }
            );

            if (response.data) {
                Alert.alert(
                    'Success',
                    response.data.Message || 'Leave application submitted successfully!'
                );
                // Reset form
                setApplication({});
            }
        } catch (error) {
            console.error('Error submitting leave application:', error);
            Alert.alert('Error', 'Failed to submit leave application');
        } finally {
            setSubmitting(false);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Employee Leave Request</Text>
            <View style={{ width: 24 }} />
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

    const selectedLeaveType = 
        typeof application.LeaveTypeID === 'object'
            ? application.LeaveTypeID.Value
            : leaveTypes.find(lt => lt.Key === application.LeaveTypeID)?.Value;

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.formCard}>
                    {/* Leave Type */}
                    <View style={styles.formGroup}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>Leave type</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.selectInput}
                            onPress={() => setShowLeaveTypeModal(true)}
                        >
                            <Text
                                style={[
                                    styles.selectInputText,
                                    !selectedLeaveType && styles.placeholder,
                                ]}
                            >
                                {selectedLeaveType || 'Select Leave Type'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* From Date */}
                    <View style={styles.formGroup}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>Date from</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setShowFromDatePicker(true)}
                        >
                            <Text
                                style={[
                                    styles.dateInputText,
                                    !application.FromDateString && styles.placeholder,
                                ]}
                            >
                                {application.FromDateString || 'yyyy/mm/dd'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <DatePickerModal
                        isVisible={showFromDatePicker}
                        onClose={() => setShowFromDatePicker(false)}
                        onDateSelect={(date) =>
                            setApplication(prev => ({ ...prev, FromDateString: date }))
                        }
                        currentDate={application.FromDateString || ''}
                    />

                    {/* To Date */}
                    <View style={styles.formGroup}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>Date to</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setShowToDatePicker(true)}
                        >
                            <Text
                                style={[
                                    styles.dateInputText,
                                    !application.ToDateString && styles.placeholder,
                                ]}
                            >
                                {application.ToDateString || 'yyyy/mm/dd'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <DatePickerModal
                        isVisible={showToDatePicker}
                        onClose={() => setShowToDatePicker(false)}
                        onDateSelect={(date) =>
                            setApplication(prev => ({ ...prev, ToDateString: date }))
                        }
                        currentDate={application.ToDateString || ''}
                    />

                    {/* Reason */}
                    <View style={styles.formGroup}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>Reason</Text>
                            <Text style={styles.required}>*</Text>
                        </View>
                        <View style={styles.reasonInput}>
                            <TextInput
                                style={styles.textarea}
                                placeholder="Reason"
                                placeholderTextColor="#8D8D8D"
                                multiline
                                numberOfLines={4}
                                value={application.Reason || ''}
                                onChangeText={(text) =>
                                    setApplication(prev => ({
                                        ...prev,
                                        Reason: text,
                                    }))
                                }
                                editable={!submitting}
                            />
                        </View>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => {
                                setApplication({});
                            }}
                            disabled={submitting}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            <Text style={styles.submitButtonText}>
                                {submitting ? 'Submitting...' : 'Submit'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Leave Type Modal */}
            <Modal
                visible={showLeaveTypeModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowLeaveTypeModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Leave Type</Text>
                        <ScrollView style={styles.modalList}>
                            {leaveTypes.map((leaveType) => (
                                <Pressable
                                    key={leaveType.Key}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setApplication(prev => ({
                                            ...prev,
                                            LeaveTypeID: leaveType,
                                        }));
                                        setShowLeaveTypeModal(false);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>
                                        {leaveType.Value}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowLeaveTypeModal(false)}
                        >
                            <Text style={styles.modalCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    content: {
        flex: 1,
        padding: 16,
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 13,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    formGroup: {
        marginBottom: 20,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#222222',
    },
    required: {
        color: 'red',
        marginLeft: 4,
        fontSize: 12,
    },
    selectInput: {
        borderWidth: 1,
        borderColor: '#767676',
        borderRadius: 5,
        paddingHorizontal: 12,
        paddingVertical: 10,
        justifyContent: 'center',
        minHeight: 37,
    },
    selectInputText: {
        fontSize: 12,
        color: '#222222',
        fontWeight: '500',
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#767676',
        borderRadius: 5,
        paddingHorizontal: 12,
        paddingVertical: 10,
        justifyContent: 'center',
        minHeight: 37,
    },
    dateInputText: {
        fontSize: 12,
        color: '#222222',
        fontWeight: '500',
    },
    placeholder: {
        color: '#8D8D8D',
    },
    reasonInput: {
        backgroundColor: '#ECECEC',
        borderRadius: 5,
        paddingHorizontal: 12,
        paddingVertical: 10,
        minHeight: 100,
    },
    textarea: {
        fontSize: 12,
        color: '#222222',
        flex: 1,
        textAlignVertical: 'top',
        fontWeight: '500',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 24,
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: '#3A62B0',
        borderRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 8,
        minWidth: 79,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#3A62B0',
    },
    submitButton: {
        backgroundColor: '#3A62B0',
        borderRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 8,
        minWidth: 79,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16,
    },
    modalList: {
        marginBottom: 16,
    },
    modalItem: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalItemText: {
        fontSize: 14,
        color: '#2F2F2F',
        fontWeight: '500',
    },
    modalCloseButton: {
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    modalCloseText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2F2F2F',
    },
    datePickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    datePickerContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 20,
    },
    datePickerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16,
    },
    dateInputsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 20,
    },
    dateInputGroup: {
        flex: 1,
    },
    dateInputLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2F2F2F',
        marginBottom: 6,
    },
    dateInputSmall: {
        borderWidth: 1,
        borderColor: '#767676',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 10,
        fontSize: 14,
        color: '#2F2F2F',
        textAlign: 'center',
    },
    datePickerButtons: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'flex-end',
    },
    datePickerCancel: {
        borderWidth: 1,
        borderColor: '#3A62B0',
        borderRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 8,
        minWidth: 79,
        justifyContent: 'center',
        alignItems: 'center',
    },
    datePickerCancelText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#3A62B0',
    },
    datePickerConfirm: {
        backgroundColor: '#3A62B0',
        borderRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 8,
        minWidth: 79,
        justifyContent: 'center',
        alignItems: 'center',
    },
    datePickerConfirmText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#fff',
    },
});

export default StaffLeaveScreen;
