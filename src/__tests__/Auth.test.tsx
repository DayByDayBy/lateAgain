import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import LoginScreen from '../LoginScreen'
import HomeScreen from '../HomeScreen'

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
      getUser: jest.fn(),
    }
  }))
}))

jest.mock('expo-web-browser')
jest.mock('expo-auth-session')

const mockSignInWithGoogle = jest.fn()
const mockSignOut = jest.fn()

jest.mock('../supabaseClient', () => ({
  signInWithGoogle: mockSignInWithGoogle,
  signOut: mockSignOut,
  getCurrentUser: jest.fn(),
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      }))
    }
  }
}))

describe('Auth Components', () => {
  describe('LoginScreen', () => {
    it('renders correctly', () => {
      const { getByText } = render(<LoginScreen />)
      expect(getByText('Welcome to Late Again')).toBeTruthy()
      expect(getByText('Sign in with Google')).toBeTruthy()
    })

    it('calls signInWithGoogle on button press', async () => {
      mockSignInWithGoogle.mockResolvedValue({ data: {}, error: null })
      const { getByText } = render(<LoginScreen />)
      const button = getByText('Sign in with Google')
      fireEvent.press(button)
      expect(mockSignInWithGoogle).toHaveBeenCalled()
    })
  })

  describe('HomeScreen', () => {
    const mockUser = { email: 'test@example.com' }

    it('renders correctly with user', () => {
      const { getByText } = render(<HomeScreen user={mockUser} />)
      expect(getByText('Welcome to Late Again')).toBeTruthy()
      expect(getByText('Logged in as: test@example.com')).toBeTruthy()
      expect(getByText('Sign Out')).toBeTruthy()
    })

    it('calls signOut on button press', async () => {
      mockSignOut.mockResolvedValue({ error: null })
      const { getByText } = render(<HomeScreen user={mockUser} />)
      const button = getByText('Sign Out')
      fireEvent.press(button)
      expect(mockSignOut).toHaveBeenCalled()
    })
  })
})