import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, AccessibilityInfo, StyleSheet } from 'react-native';
import { supabase, getUserProfile } from './supabaseClient';

interface Company {
  id: string;
  name: string;
  email: string;
  transport_type: string;
  notes: string;
}

interface Props {
  navigation: any;
}

const CompanyList: React.FC<Props> = ({ navigation }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [focusedItem, setFocusedItem] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    const profile = await getUserProfile();
    setUserRole(profile?.role || null);
  };

  const fetchCompanies = async () => {
    const { data, error } = await supabase.from('companies').select('*');
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setCompanies(data || []);
    }
  };

  const deleteCompany = async (id: string) => {
    const { error } = await supabase.from('companies').delete().eq('id', id);
    if (error) {
      Alert.alert('Error', error.message);
      AccessibilityInfo.announceForAccessibility('Failed to delete company. Please try again.');
    } else {
      fetchCompanies();
      AccessibilityInfo.announceForAccessibility('Company deleted successfully.');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Company', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', onPress: () => deleteCompany(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">Company List</Text>
      {userRole === 'admin' && (
        <TouchableOpacity
          onPress={() => navigation.navigate('CompanyForm')}
          style={[styles.addButton, focusedItem === 'add' && styles.focusedButton]}
          accessibilityLabel="Add new company"
          accessibilityRole="button"
          accessibilityHint="Navigate to add a new company form"
          onFocus={() => setFocusedItem('add')}
          onBlur={() => setFocusedItem(null)}
        >
          <Text style={styles.addButtonText}>Add Company</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={companies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.companyItem} accessibilityLabel={`Company: ${item.name}, Email: ${item.email}`}>
            <Text style={styles.companyName}>{item.name}</Text>
            <Text style={styles.companyEmail}>{item.email}</Text>
            {userRole === 'admin' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('CompanyForm', { company: item })}
                  style={[styles.actionButton, focusedItem === `edit-${item.id}` && styles.focusedButton]}
                  accessibilityLabel={`Edit ${item.name}`}
                  accessibilityRole="button"
                  accessibilityHint="Edit this company's details"
                  onFocus={() => setFocusedItem(`edit-${item.id}`)}
                  onBlur={() => setFocusedItem(null)}
                >
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  style={[styles.actionButton, focusedItem === `delete-${item.id}` && styles.focusedButton]}
                  accessibilityLabel={`Delete ${item.name}`}
                  accessibilityRole="button"
                  accessibilityHint="Delete this company"
                  onFocus={() => setFocusedItem(`delete-${item.id}`)}
                  onBlur={() => setFocusedItem(null)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
    alignItems: 'center',
    minHeight: 44,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
  companyItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  companyEmail: {
    fontSize: 16,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    minHeight: 44,
    minWidth: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editText: {
    color: 'blue',
    fontSize: 16,
  },
  deleteText: {
    color: 'red',
    fontSize: 16,
  },
  focusedButton: {
    borderWidth: 2,
    borderColor: '#000',
  },
});

export default CompanyList;