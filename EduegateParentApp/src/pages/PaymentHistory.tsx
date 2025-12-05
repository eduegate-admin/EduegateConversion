import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { studentService } from '../services/student/studentService';
import { theme } from '../constants/theme';

interface PaymentHistory {
    TransactionNumber: string;
    Amount: number;
    CollectionDateString: string;
    FeeCollectionStatus: string;
    FeeCollectionStatusID: number;
}

export const PaymentHistory = () => {
    const navigation = useNavigation();
    const [payments, setPayments] = useState<PaymentHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            setIsLoading(true);
            const data = await studentService.getPaymentHistory();
            setPayments(data);
        } catch (error) {
            console.error('Failed to load payment history', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toFixed(2)}`;
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
                <Text style={styles.headerTitle}>Fee Payment History</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {payments.length > 0 ? (
                    payments.map((payment, index) => {
                        const isExpanded = expandedIndex === index;
                        const isPaid = payment.FeeCollectionStatus === 'Paid';

                        return (
                            <View key={index} style={styles.paymentCard}>
                                <TouchableOpacity
                                    style={styles.cardHeader}
                                    onPress={() => toggleExpand(index)}
                                >
                                    <View style={styles.statusIconContainer}>
                                        <Text style={styles.statusIcon}>
                                            {isPaid ? '✓' : '⚠'}
                                        </Text>
                                    </View>
                                    <View style={styles.cardHeaderInfo}>
                                        <View style={styles.statusRow}>
                                            <Text style={[
                                                styles.statusText,
                                                { color: isPaid ? '#4caf50' : '#ff9800' }
                                            ]}>
                                                {payment.FeeCollectionStatus}
                                            </Text>
                                            <Text style={styles.amountText}>
                                                {formatCurrency(payment.Amount)}
                                            </Text>
                                        </View>
                                        <Text style={styles.dateText}>
                                            {payment.CollectionDateString}
                                        </Text>
                                    </View>
                                    <Text style={styles.expandIcon}>
                                        {isExpanded ? '▲' : '▼'}
                                    </Text>
                                </TouchableOpacity>

                                {isExpanded && (
                                    <View style={styles.cardBody}>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Transaction number</Text>
                                            <Text style={styles.detailValue}>
                                                {payment.TransactionNumber}
                                            </Text>
                                        </View>

                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Collection date</Text>
                                            <Text style={styles.detailValue}>
                                                {payment.CollectionDateString}
                                            </Text>
                                        </View>

                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Status</Text>
                                            <Text style={[
                                                styles.detailValue,
                                                { color: isPaid ? '#4caf50' : '#ff9800' }
                                            ]}>
                                                {payment.FeeCollectionStatus}
                                            </Text>
                                        </View>

                                        <View style={styles.viewButtonContainer}>
                                            <TouchableOpacity
                                                style={styles.viewButton}
                                                onPress={() => {
                                                    // View details would navigate to a details page
                                                    console.log('View details for:', payment.TransactionNumber);
                                                }}
                                            >
                                                <Text style={styles.viewButtonText}>View Item</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        );
                    })
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>💳</Text>
                        <View style={styles.emptyTextContainer}>
                            <Text style={styles.emptyTitle}>Not found!</Text>
                            <Text style={styles.emptyMessage}>
                                There is no collection details found!
                            </Text>
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    content: {
        padding: 16,
    },
    paymentCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    statusIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    statusIcon: {
        fontSize: 18,
    },
    cardHeaderInfo: {
        flex: 1,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    statusText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    amountText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    dateText: {
        fontSize: 14,
        color: '#666',
    },
    expandIcon: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
    },
    cardBody: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 16,
    },
    detailRow: {
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    viewButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    viewButton: {
        backgroundColor: '#6c757d',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    viewButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
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

export default PaymentHistory;
