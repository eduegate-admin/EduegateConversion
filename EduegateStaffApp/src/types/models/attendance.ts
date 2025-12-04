// Data Models for Teacher Classes and Attendance

export interface TeacherClass {
    ClassID: number;
    ClassName: string;
    SectionID: number;
    SectionName: string;
    SubjectID?: number;
    SubjectName?: string;
    StudentCount?: number;
}

export interface Student {
    StudentID: number;
    StudentName: string;
    RollNumber?: string;
    AdmissionNumber?: string;
    ProfileImageUrl?: string;
    IsPresent?: boolean;
}

export interface AttendanceRecord {
    StudentID: number;
    ClassID: number;
    SectionID: number;
    Date: string;
    IsPresent: boolean;
    Remarks?: string;
}
