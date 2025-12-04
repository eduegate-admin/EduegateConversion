import React from 'react';
import {View, StyleSheet, ScrollView, StatusBar} from 'react-native';
import {Text, Card, Avatar, List, Divider, IconButton, Button} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

export default function MyAccountScreen() {
  const navigation = useNavigation();
  const user = useSelector((state: any) => state.auth.user);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" />

      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor="white"
          size={24}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Account</Text>
        </View>
        <IconButton
          icon="pencil"
          iconColor="white"
          size={24}
          onPress={() => {}}
          style={styles.editButton}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <Card.Content>
            <View style={styles.profileHeader}>
              <Avatar.Text
                size={80}
                label={user?.name?.charAt(0) || 'U'}
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Text variant="headlineSmall" style={styles.userName}>
                  {user?.name || 'User Name'}
                </Text>
                <Text variant="bodyMedium" style={styles.userRole}>
                  {user?.department || 'Department'}
                </Text>
                <Text variant="bodySmall" style={styles.userCode}>
                  ID: {user?.employeeId || 'N/A'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Contact Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Contact Information
            </Text>
            <List.Item
              title="Email"
              description={user?.email || 'Not provided'}
              left={props => <List.Icon {...props} icon="email" />}
            />
            <Divider />
            <List.Item
              title="Mobile"
              description="+971 50 123 4567"
              left={props => <List.Icon {...props} icon="phone" />}
            />
            <Divider />
            <List.Item
              title="Department"
              description={user?.department || 'Not assigned'}
              left={props => <List.Icon {...props} icon="office-building" />}
            />
          </Card.Content>
        </Card>

        {/* Employment Details */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Employment Details
            </Text>
            <List.Item
              title="Employee ID"
              description={user?.employeeId || 'N/A'}
              left={props => <List.Icon {...props} icon="badge-account" />}
            />
            <Divider />
            <List.Item
              title="Join Date"
              description="January 15, 2024"
              left={props => <List.Icon {...props} icon="calendar" />}
            />
            <Divider />
            <List.Item
              title="Branch"
              description="Main Branch - Dubai"
              left={props => <List.Icon {...props} icon="store" />}
            />
            <Divider />
            <List.Item
              title="Status"
              description="Active"
              left={props => <List.Icon {...props} icon="check-circle" color="#4caf50" />}
            />
          </Card.Content>
        </Card>

        {/* Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('ChangePassword' as never)}
              icon="lock-reset"
              style={styles.actionButton}>
              Change Password
            </Button>
            <Button
              mode="outlined"
              onPress={() => {}}
              icon="account-edit"
              style={styles.actionButton}>
              Edit Profile
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    backgroundColor: '#1976d2',
    paddingTop: 45,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    margin: 0,
    marginRight: 10,
  },
  editButton: {
    margin: 0,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    marginHorizontal: 20,
    marginTop: -10,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatar: {
    backgroundColor: '#1976d2',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 20,
  },
  userName: {
    fontWeight: 'bold',
    color: '#333',
  },
  userRole: {
    color: '#666',
    marginTop: 4,
  },
  userCode: {
    color: '#999',
    marginTop: 2,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  actionButton: {
    marginBottom: 10,
  },
  bottomSpacing: {
    height: 20,
  },
});
