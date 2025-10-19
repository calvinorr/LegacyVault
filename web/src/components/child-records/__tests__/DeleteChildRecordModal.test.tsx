// web/src/components/child-records/__tests__/DeleteChildRecordModal.test.tsx
// Tests for DeleteChildRecordModal component

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteChildRecordModal } from '../DeleteChildRecordModal';
import { ChildRecord } from '../../../services/api/childRecords';

describe('DeleteChildRecordModal', () => {
  const mockRecord: ChildRecord = {
    _id: '1',
    parentId: 'p1',
    recordType: 'Insurance',
    name: 'Car Insurance',
    fields: { policyNumber: 'POL-123' },
    status: 'active',
    attachments: [],
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-10-01T00:00:00Z'
  };

  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders delete confirmation modal', () => {
    render(
      <DeleteChildRecordModal
        record={mockRecord}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Delete Record')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
  });

  test('displays record name and type', () => {
    render(
      <DeleteChildRecordModal
        record={mockRecord}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Car Insurance')).toBeInTheDocument();
    expect(screen.getByText('Type: Insurance')).toBeInTheDocument();
  });

  test('displays warning message', () => {
    render(
      <DeleteChildRecordModal
        record={mockRecord}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/Once deleted, this record will be permanently removed/i)).toBeInTheDocument();
  });

  test('requires checkbox confirmation before enabling delete', () => {
    render(
      <DeleteChildRecordModal
        record={mockRecord}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const deleteButton = screen.getByText(/Delete Record/i);
    expect(deleteButton).toBeDisabled();

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(deleteButton).not.toBeDisabled();
  });

  test('calls onConfirm when delete is clicked with checkbox checked', async () => {
    render(
      <DeleteChildRecordModal
        record={mockRecord}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    const deleteButton = screen.getByText(/Delete Record/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalled();
    });
  });

  test('calls onCancel when cancel button clicked', () => {
    render(
      <DeleteChildRecordModal
        record={mockRecord}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('displays confirmation checkbox label', () => {
    render(
      <DeleteChildRecordModal
        record={mockRecord}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/I understand this record will be permanently deleted/i)).toBeInTheDocument();
  });

  test('shows loading state when deleting', () => {
    render(
      <DeleteChildRecordModal
        record={mockRecord}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    const deleteButton = screen.getByText(/Deleting/i);
    expect(deleteButton).toBeDisabled();
  });

  test('unchecking checkbox disables delete button', () => {
    render(
      <DeleteChildRecordModal
        record={mockRecord}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    let deleteButton = screen.getByText(/Delete Record/i);
    expect(deleteButton).not.toBeDisabled();

    fireEvent.click(checkbox);
    deleteButton = screen.getByText(/Delete Record/i);
    expect(deleteButton).toBeDisabled();
  });

  test('displays close button in header', () => {
    render(
      <DeleteChildRecordModal
        record={mockRecord}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const headerButtons = screen.getAllByRole('button');
    expect(headerButtons.length).toBeGreaterThanOrEqual(1);
  });

  test('has red accent styling for danger state', () => {
    const { container } = render(
      <DeleteChildRecordModal
        record={mockRecord}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Check for red styling (red accent color #ef4444)
    const title = screen.getByText('Delete Record');
    expect(title).toBeInTheDocument();
    expect(title).toHaveStyle({ color: '#ef4444' });
  });
});
