import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EmploymentRecordForm from '../employment/EmploymentRecordForm';

// Mock hooks and modules
jest.mock('../../hooks/useEmploymentRecords', () => ({
  useCreateEmploymentRecord: () => ({ mutateAsync: jest.fn() }),
  useUpdateEmploymentRecord: () => ({ mutateAsync: jest.fn() }),
}));
jest.mock('../../hooks/useRecordTypes', () => ({
  useRecordTypes: () => ({ recordTypes: [{ _id: '1', name: 'Test Type' }], loading: false }),
}));

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('EmploymentRecordForm', () => {
  it('renders the form correctly', () => {
    render(<EmploymentRecordForm onSuccess={() => {}} onCancel={() => {}} />, { wrapper });
    expect(screen.getByLabelText(/Record Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Record Type/i)).toBeInTheDocument();
  });
});