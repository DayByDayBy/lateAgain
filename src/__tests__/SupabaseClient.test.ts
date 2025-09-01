// Mock Supabase before importing
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      getUser: jest.fn(),
    },
  })),
}));

// Mock supabaseClient to prevent environment variable errors
jest.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      getUser: jest.fn(),
    },
  },
  signInWithGoogle: jest.fn(),
  signOut: jest.fn(),
  signUpWithEmail: jest.fn(),
  signInWithPassword: jest.fn(),
  getCurrentUser: jest.fn(),
}));

import { signInWithGoogle, signOut, signUpWithEmail, signInWithPassword, getCurrentUser } from '../supabaseClient';

// Mock Expo modules
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'redirect-uri'),
}));

const mockSupabase = require('@supabase/supabase-js').createClient();

describe('SupabaseClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variables for testing
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  });

  describe('signInWithGoogle', () => {
    it('calls signInWithOAuth with correct parameters', async () => {
      const mockResult = { data: { user: { id: '123' } }, error: null };
      mockSupabase.auth.signInWithOAuth.mockResolvedValue(mockResult);

      const result = await signInWithGoogle();

      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'redirect-uri',
        },
      });
      expect(result).toEqual(mockResult);
    });

    it('handles errors from signInWithOAuth', async () => {
      const mockError = { message: 'OAuth error' };
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({ data: null, error: mockError });

      const result = await signInWithGoogle();

      expect(result.error).toEqual(mockError);
    });
  });

  describe('signOut', () => {
    it('calls signOut successfully', async () => {
      const mockResult = { error: null };
      mockSupabase.auth.signOut.mockResolvedValue(mockResult);

      const result = await signOut();

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('handles errors from signOut', async () => {
      const mockError = { message: 'Sign out error' };
      mockSupabase.auth.signOut.mockResolvedValue({ error: mockError });

      const result = await signOut();

      expect(result.error).toEqual(mockError);
    });
  });

  describe('signUpWithEmail', () => {
    it('calls signUp with correct parameters', async () => {
      const mockResult = { data: { user: { id: '123' } }, error: null };
      mockSupabase.auth.signUp.mockResolvedValue(mockResult);

      const result = await signUpWithEmail('test@example.com', 'password123');

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResult);
    });

    it('handles errors from signUp', async () => {
      const mockError = { message: 'Sign up error' };
      mockSupabase.auth.signUp.mockResolvedValue({ data: null, error: mockError });

      const result = await signUpWithEmail('test@example.com', 'password123');

      expect(result.error).toEqual(mockError);
    });
  });

  describe('signInWithPassword', () => {
    it('calls signInWithPassword with correct parameters', async () => {
      const mockResult = { data: { user: { id: '123' } }, error: null };
      mockSupabase.auth.signInWithPassword.mockResolvedValue(mockResult);

      const result = await signInWithPassword('test@example.com', 'password123');

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResult);
    });

    it('handles errors from signInWithPassword', async () => {
      const mockError = { message: 'Sign in error' };
      mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: null, error: mockError });

      const result = await signInWithPassword('test@example.com', 'password123');

      expect(result.error).toEqual(mockError);
    });
  });

  describe('getCurrentUser', () => {
    it('calls getUser and returns result', async () => {
      const mockResult = { data: { user: { id: '123', email: 'test@example.com' } }, error: null };
      mockSupabase.auth.getUser.mockResolvedValue(mockResult);

      const result = await getCurrentUser();

      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('handles errors from getUser', async () => {
      const mockError = { message: 'Get user error' };
      mockSupabase.auth.getUser.mockResolvedValue({ data: null, error: mockError });

      const result = await getCurrentUser();

      expect(result.error).toEqual(mockError);
    });
  });

  describe('Environment Variables', () => {
    it('throws error when SUPABASE_URL is missing', () => {
      delete process.env.EXPO_PUBLIC_SUPABASE_URL;

      expect(() => {
        require('../supabaseClient');
      }).toThrow();
    });

    it('throws error when SUPABASE_ANON_KEY is missing', () => {
      delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      expect(() => {
        require('../supabaseClient');
      }).toThrow();
    });
  });
});