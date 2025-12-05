import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { studentService, Student } from '../services/student/studentService';
import { theme } from '../constants/theme';
import { BottomMenu } from '../components/BottomMenu';

interface WeekDay {
    Key: number;
    Value: string;
}

interface ClassTime {
    Key: number;
    Value: string;
}

interface TimeTableSlot {
    WeekDayID: number;
    ClassTimingID: number;
    Subject: { Value: string };
    StaffNames: string;
}

interface ProcessedTimeTable {
    [weekDayId: number]: {
        [classTimingId: number]: TimeTableSlot;
    };
}

export const TimeTable = () => {
    const navigation = useNavigation();
    const [selectedWard, setSelectedWard] = useState<Student | null>(null);
    const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
    const [classTimes, setClassTimes] = useState<ClassTime[]>([]);
    const [processedTimeTable, setProcessedTimeTable] = useState<ProcessedTimeTable>({});
    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const scrollViewRef = useRef<ScrollView>(null);

    const colorPalette = ['#50cd89', '#009ef7', '#ffc700', '#f1416c', '#7239ea', '#20c997'];
    const subjectColors = useRef<{ [key: string]: string }>({});
    const colorIndex = useRef(0);

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
                await fetchTimeTableData(ward.StudentIID);
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

    const fetchTimeTableData = async (studentId: number) => {
        try {
            const [daysData, timesData, tableData] = await Promise.all([
                studentService.getWeekDays(),
                studentService.getClassTimes(studentId),
                studentService.getTimeTable(studentId)
            ]);

            setWeekDays(daysData);
            setClassTimes(timesData);

            // Process Time Table Data
            const processed: ProcessedTimeTable = {};
            daysData.forEach(day => { processed[day.Key] = {}; });

            if (tableData && tableData.length > 0 && tableData[0].AllocInfoDetails) {
                tableData[0].AllocInfoDetails.forEach((slot: TimeTableSlot) => {
                    if (!processed[slot.WeekDayID]) processed[slot.WeekDayID] = {};
                    processed[slot.WeekDayID][slot.ClassTimingID] = slot;
                });
            }
            setProcessedTimeTable(processed);

            // Select Today
            const todayJsIndex = ((new Date().getDay() + 1) % 7) || 7; // Adjust if needed based on API
            // Assuming API Key matches JS getDay() logic or similar. 
            // Legacy code: ((new Date().getDay() + 1) % 7) || 7;
            // Let's try to find matching Key
            const matchingDayIdx = daysData.findIndex(day => day.Key === todayJsIndex);
            if (matchingDayIdx !== -1) {
                setCurrentDayIndex(matchingDayIdx);
            } else {
                setCurrentDayIndex(0);
            }

        } catch (error) {
            console.error('Failed to fetch time table data', error);
        }
    };

    const getSubjectColor = (subjectName: string) => {
        if (!subjectName || subjectName === 'Free' || subjectName === 'N/A') return '#6c757d';
        if (subjectColors.current[subjectName]) return subjectColors.current[subjectName];

        const color = colorPalette[colorIndex.current % colorPalette.length];
        subjectColors.current[subjectName] = color;
        colorIndex.current++;
        return color;
    };

    const formatTime = (timeRange: string) => {
        if (!timeRange) return '';
        const parts = timeRange.split('-').map(t => {
            const [h, m] = t.trim().split(':');
            let hour = parseInt(h);
            const min = parseInt(m);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            hour = hour % 12 || 12;
            return `${hour}:${min.toString().padStart(2, '0')} ${ampm}`;
        });
        return parts.join(' - ');
    };

    const formatSingleTime = (timeStr: string) => {
        if (!timeStr) return '';
        const [h, m] = timeStr.trim().split(':');
        let hour = parseInt(h);
        const min = parseInt(m);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        return `${hour}:${min.toString().padStart(2, '0')} ${ampm}`;
    };

    const isCurrentPeriod = (timeRange: string, dayKey: number) => {
        // Check if day matches today
        // Legacy logic: if (dayKey != new Date().getDay()) return false;
        // But legacy used ((new Date().getDay() + 1) % 7) || 7 for Key.
        // Let's assume Key matches the logic used to select today.

        const todayKey = ((new Date().getDay() + 1) % 7) || 7;
        if (dayKey !== todayKey) return false;

        try {
            const now = new Date();
            const [startTimeStr, endTimeStr] = timeRange.split('-').map(s => s.trim());

            const [startHours, startMinutes] = startTimeStr.split(':');
            const startTime = new Date();
            startTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

            const [endHours, endMinutes] = endTimeStr.split(':');
            const endTime = new Date();
            endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

            return now >= startTime && now <= endTime;
        } catch (e) {
            return false;
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const currentDay = weekDays[currentDayIndex];
    const currentDaySlots = currentDay ? processedTimeTable[currentDay.Key] : {};

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Time Table</Text>
            </View>

            {/* Day Switcher */}
            <View style={styles.daySwitcherContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySwitcherContent}>
                    {weekDays.map((day, index) => (
                        <TouchableOpacity
                            key={day.Key}
                            style={[
                                styles.daySwitcherItem,
                                currentDayIndex === index && styles.daySwitcherItemActive
                            ]}
                            onPress={() => setCurrentDayIndex(index)}
                        >
                            <Text style={[
                                styles.daySwitcherText,
                                currentDayIndex === index && styles.daySwitcherTextActive
                            ]}>
                                {day.Value.substring(0, 3)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Agenda View */}
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={styles.agendaContent}
                showsVerticalScrollIndicator={false}
            >
                {classTimes.length > 0 ? (
                    classTimes.map((timeSlot, index) => {
                        const slot = currentDaySlots ? currentDaySlots[timeSlot.Key] : null;
                        const isCurrent = currentDay ? isCurrentPeriod(timeSlot.Value, currentDay.Key) : false;
                        const [startTime, endTime] = timeSlot.Value.split('-');

                        return (
                            <View key={index} style={styles.scheduleItem}>
                                {/* Timeline */}
                                <View style={styles.timelineTrack}>
                                    <Text style={styles.timelineTime}>{formatSingleTime(startTime)}</Text>
                                    <View style={[styles.timelineDot, isCurrent && styles.timelineDotActive]} />
                                    <View style={styles.timelineLine} />
                                    <Text style={styles.timelineTime}>{formatSingleTime(endTime)}</Text>
                                </View>

                                {/* Period Card */}
                                <View style={styles.cardContainer}>
                                    {slot ? (
                                        <View style={[
                                            styles.periodCard,
                                            { backgroundColor: getSubjectColor(slot.Subject?.Value) },
                                            isCurrent && styles.periodCardActive
                                        ]}>
                                            <Text style={styles.subjectName}>{slot.Subject?.Value || 'N/A'}</Text>
                                            {slot.StaffNames && (
                                                <View style={styles.teacherRow}>
                                                    <View style={styles.teacherIconCircle}>
                                                        <Text style={styles.teacherIcon}>👤</Text>
                                                    </View>
                                                    <Text style={styles.teacherName}>{slot.StaffNames}</Text>
                                                </View>
                                            )}
                                            <View style={styles.timeRow}>
                                                <View style={styles.timeIconCircle}>
                                                    <Text style={styles.timeIcon}>🕒</Text>
                                                </View>
                                                <Text style={styles.timeText}>{formatTime(timeSlot.Value)}</Text>
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={styles.freeCard}>
                                            <Text style={styles.freeText}>Free</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No timetable data available.</Text>
                    </View>
                )}
            </ScrollView>
            <BottomMenu />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f6f9',
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
    daySwitcherContainer: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    daySwitcherContent: {
        paddingHorizontal: 10,
    },
    daySwitcherItem: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginHorizontal: 4,
        backgroundColor: '#f5f5f5',
    },
    daySwitcherItemActive: {
        backgroundColor: theme.colors.primary,
        elevation: 2,
    },
    daySwitcherText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6c757d',
    },
    daySwitcherTextActive: {
        color: '#fff',
    },
    agendaContent: {
        padding: 20,
    },
    scheduleItem: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    timelineTrack: {
        width: 60,
        alignItems: 'center',
        marginRight: 10,
    },
    timelineTime: {
        fontSize: 10,
        color: '#6c757d',
        fontWeight: '500',
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#d1d5db',
        marginVertical: 4,
    },
    timelineDotActive: {
        backgroundColor: theme.colors.primary,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#e5e7eb',
        minHeight: 30,
    },
    cardContainer: {
        flex: 1,
    },
    periodCard: {
        borderRadius: 12,
        padding: 15,
        minHeight: 80,
    },
    periodCardActive: {
        transform: [{ scale: 1.02 }],
        borderWidth: 2,
        borderColor: '#ffc107',
        elevation: 4,
    },
    subjectName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    teacherRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    teacherIconCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    teacherIcon: {
        fontSize: 12,
        color: '#fff',
    },
    teacherName: {
        fontSize: 13,
        color: '#fff',
        opacity: 0.9,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeIconCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    timeIcon: {
        fontSize: 12,
        color: '#fff',
    },
    timeText: {
        fontSize: 13,
        color: '#fff',
        opacity: 0.9,
    },
    freeCard: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 15,
        minHeight: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    freeText: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#b5b5c3',
    },
    emptyState: {
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#6c757d',
    },
});

export default TimeTable;
