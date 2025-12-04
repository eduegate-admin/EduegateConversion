import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, StatusBar, Linking} from 'react-native';
import {Text, Card, IconButton, TextInput, Button, Snackbar} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

export default function ContactUsScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    if (!name || !email || !subject || !message) {
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSuccess('Message sent successfully!');
    setLoading(false);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  const openPhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const openEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const openWebsite = (url: string) => {
    Linking.openURL(url);
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
          <Text style={styles.headerTitle}>Contact Us</Text>
          <Text style={styles.headerSubtitle}>We'd love to hear from you</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Get In Touch
            </Text>
            <View style={styles.contactItem}>
              <IconButton icon="phone" iconColor="#1976d2" size={24} />
              <View style={styles.contactInfo}>
                <Text variant="bodySmall" style={styles.contactLabel}>
                  Phone
                </Text>
                <Text
                  variant="bodyMedium"
                  style={styles.contactValue}
                  onPress={() => openPhone('+971-4-1234567')}>
                  +971-4-1234567
                </Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <IconButton icon="email" iconColor="#1976d2" size={24} />
              <View style={styles.contactInfo}>
                <Text variant="bodySmall" style={styles.contactLabel}>
                  Email
                </Text>
                <Text
                  variant="bodyMedium"
                  style={styles.contactValue}
                  onPress={() => openEmail('support@itrade.ae')}>
                  support@itrade.ae
                </Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <IconButton icon="web" iconColor="#1976d2" size={24} />
              <View style={styles.contactInfo}>
                <Text variant="bodySmall" style={styles.contactLabel}>
                  Website
                </Text>
                <Text
                  variant="bodyMedium"
                  style={styles.contactValue}
                  onPress={() => openWebsite('https://www.itrade.ae')}>
                  www.itrade.ae
                </Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <IconButton icon="map-marker" iconColor="#1976d2" size={24} />
              <View style={styles.contactInfo}>
                <Text variant="bodySmall" style={styles.contactLabel}>
                  Address
                </Text>
                <Text variant="bodyMedium" style={styles.contactText}>
                  Dubai Silicon Oasis{'\n'}Dubai, United Arab Emirates
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Send Us A Message
            </Text>
            <TextInput
              label="Your Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="outlined"
              disabled={loading}
            />
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              disabled={loading}
            />
            <TextInput
              label="Subject"
              value={subject}
              onChangeText={setSubject}
              style={styles.input}
              mode="outlined"
              disabled={loading}
            />
            <TextInput
              label="Message"
              value={message}
              onChangeText={setMessage}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={5}
              disabled={loading}
            />
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={loading}
              disabled={loading || !name || !email || !subject || !message}>
              Send Message
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Business Hours
            </Text>
            <View style={styles.hoursRow}>
              <Text variant="bodyMedium" style={styles.hoursDay}>
                Monday - Friday
              </Text>
              <Text variant="bodyMedium" style={styles.hoursTime}>
                9:00 AM - 6:00 PM
              </Text>
            </View>
            <View style={styles.hoursRow}>
              <Text variant="bodyMedium" style={styles.hoursDay}>
                Saturday
              </Text>
              <Text variant="bodyMedium" style={styles.hoursTime}>
                9:00 AM - 2:00 PM
              </Text>
            </View>
            <View style={styles.hoursRow}>
              <Text variant="bodyMedium" style={styles.hoursDay}>
                Sunday
              </Text>
              <Text variant="bodyMedium" style={styles.hoursTime}>
                Closed
              </Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess('')}
        duration={3000}
        style={styles.snackbar}>
        {success}
      </Snackbar>
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
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    color: '#999',
    marginBottom: 4,
  },
  contactValue: {
    color: '#1976d2',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  contactText: {
    color: '#666',
    lineHeight: 20,
  },
  input: {
    marginBottom: 15,
  },
  submitButton: {
    marginTop: 5,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  hoursDay: {
    color: '#666',
  },
  hoursTime: {
    color: '#333',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 30,
  },
  snackbar: {
    backgroundColor: '#388e3c',
  },
});
