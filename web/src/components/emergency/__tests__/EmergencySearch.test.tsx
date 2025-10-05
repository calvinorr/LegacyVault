// web/src/components/emergency/__tests__/EmergencySearch.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import EmergencySearch from '../EmergencySearch';

describe('EmergencySearch', () => {
  it('renders search input', () => {
    const mockSearchChange = jest.fn();
    const mockDomainChange = jest.fn();

    render(
      <EmergencySearch
        searchQuery=""
        onSearchChange={mockSearchChange}
        selectedDomain="all"
        onDomainChange={mockDomainChange}
      />
    );

    expect(screen.getByPlaceholderText('Search critical records...')).toBeInTheDocument();
  });

  it('calls onSearchChange when typing in search', () => {
    const mockSearchChange = jest.fn();
    const mockDomainChange = jest.fn();

    render(
      <EmergencySearch
        searchQuery=""
        onSearchChange={mockSearchChange}
        selectedDomain="all"
        onDomainChange={mockDomainChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search critical records...');
    fireEvent.change(searchInput, { target: { value: 'insurance' } });

    expect(mockSearchChange).toHaveBeenCalledWith('insurance');
  });

  it('renders all domain filter buttons', () => {
    const mockSearchChange = jest.fn();
    const mockDomainChange = jest.fn();

    render(
      <EmergencySearch
        searchQuery=""
        onSearchChange={mockSearchChange}
        selectedDomain="all"
        onDomainChange={mockDomainChange}
      />
    );

    expect(screen.getByText('All Domains')).toBeInTheDocument();
    expect(screen.getByText('Property')).toBeInTheDocument();
    expect(screen.getByText('Vehicles')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Insurance')).toBeInTheDocument();
  });

  it('highlights selected domain button', () => {
    const mockSearchChange = jest.fn();
    const mockDomainChange = jest.fn();

    render(
      <EmergencySearch
        searchQuery=""
        onSearchChange={mockSearchChange}
        selectedDomain="property"
        onDomainChange={mockDomainChange}
      />
    );

    const propertyButton = screen.getByText('Property');
    expect(propertyButton.className).toContain('bg-red-600');
    expect(propertyButton.className).toContain('text-white');
  });

  it('calls onDomainChange when domain button clicked', () => {
    const mockSearchChange = jest.fn();
    const mockDomainChange = jest.fn();

    render(
      <EmergencySearch
        searchQuery=""
        onSearchChange={mockSearchChange}
        selectedDomain="all"
        onDomainChange={mockDomainChange}
      />
    );

    const vehiclesButton = screen.getByText('Vehicles');
    fireEvent.click(vehiclesButton);

    expect(mockDomainChange).toHaveBeenCalledWith('vehicles');
  });
});
