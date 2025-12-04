import { apiClient } from '../api/client';
import { API_CONFIG } from '../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Student {
    StudentIID: number;
    StudentName: string;
    Class: string;
    Section: string;
    AdmissionNumber: string;
    StudentPhoto: string; // URL or base64?
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
};
