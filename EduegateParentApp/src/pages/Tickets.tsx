import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { studentService } from '../services/student/studentService';
import { theme } from '../constants/theme';

interface Ticket {
    TicketIID: number;
    TicketNo: string;
    Subject: string;
    DocumentTypeName: string;
    TicketStatus: string;
    FromDueDateString: string;
    ToDueDateString: string;
    Description: string;
    TicketCommunications: any[];
}

export const Tickets = () => {
    const navigation = useNavigation();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedTicket, setExpandedTicket] = useState<number | null>(null);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            setIsLoading(true);
            const data = await studentService.getTickets();
            setTickets(data);
            // Expand first ticket by default
            if (data.length > 0) {
                setExpandedTicket(data[0].TicketIID);
            }
        } catch (error) {
            console.error('Failed to load tickets', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleExpand = (ticketId: number) => {
        setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Opened':
                return '#ff9800'; // warning/orange
            case 'Assigned':
                return '#2196f3'; // info/blue
            case 'Hold':
                return '#f44336'; // danger/red
            case 'Closed':
                return '#4caf50'; // success/green
            default:
                return '#757575'; // gray
        }
    };

    const stripHtmlTags = (html: string) => {
        if (!html) return '';
        return html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .trim();
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
                <Text style={styles.headerTitle}>Ticket</Text>
                <TouchableOpacity style={styles.generateButton}>
                    <Text style={styles.generateButtonText}>Generate</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {tickets.length > 0 ? (
                    tickets.map((ticket) => {
                        const isExpanded = expandedTicket === ticket.TicketIID;

                        return (
                            <View key={ticket.TicketIID} style={styles.ticketCard}>
                                {/* Ticket Header */}
                                <View style={styles.ticketHeader}>
                                    <Text style={styles.ticketNumber}>
                                        Ticket No: {ticket.TicketNo}
                                    </Text>
                                </View>

                                {/* Ticket Body */}
                                <View style={styles.ticketBody}>
                                    <TouchableOpacity
                                        style={styles.ticketSummary}
                                        onPress={() => toggleExpand(ticket.TicketIID)}
                                    >
                                        <View style={styles.iconContainer}>
                                            <Text style={styles.iconText}>🎧</Text>
                                        </View>
                                        <View style={styles.ticketInfo}>
                                            <Text style={styles.subject}>{ticket.Subject}</Text>
                                            <Text style={styles.category}>{ticket.DocumentTypeName}</Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.TicketStatus) }]}>
                                            <Text style={styles.statusText}>{ticket.TicketStatus}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    {isExpanded && (
                                        <View style={styles.ticketDetails}>
                                            <View style={styles.separator} />

                                            {/* Dates */}
                                            <View style={styles.dateRow}>
                                                <Text style={styles.dateLabel}>Ticket date</Text>
                                                <Text style={styles.dateColon}>:</Text>
                                                <Text style={styles.dateValue}>{ticket.FromDueDateString}</Text>
                                            </View>

                                            <View style={styles.dateRow}>
                                                <Text style={styles.dateLabel}>Resolution date</Text>
                                                <Text style={styles.dateColon}>:</Text>
                                                <Text style={styles.dateValue}>{ticket.ToDueDateString}</Text>
                                            </View>

                                            {/* Description */}
                                            {ticket.Description && (
                                                <Text style={styles.description}>
                                                    {stripHtmlTags(ticket.Description)}
                                                </Text>
                                            )}

                                            {/* Communications */}
                                            {ticket.TicketCommunications && ticket.TicketCommunications.length > 0 && (
                                                <>
                                                    <View style={styles.separator} />
                                                    <Text style={styles.communicationTitle}>Communication</Text>
                                                    {ticket.TicketCommunications.map((comm, index) => (
                                                        <View key={index} style={styles.communicationItem}>
                                                            <View style={styles.commHeader}>
                                                                <Text style={styles.commDate}>{comm.CommunicationStringDate}</Text>
                                                                <Text style={styles.commUser}>{comm.CommunicationUser}</Text>
                                                            </View>
                                                            <View style={styles.commBubble}>
                                                                <Text style={styles.commText}>
                                                                    {stripHtmlTags(comm.Notes)}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    ))}
                                                </>
                                            )}
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🎫</Text>
                        <Text style={styles.emptyTitle}>
                            There are currently {'\n'}no <Text style={styles.emptyBold}>support tickets.</Text>
                        </Text>
                    </View>
                )}
            </ScrollView>
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    generateButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    generateButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
    },
    ticketCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        overflow: 'hidden',
    },
    ticketHeader: {
        backgroundColor: theme.colors.primary,
        padding: 12,
    },
    ticketNumber: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    ticketBody: {
        padding: 16,
    },
    ticketSummary: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 12,
    },
    iconText: {
        fontSize: 32,
    },
    ticketInfo: {
        flex: 1,
    },
    subject: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    category: {
        fontSize: 14,
        color: '#666',
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    ticketDetails: {
        marginTop: 16,
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 12,
    },
    dateRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    dateLabel: {
        width: 110,
        fontSize: 14,
        color: '#666',
    },
    dateColon: {
        width: 36,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    dateValue: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    description: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginTop: 12,
    },
    communicationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    communicationItem: {
        marginBottom: 12,
    },
    commHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    commDate: {
        fontSize: 12,
        color: '#999',
        marginRight: 8,
    },
    commUser: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    commBubble: {
        backgroundColor: '#e3f2fd',
        padding: 12,
        borderRadius: 8,
        maxWidth: '80%',
    },
    commText: {
        fontSize: 14,
        color: '#333',
    },
    emptyState: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        lineHeight: 26,
    },
    emptyBold: {
        fontWeight: 'bold',
    },
});

export default Tickets;
