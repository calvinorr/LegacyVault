import { isValidSortCode, formatSortCodeInput } from '../ukValidation';

describe('UK Sort Code Validation', () => {
  describe('isValidSortCode', () => {
    it('validates correct sort codes', () => {
      expect(isValidSortCode('12-34-56')).toBe(true);
      expect(isValidSortCode('00-00-00')).toBe(true);
      expect(isValidSortCode('99-99-99')).toBe(true);
    });

    it('rejects invalid formats', () => {
      expect(isValidSortCode('123456')).toBe(false);
      expect(isValidSortCode('12-34')).toBe(false);
      expect(isValidSortCode('1-2-3')).toBe(false);
      expect(isValidSortCode('invalid')).toBe(false);
      expect(isValidSortCode('')).toBe(false);
    });

    it('handles spaces correctly', () => {
      expect(isValidSortCode('12 -34-56')).toBe(true); // Removes spaces
      expect(isValidSortCode(' 12-34-56 ')).toBe(true);
    });
  });

  describe('formatSortCodeInput', () => {
    it('formats numeric input correctly', () => {
      expect(formatSortCodeInput('123456')).toBe('12-34-56');
      expect(formatSortCodeInput('12')).toBe('12');
      expect(formatSortCodeInput('1234')).toBe('12-34');
    });

    it('removes non-digit characters', () => {
      expect(formatSortCodeInput('12a34b56')).toBe('12-34-56');
      expect(formatSortCodeInput('12-34-56')).toBe('12-34-56');
    });

    it('limits to 6 digits', () => {
      expect(formatSortCodeInput('1234567890')).toBe('12-34-56');
    });

    it('handles empty input', () => {
      expect(formatSortCodeInput('')).toBe('');
    });
  });
});
