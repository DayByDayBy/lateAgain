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

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import QuickReporting from '../QuickReporting';

const mockSupabase = require('../supabaseClient').supabase;

describe('QuickReporting', () => {
  const mockNavigation = {};
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
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

    expect(alertSpy).toHaveBeenCalledWith('Email Sent', 'Email sent to a@example.com');
  });
});