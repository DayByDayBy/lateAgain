import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
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
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [transportTypeError, setTransportTypeError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name: string) => {
    return name.trim().length > 0;
  };

  const validateTransportType = (type: string) => {
    return type.trim().length > 0;
  };

  const sanitizeInput = (input: string) => {
    return input.trim();
  };

  useEffect(() => {
    if (route.params?.company) {
      setCompany(route.params.company);
    }
  }, [route.params]);

  const handleNameChange = (text: string) => {
    const sanitized = sanitizeInput(text);
    setCompany({ ...company, name: sanitized });
    if (sanitized && !validateName(sanitized)) {
      setNameError('Name is required.');
    } else {
      setNameError('');
    }
  };

  const handleEmailChange = (text: string) => {
    const sanitized = sanitizeInput(text);
    setCompany({ ...company, email: sanitized });
    if (sanitized && !validateEmail(sanitized)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const handleTransportTypeChange = (text: string) => {
    const sanitized = sanitizeInput(text);
    setCompany({ ...company, transport_type: sanitized });
    if (sanitized && !validateTransportType(sanitized)) {
      setTransportTypeError('Transport type is required.');
    } else {
      setTransportTypeError('');
    }
  };

  const handleNotesChange = (text: string) => {
    const sanitized = sanitizeInput(text);
    setCompany({ ...company, notes: sanitized });
  };

  const saveCompany = async () => {
    setGeneralError('');
    const sanitizedCompany = {
      ...company,
      name: sanitizeInput(company.name),
      email: sanitizeInput(company.email),
      transport_type: sanitizeInput(company.transport_type),
      notes: sanitizeInput(company.notes),
    };

    let hasError = false;
    if (!validateName(sanitizedCompany.name)) {
      setNameError('Name is required.');
      hasError = true;
    }
    if (!validateEmail(sanitizedCompany.email)) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    }
    if (!validateTransportType(sanitizedCompany.transport_type)) {
      setTransportTypeError('Transport type is required.');
      hasError = true;
    }
    if (hasError) return;

    if (company.id) {
      // Update
      const { error } = await supabase
        .from('companies')
        .update(sanitizedCompany)
        .eq('id', company.id);
      if (error) {
        setGeneralError(error.message);
      } else {
        navigation.goBack();
      }
    } else {
      // Insert
      const { error } = await supabase.from('companies').insert(sanitizedCompany);
      if (error) {
        setGeneralError(error.message);
      } else {
        navigation.goBack();
      }
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Name"
        value={company.name}
        onChangeText={handleNameChange}
        style={styles.input}
        accessibilityLabel="Company name input field"
      />
      {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
      <TextInput
        placeholder="Email"
        value={company.email}
        onChangeText={handleEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        accessibilityLabel="Company email input field"
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      <TextInput
        placeholder="Transport Type"
        value={company.transport_type}
        onChangeText={handleTransportTypeChange}
        style={styles.input}
        accessibilityLabel="Transport type input field"
      />
      {transportTypeError ? <Text style={styles.errorText}>{transportTypeError}</Text> : null}
      <TextInput
        placeholder="Notes"
        value={company.notes}
        onChangeText={handleNotesChange}
        style={styles.input}
        multiline
        accessibilityLabel="Notes input field"
      />
      {generalError ? <Text style={styles.errorText}>{generalError}</Text> : null}
      <TouchableOpacity
        onPress={saveCompany}
        style={styles.button}
        accessibilityLabel="Save company button"
      >
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default CompanyForm;