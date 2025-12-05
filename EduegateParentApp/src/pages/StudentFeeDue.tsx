import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { studentService, Student } from '../services/student/studentService';
import { theme } from '../constants/theme';
import { BottomMenu } from '../components/BottomMenu';

interface FeeType {
    InvoiceNo: string;
    FeeMaster: { Value: string };
    Amount: number;
    InvoiceDateString: string;
    InvoiceStringDate: string;
    FeePeriod: { Value: string };
    FeeDueMonthlySplit: Array<{
        MonthName: string;
        Year: number;
        TotalAmount: number;
        CreditNote: number;
        NowPaying: number;
    }>;
}

interface FeeDetails {
    NowPaying: number;
    StudentFeeDueTypes: FeeType[];
}

export const StudentFeeDue = () => {
    const navigation = useNavigation();
    const [selectedWard, setSelectedWard] = useState<Student | null>(null);
    const [feeDetails, setFeeDetails] = useState<FeeDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // First item expanded by default

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const storedWard = await AsyncStorage.getItem('selectedWard');
            if (storedWard) {
                const ward = JSON.parse(storedWard);
                setSelectedWard(ward);
                await fetchFeeDetails(ward.StudentIID);
            } else {
                Alert.alert('Error', 'No student selected');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Failed to load initial data', error);
            setError('An error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFeeDetails = async (studentId: number) => {
        try {
            const data = await studentService.getStudentFeeDetails(studentId);
            setFeeDetails(data);

            if (!data.StudentFeeDueTypes || data.StudentFeeDueTypes.length === 0) {
                setError('No fee dues were found. Please try again later.');
            }
        } catch (error) {
            console.error('Failed to fetch fee details', error);
            setError('An error occurred while fetching fee details.');
        }
    };

    const toggleAccordion = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const formatCurrency = (amount: number) => {
        return `₹ ${amount.toFixed(2)}`;
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
                <Text style={styles.headerTitle}>Fee Due</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {error ? (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorIcon}>⚠️</Text>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : (
                    <>
                        {/* Total Amount Card */}
                        {feeDetails && (
                            <View style={styles.totalCard}>
                                <Text style={styles.totalLabel}>Total Amount:</Text>
                                <Text style={styles.totalAmount}>{formatCurrency(feeDetails.NowPaying || 0)}</Text>
                            </View>
                        )}

                        {/* Fee Types Accordion */}
                        {feeDetails?.StudentFeeDueTypes && feeDetails.StudentFeeDueTypes.map((feeType, index) => (
                            <View key={index} style={styles.accordionItem}>
                                <TouchableOpacity
                                    style={styles.accordionHeader}
                                    onPress={() => toggleAccordion(index)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.accordionHeaderContent}>
                                        <View style={styles.headerLeft}>
                                            <Text style={styles.invoiceNo}>{feeType.InvoiceNo}</Text>
                                            <Text style={styles.feeMaster}>{feeType.FeeMaster?.Value || 'N/A'}</Text>
                                        </View>
                                        <View style={styles.headerRight}>
                                            <Text style={styles.amount}>{formatCurrency(feeType.Amount || 0)}</Text>
                                            <Text style={styles.date}>{feeType.InvoiceDateString}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.chevron}>{expandedIndex === index ? '▲' : '▼'}</Text>
                                </TouchableOpacity>

                                {expandedIndex === index && (
                                    <View style={styles.accordionBody}>
                                        <Text style={styles.bodyTitle}>{feeType.FeeMaster?.Value || 'N/A'}</Text>

                                        <View style={styles.bodyDetails}>
                                            {feeType.FeePeriod?.Value && (
                                                <View style={styles.detailRow}>
                                                    <Text style={styles.detailLabel}>Fee period</Text>
                                                    <Text style={styles.detailValue}>{feeType.FeePeriod.Value}</Text>
                                                </View>
                                            )}
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>Date</Text>
                                                <Text style={styles.detailValue}>{feeType.InvoiceStringDate}</Text>
                                            </View>
                                        </View>

                                        {/* Monthly Split */}
                                        {feeType.FeeDueMonthlySplit && feeType.FeeDueMonthlySplit.map((split, splitIndex) => (
                                            <View key={splitIndex} style={styles.splitCard}>
                                                <View style={styles.splitRow}>
                                                    <Text style={styles.splitLabel}>Month</Text>
                                                    <Text style={styles.splitValue}>{split.MonthName}</Text>
                                                </View>
                                                <View style={styles.splitRow}>
                                                    <Text style={styles.splitLabel}>Year</Text>
                                                    <Text style={styles.splitValue}>{split.Year}</Text>
                                                </View>
                                                <View style={styles.splitRow}>
                                                    <Text style={styles.splitLabel}>Amount</Text>
                                                    <Text style={styles.splitValue}>{formatCurrency(split.TotalAmount || 0)}</Text>
                                                </View>
                                                <View style={styles.splitRow}>
                                                    <Text style={styles.splitLabel}>Credit note</Text>
                                                    <Text style={styles.splitValue}>{formatCurrency(split.CreditNote || 0)}</Text>
                                                </View>
                                                <View style={styles.splitRow}>
                                                    <Text style={styles.splitLabel}>Balance</Text>
                                                    <Text style={[styles.splitValue, styles.balanceValue]}>
                                                        {formatCurrency(split.NowPaying || 0)}
                                                    </Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>
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
    content: {
        padding: 16,
    },
    totalCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    accordionItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    accordionHeader: {
        padding: 16,
        backgroundColor: '#fff',
    },
    accordionHeaderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    headerLeft: {
        flex: 1,
        marginRight: 12,
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    invoiceNo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    feeMaster: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    amount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
        color: '#666',
    },
    chevron: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    accordionBody: {
        padding: 16,
        paddingTop: 0,
        backgroundColor: '#f8f8f8',
    },
    bodyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    bodyDetails: {
        marginBottom: 16,
    },
    detailRow: {
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    splitCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    splitRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    splitLabel: {
        fontSize: 14,
        color: '#666',
    },
    splitValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    balanceValue: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    errorCard: {
        backgroundColor: '#fff3cd',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ffc107',
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    errorText: {
        fontSize: 16,
        color: '#856404',
        textAlign: 'center',
    },
});

export default StudentFeeDue;
