import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { studentService, Student } from '../services/student/studentService';
import { theme } from '../constants/theme';

const ATTENDANCE_STATUS_COLORS: { [key: string]: { color: string; label: string } } = {
    P: { color: '#0ead1f', label: 'Present' },
    A: { color: '#f37d1a', label: 'Absent' },
    AE: { color: '#f54213', label: 'Absences Excused' },
    H: { color: '#ea2b15', label: 'Holiday' },
    L: { color: '#fa06e0', label: 'Late' },
    T: { color: '#855649', label: 'Tardy' },
    TE: { color: '#b38f86', label: 'Tardy Excused' },
    W: { color: '#95b3d7', label: 'Weekend' },
    NA: { color: '#8e0d0d', label: 'Not Available' },
    UM: { color: '#4c4646', label: 'Unmarked' },
    LE: { color: '#0eaec7', label: 'Late Excused' },
    LA: { color: '#c2e20d', label: 'Leave Applied' },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const StudentAttendance = () => {
    const navigation = useNavigation();
    const [selectedWard, setSelectedWard] = useState<Student | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [classWiseAttendance, setClassWiseAttendance] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
    const [isYearPickerVisible, setIsYearPickerVisible] = useState(false);
    const [years, setYears] = useState<number[]>([]);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedWard) {
            fetchAttendance();
        }
    }, [selectedMonth, selectedYear]);

    const loadInitialData = async () => {
        try {
            setIsLoading(true);
            const storedWard = await AsyncStorage.getItem('selectedWard');
            if (storedWard) {
                const ward = JSON.parse(storedWard);
                setSelectedWard(ward);

                // Generate last 5 years
                const currentYear = new Date().getFullYear();
                const yearsList = [];
                for (let i = currentYear - 5; i <= currentYear; i++) {
                    yearsList.push(i);
                }
                setYears(yearsList);

                await fetchAttendance(ward.StudentIID);
                await fetchClassWiseAttendance(ward.StudentIID);
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

    const fetchAttendance = async (studentId?: number) => {
        try {
            setIsLoading(true);
            const id = studentId || selectedWard?.StudentIID;
            if (!id) return;

            const data = await studentService.getStudentAttendance(id, selectedMonth, selectedYear);
            setAttendanceData(data);
        } catch (error) {
            console.error('Failed to fetch attendance', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchClassWiseAttendance = async (studentId: number) => {
        try {
            const data = await studentService.getStudentClassWiseAttendance(studentId);
            setClassWiseAttendance(data);
        } catch (error) {
            console.error('Failed to fetch class-wise attendance', error);
        }
    };

    const getDaysInMonth = () => {
        return new Date(selectedYear, selectedMonth + 1, 0).getDate();
    };

    const getFirstDayOfMonth = () => {
        return new Date(selectedYear, selectedMonth, 1).getDay();
    };

    const getAttendanceForDay = (day: number) => {
        const attendance = attendanceData.find(a => {
            const date = new Date(a.AttendenceDate);
            return date.getDate() === day &&
                date.getMonth() === selectedMonth &&
                date.getFullYear() === selectedYear;
        });

        if (attendance?.PresentStatusTitle) {
            return attendance.PresentStatusTitle;
        }
        return 'UM';
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth();
        const firstDay = getFirstDayOfMonth();
        const rows: React.ReactElement[] = [];

        // Header row with day names
        const headerCells = DAYS.map((day, index) => (
            <View key={`header-${index}`} style={styles.calendarCell}>
                <Text style={styles.dayName}>{day}</Text>
            </View>
        ));
        rows.push(
            <View key="header" style={styles.calendarRow}>
                {headerCells}
            </View>
        );

        // Calendar grid
        let cells: React.ReactElement[] = [];

        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            cells.push(
                <View key={`empty-${i}`} style={styles.calendarCell}>
                    <View style={styles.dayContainer} />
                </View>
            );
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const status = getAttendanceForDay(day);
            const statusColor = ATTENDANCE_STATUS_COLORS[status]?.color || '#ccc';
            const isToday = day === new Date().getDate() &&
                selectedMonth === new Date().getMonth() &&
                selectedYear === new Date().getFullYear();

            cells.push(
                <View key={`day-${day}`} style={styles.calendarCell}>
                    <View style={[
                        styles.dayContainer,
                        { backgroundColor: statusColor },
                        isToday && styles.todayContainer
                    ]}>
                        <Text style={[styles.dayNumber, isToday && styles.todayText]}>{day}</Text>
                        <Text style={styles.statusText}>{status}</Text>
                    </View>
                </View>
            );

            // Start new row every 7 cells
            if ((firstDay + day) % 7 === 0) {
                rows.push(
                    <View key={`row-${day}`} style={styles.calendarRow}>
                        {cells}
                    </View>
                );
                cells = [];
            }
        }

        // Add remaining cells if any
        if (cells.length > 0) {
            while (cells.length < 7) {
                cells.push(
                    <View key={`empty-end-${cells.length}`} style={styles.calendarCell}>
                        <View style={styles.dayContainer} />
                    </View>
                );
            }
            rows.push(
                <View key="last-row" style={styles.calendarRow}>
                    {cells}
                </View>
            );
        }

        return rows;
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
                <Text style={styles.headerTitle}>Attendance</Text>
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={styles.filterItem}
                    onPress={() => setIsMonthPickerVisible(true)}
                >
                    <Text style={styles.filterText}>{MONTHS[selectedMonth]}</Text>
                    <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.filterItem}
                    onPress={() => setIsYearPickerVisible(true)}
                >
                    <Text style={styles.filterText}>{selectedYear}</Text>
                    <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Calendar */}
                <View style={styles.calendarCard}>
                    <Text style={styles.calendarTitle}>
                        {MONTHS[selectedMonth]} {selectedYear}
                    </Text>
                    {isLoading ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 20 }} />
                    ) : (
                        <View style={styles.calendar}>{renderCalendar()}</View>
                    )}
                </View>

                {/* Legend */}
                <View style={styles.legendCard}>
                    <Text style={styles.legendTitle}>Attendance Legend</Text>
                    <View style={styles.legendGrid}>
                        {Object.entries(ATTENDANCE_STATUS_COLORS).map(([code, { color, label }]) => (
                            <View key={code} style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: color }]} />
                                <Text style={styles.legendLabel}>{label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Class-wise Summary */}
                {classWiseAttendance.length > 0 && (
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryTitle}>Overall Summary</Text>
                        {classWiseAttendance.map((item, index) => {
                            const percentage = item.AttendancePercentage || 0;
                            const barColor = percentage >= 90 ? '#4caf50' :
                                percentage >= 75 ? '#ff9800' : '#f44336';

                            return (
                                <View key={index} style={styles.summaryCard}>
                                    <View style={styles.summaryHeader}>
                                        <Text style={styles.summaryClass}>
                                            {item.ClassName}
                                            {item.SectionName ? ` - ${item.SectionName}` : ''}
                                        </Text>
                                        <Text style={[styles.summaryPercentage, { color: barColor }]}>
                                            {percentage.toFixed(2)}%
                                        </Text>
                                    </View>

                                    <View style={styles.progressBar}>
                                        <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: barColor }]} />
                                    </View>

                                    <View style={styles.statsRow}>
                                        <View style={styles.statItem}>
                                            <Text style={styles.statValue}>{item.StudentPresentCount || 0}</Text>
                                            <Text style={styles.statLabel}>Present</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: '#f44336' }]}>{item.StudentAbsentCount || 0}</Text>
                                            <Text style={styles.statLabel}>Absent</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={styles.statValue}>{item.TotalMarkedDays || 0}</Text>
                                            <Text style={styles.statLabel}>Total</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            {/* Month Picker Modal */}
            <Modal
                visible={isMonthPickerVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsMonthPickerVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Month</Text>
                        <ScrollView>
                            {MONTHS.map((month, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setSelectedMonth(index);
                                        setIsMonthPickerVisible(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        selectedMonth === index && styles.selectedModalItemText
                                    ]}>
                                        {month}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setIsMonthPickerVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Year Picker Modal */}
            <Modal
                visible={isYearPickerVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsYearPickerVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Year</Text>
                        <ScrollView>
                            {years.map((year) => (
                                <TouchableOpacity
                                    key={year}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setSelectedYear(year);
                                        setIsYearPickerVisible(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        selectedYear === year && styles.selectedModalItemText
                                    ]}>
                                        {year}
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
    filterContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        gap: 10,
    },
    filterItem: {
        flex: 1,
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
    content: {
        padding: 16,
    },
    calendarCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    calendarTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 16,
    },
    calendar: {
        width: '100%',
    },
    calendarRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    calendarCell: {
        flex: 1,
        aspectRatio: 1,
        padding: 2,
    },
    dayName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
        textAlign: 'center',
        paddingVertical: 4,
    },
    dayContainer: {
        flex: 1,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    todayContainer: {
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    dayNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
    },
    todayText: {
        color: '#fff',
    },
    statusText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '600',
    },
    legendCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    legendTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    legendGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        marginBottom: 6,
        minWidth: '47%',
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendLabel: {
        fontSize: 12,
        color: '#333',
    },
    summaryContainer: {
        marginTop: 8,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    summaryCard: {
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
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryClass: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    summaryPercentage: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    progressBar: {
        height: 20,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 16,
    },
    progressFill: {
        height: '100%',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4caf50',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
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

export default StudentAttendance;
