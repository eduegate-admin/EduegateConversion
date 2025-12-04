import { apiClient } from '../api/client';
import { API_CONFIG } from '../../constants/config';
import { StaffProfile, AttendanceStatus, PageInfoResponse, BoilerPlate } from '../../types/models/home';

export const homeService = {
    getStaffDetailForHome: async (): Promise<StaffProfile> => {
        const response = await apiClient.get<StaffProfile>(`${API_CONFIG.SchoolServiceUrl}/GetStaffDetailForHome`);
        return response.data;
    },

    getTodayStaffAttendance: async (): Promise<AttendanceStatus> => {
        const response = await apiClient.get<AttendanceStatus>(`${API_CONFIG.SchoolServiceUrl}/GetTodayStaffAttendanceByLoginID`);
        return response.data;
    },

    getPageInfo: async (): Promise<BoilerPlate[]> => {
        // PageID 109 is used in legacy app for home screen banners
        const response = await apiClient.get<PageInfoResponse>(`${API_CONFIG.RootUrl}/GetPageInfo`, {
            params: {
                pageID: 109,
                parameter: ''
            }
        });
        return response.data?.BoilerPlates || [];
    },

    getMyClassCount: async (): Promise<number> => {
        const response = await apiClient.get<number>(`${API_CONFIG.SchoolServiceUrl}/GetMyClassCount`);
        return response.data;
    },

    getEmployeeAssignmentsCount: async (): Promise<number> => {
        const response = await apiClient.get<number>(`${API_CONFIG.SchoolServiceUrl}/GetEmployeeAssignmentsCount`);
        return response.data;
    },

    getMyLessonPlanCount: async (): Promise<number> => {
        const response = await apiClient.get<number>(`${API_CONFIG.SchoolServiceUrl}/GetMyLessonPlanCount`);
        return response.data;
    },

    getLatestStaffCircularCount: async (): Promise<number> => {
        const response = await apiClient.get<number>(`${API_CONFIG.SchoolServiceUrl}/GetLatestStaffCircularCount`);
        return response.data;
    },

    getMyNotificationCount: async (): Promise<number> => {
        const response = await apiClient.get<number>(`${API_CONFIG.SchoolServiceUrl}/GetMyNotificationCount`);
        return response.data;
    },

    getNotesCount: async (): Promise<number> => {
        try {
            const response = await apiClient.get<number>(`${API_CONFIG.SchoolServiceUrl}/GetNotesCount`);
            return response.data || 0;
        } catch (error) {
            console.error('Error fetching notes count:', error);
            return 0;
        }
    },

    getStudentAttendanceCount: async (): Promise<number> => {
        try {
            const response = await apiClient.get<number>(`${API_CONFIG.SchoolServiceUrl}/GetStudentAttendanceCount`);
            return response.data || 0;
        } catch (error) {
            console.error('Error fetching student attendance count:', error);
            return 0;
        }
    },
};
