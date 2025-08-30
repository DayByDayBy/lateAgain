import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
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

  useEffect(() => {
    fetchCompanies();
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

  const generatePreview = () => {
    if (!selectedCompany || !selectedRoute || !selectedIssue) return;
    let text = templates[selectedIssue];
    text = text.replace('[Company Name]', selectedCompany.name);
    text = text.replace('[Route Number]', selectedRoute.route_number.toString());
    setPreviewText(text);
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
        </>
      ) : null}
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
});

export default QuickReporting;