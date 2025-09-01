import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import UsefulInfoScreen from '../UsefulInfoScreen';
import { supabase } from '../supabaseClient';

// Mock the supabase client
const mockSupabaseQuery = {
  select: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  order: jest.fn().mockResolvedValue({
    data: null,
    error: null,
  }),
};

jest.mock('../supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => mockSupabaseQuery),
  },
}));

// Mock react-native Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  openURL: jest.fn(() => Promise.resolve()),
}));

// Mock Alert
const mockAlert = jest.fn();
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: mockAlert,
}));

// Mock MaterialIcons
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockCompanies = [
  {
    id: '1',
    name: 'First Bus',
    email: 'enquiries@firstbus.co.uk',
    transport_type: 'Bus',
    website: 'https://www.firstbus.co.uk',
    phone: '0344 800 4411',
    address: 'FirstGroup plc, 395 King Street, Aberdeen AB24 5RP',
    category: 'bus_company' as const,
    priority: 'must' as const,
    region: 'UK-wide',
    notes: 'Major bus operator across the UK',
  },
  {
    id: '2',
    name: 'Bus Users Scotland',
    email: 'info@bususersscotland.org.uk',
    transport_type: 'Regulatory',
    website: 'https://www.bususersscotland.org.uk',
    phone: '0141 332 9988',
    category: 'regulatory_body' as const,
    priority: 'must' as const,
    region: 'Scotland',
    notes: 'Scottish bus passenger watchdog',
  },
];

const mockUsefulInfo = [
  {
    id: '1',
    title: 'Passenger Rights',
    content: 'Under UK law, bus passengers have rights to reliable service...',
    category: 'passenger_rights',
    priority: 1,
    region: 'UK-wide',
  },
];

describe('UsefulInfoScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock responses
    mockSupabaseQuery.order.mockImplementation((column, options) => {
      // Mock different responses based on the query context
      if (mockSupabaseQuery.in.mock.calls.length > 0) {
        // This is a companies query with .in()
        return Promise.resolve({
          data: mockCompanies,
          error: null,
        });
      } else {
        // This is a useful_info query
        return Promise.resolve({
          data: mockUsefulInfo,
          error: null,
        });
      }
    });
  });

  it('renders loading state initially', () => {
    const { getByText } = render(
      <UsefulInfoScreen navigation={mockNavigation} />
    );

    expect(getByText('Loading information...')).toBeTruthy();
  });

  it('renders screen title', async () => {
    const { getByText } = render(
      <UsefulInfoScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText('Useful Information')).toBeTruthy();
    });
  });

  it('displays companies and useful information after loading', async () => {
    const { getByText } = render(
      <UsefulInfoScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText('First Bus')).toBeTruthy();
      expect(getByText('Bus Users Scotland')).toBeTruthy();
      expect(getByText('Passenger Rights')).toBeTruthy();
    });
  });

  it('filters by search query', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <UsefulInfoScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText('First Bus')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Search companies, information...');
    fireEvent.changeText(searchInput, 'First');

    await waitFor(() => {
      expect(getByText('First Bus')).toBeTruthy();
      expect(queryByText('Bus Users Scotland')).toBeNull();
    });
  });

  it('filters by category', async () => {
    const { getByText, queryByText } = render(
      <UsefulInfoScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText('First Bus')).toBeTruthy();
    });

    // Click on Companies filter
    fireEvent.press(getByText('Companies'));

    await waitFor(() => {
      expect(getByText('First Bus')).toBeTruthy();
      expect(queryByText('Passenger Rights')).toBeNull();
    });
  });

  it('opens email link when email contact is pressed', async () => {
    const { getByText } = render(
      <UsefulInfoScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText('First Bus')).toBeTruthy();
    });

    const emailButton = getByText('enquiries@firstbus.co.uk');
    fireEvent.press(emailButton);

    // Verify Linking.openURL was called with mailto URL
    const { Linking } = require('react-native/Libraries/Linking/Linking');
    expect(Linking.canOpenURL).toHaveBeenCalledWith('mailto:enquiries@firstbus.co.uk');
    expect(Linking.openURL).toHaveBeenCalledWith('mailto:enquiries@firstbus.co.uk');
  });

  it('opens phone link when phone contact is pressed', async () => {
    const { getByText } = render(
      <UsefulInfoScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText('First Bus')).toBeTruthy();
    });

    const phoneButton = getByText('0344 800 4411');
    fireEvent.press(phoneButton);

    const { Linking } = require('react-native/Libraries/Linking/Linking');
    expect(Linking.canOpenURL).toHaveBeenCalledWith('tel:0344 800 4411');
    expect(Linking.openURL).toHaveBeenCalledWith('tel:0344 800 4411');
  });

  it('opens website link when website contact is pressed', async () => {
    const { getByText } = render(
      <UsefulInfoScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText('First Bus')).toBeTruthy();
    });

    const websiteButton = getByText('Website');
    fireEvent.press(websiteButton);

    const { Linking } = require('react-native/Libraries/Linking/Linking');
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://www.firstbus.co.uk');
    expect(Linking.openURL).toHaveBeenCalledWith('https://www.firstbus.co.uk');
  });

  it('shows priority badges for companies', async () => {
    const { getByText } = render(
      <UsefulInfoScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText('MUST')).toBeTruthy();
    });
  });

  it('displays empty state when no results found', async () => {
    const { getByPlaceholderText, getByText } = render(
      <UsefulInfoScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText('First Bus')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Search companies, information...');
    fireEvent.changeText(searchInput, 'nonexistent');

    await waitFor(() => {
      expect(getByText('No information found')).toBeTruthy();
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock an error response
    const mockFrom = supabase.from as jest.Mock;
    mockFrom.mockImplementation(() => ({
      select: () => ({
        in: () => ({
          order: () => Promise.resolve({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
        order: () => Promise.resolve({
          data: null,
          error: { message: 'Database error' },
        }),
      }),
    }));

    const alertMock = Alert.alert as jest.Mock;

    render(<UsefulInfoScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Error', 'Failed to load information. Please try again.');
    });
  });

  it('clears search when clear button is pressed', async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <UsefulInfoScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByPlaceholderText('Search companies, information...')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Search companies, information...');
    fireEvent.changeText(searchInput, 'test query');

    // Assuming there's a clear button with testID
    // This would need to be implemented in the component
    // const clearButton = getByTestId('clear-search');
    // fireEvent.press(clearButton);
    // expect(searchInput.props.value).toBe('');
  });
});