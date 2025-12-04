import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { apiClient } from '../../services/api/client';
import { API_CONFIG } from '../../constants/config';
import { theme } from '../../constants/theme';

interface LookupItem {
    Key: string | number;
    Value: string;
}

interface SalarySlip {
    SlipDate: string;
    ReportContentID: string;
    Amount?: number;
    Status?: string;
}

interface PaySlipScreenRoute {
    params?: {
        employeeId?: string;
    };
}

type PaySlipScreenRouteProp = RouteProp<any, 'SalarySlip'>;

export const PaySlipScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<PaySlipScreenRouteProp>();
    
    const [months, setMonths] = useState<LookupItem[]>([]);
    const [years, setYears] = useState<LookupItem[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<LookupItem | null>(null);
    const [selectedYear, setSelectedYear] = useState<LookupItem | null>(null);
    const [salarySlips, setSalarySlips] = useState<SalarySlip[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);

    useEffect(() => {
        loadLookupData();
    }, []);

    const loadLookupData = async () => {
        try {
            setLoading(true);

            // Load months
            const monthsResponse = await apiClient.get<LookupItem[]>(
                `${API_CONFIG.SchoolServiceUrl}/GetDynamicLookUpDataForMobileApp?lookType=Months&defaultBlank=false`
            );
            const monthsList = Array.isArray(monthsResponse.data) ? monthsResponse.data : [];
            setMonths(monthsList);

            // Load years
            const yearsResponse = await apiClient.get<LookupItem[]>(
                `${API_CONFIG.SchoolServiceUrl}/GetDynamicLookUpDataForMobileApp?lookType=Years&defaultBlank=false`
            );
            const yearsList = Array.isArray(yearsResponse.data) ? yearsResponse.data : [];
            setYears(yearsList);

            // Set current month and year as defaults
            if (monthsList.length > 0) {
                const currentMonth = new Date().getMonth() + 1;
                const defaultMonth = monthsList.find(m => m.Key === currentMonth.toString());
                setSelectedMonth(defaultMonth || monthsList[0]);
            }

            if (yearsList.length > 0) {
                const currentYear = new Date().getFullYear();
                const defaultYear = yearsList.find(y => y.Key === currentYear.toString());
                setSelectedYear(defaultYear || yearsList[0]);
            }
        } catch (error) {
            console.error('Error loading lookup data:', error);
            Alert.alert('Error', 'Failed to load month and year options');
        } finally {
            setLoading(false);
        }
    };

    const getSalarySlipList = async () => {
        if (!selectedMonth || !selectedYear) {
            Alert.alert('Validation', 'Please select both month and year');
            return;
        }

        try {
            setSearching(true);
            setSalarySlips([]);

            const response = await apiClient.get<SalarySlip | SalarySlip[]>(
                `${API_CONFIG.SchoolServiceUrl}/GetSalarySlipList?Month=${selectedMonth.Key}&Year=${selectedYear.Value}`
            );

            if (response.data) {
                const slips = Array.isArray(response.data) ? response.data : [response.data];
                setSalarySlips(slips);

                if (slips.length === 0) {
                    Alert.alert(
                        'No Results',
                        `No payslips available for ${selectedMonth.Value} ${selectedYear.Value}`
                    );
                }
            }
        } catch (error) {
            console.error('Error fetching salary slips:', error);
            Alert.alert('Error', 'Failed to fetch salary slips');
        } finally {
            setSearching(false);
        }
    };

    const downloadSalarySlip = async (slip: SalarySlip) => {
        try {
            Alert.alert(
                'Download',
                `Download salary slip for ${new Date(slip.SlipDate).toLocaleDateString()}?`,
                [
                    { text: 'Cancel', onPress: () => {} },
                    {
                        text: 'Download',
                        onPress: async () => {
                            try {
                                const response = await apiClient.get(
                                    `${API_CONFIG.ContentServiceUrl}/ReadContentsByIDForMobile?contentID=${slip.ReportContentID}`
                                );
                                Alert.alert(
                                    'Success',
                                    'Salary slip download link prepared. In production, this would open the file.'
                                );
                            } catch (err) {
                                console.error('Download error:', err);
                                Alert.alert('Error', 'Failed to download salary slip');
                            }
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Pay Slip</Text>
            <View style={{ width: 24 }} />
        </View>
    );

    const renderMonthPicker = () => (
        <Modal visible={showMonthPicker} transparent animationType="fade">
            <Pressable
                style={styles.modalOverlay}
                onPress={() => setShowMonthPicker(false)}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Month</Text>
                    <FlatList
                        data={months}
                        renderItem={({ item }) => (
                            <Pressable
                                style={[
                                    styles.modalItem,
                                    selectedMonth?.Key === item.Key && styles.modalItemSelected,
                                ]}
                                onPress={() => {
                                    setSelectedMonth(item);
                                    setShowMonthPicker(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.modalItemText,
                                        selectedMonth?.Key === item.Key &&
                                            styles.modalItemTextSelected,
                                    ]}
                                >
                                    {item.Value}
                                </Text>
                            </Pressable>
                        )}
                        keyExtractor={(item) => item.Key.toString()}
                        scrollEnabled
                        nestedScrollEnabled
                    />
                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={() => setShowMonthPicker(false)}
                    >
                        <Text style={styles.modalCloseText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );

    const renderYearPicker = () => (
        <Modal visible={showYearPicker} transparent animationType="fade">
            <Pressable
                style={styles.modalOverlay}
                onPress={() => setShowYearPicker(false)}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Year</Text>
                    <FlatList
                        data={years}
                        renderItem={({ item }) => (
                            <Pressable
                                style={[
                                    styles.modalItem,
                                    selectedYear?.Key === item.Key && styles.modalItemSelected,
                                ]}
                                onPress={() => {
                                    setSelectedYear(item);
                                    setShowYearPicker(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.modalItemText,
                                        selectedYear?.Key === item.Key &&
                                            styles.modalItemTextSelected,
                                    ]}
                                >
                                    {item.Value}
                                </Text>
                            </Pressable>
                        )}
                        keyExtractor={(item) => item.Key.toString()}
                        scrollEnabled
                        nestedScrollEnabled
                    />
                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={() => setShowYearPicker(false)}
                    >
                        <Text style={styles.modalCloseText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );

    const renderSalarySlipItem = (slip: SalarySlip) => (
        <TouchableOpacity
            key={slip.ReportContentID}
            style={styles.slipCard}
            onPress={() => downloadSalarySlip(slip)}
        >
            <View style={styles.slipCardHeader}>
                <View>
                    <Text style={styles.slipDate}>
                        {new Date(slip.SlipDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </Text>
                    <Text style={styles.slipLabel}>Salary Slip</Text>
                </View>
                <View style={styles.downloadIcon}>
                    <Text style={styles.downloadIconText}>⬇</Text>
                </View>
            </View>
            <Text style={styles.slipSubtext}>Tap to download</Text>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyTitle}>No payslips available</Text>
            <Text style={styles.emptyMessage}>
                There are currently no payslips available for download for the selected month.
            </Text>
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

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.formCard}>
                    {/* Month Selector */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Month <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={styles.selectorButton}
                            onPress={() => setShowMonthPicker(true)}
                        >
                            <Text style={styles.selectorText}>
                                {selectedMonth?.Value || 'Select Month'}
                            </Text>
                            <Text style={styles.selectorIcon}>▼</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Year Selector */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Year <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={styles.selectorButton}
                            onPress={() => setShowYearPicker(true)}
                        >
                            <Text style={styles.selectorText}>
                                {selectedYear?.Value || 'Select Year'}
                            </Text>
                            <Text style={styles.selectorIcon}>▼</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, searching && styles.submitButtonDisabled]}
                        onPress={getSalarySlipList}
                        disabled={searching}
                    >
                        <Text style={styles.submitButtonText}>
                            {searching ? 'Searching...' : 'Submit'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Results */}
                {salarySlips.length > 0 ? (
                    <View style={styles.resultsContainer}>
                        <Text style={styles.resultsTitle}>Available Payslips</Text>
                        {salarySlips.map((slip) => renderSalarySlipItem(slip))}
                    </View>
                ) : searching ? null : (
                    renderEmptyState()
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {renderMonthPicker()}
            {renderYearPicker()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
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
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Form Card
    formCard: {
        margin: 16,
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2F2F2F',
        marginBottom: 8,
    },
    required: {
        color: '#FF3333',
    },
    selectorButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        backgroundColor: '#FAFAFA',
    },
    selectorText: {
        fontSize: 14,
        color: '#2F2F2F',
        fontWeight: '500',
    },
    selectorIcon: {
        fontSize: 12,
        color: '#999999',
    },
    submitButton: {
        marginTop: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#3A62B0',
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '80%',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16,
    },
    modalItem: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalItemSelected: {
        backgroundColor: '#E0E7FF',
        borderRadius: 8,
        borderBottomWidth: 0,
    },
    modalItemText: {
        fontSize: 14,
        color: '#2F2F2F',
        fontWeight: '500',
    },
    modalItemTextSelected: {
        color: '#3A62B0',
        fontWeight: '600',
    },
    modalCloseButton: {
        marginTop: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
        alignItems: 'center',
    },
    modalCloseText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2F2F2F',
    },

    // Results
    resultsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    slipCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    slipCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    slipDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    slipLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    downloadIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E0E7FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    downloadIconText: {
        fontSize: 16,
        color: '#3A62B0',
    },
    slipSubtext: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        marginTop: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
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
        lineHeight: 20,
    },
});

export default PaySlipScreen;
