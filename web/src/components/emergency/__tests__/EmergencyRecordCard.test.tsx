// web/src/components/emergency/__tests__/EmergencyRecordCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EmergencyRecordCard from '../EmergencyRecordCard';
import { CriticalRecord } from '../../../services/api/emergency';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockRecord: CriticalRecord = {
  id: '123',
  domain: 'property',
  name: 'Home Insurance',
  recordType: 'home-insurance',
  contactPhone: '0800 123 4567',
  contactEmail: 'claims@insurer.co.uk',
  priority: 'Critical',
  notes: 'Policy number: POL-123456',
  domainUrl: '/property/123',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('EmergencyRecordCard', () => {
  it('renders record name and type', () => {
    render(
      <BrowserRouter>
        <EmergencyRecordCard record={mockRecord} />
      </BrowserRouter>
    );
    expect(screen.getByText('Home Insurance')).toBeInTheDocument();
    expect(screen.getByText('home insurance')).toBeInTheDocument();
  });

  it('renders contact phone with tel: link', () => {
    render(
      <BrowserRouter>
        <EmergencyRecordCard record={mockRecord} />
      </BrowserRouter>
    );
    const phoneLink = screen.getByRole('link', { name: /0800 123 4567/i });
    expect(phoneLink).toHaveAttribute('href', 'tel:0800 123 4567');
  });

  it('renders contact email with mailto: link', () => {
    render(
      <BrowserRouter>
        <EmergencyRecordCard record={mockRecord} />
      </BrowserRouter>
    );
    const emailLink = screen.getByRole('link', { name: /claims@insurer.co.uk/i });
    expect(emailLink).toHaveAttribute('href', 'mailto:claims@insurer.co.uk');
  });

  it('renders notes section', () => {
    render(
      <BrowserRouter>
        <EmergencyRecordCard record={mockRecord} />
      </BrowserRouter>
    );
    expect(screen.getByText('Policy number: POL-123456')).toBeInTheDocument();
  });

  it('navigates to record detail when external link clicked', () => {
    render(
      <BrowserRouter>
        <EmergencyRecordCard record={mockRecord} />
      </BrowserRouter>
    );
    const detailButton = screen.getByLabelText('View full details');
    fireEvent.click(detailButton);
    expect(mockNavigate).toHaveBeenCalledWith('/property/123');
  });

  it('does not render contact section when no phone or email', () => {
    const recordWithoutContact = {
      ...mockRecord,
      contactPhone: undefined,
      contactEmail: undefined,
    };
    render(
      <BrowserRouter>
        <EmergencyRecordCard record={recordWithoutContact} />
      </BrowserRouter>
    );
    expect(screen.queryByRole('link', { name: /tel:/i })).not.toBeInTheDocument();
  });
});
