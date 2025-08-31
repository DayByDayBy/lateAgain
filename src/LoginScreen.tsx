import React, { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native'
import { signInWithGoogle, signUpWithEmail, signInWithPassword } from './supabaseClient'

const LoginScreen = () => {
  const [authMethod, setAuthMethod] = useState<'google' | 'email'>('google')
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const handleGoogleSignIn = async () => {
    setError('')
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
    }
  }

  const handleEmailAuth = async () => {
    setError('')
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long.')
      return
    }
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      if (isSignUp) {
        const { error } = await signUpWithEmail(email, password)
        if (error) {
          setError(error.message)
        } else {
          Alert.alert('Success', 'Account created successfully! Please check your email to confirm.')
        }
      } else {
        const { error } = await signInWithPassword(email, password)
        if (error) {
          setError(error.message)
        }
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Late Again</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, authMethod === 'google' && styles.activeToggle]}
          onPress={() => setAuthMethod('google')}
        >
          <Text style={styles.toggleText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, authMethod === 'email' && styles.activeToggle]}
          onPress={() => setAuthMethod('email')}
        >
          <Text style={styles.toggleText}>Email</Text>
        </TouchableOpacity>
      </View>

      {authMethod === 'google' ? (
        <TouchableOpacity style={styles.button} onPress={handleGoogleSignIn}>
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.formContainer}>
          <View style={styles.formToggle}>
            <TouchableOpacity
              style={[styles.formToggleButton, !isSignUp && styles.activeFormToggle]}
              onPress={() => setIsSignUp(false)}
            >
              <Text style={styles.formToggleText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formToggleButton, isSignUp && styles.activeFormToggle]}
              onPress={() => setIsSignUp(true)}
            >
              <Text style={styles.formToggleText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleEmailAuth}>
            <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#4285F4',
  },
  toggleText: {
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
    maxWidth: 300,
  },
  formToggle: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  formToggleButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  activeFormToggle: {
    backgroundColor: '#4285F4',
  },
  formToggleText: {
    fontSize: 16,
    color: '#000',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
})

export default LoginScreen