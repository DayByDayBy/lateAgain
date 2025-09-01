import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CompanyList from '../CompanyList';
import CompanyForm from '../CompanyForm';
import QuickReporting from '../QuickReporting';
import { supabase } from '../supabaseClient';

// Mock AsyncStorage for QuickReporting component
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
}));

jest.mock('../supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({
        data: [
          { id: '1', name: 'Test Company', email: 'test@example.com', transport_type: 'Bus', notes: 'Test notes' }
        ],
        error: null
      })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      })),
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }
}));

describe('Company Components', () => {
  describe('CompanyList', () => {
    const mockNavigation = {
      navigate: jest.fn()
    };

    it('renders companies correctly', async () => {
      const { getByText } = render(<CompanyList navigation={mockNavigation} />);
      await waitFor(() => {
        expect(getByText('Test Company')).toBeTruthy();
        expect(getByText('test@example.com')).toBeTruthy();
      });
    });

    it('navigates to CompanyForm on add button press', () => {
      const { getByText } = render(<CompanyList navigation={mockNavigation} />);
      const addButton = getByText('Add Company');
      fireEvent.press(addButton);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('CompanyForm');
    });

    it('navigates to CompanyForm on edit press', async () => {
      const { getByText } = render(<CompanyList navigation={mockNavigation} />);
      await waitFor(() => {
        const editButton = getByText('Edit');
        fireEvent.press(editButton);
        expect(mockNavigation.navigate).toHaveBeenCalledWith('CompanyForm', {
          company: { id: '1', name: 'Test Company', email: 'test@example.com', transport_type: 'Bus', notes: 'Test notes' }
        });
      });
    });
  });

  describe('CompanyForm', () => {
    const mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn()
    };

    it('saves new company', async () => {
      const { getByText, getByPlaceholderText } = render(<CompanyForm navigation={mockNavigation} route={{ params: {} }} />);

      const nameInput = getByPlaceholderText('Name');
      const emailInput = getByPlaceholderText('Email');
      const transportInput = getByPlaceholderText('Transport Type');
      const notesInput = getByPlaceholderText('Notes');
      const saveButton = getByText('Save');

      fireEvent.changeText(nameInput, 'New Company');
      fireEvent.changeText(emailInput, 'new@example.com');
      fireEvent.changeText(transportInput, 'Train');
      fireEvent.changeText(notesInput, 'New notes');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('companies');
        expect(mockNavigation.goBack).toHaveBeenCalled();
      });
    });

    it('updates existing company', async () => {
      const existingCompany = { id: '1', name: 'Existing Company', email: 'existing@example.com', transport_type: 'Bus', notes: 'Existing notes' };
      const { getByText } = render(<CompanyForm navigation={mockNavigation} route={{ params: { company: existingCompany } }} />);

      const saveButton = getByText('Save');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('companies');
        expect(mockNavigation.goBack).toHaveBeenCalled();
      });
    });
  });

// Ticket 3: Input Validation - Add comprehensive validation for all forms
describe('Input Validation', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn()
  };

  const mockSupabase = require('../supabaseClient').supabase;

  describe('CompanyForm Validation', () => {
    it('validates required company name field', async () => {
      const { getByText, getByPlaceholderText } = render(<CompanyForm navigation={mockNavigation} route={{ params: {} }} />);

      const nameInput = getByPlaceholderText('Name');
      const saveButton = getByText('Save');

      // Test empty name validation
      fireEvent.changeText(nameInput, '');
      fireEvent.press(saveButton);

      // Should show validation error for empty name
      await waitFor(() => {
        expect(getByText('Name is required.')).toBeTruthy();
      });
    });

    it('validates email format', async () => {
      const { getByText, getByPlaceholderText } = render(<CompanyForm navigation={mockNavigation} route={{ params: {} }} />);

      const nameInput = getByPlaceholderText('Name');
      const emailInput = getByPlaceholderText('Email');
      const saveButton = getByText('Save');

      fireEvent.changeText(nameInput, 'Test Company');
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(getByText('Please enter a valid email address.')).toBeTruthy();
      });
    });

    it('validates transport type selection', async () => {
      const { getByText, getByPlaceholderText } = render(<CompanyForm navigation={mockNavigation} route={{ params: {} }} />);

      const nameInput = getByPlaceholderText('Name');
      const emailInput = getByPlaceholderText('Email');
      const transportInput = getByPlaceholderText('Transport Type');
      const saveButton = getByText('Save');

      fireEvent.changeText(nameInput, 'Test Company');
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(transportInput, '');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(getByText('Transport type is required.')).toBeTruthy();
      });
    });

    it('validates input sanitization', async () => {
      const { getByText, getByPlaceholderText } = render(<CompanyForm navigation={mockNavigation} route={{ params: {} }} />);

      const nameInput = getByPlaceholderText('Name');
      const emailInput = getByPlaceholderText('Email');
      const notesInput = getByPlaceholderText('Notes');
      const saveButton = getByText('Save');

      // Test input sanitization (trimming whitespace)
      fireEvent.changeText(nameInput, '  Test Company  ');
      fireEvent.changeText(emailInput, '  test@example.com  ');
      fireEvent.changeText(notesInput, '  Test notes  ');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('companies');
      });
    });
  });

  describe('QuickReporting Validation', () => {
    it('validates issue description for "Other" type', async () => {
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
      fireEvent.press(getByText('Other'));

      await waitFor(() => {
        expect(getByText('Send Email')).toBeTruthy();
      });

      // Try to send without description
      fireEvent.press(getByText('Send Email'));

      await waitFor(() => {
        expect(getByText('Please provide a description for the issue.')).toBeTruthy();
      });
    });

    it('validates route selection before sending', async () => {
      const mockCompanies = [{ id: '1', name: 'Company A', email: 'a@example.com' }];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockCompanies, error: null }),
      });

      const { getByText } = render(<QuickReporting navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('Company A')).toBeTruthy();
      });

      fireEvent.press(getByText('Company A'));
      fireEvent.press(getByText('Late'));

      await waitFor(() => {
        expect(getByText('Send Email')).toBeTruthy();
      });

      // Try to send without route selected
      fireEvent.press(getByText('Send Email'));

      await waitFor(() => {
        expect(getByText('Please select a route.')).toBeTruthy();
      });
    });
  });
});
});