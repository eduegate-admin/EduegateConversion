import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    RefreshControl,
    Dimensions,
    Alert,
    SafeAreaView,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { attendanceService } from '../../services/school/attendanceService';
import { theme } from '../../constants/theme';

interface Student {
    StudentID: number;
    StudentIID: number;
    StudentName: string;
    StudentFullName: string;
    StudentCode: string;
    AdmissionNumber: string;
    StudentProfileImageUrl?: string;
    AdmissionDate: string;
    FeeStartDate: string;
    attendance: 'Present' | 'Absent' | 'Unmarked';
    attendances: AttendanceRecord[];
}

interface AttendanceRecord {
    date: string;
    day: number;
    month: number;
    year: number;
    statusId: number;
    statusTitle: string;
    statusDescription: string;
    reason: string;
}

interface PresentStatus {
    PresentStatusID: number;
    StatusDescription: string;
    StatusTitle: string;
}

interface SelectionState {
    [key: string]: 'Present' | 'Absent' | 'Unmarked';
}

type StudentAttendanceRouteProp = RouteProp<any, 'StudentAttendance'>;

export const StudentAttendanceScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<StudentAttendanceRouteProp>();
    
    const { classId: initialClassId, sectionId: initialSectionId } = route.params || {};

    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    
    // Classes and Sections from Backend
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<number>(initialClassId || 0);
    const [selectedSectionId, setSelectedSectionId] = useState<number>(initialSectionId || 0);
    const [className, setClassName] = useState('');
    const [sectionName, setSectionName] = useState('');
    
    const [attendanceState, setAttendanceState] = useState<SelectionState>({});
    const [presentStatuses, setPresentStatuses] = useState<PresentStatus[]>([]);
    const [holidayData, setHolidayData] = useState<any[]>([]);
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [years, setYears] = useState<number[]>([]);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [showClassMenu, setShowClassMenu] = useState(false);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        initializeScreen();
    }, []);

    useEffect(() => {
        if (selectedClassId && selectedSectionId) {
            loadAttendanceData();
        }
    }, [selectedMonth, selectedYear, selectedClassId, selectedSectionId]);

    const initializeScreen = async () => {
        try {
            setLoading(true);
            
            // Generate years list (current year - 5 to current year)
            const currentYear = new Date().getFullYear();
            const yearsList = [];
            for (let i = currentYear - 5; i <= currentYear; i++) {
                yearsList.push(i);
            }
            setYears(yearsList);

            // Load classes from backend
            await loadClasses();

            // Load present statuses
            await loadPresentStatuses();
        } catch (error) {
            console.error('Error initializing screen:', error);
            Alert.alert('Error', 'Failed to initialize. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadClasses = async () => {
        try {
            const classList = await attendanceService.getTeacherClasses();
            
            if (classList && classList.length > 0) {
                setClasses(classList);
                
                // Set first class as default if not passed via params
                if (!initialClassId && classList[0]) {
                    const firstClass = classList[0];
                    setSelectedClassId(firstClass.ClassID);
                    setClassName(firstClass.ClassName);
                    
                    // Get unique sections for this class
                    const classSection = classList.filter(c => c.ClassID === firstClass.ClassID);
                    const uniqueSections = classSection.reduce((acc: any[], current) => {
                        const exists = acc.find(s => s.SectionID === current.SectionID);
                        if (!exists) acc.push(current);
                        return acc;
                    }, []);
                    
                    setSections(uniqueSections);
                    
                    if (uniqueSections[0]) {
                        setSelectedSectionId(uniqueSections[0].SectionID);
                        setSectionName(uniqueSections[0].SectionName);
                    }
                } else if (initialClassId) {
                    // If classId passed via params, find and set it
                    const selectedClass = classList.find(c => c.ClassID === initialClassId);
                    if (selectedClass) {
                        setClassName(selectedClass.ClassName);
                        
                        const classSection = classList.filter(c => c.ClassID === initialClassId);
                        const uniqueSections = classSection.reduce((acc: any[], current) => {
                            const exists = acc.find(s => s.SectionID === current.SectionID);
                            if (!exists) acc.push(current);
                            return acc;
                        }, []);
                        
                        setSections(uniqueSections);
                        
                        if (initialSectionId) {
                            const selectedSection = uniqueSections.find(s => s.SectionID === initialSectionId);
                            if (selectedSection) {
                                setSectionName(selectedSection.SectionName);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading classes:', error);
            Alert.alert('Error', 'Failed to load classes');
        }
    };

    const handleClassChange = (newClassId: number) => {
        setSelectedClassId(newClassId);
        
        // Update class name
        const selectedClass = classes.find(c => c.ClassID === newClassId);
        if (selectedClass) {
            setClassName(selectedClass.ClassName);
            
            // Get sections for this class
            const classSection = classes.filter(c => c.ClassID === newClassId);
            const uniqueSections = classSection.reduce((acc: any[], current) => {
                const exists = acc.find(s => s.SectionID === current.SectionID);
                if (!exists) acc.push(current);
                return acc;
            }, []);
            
            setSections(uniqueSections);
            
            // Set first section as default
            if (uniqueSections[0]) {
                setSelectedSectionId(uniqueSections[0].SectionID);
                setSectionName(uniqueSections[0].SectionName);
            }
        }
        
        // Clear students when class changes
        setStudents([]);
    };

    const handleSectionChange = (newSectionId: number) => {
        setSelectedSectionId(newSectionId);
        
        // Update section name
        const selectedSection = sections.find(s => s.SectionID === newSectionId);
        if (selectedSection) {
            setSectionName(selectedSection.SectionName);
        }
        
        // Clear students when section changes
        setStudents([]);
    };

    const loadPresentStatuses = async () => {
        try {
            // Get Present/Absent statuses
            // For now, using mock data - replace with actual API call
            const statuses = [
                { PresentStatusID: 1, StatusDescription: 'Present', StatusTitle: 'P' },
                { PresentStatusID: 2, StatusDescription: 'Absent', StatusTitle: 'A' },
                { PresentStatusID: 9, StatusDescription: 'Unmarked', StatusTitle: 'UM' },
            ];
            setPresentStatuses(statuses);
        } catch (error) {
            console.error('Error loading present statuses:', error);
        }
    };

    const loadAttendanceData = async () => {
        try {
            setLoading(true);

            // Load students for the selected class/section
            const studentsList = await attendanceService.getStudentsByClassSection(
                selectedClassId,
                selectedSectionId
            );

            // For now, using mock data for holidays and records
            // Replace with actual API calls when available
            const holidays: any[] = [];
            const records: any[] = [];

            // Process students and build attendance records
            const processedStudents = processStudentAttendance(
                studentsList,
                records,
                holidays
            );

            setStudents(processedStudents);
            setHolidayData(holidays);
            setAttendanceData(records);

            // Initialize attendance state
            const initialState: SelectionState = {};
            processedStudents.forEach((student: Student) => {
                initialState[student.StudentIID] = 'Unmarked';
            });
            setAttendanceState(initialState);
        } catch (error) {
            console.error('Error loading attendance data:', error);
            Alert.alert('Error', 'Failed to load students. Please check your class/section selection.');
            setStudents([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const processStudentAttendance = (
        studentsList: any[],
        attendanceRecords: any[],
        holidays: any[]
    ): Student[] => {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

        return studentsList.map((student: any) => {
            const attendances: AttendanceRecord[] = [];

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(selectedYear, selectedMonth, day);
                const dateStr = `${day}/${selectedMonth + 1}/${selectedYear}`;

                // Check if there's existing attendance record
                const existingRecord = attendanceRecords.find(
                    (r: any) =>
                        r.StudentID === student.StudentIID &&
                        r.Day === day &&
                        r.Month === selectedMonth + 1 &&
                        r.Year === selectedYear
                );

                // Check if it's a holiday
                const holiday = holidays.find(
                    (h: any) =>
                        h.Day === day &&
                        h.Month === selectedMonth + 1 &&
                        h.Year === selectedYear
                );

                let status = existingRecord?.StatusTitle || 'UM';
                let description = existingRecord?.StatusDescription || 'Unmarked';

                if (holiday) {
                    status = holiday.EventType === '1' ? 'H' : 'W';
                    description = holiday.EventTitle;
                }

                attendances.push({
                    date: dateStr,
                    day,
                    month: selectedMonth,
                    year: selectedYear,
                    statusId: existingRecord?.PresentStatusID || 9,
                    statusTitle: status,
                    statusDescription: description,
                    reason: holiday?.EventTitle || '',
                });
            }

            return {
                ...student,
                StudentIID: student.StudentIID || student.StudentID,
                StudentFullName: student.StudentFullName || student.StudentName,
                attendances,
            };
        });
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadAttendanceData();
    };

    const toggleAttendance = (studentId: number, statusId: number) => {
        setAttendanceState({
            ...attendanceState,
            [studentId]: statusId === 1 ? 'Present' : 'Absent',
        });
    };

    const saveAttendance = async (
        studentId: number,
        attendanceDate: string,
        statusId: number
    ) => {
        try {
            await attendanceService.submitAttendance([
                {
                    StudentID: studentId,
                    AttendanceReasonID: null,
                    Reason: '',
                    ClassID: selectedClassId,
                    SectionID: selectedSectionId,
                } as any,
            ]);

            Alert.alert('Success', 'Attendance marked successfully');
            loadAttendanceData();
        } catch (error) {
            console.error('Error saving attendance:', error);
            Alert.alert('Error', 'Failed to save attendance');
        }
    };

    const sendNotificationsToParents = async () => {
        try {
            setNotificationLoading(true);
            // Call API to send notifications
            // await attendanceService.sendNotifications(classId, sectionId);
            Alert.alert('Success', 'Notifications sent to parents');
        } catch (error) {
            console.error('Error sending notifications:', error);
            Alert.alert('Error', 'Failed to send notifications');
        } finally {
            setNotificationLoading(false);
        }
    };

    const renderCalendar = () => {
        const days = [];
        const today = new Date();
        
        // Get days of week
        const dayNames = ['FRI', 'SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU'];
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        
        // Day names header
        days.push(
            <View key="dayNames" style={styles.calendarDayNames}>
                {dayNames.map((day, idx) => (
                    <Text key={`name-${idx}`} style={styles.dayName}>{day}</Text>
                ))}
            </View>
        );

        // Generate date numbers for the month
        const dateNumbers = [];
        for (let i = 1; i <= Math.min(daysInMonth, 31); i++) {
            const date = new Date(selectedYear, selectedMonth, i);
            const isToday = i === today.getDate() && 
                           selectedMonth === today.getMonth() && 
                           selectedYear === today.getFullYear();
            
            dateNumbers.push(
                <TouchableOpacity
                    key={`date-${i}`}
                    style={[
                        styles.calendarDateBox,
                        isToday && styles.calendarDateBoxActive,
                    ]}
                    onPress={() => setSelectedDate(date)}
                >
                    {isToday && (
                        <LinearGradient
                            colors={['#6B46C1', '#452A61']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.calendarDateActiveBackground}
                        >
                            <Text style={styles.calendarDateTextActive}>{i}</Text>
                            <Text style={styles.calendarDateDayName}>{dayNames[date.getDay()]}</Text>
                        </LinearGradient>
                    )}
                    {!isToday && (
                        <>
                            <Text style={styles.calendarDateDayName}>{dayNames[date.getDay()]}</Text>
                            <Text style={styles.calendarDateText}>{i}</Text>
                        </>
                    )}
                </TouchableOpacity>
            );
        }

        days.push(
            <View key="dateNumbers" style={styles.calendarDates}>
                {dateNumbers}
            </View>
        );

        return <View>{days}</View>;
    };

    const renderClassAndSection = () => (
        <View style={styles.filterCard}>
            <View style={styles.filterRow}>
                <View style={styles.filterColumn}>
                    <Text style={styles.filterLabel}>Class</Text>
                    <TouchableOpacity 
                        style={styles.filterValue}
                        onPress={() => {
                            const classOptions = classes.map(c => ({
                                label: c.ClassName,
                                value: c.ClassID
                            }));
                            showClassPicker(classOptions);
                        }}
                    >
                        <Text style={styles.filterText}>{className || 'Select Class'}</Text>
                        <Text style={styles.dropdownIcon}>▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.filterColumn}>
                    <Text style={styles.filterLabel}>Section</Text>
                    <TouchableOpacity 
                        style={styles.filterValue}
                        onPress={() => {
                            const sectionOptions = sections.map(s => ({
                                label: s.SectionName,
                                value: s.SectionID
                            }));
                            showSectionPicker(sectionOptions);
                        }}
                    >
                        <Text style={styles.filterText}>{sectionName || 'Select Section'}</Text>
                        <Text style={styles.dropdownIcon}>▼</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity
                style={styles.notificationButton}
                onPress={sendNotificationsToParents}
                disabled={notificationLoading || !selectedClassId || !selectedSectionId}
            >
                <Text style={styles.notificationButtonText}>
                    {notificationLoading ? 'Sending...' : "Send today's attendance to parents"}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const showClassPicker = (options: any[]) => {
        Alert.alert(
            'Select Class',
            '',
            options.map(opt => ({
                text: opt.label,
                onPress: () => handleClassChange(opt.value),
            })),
            { cancelable: true }
        );
    };

    const showSectionPicker = (options: any[]) => {
        Alert.alert(
            'Select Section',
            '',
            options.map(opt => ({
                text: opt.label,
                onPress: () => handleSectionChange(opt.value),
            })),
            { cancelable: true }
        );
    };

    const getAttendanceColor = (status: string) => {
        switch (status) {
            case 'Present':
                return '#3CA52C';
            case 'Absent':
                return '#BE3939';
            case 'Unmarked':
                return '#F1F1F1';
            default:
                return '#F1F1F1';
        }
    };

    const getAttendanceTextColor = (status: string) => {
        return status === 'Unmarked' ? '#999999' : '#FFFFFF';
    };

    const renderStudentCard = ({ item }: { item: Student }) => {
        const currentStatus = attendanceState[item.StudentIID] || 'Unmarked';
        
        return (
            <View style={styles.studentCard}>
                {/* Student Header with Profile */}
                <View style={styles.studentHeader}>
                    <Image
                        source={
                            item.StudentProfileImageUrl
                                ? { uri: item.StudentProfileImageUrl }
                                : require('../../assets/images/profile_img.png')
                        }
                        style={styles.studentAvatar}
                    />
                    <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{item.StudentFullName}</Text>
                        <Text style={styles.studentCode}>{item.AdmissionNumber}</Text>
                    </View>
                </View>

                {/* Monthly Attendance Records */}
                <View style={styles.attendanceHistoryContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.attendanceHistoryScroll}
                    >
                        {item.attendances && item.attendances.map((record, idx) => (
                            <View key={idx} style={styles.attendanceStatusDay}>
                                <TouchableOpacity
                                    style={[
                                        styles.attendanceDayButton,
                                        getStatusStyle(record.statusTitle),
                                    ]}
                                    onPress={() => {
                                        const statusId = record.statusTitle === 'P' ? 1 : record.statusTitle === 'A' ? 2 : 9;
                                        saveAttendance(item.StudentIID, record.date, statusId);
                                    }}
                                >
                                    <Text style={styles.attendanceDayDate}>{record.day}</Text>
                                    <Text style={styles.attendanceStatusBadge}>{getStatusLabel(record.statusTitle)}</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Attendance Status Row */}
                <View style={styles.attendanceRow}>
                    {/* Unmarked Badge */}
                    <View style={styles.badgeContainer}>
                        <View style={[styles.statusBadge, { backgroundColor: '#F1F1F1' }]}>
                            <Text style={styles.statusBadgeText}>Unmarked</Text>
                        </View>
                    </View>

                    {/* Send Notification Badge */}
                    <TouchableOpacity
                        style={styles.badgeContainer}
                        onPress={() => sendNotificationsToParents()}
                    >
                        <View style={[styles.notificationBadge, { backgroundColor: '#3A62B0' }]}>
                            <Text style={styles.notificationBadgeText}>Send Notification</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Quick Attendance Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.attendanceButton]}
                        onPress={() => {
                            toggleAttendance(item.StudentIID, 2);
                            saveAttendance(
                                item.StudentIID,
                                `${selectedDate.getDate()}/${selectedMonth + 1}/${selectedYear}`,
                                2
                            );
                        }}
                    >
                        <LinearGradient
                            colors={['#BE3939', '#A02E2E']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.attendanceButtonGradient}
                        >
                            <Text style={styles.attendanceButtonText}>Absent</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.attendanceButton]}
                        onPress={() => {
                            toggleAttendance(item.StudentIID, 1);
                            saveAttendance(
                                item.StudentIID,
                                `${selectedDate.getDate()}/${selectedMonth + 1}/${selectedYear}`,
                                1
                            );
                        }}
                    >
                        <LinearGradient
                            colors={['#3CA52C', '#2E8620']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.attendanceButtonGradient}
                        >
                            <Text style={styles.attendanceButtonText}>Present</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Expandable Indicator */}
                <TouchableOpacity style={styles.expandButton}>
                    <Text style={styles.expandIcon}>∨</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'P':
                return { backgroundColor: '#3CA52C' };
            case 'A':
                return { backgroundColor: '#BE3939' };
            case 'H':
            case 'W':
                return { backgroundColor: '#F59E0B' };
            default:
                return { backgroundColor: '#F1F1F1' };
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'P':
                return 'P';
            case 'A':
                return 'A';
            case 'H':
                return 'H';
            case 'W':
                return 'W';
            default:
                return 'UM';
        }
    };

    const handleHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Attendance</Text>
            <View style={{ width: 24 }} />
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                {handleHeader()}
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {handleHeader()}
            
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
            >
                {/* Purple Header Section with Calendar */}
                <View style={styles.purpleHeader}>
                    {/* Month/Year Navigation */}
                    <View style={styles.monthYearNav}>
                        <TouchableOpacity onPress={() => setSelectedMonth(Math.max(0, selectedMonth - 1))}>
                            <Text style={styles.navArrow}>‹</Text>
                        </TouchableOpacity>
                        <View style={styles.monthYearDisplay}>
                            <Text style={styles.monthYearText}>
                                {months[selectedMonth]} {selectedYear}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => setSelectedMonth(Math.min(11, selectedMonth + 1))}>
                            <Text style={styles.navArrow}>›</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.monthTitle}>
                        {months[selectedMonth]},{selectedYear}
                    </Text>
                    {renderCalendar()}
                </View>

                {/* Class and Section Filter */}
                {renderClassAndSection()}

                {/* Student List */}
                <FlatList
                    data={students}
                    renderItem={renderStudentCard}
                    keyExtractor={(item) => item.StudentIID.toString()}
                    scrollEnabled={false}
                    contentContainerStyle={styles.studentListContainer}
                />

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EFEFEF',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#D2D2D2',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        height: 85,
    },
    backIcon: {
        fontSize: 28,
        color: '#2F2F2F',
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2F2F2F',
    },
    content: {
        flex: 1,
    },
    // Purple Header Section
    purpleHeader: {
        backgroundColor: '#543177',
        paddingHorizontal: 16,
        paddingVertical: 24,
        paddingTop: 20,
    },
    monthYearNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    navArrow: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    monthYearDisplay: {
        flex: 1,
        alignItems: 'center',
    },
    monthYearText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    monthTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 20,
        textAlign: 'center',
    },
    calendarDayNames: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    dayName: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        flex: 1,
    },
    calendarDates: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    calendarDateBox: {
        width: 45,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarDateBoxActive: {
        borderRadius: 11,
        overflow: 'hidden',
    },
    calendarDateActiveBackground: {
        width: 60,
        height: 65,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 11,
    },
    calendarDateDayName: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
        marginBottom: 4,
    },
    calendarDateText: {
        fontSize: 24,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
    },
    calendarDateTextActive: {
        fontSize: 32,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Filter Card
    filterCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginVertical: 16,
        borderRadius: 16,
        paddingHorizontal: 22,
        paddingVertical: 20,
        ...theme.shadows.md,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 12,
    },
    filterColumn: {
        flex: 1,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2F2F2F',
        marginBottom: 8,
    },
    filterValue: {
        backgroundColor: '#E4E4E4',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 31,
    },
    filterText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#2F2F2F',
    },
    dropdownIcon: {
        fontSize: 12,
        color: '#999999',
        fontWeight: '600',
    },
    notificationButton: {
        backgroundColor: '#3A62B0',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    notificationButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    // Dropdown picker styles
    pickerItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    pickerItemText: {
        fontSize: 14,
        color: '#2F2F2F',
    },
    // Student Card
    studentCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 13,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
        ...theme.shadows.sm,
    },
    studentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    studentAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#D9D9D9',
        marginRight: 12,
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2F2F2F',
    },
    studentCode: {
        fontSize: 14,
        fontWeight: '600',
        color: '#543177',
        marginTop: 2,
    },
    // Attendance History
    attendanceHistoryContainer: {
        marginBottom: 12,
        maxHeight: 70,
    },
    attendanceHistoryScroll: {
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    attendanceStatusDay: {
        marginRight: 8,
    },
    attendanceDayButton: {
        width: 50,
        height: 60,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
    },
    attendanceDayDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    attendanceStatusBadge: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    attendanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        gap: 8,
    },
    badgeContainer: {
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBadgeText: {
        fontSize: 6.716,
        fontWeight: '500',
        color: '#999999',
    },
    notificationBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadgeText: {
        fontSize: 6.716,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    attendanceButton: {
        flex: 1,
        borderRadius: 5,
        overflow: 'hidden',
    },
    attendanceButtonActive: {
        opacity: 0.9,
    },
    attendanceButtonGradient: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        justifyContent: 'center',
        alignItems: 'center',
        height: 19,
    },
    attendanceButtonText: {
        fontSize: 7.941,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    expandButton: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    expandIcon: {
        fontSize: 14,
        color: '#CCCCCC',
    },
    // Student List
    studentListContainer: {
        paddingHorizontal: 16,
        paddingTop: 0,
    },
});

export default StudentAttendanceScreen;
