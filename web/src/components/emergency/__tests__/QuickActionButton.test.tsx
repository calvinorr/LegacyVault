// web/src/components/emergency/__tests__/QuickActionButton.test.tsx
import { render, screen } from '@testing-library/react';
import { Phone } from 'lucide-react';
import QuickActionButton from '../QuickActionButton';

describe('QuickActionButton', () => {
  it('renders with correct label', () => {
    render(
      <QuickActionButton
        icon={Phone}
        label="0123 456 7890"
        href="tel:01234567890"
        color="green"
      />
    );
    expect(screen.getByText('0123 456 7890')).toBeInTheDocument();
  });

  it('renders with correct href for phone', () => {
    render(
      <QuickActionButton
        icon={Phone}
        label="0123 456 7890"
        href="tel:01234567890"
        color="green"
      />
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'tel:01234567890');
  });

  it('applies correct color classes', () => {
    const { rerender } = render(
      <QuickActionButton
        icon={Phone}
        label="Test"
        href="tel:123"
        color="green"
      />
    );
    let link = screen.getByRole('link');
    expect(link.className).toContain('bg-green-100');

    rerender(
      <QuickActionButton
        icon={Phone}
        label="Test"
        href="tel:123"
        color="blue"
      />
    );
    link = screen.getByRole('link');
    expect(link.className).toContain('bg-blue-100');

    rerender(
      <QuickActionButton
        icon={Phone}
        label="Test"
        href="tel:123"
        color="red"
      />
    );
    link = screen.getByRole('link');
    expect(link.className).toContain('bg-red-100');
  });

  it('has minimum touch target height for accessibility', () => {
    render(
      <QuickActionButton
        icon={Phone}
        label="Test"
        href="tel:123"
        color="green"
      />
    );
    const link = screen.getByRole('link');
    expect(link.className).toContain('min-h-[48px]');
  });
});
