import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { studentService } from '../services/student/studentService';
import { theme } from '../constants/theme';
import { BottomMenu } from '../components/BottomMenu';

const { width } = Dimensions.get('window');

export const ClassTeachers = () => {
    const navigation = useNavigation();
    const [teachers, setTeachers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedWard, setSelectedWard] = useState<any>(null);

    useEffect(() => {
        loadTeachers();
    }, []);

    const loadTeachers = async () => {
        try {
            setIsLoading(true);
            const storedWard = await AsyncStorage.getItem('selectedWard');
            if (storedWard) {
                const ward = JSON.parse(storedWard);
                setSelectedWard(ward);
                const data = await studentService.getTeacherDetails(ward.StudentIID);
                setTeachers(data);
            }
        } catch (error) {
            console.error('Failed to load teachers', error);
        } finally {
            setIsLoading(false);
        }
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
                <Text style={styles.headerTitle}>Teacher details</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {teachers.length > 0 ? (
                    <View style={styles.grid}>
                        {teachers.map((teacher, index) => (
                            <View key={index} style={styles.cardContainer}>
                                <View style={styles.card}>
                                    <LinearGradient
                                        colors={['#8A52BF', '#317195']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.cardHeader}
                                    />
                                    <View style={styles.cardBody}>
                                        <View style={styles.avatarContainer}>
                                            <Image
                                                source={{ uri: teacher.EmployeeProfileImageUrl || 'https://via.placeholder.com/150' }}
                                                style={styles.avatar}
                                                resizeMode="cover"
                                            />
                                        </View>
                                        <Text style={styles.teacherName} numberOfLines={1}>
                                            {teacher.HeadTeacherName}
                                        </Text>
                                        <Text style={styles.subjectName}>
                                            {teacher.SubjectName}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No teacher details found.</Text>
                    </View>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>
            <BottomMenu />
        </View>
    );
};

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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    cardContainer: {
        width: '48%', // Two columns
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        height: 200,
    },
    cardHeader: {
        height: 60,
        width: '100%',
    },
    cardBody: {
        alignItems: 'center',
        paddingHorizontal: 10,
        marginTop: -30, // Overlap avatar
    },
    avatarContainer: {
        padding: 3,
        backgroundColor: '#fff',
        borderRadius: 40,
        marginBottom: 10,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#eee',
    },
    teacherName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 5,
    },
    subjectName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#7133AD',
        textAlign: 'center',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666',
    },
});

export default ClassTeachers;
