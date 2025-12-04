export type RootStackParamList = {
    // Auth Screens
    Login: undefined;
    BiometricAuth: undefined;
    IdentityLogin: undefined;
    Register: undefined;
    ResetPassword: undefined;
    ChangePassword: undefined;

    // Main App
    Home: undefined;

    // Teacher Screens
    TeacherClasses: undefined;
    Assignments: undefined;
    AssignmentEntry: { assignmentId?: number };
    LessonPlan: undefined;
    MarkEntry: undefined;
    MarkList: undefined;
    Topics: undefined;

    // Attendance Screens
    AttendanceClasses: undefined;
    AttendanceStudents: { classId: number; sectionId: number };
    AttendanceDetail: { studentId: number; studentName: string };

    // Staff Screens
    Profile: undefined;
    StaffAttendance: undefined;
    StaffLeaveList: undefined;
    StaffLeaveEntry: undefined;
    StaffTimetable: undefined;
    SalarySlip: { employeeId: number };

    // Communication Screens
    Inbox: undefined;
    Message: {
        receiverId?: number;
        parentName?: string;
        studentId?: number;
        studentName?: string;
    };
    CreateAnnouncement: undefined;
    Broadcast: {
        listName?: string;
        broadcastName?: string;
        broadcastId?: number;
    };
    EditBroadcast: { broadcastId: number };
    Circulars: undefined;
    Mailbox: undefined;

    // Driver Screens
    DriverSchedule: undefined;
    RouteDetails: undefined;
    DriverLocation: { employeeId: number };
    VehicleTracking: undefined;
    VehicleAttendant: undefined;
    DriverReports: undefined;
    FaceDetection: undefined;

    // Student Screens
    ClassStudents: { id?: number; studentId?: number };
    StudentProfile: { studentId: number };
    StudentLeaveRequest: undefined;
    StudentEarlyPickup: undefined;
    StudentPickerVerification: undefined;
    PickerVerificationHome: undefined;

    // Dashboard Screens
    DirectorHome: undefined;
    FinancialDashboard: undefined;
    AcademicDashboard: undefined;
    StaffingDashboard: undefined;
    RevenueDashboard: undefined;
    StudentDashboard: undefined;

    // Other Screens
    IDCard: undefined;
    AppOnboarding: undefined;
    AboutUs: undefined;
    Offline: undefined;
    UserRegistration: { id?: string; isAnonymous?: boolean };
    MyWards: undefined;
    Enroll: undefined;

    // New Home Screen Routes
    Academics: undefined;
    HR: undefined;
    Notifications: undefined;
    PickupVerification: undefined;
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
