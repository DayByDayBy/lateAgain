import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, AccessibilityInfo } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons } from '@expo/vector-icons'
import { signOut } from './supabaseClient'

interface HomeScreenProps {
  route: any;
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ route, navigation }) => {
  const user = route.params?.user;
  const [focusedButton, setFocusedButton] = useState<string | null>(null);

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      console.error('Error signing out:', error.message)
      AccessibilityInfo.announceForAccessibility('Sign out failed. Please try again.')
    } else {
      AccessibilityInfo.announceForAccessibility('Successfully signed out.')
    }
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.content}>
        <MaterialIcons name="home" size={60} color="#fff" style={styles.icon} />
        <Text style={styles.title} accessibilityRole="header">Late Again</Text>
        <Text style={styles.email}>Logged in as: {user?.email}</Text>
        <TouchableOpacity
          style={[styles.button, focusedButton === 'manage' && styles.focusedButton]}
          onPress={() => navigation.navigate('CompanyList')}
          accessibilityLabel="Manage Companies"
          accessibilityRole="button"
          accessibilityHint="Navigate to the company management screen"
          onFocus={() => setFocusedButton('manage')}
          onBlur={() => setFocusedButton(null)}
        >
          <MaterialIcons name="business" size={20} color="#fff" />
          <Text style={styles.buttonText}>Manage Companies</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, focusedButton === 'report' && styles.focusedButton]}
          onPress={() => navigation.navigate('QuickReporting')}
          accessibilityLabel="Quick Reporting"
          accessibilityRole="button"
          accessibilityHint="Navigate to the quick reporting screen for delay complaints"
          onFocus={() => setFocusedButton('report')}
          onBlur={() => setFocusedButton(null)}
        >
          <MaterialIcons name="report" size={20} color="#fff" />
          <Text style={styles.buttonText}>Quick Reporting</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.signOutButton, focusedButton === 'signout' && styles.focusedButton]}
          onPress={handleSignOut}
          accessibilityLabel="Sign Out"
          accessibilityRole="button"
          accessibilityHint="Sign out of your account"
          onFocus={() => setFocusedButton('signout')}
          onBlur={() => setFocusedButton(null)}
        >
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
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 10,
    width: '80%',
    justifyContent: 'center',
    minHeight: 44,
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
  focusedButton: {
    borderWidth: 2,
    borderColor: '#fff',
  },
})

export default HomeScreen