import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons } from '@expo/vector-icons'
import { signOut } from './supabaseClient'

interface HomeScreenProps {
  route: any;
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ route, navigation }) => {
  const user = route.params?.user;
  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      console.error('Error signing out:', error.message)
    }
  } 

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.content}>
        <MaterialIcons name="home" size={60} color="#fff" style={styles.icon} />
        <Text style={styles.title}>Late Again</Text>
        <Text style={styles.email}>Logged in as: {user?.email}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CompanyList')}>
          <MaterialIcons name="business" size={20} color="#fff" />
          <Text style={styles.buttonText}>Manage Companies</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('QuickReporting')}>
          <MaterialIcons name="report" size={20} color="#fff" />
          <Text style={styles.buttonText}>Quick Reporting</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.signOutButton]} onPress={handleSignOut}>
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 10,
    width: '80%',
    justifyContent: 'center',
  },
  signOutButton: {
    backgroundColor: 'rgba(219, 68, 55, 0.8)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
})

export default HomeScreen