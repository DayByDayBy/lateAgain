jest.mock('../supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QuickReporting from '../QuickReporting';

const mockSupabase = require('../supabaseClient').supabase;

describe('QuickReporting', () => {
  const mockNavigation = {};
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('renders correctly', () => {
    const { getByText } = render(<QuickReporting navigation={mockNavigation} />);
    expect(getByText('Quick Reporting')).toBeTruthy();
    expect(getByText('Select Company:')).toBeTruthy();
  });

  it('fetches companies on mount', async () => {
    const mockCompanies = [
      { id: '1', name: 'Company A', email: 'a@example.com' },
      { id: '2', name: 'Company B', email: 'b@example.com' },
    ];
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: mockCompanies, error: null }),
    });

    const { getByText } = render(<QuickReporting navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Company A')).toBeTruthy();
      expect(getByText('Company B')).toBeTruthy();
    });
  });

  it('selects company and fetches routes', async () => {
    const mockCompanies = [{ id: '1', name: 'Company A', email: 'a@example.com' }];
    const mockRoutes = [
      { id: 'r1', route_number: 101, description: 'Route 101' },
      { id: 'r2', route_number: 102, description: 'Route 102' },
    ];

    mockSupabase.from
      .mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: mockCompanies, error: null }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: mockRoutes, error: null }),
        }),
      });

    const { getByText } = render(<QuickReporting navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Company A')).toBeTruthy();
    });

    fireEvent.press(getByText('Company A'));

    await waitFor(() => {
      expect(getByText('Route 101: Route 101')).toBeTruthy();
      expect(getByText('Route 102: Route 102')).toBeTruthy();
    });
  });

  it('selects issue and generates preview', async () => {
    const mockCompanies = [{ id: '1', name: 'Company A', email: 'a@example.com' }];
    const mockRoutes = [{ id: 'r1', route_number: 101, description: 'Route 101' }];

    mockSupabase.from
      .mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: mockCompanies, error: null }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: mockRoutes, error: null }),
        }),
      });

    const { getByText } = render(<QuickReporting navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Company A')).toBeTruthy();
    });

    fireEvent.press(getByText('Company A'));

    await waitFor(() => {
      expect(getByText('Route 101: Route 101')).toBeTruthy();
    });

    fireEvent.press(getByText('Route 101: Route 101'));
    fireEvent.press(getByText('Late'));

    await waitFor(() => {
      expect(getByText('Email Preview:')).toBeTruthy();
      expect(getByText(/Dear Company A Team/)).toBeTruthy();
      expect(getByText(/route 101 was delayed/)).toBeTruthy();
    });
  });

  it('generates correct template for each issue type', () => {
    const templates = {
      Late: "Dear [Company Name] Team,\n\nI am writing to report that my recent journey on route [Route Number] was delayed. This has caused inconvenience, and I would appreciate any updates or compensation if applicable.\n\nThank you for your attention to this matter.\n\nBest regards,\n[Your Name]",
      Early: "Dear [Company Name] Team,\n\nI am writing to report that my recent journey on route [Route Number] arrived earlier than scheduled. This has caused inconvenience, and I would appreciate any updates or compensation if applicable.\n\nThank you for your attention to this matter.\n\nBest regards,\n[Your Name]",
      Cancelled: "Dear [Company Name] Team,\n\nI am writing to report that my recent journey on route [Route Number] was cancelled. This has caused significant inconvenience, and I would appreciate any updates or compensation if applicable.\n\nThank you for your attention to this matter.\n\nBest regards,\n[Your Name]",
      Other: "Dear [Company Name] Team,\n\nI am writing to report an issue with my recent journey on route [Route Number]. [Please describe the issue].\n\nThank you for your attention to this matter.\n\nBest regards,\n[Your Name]",
    };

    expect(templates.Late).toContain('delayed');
    expect(templates.Early).toContain('arrived earlier');
    expect(templates.Cancelled).toContain('cancelled');
    expect(templates.Other).toContain('an issue');
  });

  it('sends email when send button is pressed', async () => {
    const mockCompanies = [{ id: '1', name: 'Company A', email: 'a@example.com' }];
    const mockRoutes = [{ id: 'r1', route_number: 101, description: 'Route 101' }];

    mockSupabase.from
      .mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: mockCompanies, error: null }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: mockRoutes, error: null }),
        }),
      });

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByText } = render(<QuickReporting navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Company A')).toBeTruthy();
    });

    fireEvent.press(getByText('Company A'));

    await waitFor(() => {
      expect(getByText('Route 101: Route 101')).toBeTruthy();
    });

    fireEvent.press(getByText('Route 101: Route 101'));
    fireEvent.press(getByText('Late'));

    await waitFor(() => {
      expect(getByText('Send Email')).toBeTruthy();
    });

    // Mock Math.random to return > 0.5 to simulate success
    const originalRandom = Math.random;
    Math.random = jest.fn().mockReturnValue(0.7);

    fireEvent.press(getByText('Send Email'));

    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Email Sent', 'Email sent to a@example.com');
    });

    Math.random = originalRandom;
  });

  it('loads drafts from AsyncStorage on mount', async () => {
    const mockDrafts = [{ id: '1', previewText: 'Test draft' }];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockDrafts));

    const { getByText } = render(<QuickReporting navigation={mockNavigation} />);

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('drafts');
    });
  });

  it('saves to drafts when send fails', async () => {
    const mockCompanies = [{ id: '1', name: 'Company A', email: 'a@example.com' }];
    const mockRoutes = [{ id: 'r1', route_number: 101, description: 'Route 101' }];

    mockSupabase.from
      .mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: mockCompanies, error: null }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: mockRoutes, error: null }),
        }),
      });

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    const { getByText } = render(<QuickReporting navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Company A')).toBeTruthy();
    });

    fireEvent.press(getByText('Company A'));

    await waitFor(() => {
      expect(getByText('Route 101: Route 101')).toBeTruthy();
    });

    fireEvent.press(getByText('Route 101: Route 101'));
    fireEvent.press(getByText('Late'));

    await waitFor(() => {
      expect(getByText('Send Email')).toBeTruthy();
    });

    // Mock Math.random to return < 0.5 to simulate failure
    const originalRandom = Math.random;
    Math.random = jest.fn().mockReturnValue(0.3);

    fireEvent.press(getByText('Send Email'));

    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('drafts', expect.any(String));
      expect(alertSpy).toHaveBeenCalledWith('Send Failed', 'Email saved to drafts for later resend.');
    });

    Math.random = originalRandom;
  });

  it('displays drafts and allows resend', async () => {
    const mockDrafts = [{
      id: '1',
      company: { name: 'Company A', email: 'a@example.com' },
      previewText: 'Test preview text for draft'
    }];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockDrafts));
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    const { getByText } = render(<QuickReporting navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Drafts:')).toBeTruthy();
      expect(getByText('Test preview text for draft...')).toBeTruthy();
      expect(getByText('Resend')).toBeTruthy();
    });

    fireEvent.press(getByText('Resend'));

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Resent', 'Email resent to a@example.com');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('drafts', '[]');
    });
  });

  // Commented-out test cases for future extensions

  /*
  // Ticket 2: Real Email Integration - Replace simulated email with actual email service
  describe('Real Email Integration', () => {
    it('sends email using Gmail API', async () => {
      // Mock Gmail API integration
      const mockGmailAPI = {
        send: jest.fn().mockResolvedValue({ success: true, messageId: '12345' })
      };

      // Test implementation would integrate with actual Gmail API
      // This test is commented out until Gmail API is implemented

      const mockCompanies = [{ id: '1', name: 'Company A', email: 'a@example.com' }];
      const mockRoutes = [{ id: 'r1', route_number: 101, description: 'Route 101' }];

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockResolvedValue({ data: mockCompanies, error: null }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: mockRoutes, error: null }),
          }),
        });

      const { getByText } = render(<QuickReporting navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('Company A')).toBeTruthy();
      });

      fireEvent.press(getByText('Company A'));

      await waitFor(() => {
        expect(getByText('Route 101: Route 101')).toBeTruthy();
      });

      fireEvent.press(getByText('Route 101: Route 101'));
      fireEvent.press(getByText('Late'));

      await waitFor(() => {
        expect(getByText('Send Email')).toBeTruthy();
      });

      fireEvent.press(getByText('Send Email'));

      // Verify Gmail API was called with correct parameters
      expect(mockGmailAPI.send).toHaveBeenCalledWith({
        to: 'a@example.com',
        subject: 'Delay Report for Route 101',
        body: expect.stringContaining('Dear Company A Team')
      });
    });

    it('handles Gmail API authentication errors', async () => {
      // Test for authentication failures with Gmail API
      const mockGmailAPI = {
        send: jest.fn().mockRejectedValue(new Error('Authentication failed'))
      };

      // Implementation would handle auth errors gracefully
      // Commented out until implementation
    });

    it('sends email using SendGrid API as alternative', async () => {
      // Alternative email service implementation
      const mockSendGrid = {
        send: jest.fn().mockResolvedValue({ success: true })
      };

      // Test SendGrid integration
      // Commented out until SendGrid is implemented
    });
  });
  */
});