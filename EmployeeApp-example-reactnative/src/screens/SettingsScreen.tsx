import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, StatusBar} from 'react-native';
import {
  Text,
  Card,
  List,
  Switch,
  Divider,
  IconButton,
  Button,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {logout} from '../store/authSlice';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);

  const [settings, setSettings] = useState({
    notifications: true,
    locationTracking: true,
    autoRefresh: false,
    soundEffects: true,
    darkMode: false,
  });

  const toggleSetting = (key: string) => {
    setSettings(prev => ({...prev, [key]: !prev[key as keyof typeof prev]}));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

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
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your preferences</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Account
            </Text>
            <List.Item
              title="My Account"
              description={user?.email || 'View account details'}
              left={props => <List.Icon {...props} icon="account-circle" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('MyAccount' as never)}
            />
            <Divider />
            <List.Item
              title="Change Password"
              description="Update your password"
              left={props => <List.Icon {...props} icon="lock-reset" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('ChangePassword' as never)}
            />
          </Card.Content>
        </Card>

        {/* Preferences */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Preferences
            </Text>
            <List.Item
              title="Notifications"
              description="Enable push notifications"
              left={props => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={settings.notifications}
                  onValueChange={() => toggleSetting('notifications')}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Location Tracking"
              description="Allow location access"
              left={props => <List.Icon {...props} icon="map-marker" />}
              right={() => (
                <Switch
                  value={settings.locationTracking}
                  onValueChange={() => toggleSetting('locationTracking')}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Auto Refresh"
              description="Automatically refresh data"
              left={props => <List.Icon {...props} icon="refresh" />}
              right={() => (
                <Switch
                  value={settings.autoRefresh}
                  onValueChange={() => toggleSetting('autoRefresh')}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Sound Effects"
              description="Enable sound notifications"
              left={props => <List.Icon {...props} icon="volume-high" />}
              right={() => (
                <Switch
                  value={settings.soundEffects}
                  onValueChange={() => toggleSetting('soundEffects')}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Dark Mode"
              description="Use dark theme"
              left={props => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={settings.darkMode}
                  onValueChange={() => toggleSetting('darkMode')}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Information
            </Text>
            <List.Item
              title="About Us"
              description="Learn about our company"
              left={props => <List.Icon {...props} icon="information" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('AboutUs' as never)}
            />
            <Divider />
            <List.Item
              title="Contact Us"
              description="Get in touch with support"
              left={props => <List.Icon {...props} icon="email" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('ContactUs' as never)}
            />
            <Divider />
            <List.Item
              title="Terms & Conditions"
              description="View terms of service"
              left={props => <List.Icon {...props} icon="file-document" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Terms' as never)}
            />
            <Divider />
            <List.Item
              title="App Version"
              description="1.0.0"
              left={props => <List.Icon {...props} icon="application" />}
            />
          </Card.Content>
        </Card>

        {/* Logout */}
        <Card style={styles.card}>
          <Card.Content>
            <Button
              mode="outlined"
              onPress={handleLogout}
              icon="logout"
              textColor="#d32f2f"
              style={styles.logoutButton}>
              Logout
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logoutButton: {
    borderColor: '#d32f2f',
  },
  bottomSpacing: {
    height: 30,
  },
});
