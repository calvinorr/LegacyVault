import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ParentEntityCard from '../ParentEntityCard';
import { ParentEntity } from '../../../services/api/parentEntities';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('ParentEntityCard', () => {
  const mockEntity: ParentEntity = {
    _id: '1',
    userId: 'user1',
    domainType: 'Vehicle',
    name: '2019 Honda Civic',
    fields: { make: 'Honda', model: 'Civic' },
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T12:00:00Z'
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderCard = (props = {}) => {
    return render(
      <BrowserRouter>
        <ParentEntityCard
          entity={mockEntity}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          childRecordCount={0}
          {...props}
        />
      </BrowserRouter>
    );
  };

  it('renders entity name and domain icon', () => {
    renderCard();

    expect(screen.getByText('2019 Honda Civic')).toBeInTheDocument();
    // Icon is rendered (svg element exists)
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('displays child record count badge', () => {
    renderCard({ childRecordCount: 5 });

    expect(screen.getByText('5 records')).toBeInTheDocument();
  });

  it('shows "record" singular when count is 1', () => {
    renderCard({ childRecordCount: 1 });

    expect(screen.getByText('1 record')).toBeInTheDocument();
  });

  it('displays relative time for last updated', () => {
    renderCard();

    // "Updated X ago" text exists
    expect(screen.getByText(/Updated .* ago/i)).toBeInTheDocument();
  });

  it('navigates to detail page when card is clicked', () => {
    renderCard();

    const card = screen.getByText('2019 Honda Civic').closest('div');
    if (card) {
      fireEvent.click(card);
    }

    expect(mockNavigate).toHaveBeenCalledWith('/vehicles/1');
  });

  it('shows action menu when more button is clicked', () => {
    renderCard();

    // Click the "more" button (MoreVertical icon button)
    const moreButtons = screen.getAllByRole('button');
    const moreButton = moreButtons.find(btn => btn.querySelector('svg'));

    if (moreButton) {
      fireEvent.click(moreButton);
    }

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onEdit when Edit is clicked', () => {
    renderCard();

    const moreButtons = screen.getAllByRole('button');
    const moreButton = moreButtons.find(btn => btn.querySelector('svg'));

    if (moreButton) {
      fireEvent.click(moreButton);
    }

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockEntity);
  });

  it('calls onDelete when Delete is clicked', () => {
    renderCard();

    const moreButtons = screen.getAllByRole('button');
    const moreButton = moreButtons.find(btn => btn.querySelector('svg'));

    if (moreButton) {
      fireEvent.click(moreButton);
    }

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockEntity);
  });

  it('renders correct icon for each domain type', () => {
    const domains: Array<ParentEntity['domainType']> = [
      'Vehicle',
      'Property',
      'Employment',
      'Services',
      'Finance'
    ];

    domains.forEach((domainType) => {
      const { container } = render(
        <BrowserRouter>
          <ParentEntityCard
            entity={{ ...mockEntity, domainType }}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </BrowserRouter>
      );

      // Each domain should render an SVG icon
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});
