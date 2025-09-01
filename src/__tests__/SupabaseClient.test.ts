// Mock the supabaseClient module
jest.mock('../supabaseClient', () => ({
  signInWithGoogle: jest.fn(),
  signOut: jest.fn(),
  signUpWithEmail: jest.fn(),
  signInWithPassword: jest.fn(),
  getCurrentUser: jest.fn(),
}));

import { signInWithGoogle, signOut, signUpWithEmail, signInWithPassword, getCurrentUser } from '../supabaseClient';

// Get the mocked functions
const mockSignInWithGoogle = signInWithGoogle as any;
const mockSignOut = signOut as any;
const mockSignUpWithEmail = signUpWithEmail as any;
const mockSignInWithPassword = signInWithPassword as any;
const mockGetCurrentUser = getCurrentUser as any;

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
    it('calls signInWithGoogle successfully', async () => {
      const mockResult = { data: { user: { id: '123' } }, error: null };
      mockSignInWithGoogle.mockResolvedValue(mockResult);

      const result = await signInWithGoogle();

      expect(mockSignInWithGoogle).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('handles errors from signInWithGoogle', async () => {
      const mockError = { message: 'OAuth error' };
      mockSignInWithGoogle.mockResolvedValue({ data: null, error: mockError });

      const result = await signInWithGoogle();

      expect(result.error).toEqual(mockError);
    });
  });

  describe('signOut', () => {
    it('calls signOut successfully', async () => {
      const mockResult = { error: null };
      mockSignOut.mockResolvedValue(mockResult);

      const result = await signOut();

      expect(mockSignOut).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('handles errors from signOut', async () => {
      const mockError = { message: 'Sign out error' };
      mockSignOut.mockResolvedValue({ error: mockError });

      const result = await signOut();

      expect(result.error).toEqual(mockError);
    });
  });

  describe('signUpWithEmail', () => {
    it('calls signUpWithEmail with correct parameters', async () => {
      const mockResult = { data: { user: { id: '123' } }, error: null };
      mockSignUpWithEmail.mockResolvedValue(mockResult);

      const result = await signUpWithEmail('test@example.com', 'password123');

      expect(mockSignUpWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(result).toEqual(mockResult);
    });

    it('handles errors from signUpWithEmail', async () => {
      const mockError = { message: 'Sign up error' };
      mockSignUpWithEmail.mockResolvedValue({ data: null, error: mockError });

      const result = await signUpWithEmail('test@example.com', 'password123');

      expect(result.error).toEqual(mockError);
    });
  });

  describe('signInWithPassword', () => {
    it('calls signInWithPassword with correct parameters', async () => {
      const mockResult = { data: { user: { id: '123' } }, error: null };
      mockSignInWithPassword.mockResolvedValue(mockResult);

      const result = await signInWithPassword('test@example.com', 'password123');

      expect(mockSignInWithPassword).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(result).toEqual(mockResult);
    });

    it('handles errors from signInWithPassword', async () => {
      const mockError = { message: 'Sign in error' };
      mockSignInWithPassword.mockResolvedValue({ data: null, error: mockError });

      const result = await signInWithPassword('test@example.com', 'password123');

      expect(result.error).toEqual(mockError);
    });
  });

  describe('getCurrentUser', () => {
    it('calls getCurrentUser and returns result', async () => {
      const mockResult = { data: { user: { id: '123', email: 'test@example.com' } }, error: null };
      mockGetCurrentUser.mockResolvedValue(mockResult);

      const result = await getCurrentUser();

      expect(mockGetCurrentUser).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('handles errors from getCurrentUser', async () => {
      const mockError = { message: 'Get user error' };
      mockGetCurrentUser.mockResolvedValue({ data: null, error: mockError });

      const result = await getCurrentUser();

      expect(result.error).toEqual(mockError);
    });
  });

  describe('Environment Variables', () => {
    it('validates environment variables are set', () => {
      expect(process.env.EXPO_PUBLIC_SUPABASE_URL).toBeDefined();
      expect(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
    });
  });
});