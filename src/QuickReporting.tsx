import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, TextInput, AccessibilityInfo } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';
import { sendEmail as sendEmailService, generateEmailSubject } from './emailService';

interface Company {
  id: string;
  name: string;
  email: string;
}

interface Route {
  id: string;
  route_number: number;
  description: string;
}

type IssueType = 'Late' | 'Early' | 'Cancelled' | 'Other';

const templates: Record<IssueType, string> = {
  Late: "Dear [Company Name] Team,\n\nI am writing to report that my recent journey on route [Route Number] was delayed. This has caused inconvenience, and I would appreciate any updates or compensation if applicable.\n\nThank you for your attention to this matter.\n\nBest regards,\n[Your Name]",
  Early: "Dear [Company Name] Team,\n\nI am writing to report that my recent journey on route [Route Number] arrived earlier than scheduled. This has caused inconvenience, and I would appreciate any updates or compensation if applicable.\n\nThank you for your attention to this matter.\n\nBest regards,\n[Your Name]",
  Cancelled: "Dear [Company Name] Team,\n\nI am writing to report that my recent journey on route [Route Number] was cancelled. This has caused significant inconvenience, and I would appreciate any updates or compensation if applicable.\n\nThank you for your attention to this matter.\n\nBest regards,\n[Your Name]",
  Other: "Dear [Company Name] Team,\n\nI am writing to report an issue with my recent journey on route [Route Number]. [Please describe the issue].\n\nThank you for your attention to this matter.\n\nBest regards,\n[Your Name]",
};

interface Props {
  navigation: any;
}

