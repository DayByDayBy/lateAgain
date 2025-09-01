// Mock all dependencies before imports
jest.mock('expo', () => ({}))
jest.mock('expo/src/winter/runtime.native', () => ({}))
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}))
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
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}))
jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'redirect-uri'),
}))

// Mock supabaseClient functions
const mockSignInWithGoogle = jest.fn(() => Promise.resolve({ data: {}, error: null }))
const mockSignOut = jest.fn(() => Promise.resolve({ error: null }))

jest.mock('../supabaseClient', () => ({
  signInWithGoogle: mockSignInWithGoogle,
  signOut: mockSignOut,
  getCurrentUser: jest.fn(() => Promise.resolve({ data: { user: { id: '123' } }, error: null })),
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      }))
    }
  }
}))

import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import LoginScreen from '../LoginScreen'
import HomeScreen from '../HomeScreen'

describe('Auth Components', () => {
  describe('LoginScreen', () => {
    it('renders correctly', () => {
      const { getByText } = render(<LoginScreen />)
      expect(getByText('Late Again')).toBeTruthy()
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
   const mockRoute = { params: { user: mockUser } }
   const mockNavigation = { navigate: jest.fn() }

   it('renders correctly with user', () => {
     const { getByText } = render(<HomeScreen route={mockRoute} navigation={mockNavigation} />)
     expect(getByText('Late Again')).toBeTruthy()
     expect(getByText('Logged in as: test@example.com')).toBeTruthy()
     expect(getByText('Sign Out')).toBeTruthy()
   })

   it('calls signOut on button press', async () => {
     mockSignOut.mockResolvedValue({ error: null })
     const { getByText } = render(<HomeScreen route={mockRoute} navigation={mockNavigation} />)
     const button = getByText('Sign Out')
     fireEvent.press(button)
     expect(mockSignOut).toHaveBeenCalled()
   })

   it('handles signOut errors gracefully', async () => {
     const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
     ;(mockSignOut as any).mockResolvedValue({ error: { message: 'Sign out failed' } })

     const { getByText } = render(<HomeScreen route={mockRoute} navigation={mockNavigation} />)
     const button = getByText('Sign Out')
     fireEvent.press(button)

     expect(mockSignOut).toHaveBeenCalled()
     expect(consoleSpy).toHaveBeenCalledWith('Error signing out:', 'Sign out failed')

     consoleSpy.mockRestore()
   })

   it('renders navigation buttons correctly', () => {
     const { getByText } = render(<HomeScreen route={mockRoute} navigation={mockNavigation} />)
     expect(getByText('Manage Companies')).toBeTruthy()
     expect(getByText('Quick Reporting')).toBeTruthy()
   })

   it('navigates to CompanyList on button press', () => {
     const { getByText } = render(<HomeScreen route={mockRoute} navigation={mockNavigation} />)
     const button = getByText('Manage Companies')
     fireEvent.press(button)
     expect(mockNavigation.navigate).toHaveBeenCalledWith('CompanyList')
   })

   it('navigates to QuickReporting on button press', () => {
     const { getByText } = render(<HomeScreen route={mockRoute} navigation={mockNavigation} />)
     const button = getByText('Quick Reporting')
     fireEvent.press(button)
     expect(mockNavigation.navigate).toHaveBeenCalledWith('QuickReporting')
   })
  })
})