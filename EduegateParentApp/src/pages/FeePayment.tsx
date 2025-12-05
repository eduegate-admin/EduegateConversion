import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { studentService } from '../services/student/studentService';
import { theme } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FeeMonthlySplit {
    FeeDueMonthlySplitID: number;
    MonthID: number;
    MonthName: string;
    Amount: number;
    NowPaying: number;
    OldNowPaying: number; // To store full amount
    IsRowSelected: boolean;
    Year: number;
    CreditNote: number;
    Balance: number;
}

interface FeeType {
    FeeDueFeeTypeMapsID: number;
    FeeMasterID: number;
    FeePeriodID: number;
    FeeType: string;
    Amount: number; // Total Due
    NowPaying: number; // Amount selected to pay
    IsPayingNow: boolean;
    IsMandatoryToPay: boolean;
    FeeDueMonthlySplit: FeeMonthlySplit[];
}

interface StudentFeeDetails {
    StudentID: number;
    StudentName: string;
    ClassID: number;
    SectionID: number;
    SchoolID: number;
    AcademicYearID: number;
    StudentFeeDueTypes: FeeType[];
    NowPaying: number; // Total for student
    IsSelected: boolean;
}

export const FeePayment = () => {
    const navigation = useNavigation();
    const [feeDetails, setFeeDetails] = useState<StudentFeeDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalAmount, setTotalAmount] = useState(0);
    const [paymentModeID, setPaymentModeID] = useState<number | null>(null);
    const [onlinePaymentModeID, setOnlinePaymentModeID] = useState<number | null>(null);
    const [qpayPaymentModeID, setQpayPaymentModeID] = useState<number | null>(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setIsLoading(true);
            const [fees, qpayMode, onlineMode] = await Promise.all([
                studentService.getStudentsFeePaymentDetails(),
                studentService.getSettingValueByKey('QPAY_PAYMENT_MODE_ID'),
                studentService.getSettingValueByKey('FEECOLLECTIONPAYMENTMODE_ONLINE')
            ]);

            // Initialize data structure
            const processedFees = fees.map((student: any) => ({
                ...student,
                NowPaying: 0,
                IsSelected: false,
                StudentFeeDueTypes: student.StudentFeeDueTypes.map((type: any) => ({
                    ...type,
                    NowPaying: 0,
                    IsPayingNow: false,
                    FeeDueMonthlySplit: type.FeeDueMonthlySplit.map((month: any) => ({
                        ...month,
                        NowPaying: 0,
                        OldNowPaying: month.NowPaying, // Store original due amount
                        IsRowSelected: false
                    }))
                }))
            }));

            setFeeDetails(processedFees);
            setQpayPaymentModeID(qpayMode);
            setOnlinePaymentModeID(onlineMode);
            setPaymentModeID(qpayMode); // Default to QPay

        } catch (error) {
            console.error('Failed to load fee payment data', error);
            Alert.alert('Error', 'Failed to load fee details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFeeTypeSelection = (studentIndex: number, typeIndex: number) => {
        const newFeeDetails = [...feeDetails];
        const student = newFeeDetails[studentIndex];
        const feeType = student.StudentFeeDueTypes[typeIndex];

        // Toggle selection
        const isSelecting = !feeType.IsPayingNow;

        // Validation Logic (Simplified)
        if (isSelecting) {
            // Check if previous terms are paid/selected
            // This requires sorting and checking order. 
            // For now, we'll just toggle.
            feeType.IsPayingNow = true;
            feeType.NowPaying = feeType.Amount; // Select full amount

            // Select all months
            feeType.FeeDueMonthlySplit.forEach(m => {
                m.IsRowSelected = true;
                m.NowPaying = m.OldNowPaying;
            });

        } else {
            feeType.IsPayingNow = false;
            feeType.NowPaying = 0;

            // Deselect all months
            feeType.FeeDueMonthlySplit.forEach(m => {
                m.IsRowSelected = false;
                m.NowPaying = 0;
            });
        }

        // Update Student Total
        updateStudentTotal(student);

        // Update Grand Total
        updateGrandTotal(newFeeDetails);

        setFeeDetails(newFeeDetails);
    };

    const updateStudentTotal = (student: StudentFeeDetails) => {
        let sum = 0;
        student.StudentFeeDueTypes.forEach(t => {
            sum += t.NowPaying;
        });
        student.NowPaying = sum;
        student.IsSelected = sum > 0;
    };

    const updateGrandTotal = (details: StudentFeeDetails[]) => {
        let sum = 0;
        details.forEach(s => {
            sum += s.NowPaying;
        });
        setTotalAmount(sum);
    };

    const handlePayNow = async () => {
        if (totalAmount <= 0) {
            Alert.alert('Error', 'Please select fees to pay');
            return;
        }

        try {
            setIsLoading(true);

            // 1. Submit Amount Log
            const logSuccess = await studentService.submitAmountAsLog(totalAmount);
            if (!logSuccess) {
                throw new Error('Failed to submit amount log');
            }

            // 2. Generate Card Session
            if (!paymentModeID) throw new Error('Payment mode not configured');
            const sessionSuccess = await studentService.generateCardSession(paymentModeID);
            if (!sessionSuccess) {
                throw new Error('Failed to generate card session');
            }

            // 3. Initiate Fee Collections
            const feeList = constructFeeList();
            const collectionResult = await studentService.initiateFeeCollections(feeList);

            if (collectionResult.operationResult === 1) {
                // Success - In a real app, redirect to Payment Gateway
                Alert.alert(
                    'Payment Initiated',
                    'Redirecting to payment gateway... (Simulation: Payment Successful)',
                    [
                        { text: 'OK', onPress: () => navigation.goBack() }
                    ]
                );
            } else {
                Alert.alert('Error', collectionResult.Message || 'Failed to initiate fee collection');
            }

        } catch (error: any) {
            console.error('Payment failed', error);
            Alert.alert('Error', error.message || 'Payment failed');
        } finally {
            setIsLoading(false);
        }
    };

    const constructFeeList = () => {
        const feeList: any[] = [];
        feeDetails.forEach(student => {
            if (student.IsSelected) {
                const feeTypes: any[] = [];
                student.StudentFeeDueTypes.forEach(type => {
                    if (type.IsPayingNow) {
                        const monthlySplits: any[] = [];
                        type.FeeDueMonthlySplit.forEach(month => {
                            if (month.IsRowSelected) {
                                monthlySplits.push({
                                    FeeCollectionMonthlySplitIID: 0,
                                    MonthID: month.MonthID,
                                    Amount: month.NowPaying,
                                    NowPaying: month.NowPaying,
                                    FeeDueMonthlySplitID: month.FeeDueMonthlySplitID,
                                    Year: month.Year,
                                    CreditNote: month.CreditNote,
                                    Balance: month.Balance
                                });
                            }
                        });

                        feeTypes.push({
                            FeeCollectionFeeTypeMapsIID: 0,
                            FeeMasterID: type.FeeMasterID,
                            FeePeriodID: type.FeePeriodID,
                            Amount: type.Amount,
                            FeeDueFeeTypeMapsID: type.FeeDueFeeTypeMapsID,
                            NowPaying: type.NowPaying,
                            MontlySplitMaps: monthlySplits
                        });
                    }
                });

                feeList.push({
                    FeeCollectionIID: 0,
                    StudentID: student.StudentID,
                    ClassID: student.ClassID,
                    SectionID: student.SectionID,
                    SchoolID: student.SchoolID,
                    AcadamicYearID: student.AcademicYearID,
                    FeePaymentModeID: paymentModeID,
                    FeeTypes: feeTypes
                });
            }
        });
        return feeList;
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
                <Text style={styles.headerTitle}>Fee Payment</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {feeDetails.length > 0 ? (
                    feeDetails.map((student, sIndex) => (
                        <View key={sIndex} style={styles.studentCard}>
                            <Text style={styles.studentName}>{student.StudentName}</Text>

                            {student.StudentFeeDueTypes.map((feeType, tIndex) => (
                                <TouchableOpacity
                                    key={tIndex}
                                    style={[
                                        styles.feeTypeRow,
                                        feeType.IsPayingNow && styles.feeTypeRowSelected
                                    ]}
                                    onPress={() => handleFeeTypeSelection(sIndex, tIndex)}
                                >
                                    <View style={styles.checkbox}>
                                        {feeType.IsPayingNow && <Text style={styles.checkmark}>✓</Text>}
                                    </View>
                                    <View style={styles.feeInfo}>
                                        <Text style={styles.feeTypeName}>{feeType.FeeType}</Text>
                                        <Text style={styles.feeAmount}>QAR {feeType.Amount.toFixed(2)}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}

                            <View style={styles.studentTotalRow}>
                                <Text style={styles.studentTotalLabel}>Subtotal:</Text>
                                <Text style={styles.studentTotalValue}>QAR {student.NowPaying.toFixed(2)}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No pending fees found.</Text>
                    </View>
                )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>QAR {totalAmount.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.payButton, totalAmount <= 0 && styles.payButtonDisabled]}
                    onPress={handlePayNow}
                    disabled={totalAmount <= 0}
                >
                    <Text style={styles.payButtonText}>Pay Now</Text>
                </TouchableOpacity>
            </View>
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
        paddingBottom: 100,
    },
    studentCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    studentName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    feeTypeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    feeTypeRowSelected: {
        backgroundColor: '#f0f9ff',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    feeInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    feeTypeName: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    feeAmount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    studentTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    studentTotalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    studentTotalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 10,
    },
    totalContainer: {
        flex: 1,
    },
    totalLabel: {
        fontSize: 12,
        color: '#666',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    payButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    payButtonDisabled: {
        backgroundColor: '#ccc',
    },
    payButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default FeePayment;