const QuickReporting: React.FC<Props> = ({ navigation }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<IssueType | null>(null);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [previewText, setPreviewText] = useState<string>('');
  const [drafts, setDrafts] = useState<any[]>([]);
  const [companyError, setCompanyError] = useState('');
  const [routeError, setRouteError] = useState('');
  const [issueError, setIssueError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [focusedItem, setFocusedItem] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
    loadDrafts();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchRoutes(selectedCompany.id);
      setSelectedRoute(null);
    } else {
      setRoutes([]);
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedCompany && selectedRoute && selectedIssue) {
      generatePreview();
    } else {
      setPreviewText('');
    }
  }, [selectedCompany, selectedRoute, selectedIssue]);

  const fetchCompanies = async () => {
    const { data, error } = await supabase.from('companies').select('*');
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setCompanies(data || []);
    }
  };

  const fetchRoutes = async (companyId: string) => {
    const { data, error } = await supabase.from('routes').select('*').eq('company_id', companyId);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setRoutes(data || []);
    }
  };

  const loadDrafts = async () => {
    const stored = await AsyncStorage.getItem('drafts');
    if (stored) {
      setDrafts(JSON.parse(stored));
    }
  };

  const generatePreview = () => {
    if (!selectedCompany || !selectedRoute || !selectedIssue) return;
    let text = templates[selectedIssue];
    text = text.replace('[Company Name]', selectedCompany.name);
    text = text.replace('[Route Number]', selectedRoute.route_number.toString());
    if (selectedIssue === 'Other') {
      text = text.replace('[Please describe the issue]', customMessage || '[Please describe the issue]');
    }
    setPreviewText(text);
  };

  const validateForm = () => {
    let hasError = false;

    if (!selectedCompany) {
      setCompanyError('Please select a company.');
      hasError = true;
    } else {
      setCompanyError('');
    }

    if (!selectedRoute) {
      setRouteError('Please select a route.');
      hasError = true;
    } else {
      setRouteError('');
    }

    if (!selectedIssue) {
      setIssueError('Please select an issue.');
      hasError = true;
    } else {
      setIssueError('');
    }

    if (selectedIssue === 'Other') {
      const trimmedMessage = customMessage.trim();
      if (!trimmedMessage) {
        setGeneralError('Please provide a description for the issue.');
        hasError = true;
      } else if (trimmedMessage.length < 10) {
        setGeneralError('Please provide a more detailed description (at least 10 characters).');
        hasError = true;
      } else if (trimmedMessage.length > 500) {
        setGeneralError('Description is too long (maximum 500 characters).');
        hasError = true;
      } else {
        setGeneralError('');
      }
    } else {
      setGeneralError('');
    }

    return !hasError;
  };

  const sendEmail = async () => {
    if (!validateForm()) return;

    try {
      const subject = generateEmailSubject(selectedIssue!, selectedRoute!.route_number, selectedCompany!.name);
      const sanitizedText = previewText.trim(); // Sanitize
      await sendEmailService({
        to: selectedCompany!.email,
        subject,
        text: sanitizedText,
      });
      Alert.alert('Email Sent', `Email sent to ${selectedCompany!.email}`);
      AccessibilityInfo.announceForAccessibility('Email sent successfully.');
    } catch (error: any) {
      console.error('Email send failed:', error);
      // Save to drafts
      const draft = {
        id: Date.now().toString(),
        company: selectedCompany,
        route: selectedRoute,
        issue: selectedIssue,
        customMessage: customMessage.trim(),
        previewText,
      };
      const newDrafts = [...drafts, draft];
      setDrafts(newDrafts);
      await AsyncStorage.setItem('drafts', JSON.stringify(newDrafts));
      Alert.alert('Send Failed', 'Email saved to drafts for later resend.');
    }
  };

  const resendDraft = async (draft: any) => {
    try {
      const subject = generateEmailSubject(draft.issue, draft.route.route_number, draft.company.name);
      await sendEmailService({
        to: draft.company.email,
        subject,
        text: draft.previewText,
      });
      Alert.alert('Resent', `Email resent to ${draft.company.email}`);
      // Remove from drafts
      const newDrafts = drafts.filter(d => d.id !== draft.id);
      setDrafts(newDrafts);
      await AsyncStorage.setItem('drafts', JSON.stringify(newDrafts));
    } catch (error: any) {
      console.error('Resend failed:', error);
      Alert.alert('Resend Failed', 'Failed to resend email.');
    }
  };

  const issues: IssueType[] = ['Late', 'Early', 'Cancelled', 'Other'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Reporting</Text>

      <Text style={styles.label}>Select Company:</Text>
      <FlatList
        data={companies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, selectedCompany?.id === item.id && styles.selected]}
            onPress={() => setSelectedCompany(item)}
            accessibilityLabel={`Select company ${item.name}`}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
      {companyError ? <Text style={styles.errorText}>{companyError}</Text> : null}

      {selectedCompany && (
        <>
          <Text style={styles.label}>Select Route:</Text>
          <FlatList
            data={routes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.item, selectedRoute?.id === item.id && styles.selected]}
                onPress={() => setSelectedRoute(item)}
                accessibilityLabel={`Select route ${item.route_number}: ${item.description}`}
              >
                <Text>Route {item.route_number}: {item.description}</Text>
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
          {routeError ? <Text style={styles.errorText}>{routeError}</Text> : null}
        </>
      )}

      {selectedRoute && (
        <>
          <Text style={styles.label}>Select Issue:</Text>
          <FlatList
            data={issues}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.item, selectedIssue === item && styles.selected]}
                onPress={() => setSelectedIssue(item)}
                accessibilityLabel={`Select ${item} issue`}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
          {issueError ? <Text style={styles.errorText}>{issueError}</Text> : null}
        </>
      )}

      {selectedIssue === 'Other' && (
        <>
          <Text style={styles.label}>Describe the Issue:</Text>
          <TextInput
            style={styles.input}
            value={customMessage}
            onChangeText={setCustomMessage}
            placeholder="Please describe the issue"
            multiline
            accessibilityLabel="Custom issue description input"
          />
        </>
      )}

      {previewText ? (
        <>
          <Text style={styles.label}>Email Preview:</Text>
          <Text style={styles.preview}>{previewText}</Text>
          {generalError ? <Text style={styles.errorText}>{generalError}</Text> : null}
          <TouchableOpacity style={styles.sendButton} onPress={sendEmail} accessibilityLabel="Send email button">
            <Text style={styles.sendButtonText}>Send Email</Text>
          </TouchableOpacity>
        </>
      ) : null}

      {drafts.length > 0 && (
        <>
          <Text style={styles.label}>Drafts:</Text>
          {drafts.map((draft) => (
            <View key={draft.id} style={styles.draftItem}>
              <Text>{draft.previewText.substring(0, 50)}...</Text>
              <TouchableOpacity style={styles.resendButton} onPress={() => resendDraft(draft)}>
                <Text style={styles.resendButtonText}>Resend</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  item: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  selected: {
    backgroundColor: '#e0e0e0',
  },
  preview: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 10,
  },
  sendButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  draftItem: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resendButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
  },
  resendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    fontSize: 16,
    minHeight: 44,
  },
  focusedInput: {
    borderColor: '#007bff',
    borderWidth: 2,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  focusedItem: {
    borderWidth: 2,
    borderColor: '#000',
  },
});

export default QuickReporting;