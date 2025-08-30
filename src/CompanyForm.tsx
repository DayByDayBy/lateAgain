import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { supabase } from './supabaseClient';

interface Company {
  id?: string;
  name: string;
  email: string;
  transport_type: string;
  notes: string;
}

interface Props {
  navigation: any;
  route: any;
}

const CompanyForm: React.FC<Props> = ({ navigation, route }) => {
  const [company, setCompany] = useState<Company>({
    name: '',
    email: '',
    transport_type: '',
    notes: '',
  });

  useEffect(() => {
    if (route.params?.company) {
      setCompany(route.params.company);
    }
  }, [route.params]);

  const saveCompany = async () => {
    if (company.id) {
      // Update
      const { error } = await supabase
        .from('companies')
        .update(company)
        .eq('id', company.id);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        navigation.goBack();
      }
    } else {
      // Insert
      const { error } = await supabase.from('companies').insert(company);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        navigation.goBack();
      }
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        placeholder="Name"
        value={company.name}
        onChangeText={(text) => setCompany({ ...company, name: text })}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Email"
        value={company.email}
        onChangeText={(text) => setCompany({ ...company, email: text })}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Transport Type"
        value={company.transport_type}
        onChangeText={(text) => setCompany({ ...company, transport_type: text })}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Notes"
        value={company.notes}
        onChangeText={(text) => setCompany({ ...company, notes: text })}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        multiline
      />
      <TouchableOpacity
        onPress={saveCompany}
        style={{ backgroundColor: 'green', padding: 10 }}
      >
        <Text style={{ color: 'white' }}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CompanyForm;