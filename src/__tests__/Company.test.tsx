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
});