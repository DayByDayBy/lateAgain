import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { signInWithGoogle } from './supabaseClient'

const LoginScreen = () => {
  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle()
    if (error) {
      console.error('Error signing in:', error.message)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Late Again</Text>
      <TouchableOpacity style={styles.button} onPress={handleGoogleSignIn}>
        <Text style={styles.buttonText}>Sign in with Google</Text>
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
  button: {
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
})

export default LoginScreen