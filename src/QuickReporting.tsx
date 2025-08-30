import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';

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
  const [previewText, setPreviewText] = useState<string>('');
  const [drafts, setDrafts] = useState<any[]>([]);

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
    setPreviewText(text);
  };

  const sendEmail = async () => {
    if (!selectedCompany) return;
    try {
      // Simulate sending with timeout
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate success or failure
          if (Math.random() > 0.5) { // 50% chance of failure for testing
            resolve(true);
          } else {
            reject(new Error('Send failed'));
          }
        }, 2000); // 2s for testing, change to 60000 for 60s
      });
      Alert.alert('Email Sent', `Email sent to ${selectedCompany.email}`);
    } catch (error) {
      // Save to drafts
      const draft = {
        id: Date.now().toString(),
        company: selectedCompany,
        route: selectedRoute,
        issue: selectedIssue,
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
      // Simulate resend
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert('Resent', `Email resent to ${draft.company.email}`);
      // Remove from drafts
      const newDrafts = drafts.filter(d => d.id !== draft.id);
      setDrafts(newDrafts);
      await AsyncStorage.setItem('drafts', JSON.stringify(newDrafts));
    } catch (error) {
      Alert.alert('Resend Failed', 'Failed to resend.');
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
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
      />

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
              >
                <Text>Route {item.route_number}: {item.description}</Text>
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
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
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </>
      )}

      {previewText ? (
        <>
          <Text style={styles.label}>Email Preview:</Text>
          <Text style={styles.preview}>{previewText}</Text>
          <TouchableOpacity style={styles.sendButton} onPress={sendEmail}>
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
});

export default QuickReporting;