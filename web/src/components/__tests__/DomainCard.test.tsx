import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DomainCard from '../domain/DomainCard';
import { Home } from 'lucide-react';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('DomainCard', () => {
  const mockDomain = {
    id: 'property',
    name: 'Property',
    description: 'Mortgage, utilities, home insurance',
    icon: Home,
    enabled: true,
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders domain card with correct information', () => {
    render(
      <BrowserRouter>
        <DomainCard domain={mockDomain} recordCount={5} isLoading={false} />
      </BrowserRouter>
    );

    expect(screen.getByText('Property')).toBeInTheDocument();
    expect(screen.getByText('Mortgage, utilities, home insurance')).toBeInTheDocument();
    expect(screen.getByText('5 records')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <BrowserRouter>
        <DomainCard domain={mockDomain} recordCount={0} isLoading={true} />
      </BrowserRouter>
    );

    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('navigates to domain page when enabled card is clicked', () => {
    render(
      <BrowserRouter>
        <DomainCard domain={mockDomain} recordCount={5} isLoading={false} />
      </BrowserRouter>
    );

    const card = screen.getByText('Property').closest('div');
    fireEvent.click(card!);

    expect(mockNavigate).toHaveBeenCalledWith('/property');
  });

  it('shows Coming Soon overlay for disabled domains', () => {
    const disabledDomain = { ...mockDomain, enabled: false };

    render(
      <BrowserRouter>
        <DomainCard domain={disabledDomain} recordCount={0} isLoading={false} />
      </BrowserRouter>
    );

    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('does not navigate when disabled card is clicked', () => {
    const disabledDomain = { ...mockDomain, enabled: false };

    render(
      <BrowserRouter>
        <DomainCard domain={disabledDomain} recordCount={0} isLoading={false} />
      </BrowserRouter>
    );

    const card = screen.getByText('Property').closest('div');
    fireEvent.click(card!);

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
