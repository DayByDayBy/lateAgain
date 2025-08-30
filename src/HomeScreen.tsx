import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { signOut } from './supabaseClient'

interface HomeScreenProps {
  user: any
}

const HomeScreen: React.FC<HomeScreenProps> = ({ user }) => {
  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      console.error('Error signing out:', error.message)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Late Again</Text>
      <Text style={styles.email}>Logged in as: {user?.email}</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  email: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#DB4437',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
})

export default HomeScreen