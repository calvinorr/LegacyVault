import React from 'react';
import { render, screen } from '@testing-library/react';
import VehicleRecordForm from '../vehicles/VehicleRecordForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('../../hooks/useVehicleRecords', () => ({
  useCreateVehicleRecord: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock('../../hooks/useRecordTypes', () => ({
  useRecordTypes: () => ({ recordTypes: [], loading: false }),
}));

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('VehicleRecordForm', () => {
  it('renders the form', () => {
    render(
      <VehicleRecordForm
        isOpen={true}
        onClose={() => {}}
        onSuccess={() => {}}
      />, { wrapper });

    expect(screen.getByText('Add Vehicle Record')).toBeInTheDocument();
  });
});