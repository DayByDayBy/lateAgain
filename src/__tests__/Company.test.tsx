import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CompanyList from '../CompanyList';
import CompanyForm from '../CompanyForm';
import { supabase } from '../supabaseClient';

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
      update: jest.fn(() => Promise.resolve({ error: null })),
      delete: jest.fn(() => Promise.resolve({ error: null })),
      eq: jest.fn(() => ({
        error: null
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

  // Commented-out test cases for future extensions

  /*
  // Ticket 3: Input Validation - Add comprehensive validation for all forms
  describe('Input Validation', () => {
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
          expect(getByText('Company name is required')).toBeTruthy();
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
          expect(getByText('Please enter a valid email address')).toBeTruthy();
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
        fireEvent.changeText(transportInput, 'Invalid Transport');
        fireEvent.press(saveButton);

        await waitFor(() => {
          expect(getByText('Please select a valid transport type')).toBeTruthy();
        });
      });

      it('validates company name length limits', async () => {
        const { getByText, getByPlaceholderText } = render(<CompanyForm navigation={mockNavigation} route={{ params: {} }} />);

        const nameInput = getByPlaceholderText('Name');
        const saveButton = getByText('Save');

        // Test name too long
        const longName = 'A'.repeat(101); // Assuming 100 char limit
        fireEvent.changeText(nameInput, longName);
        fireEvent.press(saveButton);

        await waitFor(() => {
          expect(getByText('Company name must be less than 100 characters')).toBeTruthy();
        });
      });

      it('validates notes field length', async () => {
        const { getByText, getByPlaceholderText } = render(<CompanyForm navigation={mockNavigation} route={{ params: {} }} />);

        const nameInput = getByPlaceholderText('Name');
        const emailInput = getByPlaceholderText('Email');
        const notesInput = getByPlaceholderText('Notes');
        const saveButton = getByText('Save');

        fireEvent.changeText(nameInput, 'Test Company');
        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(notesInput, 'A'.repeat(501)); // Assuming 500 char limit
        fireEvent.press(saveButton);

        await waitFor(() => {
          expect(getByText('Notes must be less than 500 characters')).toBeTruthy();
        });
      });
    });

    describe('QuickReporting Validation', () => {
      it('validates issue description for "Other" type', async () => {
        // Test validation for custom issue descriptions
        // This would be in QuickReporting component
        // Commented out until validation is implemented
      });

      it('validates route selection before sending', async () => {
        // Ensure route is selected before allowing email send
        // Commented out until implementation
      });
    });
  });
  */
});