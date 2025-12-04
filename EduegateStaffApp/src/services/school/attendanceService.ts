import { apiClient } from '../api/client';
import { API_CONFIG } from '../../constants/config';
import { TeacherClass, Student, AttendanceRecord } from '../../types/models/attendance';

export const attendanceService = {
    /**
     * Get all classes assigned to the teacher
     */
    getTeacherClasses: async (): Promise<TeacherClass[]> => {
        try {
            const response = await apiClient.get<TeacherClass[]>(`${API_CONFIG.SchoolServiceUrl}/GetTeacherClass`);
            console.log('✅ Loaded teacher classes:', response.data.length);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to load teacher classes:', error);
            throw error;
        }
    },

    /**
     * Get students in a specific class and section
     */
    getStudentsByClassSection: async (
        classId: number,
        sectionId: number
    ): Promise<Student[]> => {
        try {
            const response = await apiClient.get<Student[]>(
                `${API_CONFIG.SchoolServiceUrl}/GetStudentsByTeacherClassAndSection`,
                {
                    params: {
                        classID: classId,
                        sectionID: sectionId,
                    },
                }
            );
            console.log('✅ Loaded students:', response.data.length);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to load students:', error);
            throw error;
        }
    },

    /**
     * Submit attendance for students
     */
    submitAttendance: async (
        attendanceRecords: AttendanceRecord[]
    ): Promise<void> => {
        try {
            await apiClient.post(`${API_CONFIG.SchoolServiceUrl}/SubmitAttendance`, attendanceRecords);
            console.log('✅ Attendance submitted successfully');
        } catch (error) {
            console.error('❌ Failed to submit attendance:', error);
            throw error;
        }
    },
};

export default attendanceService;
