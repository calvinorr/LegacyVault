// web/src/components/renewals/__tests__/RenewalTimeline.test.tsx

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RenewalTimeline from '../RenewalTimeline';
import { Renewal } from '../../../services/api/renewals';

const mockRenewals: Renewal[] = [
  {
    id: '1',
    domain: 'property',
    name: 'Home Insurance',
    recordType: 'home-insurance',
    renewalDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago (overdue)
    priority: 'Critical',
    domainUrl: '/property/1'
  },
  {
    id: '2',
    domain: 'vehicles',
    name: 'Car MOT',
    recordType: 'mot',
    renewalDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    priority: 'Important',
    domainUrl: '/vehicles/2'
  },
  {
    id: '3',
    domain: 'finance',
    name: 'ISA Maturity',
    recordType: 'isa',
    renewalDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
    priority: 'Standard',
    domainUrl: '/finance/3'
  },
  {
    id: '4',
    domain: 'government',
    name: 'Passport Renewal',
    recordType: 'passport',
    renewalDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
    priority: 'Important',
    domainUrl: '/government/4'
  },
  {
    id: '5',
    domain: 'insurance',
    name: 'Life Insurance',
    recordType: 'life-insurance',
    renewalDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days from now
    priority: 'Standard',
    domainUrl: '/insurance/5'
  }
];

describe('RenewalTimeline', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <RenewalTimeline renewals={[]} />
      </BrowserRouter>
    );
  });

  it('groups renewals by time period correctly', () => {
    render(
      <BrowserRouter>
        <RenewalTimeline renewals={mockRenewals} />
      </BrowserRouter>
    );

    // Check for time period headers
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('Next 7 Days')).toBeInTheDocument();
    expect(screen.getByText('Next 30 Days')).toBeInTheDocument();
    expect(screen.getByText('Next 90 Days')).toBeInTheDocument();
    expect(screen.getByText('Beyond 90 Days')).toBeInTheDocument();
  });

  it('displays renewal names', () => {
    render(
      <BrowserRouter>
        <RenewalTimeline renewals={mockRenewals} />
      </BrowserRouter>
    );

    expect(screen.getByText('Home Insurance')).toBeInTheDocument();
    expect(screen.getByText('Car MOT')).toBeInTheDocument();
    expect(screen.getByText('ISA Maturity')).toBeInTheDocument();
    expect(screen.getByText('Passport Renewal')).toBeInTheDocument();
    expect(screen.getByText('Life Insurance')).toBeInTheDocument();
  });

  it('shows count of renewals in each section', () => {
    render(
      <BrowserRouter>
        <RenewalTimeline renewals={mockRenewals} />
      </BrowserRouter>
    );

    // Should show counts in parentheses - use getAllByText since multiple sections may have count (1)
    const counts = screen.getAllByText(/\(\d+\)/);
    expect(counts.length).toBeGreaterThan(0); // At least one section shows a count
  });

  it('renders empty when no renewals provided', () => {
    const { container } = render(
      <BrowserRouter>
        <RenewalTimeline renewals={[]} />
      </BrowserRouter>
    );

    // Should not show any section headers
    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
    expect(screen.queryByText('Next 7 Days')).not.toBeInTheDocument();
  });

  it('hides sections with no renewals', () => {
    const onlyOverdueRenewal: Renewal[] = [
      {
        id: '1',
        domain: 'property',
        name: 'Home Insurance',
        recordType: 'home-insurance',
        renewalDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'Critical',
        domainUrl: '/property/1'
      }
    ];

    render(
      <BrowserRouter>
        <RenewalTimeline renewals={onlyOverdueRenewal} />
      </BrowserRouter>
    );

    expect(screen.getByText('Overdue')).toBeInTheDocument();
    // Beyond 90 days shouldn't appear since we only have an overdue renewal
    expect(screen.queryByText('Beyond 90 Days')).not.toBeInTheDocument();
  });
});
