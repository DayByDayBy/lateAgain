import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { supabase } from './supabaseClient';

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

  useEffect(() => {
    fetchCompanies();
  }, []);

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
    } else {
      fetchCompanies();
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Company', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', onPress: () => deleteCompany(id) },
    ]);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TouchableOpacity
        onPress={() => navigation.navigate('CompanyForm')}
        style={{ backgroundColor: 'blue', padding: 10, marginBottom: 20 }}
      >
        <Text style={{ color: 'white' }}>Add Company</Text>
      </TouchableOpacity>
      <FlatList
        data={companies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>{item.name}</Text>
            <Text>{item.email}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CompanyForm', { company: item })}>
              <Text style={{ color: 'blue' }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={{ color: 'red' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default CompanyList;