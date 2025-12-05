import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { studentService } from '../services/student/studentService';
import { theme } from '../constants/theme';
import { BottomMenu } from '../components/BottomMenu';

interface LibraryTransaction {
    BookTitle: string;
    StudentName: string;
    TransactionDate: string;
    ReturnDueDate: string;
    Status: string;
}

export const Library = () => {
    const navigation = useNavigation();
    const [issuedBooks, setIssuedBooks] = useState<LibraryTransaction[]>([]);
    const [returnedBooks, setReturnedBooks] = useState<LibraryTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadLibraryData();
    }, []);

    const loadLibraryData = async () => {
        try {
            setIsLoading(true);
            const [issued, returned] = await Promise.all([
                studentService.getLibraryTransactions('Issue'),
                studentService.getLibraryTransactions('Return')
            ]);
            setIssuedBooks(issued);
            setReturnedBooks(returned);
        } catch (error) {
            console.error('Failed to load library data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const BookCard = ({ book }: { book: LibraryTransaction }) => {
        const isReturned = book.Status === 'Return';

        return (
            <View style={styles.bookCard}>
                <View style={[
                    styles.statusIndicator,
                    { backgroundColor: isReturned ? '#4caf50' : '#ff9800' }
                ]} />

                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View style={styles.bookInfo}>
                            <Text style={styles.bookTitle}>{book.BookTitle}</Text>
                            <View style={styles.studentInfo}>
                                <Text style={styles.studentLabel}>Student: </Text>
                                <Text style={styles.studentName}>{book.StudentName}</Text>
                            </View>
                        </View>
                        <Text style={styles.bookIcon}>📚</Text>
                    </View>

                    <View style={styles.cardFooter}>
                        <View style={styles.dateSection}>
                            <Text style={styles.dateLabel}>Transaction Date:</Text>
                            <Text style={styles.dateValue}>{formatDate(book.TransactionDate)}</Text>
                        </View>

                        <View style={styles.rightSection}>
                            <View style={styles.dateSection}>
                                <Text style={styles.dateLabel}>Return Date:</Text>
                                <Text style={styles.dateValue}>{formatDate(book.ReturnDueDate)}</Text>
                            </View>
                            <View style={styles.statusSection}>
                                <Text style={styles.statusLabel}>Status</Text>
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: isReturned ? '#e8f5e9' : '#fff3cd' }
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        { color: isReturned ? '#388e3c' : '#856404' }
                                    ]}>
                                        {book.Status}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    const EmptyState = ({ message }: { message: string }) => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>ℹ️</Text>
            <Text style={styles.emptyText}>{message}</Text>
        </View>
    );

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
                <Text style={styles.headerTitle}>Library</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Issued Books Section */}
                <Text style={styles.sectionTitle}>Issued</Text>
                {issuedBooks.length > 0 ? (
                    issuedBooks.map((book, index) => (
                        <BookCard key={index} book={book} />
                    ))
                ) : (
                    <EmptyState message="There are currently no library books issued for return." />
                )}

                {/* Returned Books Section */}
                <Text style={[styles.sectionTitle, styles.returnedSection]}>Returned</Text>
                {returnedBooks.length > 0 ? (
                    returnedBooks.map((book, index) => (
                        <BookCard key={index} book={book} />
                    ))
                ) : (
                    <EmptyState message="No books have been returned yet" />
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
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        marginTop: 8,
    },
    returnedSection: {
        marginTop: 24,
    },
    bookCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        flexDirection: 'row',
    },
    statusIndicator: {
        width: 6,
    },
    cardContent: {
        flex: 1,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    bookInfo: {
        flex: 1,
        marginRight: 12,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    studentLabel: {
        fontSize: 14,
        color: '#666',
    },
    studentName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    bookIcon: {
        fontSize: 32,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    dateSection: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    dateValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    rightSection: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-end',
    },
    statusSection: {
        alignItems: 'flex-end',
    },
    statusLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyState: {
        backgroundColor: '#fff3cd',
        borderRadius: 12,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ffc107',
    },
    emptyIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    emptyText: {
        flex: 1,
        fontSize: 14,
        color: '#856404',
        fontWeight: '600',
    },
});

export default Library;
