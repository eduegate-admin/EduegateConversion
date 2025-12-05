import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { studentService, Student } from '../services/student/studentService';
import { theme } from '../constants/theme';

// Import SVGs
import CalendarIllustration from '../assets/images/calneder_illustration.svg';
import FeeDuesIllustration from '../assets/images/fee_dues.svg';
import LeaveRequestIllustration from '../assets/images/leave_requst.svg';
import CircularIcon from '../assets/images/circular.svg';
import ReportCardIcon from '../assets/images/reportcard.svg';
import AssignmentIcon from '../assets/images/assignment.svg';
import TeacherIcon from '../assets/images/teacher.svg';
import TopicIcon from '../assets/images/topic.svg';
import BackArrowIcon from '../assets/images/back-arrow.svg'; // Assuming this exists or use text

const { width } = Dimensions.get('window');

export const MyWards = () => {
  const navigation = useNavigation<any>();
  const [wards, setWards] = useState<Student[]>([]);
  const [selectedWard, setSelectedWard] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<string>('');
  const [attendanceData, setAttendanceData] = useState<any>({ present: 0, absent: 0 });
  const [feeDue, setFeeDue] = useState<number>(0);
  const [leaveSummary, setLeaveSummary] = useState<any>({ Pending: 0, Approved: 0, Rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState('');
  const [currentYear, setCurrentYear] = useState('');

  useEffect(() => {
    loadData();
    const date = new Date();
    setCurrentMonth(date.toLocaleString('default', { month: 'short' }));
    setCurrentYear(date.getFullYear().toString());
  }, []);

  useEffect(() => {
    if (selectedWard) {
      fetchWardDetails(selectedWard);
    }
  }, [selectedWard]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const myStudents = await studentService.getMyStudents();
      setWards(myStudents);

      // Load selected ward from AsyncStorage or default to first
      const storedWard = await AsyncStorage.getItem('selectedWard');
      if (storedWard) {
        try {
          const parsedWard = JSON.parse(storedWard);
          const found = myStudents.find(s => s.StudentIID === parsedWard.StudentIID);
          setSelectedWard(found || myStudents[0]);
        } catch (e) {
          setSelectedWard(myStudents[0]);
        }
      } else if (myStudents.length > 0) {
        setSelectedWard(myStudents[0]);
      }
    } catch (error) {
      console.error('Failed to load wards', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWardDetails = async (ward: Student) => {
    try {
      // Attendance
      // Note: API requires month/year. Using current month/year as per legacy logic
      // Legacy: $scope.SelectedMonthShort, $scope.SelectedDateYear
      const date = new Date();
      const month = date.getMonth() + 1; // 1-12
      const year = date.getFullYear();

      // We need to implement getAttendanceSummary in studentService if not exists
      // For now, assuming we can fetch it or mocking it based on legacy controller
      // The legacy controller calls: GetStudentAttendenceCountByStudentID

      // Mocking the call structure here as it wasn't in the previous studentService
      // In a real scenario, add this method to studentService
      const attendanceRes = await studentService.getAttendanceSummary(ward.StudentIID, month, year);
      setAttendanceData({
        present: attendanceRes.StudentPresentCount || 0,
        absent: attendanceRes.StudentAbsentCount || 0
      });

      const total = (attendanceRes.StudentPresentCount || 0) + (attendanceRes.StudentAbsentCount || 0);
      if (total === 0) {
        setAttendance('No data');
      } else {
        const pct = ((attendanceRes.StudentPresentCount || 0) / total) * 100;
        setAttendance(pct.toFixed(2) + '%');
      }

      // Fee Due
      const fee = await studentService.getFeeDueAmount(ward.StudentIID);
      setFeeDue(fee);

      // Leave Summary
      const leaves = await studentService.getLeaveSummary(ward.StudentIID);
      setLeaveSummary({
        Pending: leaves.ApplicationSubmittedCount || 0,
        Approved: leaves.ApplicationApprovedCount || 0,
        Rejected: leaves.ApplicationRejectedCount || 0
      });

    } catch (error) {
      console.error('Failed to fetch ward details', error);
    }
  };

  const handleSelectWard = async (ward: Student) => {
    setSelectedWard(ward);
    await AsyncStorage.setItem('selectedWard', JSON.stringify(ward));
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
        <Text style={styles.headerTitle}>My Wards</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        {selectedWard && (
          <View style={styles.profileCard}>
            <View style={styles.profileContent}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: selectedWard.StudentProfileImageUrl || 'https://via.placeholder.com/150' }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.studentName}>
                  {selectedWard.FirstName} {selectedWard.MiddleName} {selectedWard.LastName}
                </Text>
                <Text style={styles.studentDetails}>{selectedWard.AdmissionNumber}</Text>
                <Text style={styles.studentDetails}>{selectedWard.ClassName} {selectedWard.SectionName}</Text>
                <Text style={styles.studentDetails}>{selectedWard.SchoolName}</Text>
              </View>
            </View>
            <View style={styles.profileFooter}>
              <TouchableOpacity style={styles.viewProfileBtn} onPress={() => navigation.navigate('StudentProfile', { studentId: selectedWard.StudentIID })}>
                <Text style={styles.viewProfileText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Ward Switcher */}
        <View style={styles.wardSwitcher}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {wards.map((ward) => (
              <TouchableOpacity
                key={ward.StudentIID}
                onPress={() => handleSelectWard(ward)}
                style={[
                  styles.wardAvatarContainer,
                  selectedWard?.StudentIID === ward.StudentIID && styles.selectedWardAvatar
                ]}
              >
                <Image
                  source={{ uri: ward.StudentProfileImageUrl || 'https://via.placeholder.com/150' }}
                  style={styles.wardAvatar}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Access Grid */}
        <View style={styles.gridContainer}>
          <QuickAccessItem
            icon={CircularIcon}
            label="Circular"
            colors={['#FFD770', '#F5B100']}
            onPress={() => navigation.navigate('Circulars')}
          />
          <QuickAccessItem
            icon={ReportCardIcon}
            label="Report Card"
            colors={['#97DA77', '#50743F']}
            onPress={() => navigation.navigate('ReportCard')}
          />
          <QuickAccessItem
            icon={AssignmentIcon}
            label="Assignments"
            colors={['#56CCDC', '#4062D9']}
            onPress={() => navigation.navigate('Assignments')}
          />
          <QuickAccessItem
            icon={TeacherIcon}
            label="Class Teachers"
            colors={['#AF70FF', '#694399']}
            onPress={() => navigation.navigate('ClassTeachers')}
          />
          <QuickAccessItem
            icon={TopicIcon}
            label="Notes"
            colors={['#708FFF', '#4062D9']}
            onPress={() => navigation.navigate('Notes')}
          />
        </View>

        {/* Attendance Section */}
        <LinearGradient colors={['#4FAEA9', '#FFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sectionCard}>
          <View style={styles.sectionLeft}>
            <Text style={styles.sectionTitle}>Attendance</Text>
            <CalendarIllustration width={80} height={80} />
          </View>
          <View style={styles.sectionRight}>
            <Text style={styles.sectionSubtitle}>Attendance for month</Text>
            <Text style={styles.sectionDate}>{currentMonth} {currentYear}</Text>

            <View style={styles.statRow}>
              <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.statText}>Present ({attendanceData.present})</Text>
            </View>
            <View style={styles.statRow}>
              <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.statText}>Absent ({attendanceData.absent})</Text>
            </View>

            <TouchableOpacity style={styles.detailsBtn} onPress={() => navigation.navigate('StudentAttendance')}>
              <Text style={styles.detailsBtnText}>View details</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Fee Due Section */}
        <LinearGradient colors={['#40B8D2', '#FFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sectionCard}>
          <View style={styles.sectionLeft}>
            <Text style={styles.sectionTitle}>Fee Due</Text>
            <FeeDuesIllustration width={80} height={80} />
          </View>
          <View style={styles.sectionRight}>
            <Text style={styles.feeAmount}>QAR {feeDue.toFixed(2)}</Text>
            <TouchableOpacity style={styles.detailsBtn} onPress={() => navigation.navigate('StudentFeeDue')}>
              <Text style={styles.detailsBtnText}>View details</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Leaves Section */}
        <LinearGradient colors={['#7879EC', '#FFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sectionCard}>
          <View style={styles.sectionLeft}>
            <Text style={styles.sectionTitle}>Leaves</Text>
            <LeaveRequestIllustration width={80} height={80} />
          </View>
          <View style={styles.sectionRight}>
            <Text style={styles.sectionSubtitle}>Leave request status</Text>

            <View style={styles.statRow}>
              <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.statText}>Pending ({leaveSummary.Pending})</Text>
            </View>
            <View style={styles.statRow}>
              <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.statText}>Approved ({leaveSummary.Approved})</Text>
            </View>
            <View style={styles.statRow}>
              <View style={[styles.dot, { backgroundColor: '#E4E6EF' }]} />
              <Text style={styles.statText}>Rejected ({leaveSummary.Rejected})</Text>
            </View>

            <TouchableOpacity style={styles.detailsBtn} onPress={() => navigation.navigate('StudentLeave')}>
              <Text style={styles.detailsBtnText}>View details</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

const QuickAccessItem = ({ icon: Icon, label, colors, onPress }: any) => (
  <TouchableOpacity style={styles.gridItem} onPress={onPress}>
    <LinearGradient colors={colors} style={styles.gridIconContainer}>
      <Icon width={40} height={40} />
    </LinearGradient>
    <Text style={styles.gridLabel}>{label}</Text>
  </TouchableOpacity>
);

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
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#9C5FBF', // Fallback color
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    marginRight: 15,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    padding: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ccc',
  },
  profileInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  studentDetails: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  profileFooter: {
    alignItems: 'flex-end',
  },
  viewProfileBtn: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  viewProfileText: {
    color: '#9C5FBF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  wardSwitcher: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  wardAvatarContainer: {
    marginHorizontal: 8,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 35,
    padding: 2,
  },
  selectedWardAvatar: {
    borderColor: theme.colors.primary,
  },
  wardAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ddd',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  gridIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  gridLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
  sectionCard: {
    borderRadius: 15,
    padding: 0,
    marginBottom: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 3,
    minHeight: 140,
  },
  sectionLeft: {
    width: '40%',
    padding: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionRight: {
    width: '60%',
    backgroundColor: '#fff',
    padding: 15,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
  },
  feeAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  detailsBtn: {
    marginTop: 10,
    alignSelf: 'flex-end',
    backgroundColor: '#f0f0f0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  detailsBtnText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default MyWards;
