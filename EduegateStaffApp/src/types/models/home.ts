export interface StaffProfile {
    EmployeeName: string;
    EmployeeCode: string;
    EmployeeProfileImageUrl: string;
    Designation?: string;
    Department?: string;
}

export interface AttendanceStatus {
    AttendenceDate: string;
    PresentStatus: string;
    InTime?: string;
    OutTime?: string;
}

export interface BoilerPlate {
    Template: string;
    Content: string;
    Title: string;
    ImageURL?: string;
}

export interface PageInfoResponse {
    BoilerPlates: BoilerPlate[];
}

export interface HomeDashboardData {
    profile: StaffProfile | null;
    attendance: AttendanceStatus | null;
    boilerPlates: BoilerPlate[];
    counts: {
        myClass: number;
        assignments: number;
        lessonPlans: number;
        notifications: number;
        circulars: number;
    };
}
