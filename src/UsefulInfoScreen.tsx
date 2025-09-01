import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Linking,
  Alert,
  AccessibilityInfo
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from './supabaseClient';

interface Company {
  id: string;
  name: string;
  email: string;
  transport_type: string;
  website?: string;
  phone?: string;
  address?: string;
  category?: 'bus_company' | 'regulatory_body';
  priority?: 'must' | 'should' | 'could';
  region?: string;
  notes?: string;
}

interface UsefulInfo {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: number;
  region?: string;
}

interface Props {
  navigation: any;
}

const UsefulInfoScreen: React.FC<Props> = ({ navigation }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [usefulInfo, setUsefulInfo] = useState<UsefulInfo[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [filteredInfo, setFilteredInfo] = useState<UsefulInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'companies' | 'regulatory' | 'info'>('all');
  const [loading, setLoading] = useState(true);
  const [focusedItem, setFocusedItem] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [companies, usefulInfo, searchQuery, selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch companies (both bus companies and regulatory bodies)
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .in('category', ['bus_company', 'regulatory_body'])
        .order('priority', { ascending: false });

      if (companiesError) throw companiesError;

      // Fetch useful information
      const { data: infoData, error: infoError } = await supabase
        .from('useful_info')
        .select('*')
        .order('priority', { ascending: true });

      if (infoError) throw infoError;

      setCompanies(companiesData || []);
      setUsefulInfo(infoData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filteredCompaniesData = companies;
    let filteredInfoData = usefulInfo;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredCompaniesData = companies.filter(company =>
        company.name.toLowerCase().includes(query) ||
        company.notes?.toLowerCase().includes(query) ||
        company.region?.toLowerCase().includes(query)
      );
      filteredInfoData = usefulInfo.filter(info =>
        info.title.toLowerCase().includes(query) ||
        info.content.toLowerCase().includes(query) ||
        info.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'companies') {
        filteredCompaniesData = filteredCompaniesData.filter(c => c.category === 'bus_company');
        filteredInfoData = [];
      } else if (selectedCategory === 'regulatory') {
        filteredCompaniesData = filteredCompaniesData.filter(c => c.category === 'regulatory_body');
        filteredInfoData = [];
      } else if (selectedCategory === 'info') {
        filteredCompaniesData = [];
      }
    }

    setFilteredCompanies(filteredCompaniesData);
    setFilteredInfo(filteredInfoData);
  };

  const handleContactPress = async (type: 'email' | 'phone' | 'website', value: string) => {
    try {
      let url = '';
      if (type === 'email') {
        url = `mailto:${value}`;
      } else if (type === 'phone') {
        url = `tel:${value}`;
      } else if (type === 'website') {
        url = value.startsWith('http') ? value : `https://${value}`;
      }

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open ${type} link`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open ${type}`);
    }
  };

  const renderCompanyItem = ({ item }: { item: Company }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialIcons
          name={item.category === 'regulatory_body' ? 'gavel' : 'directions-bus'}
          size={24}
          color="#007bff"
        />
        <Text style={styles.cardTitle}>{item.name}</Text>
        {item.priority && (
          <Text style={[styles.priorityBadge, getPriorityStyle(item.priority)]}>
            {item.priority.toUpperCase()}
          </Text>
        )}
      </View>

      <Text style={styles.regionText}>{item.region}</Text>

      {item.email && (
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => handleContactPress('email', item.email)}
          accessibilityLabel={`Email ${item.name}`}
          accessibilityHint="Opens email client to contact this organization"
        >
          <MaterialIcons name="email" size={16} color="#007bff" />
          <Text style={styles.contactText}>{item.email}</Text>
        </TouchableOpacity>
      )}

      {item.phone && (
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => handleContactPress('phone', item.phone!)}
          accessibilityLabel={`Call ${item.name}`}
          accessibilityHint="Initiates phone call to this organization"
        >
          <MaterialIcons name="phone" size={16} color="#007bff" />
          <Text style={styles.contactText}>{item.phone}</Text>
        </TouchableOpacity>
      )}

      {item.website && (
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => handleContactPress('website', item.website!)}
          accessibilityLabel={`Visit ${item.name} website`}
          accessibilityHint="Opens website in browser"
        >
          <MaterialIcons name="web" size={16} color="#007bff" />
          <Text style={styles.contactText}>Website</Text>
        </TouchableOpacity>
      )}

      {item.notes && (
        <Text style={styles.notesText}>{item.notes}</Text>
      )}
    </View>
  );

  const renderInfoItem = ({ item }: { item: UsefulInfo }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialIcons name="info" size={24} color="#28a745" />
        <Text style={styles.cardTitle}>{item.title}</Text>
      </View>

      <Text style={styles.categoryText}>Category: {item.category.replace('_', ' ')}</Text>
      <Text style={styles.contentText}>{item.content}</Text>
    </View>
  );

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'must': return styles.mustPriority;
      case 'should': return styles.shouldPriority;
      case 'could': return styles.couldPriority;
      default: return {};
    }
  };

  const categoryButtons = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'companies', label: 'Companies', icon: 'business' },
    { key: 'regulatory', label: 'Regulatory', icon: 'gavel' },
    { key: 'info', label: 'Info', icon: 'info' },
  ];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">Useful Information</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search companies, information..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search input field"
          accessibilityHint="Type to search for companies or information"
        />
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            accessibilityLabel="Clear search"
            accessibilityHint="Clears the search input"
          >
            <MaterialIcons name="clear" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        {categoryButtons.map(button => (
          <TouchableOpacity
            key={button.key}
            style={[
              styles.categoryButton,
              selectedCategory === button.key && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(button.key as any)}
            accessibilityLabel={`Filter by ${button.label}`}
            accessibilityHint={`Shows ${button.label.toLowerCase()} information`}
          >
            <MaterialIcons
              name={button.icon as any}
              size={16}
              color={selectedCategory === button.key ? '#fff' : '#007bff'}
            />
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === button.key && styles.categoryButtonTextActive
            ]}>
              {button.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <FlatList
        data={[
          ...filteredCompanies.map(company => ({ ...company, type: 'company' })),
          ...filteredInfo.map(info => ({ ...info, type: 'info' }))
        ]}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={({ item }) =>
          item.type === 'company'
            ? renderCompanyItem({ item: item as Company })
            : renderInfoItem({ item: item as UsefulInfo })
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No information found</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  categoryButtonActive: {
    backgroundColor: '#007bff',
  },
  categoryButtonText: {
    marginLeft: 5,
    color: '#007bff',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  priorityBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    color: '#fff',
  },
  mustPriority: {
    backgroundColor: '#dc3545',
  },
  shouldPriority: {
    backgroundColor: '#ffc107',
  },
  couldPriority: {
    backgroundColor: '#28a745',
  },
  regionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  contactText: {
    marginLeft: 8,
    color: '#007bff',
    fontSize: 14,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  contentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default UsefulInfoScreen;