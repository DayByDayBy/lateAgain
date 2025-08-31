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
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

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
          Alert.alert('Success', 'Account created successfully! Please check your email to confirm.')
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
    <View style={styles.container}>
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
  fieldErrorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 5,
  },
})

export default LoginScreen