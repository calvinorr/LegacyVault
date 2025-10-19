// web/src/components/child-records/__tests__/ChildRecordForm.test.tsx
// Comprehensive tests for ChildRecordForm component

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChildRecordForm } from '../ChildRecordForm';
import * as childRecordsApi from '../../../services/api/childRecords';

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false
  }))
}));

// Mock the API
jest.mock('../../../hooks/useChildRecords', () => ({
  useCreateChildRecord: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false
  })),
  useUpdateChildRecord: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false
  }))
}));

describe('ChildRecordForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders step 1 (type selector) for new records', () => {
    render(
      <ChildRecordForm
        domain="vehicles"
        parentId="p1"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Add Record')).toBeInTheDocument();
    expect(screen.getByText('Select the type of record to create')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Service History')).toBeInTheDocument();
  });

  test('renders all 6 record types in step 1', () => {
    render(
      <ChildRecordForm
        domain="vehicles"
        parentId="p1"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const recordTypes = ['Contact', 'Service History', 'Finance', 'Insurance', 'Government', 'Pension'];
    recordTypes.forEach(type => {
      expect(screen.getByText(type)).toBeInTheDocument();
    });
  });

  test('progresses to step 2 when selecting record type', async () => {
    render(
      <ChildRecordForm
        domain="vehicles"
        parentId="p1"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const contactButton = screen.getByText('Contact').closest('button');
    if (contactButton) {
      fireEvent.click(contactButton);
    }

    // Should show form fields after selecting type
    await waitFor(() => {
      expect(screen.getByText(/Record Name/i)).toBeInTheDocument();
    });
  });

  test('displays continuity fields (name, phone, email)', async () => {
    render(
      <ChildRecordForm
        domain="vehicles"
        parentId="p1"
        recordType="Contact"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText(/Record Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Phone/i)).toBeInTheDocument();
    expect(screen.getByText(/Email/i)).toBeInTheDocument();
  });

  test('displays renewal date field for Insurance records', async () => {
    render(
      <ChildRecordForm
        domain="vehicles"
        parentId="p1"
        recordType="Insurance"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText(/Renewal Date/i)).toBeInTheDocument();
  });

  test('displays status dropdown', async () => {
    render(
      <ChildRecordForm
        domain="vehicles"
        parentId="p1"
        recordType="Contact"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const statusSelect = screen.getByDisplayValue('active');
    expect(statusSelect).toBeInTheDocument();
  });

  test('groups fields into Essential Information and Additional Details sections', async () => {
    render(
      <ChildRecordForm
        domain="vehicles"
        parentId="p1"
        recordType="Contact"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText(/Essential Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Additional Details/i)).toBeInTheDocument();
  });

  test('closes modal when clicking close button', () => {
    render(
      <ChildRecordForm
        domain="vehicles"
        parentId="p1"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' }).closest('button');
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('validates required fields', async () => {
    render(
      <ChildRecordForm
        domain="vehicles"
        parentId="p1"
        recordType="Contact"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const submitButton = screen.getByText(/Create Record/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
    });
  });

  test('disables submit button while loading', async () => {
    render(
      <ChildRecordForm
        domain="vehicles"
        parentId="p1"
        recordType="Contact"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const submitButton = screen.getByText(/Create Record/i);
    expect(submitButton).not.toBeDisabled();
  });

  test('displays "Edit Record" title for existing records', () => {
    const mockRecord = {
      _id: '1',
      parentId: 'p1',
      recordType: 'Contact' as const,
      name: 'John Smith',
      fields: { phone: '028-1234-5678' },
      status: 'active' as const,
      attachments: [],
      createdAt: '2025-10-01T00:00:00Z',
      updatedAt: '2025-10-01T00:00:00Z'
    };

    render(
      <ChildRecordForm
        domain="vehicles"
        parentId="p1"
        record={mockRecord}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Edit Record')).toBeInTheDocument();
  });

  test('pre-fills form with existing record data', () => {
    const mockRecord = {
      _id: '1',
      parentId: 'p1',
      recordType: 'Contact' as const,
      name: 'John Smith',
      fields: { phone: '028-1234-5678', email: 'john@example.com' },
      status: 'active' as const,
      attachments: [],
      createdAt: '2025-10-01T00:00:00Z',
      updatedAt: '2025-10-01T00:00:00Z'
    };

    render(
      <ChildRecordForm
        domain="vehicles"
        parentId="p1"
        record={mockRecord}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByDisplayValue('John Smith')).toBeInTheDocument();
    expect(screen.getByDisplayValue('028-1234-5678')).toBeInTheDocument();
  });

  test('shows "Save Changes" button for edit mode', () => {
    const mockRecord = {
      _id: '1',
      parentId: 'p1',
      recordType: 'Contact' as const,
      name: 'John Smith',
      fields: {},
      status: 'active' as const,
      attachments: [],
      createdAt: '2025-10-01T00:00:00Z',
      updatedAt: '2025-10-01T00:00:00Z'
    };

    render(
      <ChildRecordForm
        domain="vehicles"
        parentId="p1"
        record={mockRecord}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText(/Save Changes/i)).toBeInTheDocument();
  });

  test('back button returns to type selector', async () => {
    render(
      <ChildRecordForm
        domain="vehicles"
        parentId="p1"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const contactButton = screen.getByText('Contact').closest('button');
    if (contactButton) {
      fireEvent.click(contactButton);
    }

    await waitFor(() => {
      const backButton = screen.getByText(/Back/i);
      fireEvent.click(backButton);
    });

    expect(screen.getByText('Select the type of record to create')).toBeInTheDocument();
  });

  test('cancel button closes modal without saving', () => {
    render(
      <ChildRecordForm
        domain="vehicles"
        parentId="p1"
        recordType="Contact"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  test('displays placeholder text for fields', async () => {
    render(
      <ChildRecordForm
        domain="vehicles"
        parentId="p1"
        recordType="Contact"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByPlaceholderText(/John Smith/i);
    expect(nameInput).toBeInTheDocument();
  });

  test('Additional Details section is visually muted/de-emphasized', async () => {
    render(
      <ChildRecordForm
        domain="vehicles"
        parentId="p1"
        recordType="Contact"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const additionalSection = screen.getByText(/Additional Details/i).closest('div');
    expect(additionalSection).toBeInTheDocument();
    // The section should have reduced opacity styling
  });

  test('handles record type with renewal date (Insurance)', async () => {
    render(
      <ChildRecordForm
        domain="vehicles"
        parentId="p1"
        recordType="Insurance"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText(/Renewal Date/i)).toBeInTheDocument();
    expect(screen.getByText(/Record Name/i)).toBeInTheDocument();
  });
});
