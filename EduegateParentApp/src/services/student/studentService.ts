import { apiClient } from '../api/client';
import { API_CONFIG } from '../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Student {
    StudentIID: number;
    StudentName: string; // Often full name in some APIs
    FirstName: string;
    MiddleName: string;
    LastName: string;
    AdmissionNumber: string;
    StudentProfileImageUrl: string;
    ClassName: string;
    SectionName: string;
    SchoolName: string;
    [key: string]: any;
}

export const studentService = {
    getMyStudents: async (): Promise<Student[]> => {
        try {
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/GetMyStudents`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch students', error);
            throw error;
        }
    },

    getFeeDueAmount: async (studentId: number): Promise<number> => {
        try {
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/GetFeeDueAmountByStudentID?studentID=${studentId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch fee due amount', error);
            return 0;
        }
    },

    getPickupRequestCount: async (): Promise<number> => {
        try {
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/GetPickupRequestsCount`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch pickup request count', error);
            return 0;
        }
    },

    getPickupRegisterCount: async (): Promise<number> => {
        try {
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/GetPickupRegisterCount`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch pickup register count', error);
            return 0;
        }
    },

    getNotificationCount: async (): Promise<number> => {
        try {
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/GetMyNotificationCount`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch notification count', error);
            return 0;
        }
    },

    getAttendanceSummary: async (studentId: number, month: number, year: number): Promise<any> => {
        try {
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/GetStudentAttendenceCountByStudentID`, {
                params: { month, year, studentID: studentId }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch attendance summary', error);
            return { StudentPresentCount: 0, StudentAbsentCount: 0 };
        }
    },

    getLeaveSummary: async (studentId: number): Promise<any> => {
        try {
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/GetStudentLeaveCountByStudentID`, {
                params: { studentID: studentId }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch leave summary', error);
            return { ApplicationSubmittedCount: 0, ApplicationApprovedCount: 0, ApplicationRejectedCount: 0 };
        }
    },

    getTeacherDetails: async (studentId: number): Promise<any[]> => {
        try {
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/GetTeacherDetails`, {
                params: { studentID: studentId }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch teacher details', error);
            return [];
        }
    },

    getCirculars: async (): Promise<any[]> => {
        try {
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/GetLatestCirculars`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch circulars', error);
            return [];
        }
    },

    getReportCardByStudentID: async (studentId: number): Promise<any[]> => {
        try {
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/GetReportcardByStudentID`, {
                params: { studentID: studentId }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch report card academic years', error);
            return [];
        }
    },

    getReportCardList: async (studentId: number, classId: number, sectionId: number, academicYearId: number): Promise<any[]> => {
        try {
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/GetReportCardList`, {
                params: {
                    studentID: studentId,
                    classID: classId,
                    sectionID: sectionId,
                    academicYearID: academicYearId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch report card list', error);
            return [];
        }
    },

    getStudentSubjectList: async (studentId: number): Promise<any[]> => {
        try {
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/Getstudentsubjectlist`, {
                params: { studentID: studentId }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch student subjects', error);
            return [];
        }
    },

    getAssignments: async (studentId: number, subjectId?: number): Promise<any[]> => {
        try {
            const params: any = { studentID: studentId };
            if (subjectId) {
                params.subjectID = subjectId;
            }
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/GetAssignments`, {
                params: params
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch assignments', error);
            return [];
        }
    },

    getNotes: async (studentId: number, subjectId?: number, date?: string): Promise<any[]> => {
        try {
            const params: any = { studentID: studentId };
            if (subjectId) {
                params.subjectID = subjectId;
            }
            if (date) {
                params.date = date;
            }
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/GetStudentSubjectWiseAgendas`, {
                params: params
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch notes', error);
            return [];
        }
    },

    getStudentAttendance: async (studentId: number, month: number, year: number): Promise<any[]> => {
        try {
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/GetStudentAttendenceByYearMonthStudentId`, {
                params: {
                    month: month,
                    year: year,
                    studentId: studentId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch student attendance', error);
            return [];
        }
    },

    getStudentClassWiseAttendance: async (studentId: number, schoolId: number = 30): Promise<any[]> => {
        try {
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/GetStudentClassWiseAttendance`, {
                params: {
                    studentID: studentId,
                    schoolID: schoolId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch class-wise attendance', error);
            return [];
        }
    },

    getStudentFeeDetails: async (studentId: number): Promise<any> => {
        try {
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/GetStudentFeeDetails`, {
                params: { studentID: studentId }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch student fee details', error);
            throw error;
        }
    },

    getLeaveApplications: async (studentId: number): Promise<any[]> => {
        try {
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/GetLeaveApplication`, {
                params: { studentID: studentId }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch leave applications', error);
            return [];
        }
    },

    deleteLeaveApplication: async (leaveApplicationId: number): Promise<any> => {
        try {
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/DeleteStudentLeaveApplicationByID`, {
                params: { leaveApplicationID: leaveApplicationId }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to delete leave application', error);
            throw error;
        }
    },

    getLibraryTransactions: async (filter: 'Issue' | 'Return'): Promise<any[]> => {
        try {
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/GetLibraryTransactions`, {
                params: { filter: filter }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch library transactions', error);
            return [];
        }
    },

    getCounselorList: async (): Promise<any[]> => {
        try {
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/GetCounselorList`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch counselor list', error);
            return [];
        }
    },

    getStudentApplications: async (): Promise<any[]> => {
        try {
            const response = await apiClient.get(`${API_CONFIG.SchoolServiceUrl}/GetStudentApplication`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch student applications', error);
            return [];
        }
    },
};
