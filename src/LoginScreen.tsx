import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, Dimensions, AccessibilityInfo } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { signInWithGoogle, signUpWithEmail, signInWithPassword, createUserProfile } from './supabaseClient'
// import BusStopTrace from '../assets/bus_stop_trace.svg'



const LoginScreen = () => {
  const { width: screenWidth } = Dimensions.get('window')
  const [authMethod, setAuthMethod] = useState<'google' | 'email'>('google')
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)


  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers
  }

  const sanitizeInput = (input: string) => {
    return input.trim()
  }

  const handleGoogleSignIn = async () => {
    setError('')
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
    }
  }


  const handleEmailChange = (text: string) => {
    const sanitized = sanitizeInput(text)
    setEmail(sanitized)
    if (sanitized && !validateEmail(sanitized)) {
      setEmailError('Please enter a valid email address.')
    } else {
      setEmailError('')
    }
  }

  const handlePasswordChange = (text: string) => {
    const sanitized = sanitizeInput(text)
    setPassword(sanitized)
    if (sanitized && !validatePassword(sanitized)) {
      setPasswordError('Password must be at least 8 characters, include uppercase, lowercase, and a number.')
    } else {
      setPasswordError('')
    }
  }

  const handleConfirmPasswordChange = (text: string) => {
    const sanitized = sanitizeInput(text)
    setConfirmPassword(sanitized)
    if (sanitized && sanitized !== password) {
      setConfirmPasswordError('Passwords do not match.')
    } else {
      setConfirmPasswordError('')
    }
  }

  const handleEmailAuth = async () => {
    setError('')
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedPassword = sanitizeInput(password)
    const sanitizedConfirm = sanitizeInput(confirmPassword)

    let hasError = false
    if (!validateEmail(sanitizedEmail)) {
      setEmailError('Please enter a valid email address.')
      hasError = true
    }
    if (!validatePassword(sanitizedPassword)) {
      setPasswordError('Password must be at least 8 characters, include uppercase, lowercase, and a number.')
      hasError = true
    }
    if (isSignUp && sanitizedPassword !== sanitizedConfirm) {
      setConfirmPasswordError('Passwords do not match.')
      hasError = true
    }
    if (hasError) return

    try {
      if (isSignUp) {
        const { error } = await signUpWithEmail(sanitizedEmail, sanitizedPassword)
        if (error) {
          setError(error.message)
        } else {
          // Create user profile after signup
          try {
            await createUserProfile('user') // Default to user role
            Alert.alert('Success', 'Account created successfully! Please check your email to confirm.')
          } catch (profileError) {
            console.error('Error creating user profile:', profileError)
            // Still show success for signup, profile can be created later
            Alert.alert('Success', 'Account created successfully! Please check your email to confirm.')
          }
        }
      } else {
        const { error } = await signInWithPassword(sanitizedEmail, sanitizedPassword)
        if (error) {
          setError(error.message)
        }
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    }
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <Text style={styles.title}>Late Again</Text>

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
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} accessibilityLabel="Sign in with Google">
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
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            accessibilityLabel="Email input field"
          />
          {emailError ? <Text style={styles.fieldErrorText}>{emailError}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
            accessibilityLabel="Password input field"
          />
          {passwordError ? <Text style={styles.fieldErrorText}>{passwordError}</Text> : null}
          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry
              accessibilityLabel="Confirm password input field"
            />
          )}
          {isSignUp && confirmPasswordError ? <Text style={styles.fieldErrorText}>{confirmPasswordError}</Text> : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleEmailAuth}>
            <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    padding: 5,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  button: {
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  formToggle: {
    flexDirection: 'row',
    marginBottom: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 25,
    padding: 5,
  },
  formToggleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeFormToggle: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  formToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    color: '#333',
    minHeight: 44,
  },
  focusedInput: {
    borderColor: '#007bff',
    borderWidth: 2,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  fieldErrorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 5,
  },
})

export default LoginScreen