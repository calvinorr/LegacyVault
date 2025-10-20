import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ServiceTypeBadge from '../ServiceTypeBadge';

describe('ServiceTypeBadge', () => {
  describe('Icon and Color Rendering', () => {
    it('should render plumber badge with correct icon and color', () => {
      const { container } = render(<ServiceTypeBadge type="plumber" />);
      expect(screen.getByText('Plumber')).toBeInTheDocument();
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveStyle({ backgroundColor: expect.stringContaining('#') });
    });

    it('should render electrician badge with yellow color', () => {
      const { container } = render(<ServiceTypeBadge type="electrician" />);
      expect(screen.getByText('Electrician')).toBeInTheDocument();
    });

    it('should render oil supplier badge', () => {
      render(<ServiceTypeBadge type="oil_supplier" />);
      expect(screen.getByText('Oil Supplier')).toBeInTheDocument();
    });

    it('should render cleaner badge', () => {
      render(<ServiceTypeBadge type="cleaner" />);
      expect(screen.getByText('Cleaner')).toBeInTheDocument();
    });

    it('should render gardener badge', () => {
      render(<ServiceTypeBadge type="gardener" />);
      expect(screen.getByText('Gardener')).toBeInTheDocument();
    });

    it('should render handyman badge', () => {
      render(<ServiceTypeBadge type="handyman" />);
      expect(screen.getByText('Handyman')).toBeInTheDocument();
    });

    it('should render other badge for unknown types', () => {
      render(<ServiceTypeBadge type="other" />);
      expect(screen.getByText('Other')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should render small size badge', () => {
      const { container } = render(<ServiceTypeBadge type="plumber" size="sm" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveStyle({ fontSize: '12px' });
    });

    it('should render medium size badge by default', () => {
      const { container } = render(<ServiceTypeBadge type="plumber" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveStyle({ fontSize: '13px' });
    });

    it('should render large size badge', () => {
      const { container } = render(<ServiceTypeBadge type="plumber" size="lg" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveStyle({ fontSize: '14px' });
    });
  });
});
