import {
  maskAccountNumber,
  maskSortCode,
  maskCardNumber
} from '../dataMasking';

describe('Data Masking Utilities', () => {
  describe('maskAccountNumber', () => {
    it('masks account numbers correctly', () => {
      expect(maskAccountNumber('12345678')).toBe('**** 5678');
      expect(maskAccountNumber('87654321')).toBe('**** 4321');
    });

    it('handles short account numbers', () => {
      expect(maskAccountNumber('123')).toBe('****');
      expect(maskAccountNumber('')).toBe('****');
    });

    it('handles undefined/null gracefully', () => {
      expect(maskAccountNumber(undefined as any)).toBe('****');
      expect(maskAccountNumber(null as any)).toBe('****');
    });
  });

  describe('maskSortCode', () => {
    it('masks sort codes correctly', () => {
      expect(maskSortCode('12-34-56')).toBe('**-**-56');
      expect(maskSortCode('65-43-21')).toBe('**-**-21');
    });

    it('handles invalid format', () => {
      expect(maskSortCode('invalid')).toBe('**-**-**');
      expect(maskSortCode('12-34')).toBe('**-**-**');
      expect(maskSortCode('')).toBe('**-**-**');
    });

    it('handles undefined/null gracefully', () => {
      expect(maskSortCode(undefined as any)).toBe('**-**-**');
      expect(maskSortCode(null as any)).toBe('**-**-**');
    });
  });

  describe('maskCardNumber', () => {
    it('masks card numbers correctly', () => {
      expect(maskCardNumber('1234567812345678')).toBe('**** **** **** 5678');
      expect(maskCardNumber('8765432187654321')).toBe('**** **** **** 4321');
    });

    it('handles short card numbers', () => {
      expect(maskCardNumber('123')).toBe('**** **** **** ****');
      expect(maskCardNumber('')).toBe('**** **** **** ****');
    });

    it('handles undefined/null gracefully', () => {
      expect(maskCardNumber(undefined as any)).toBe('**** **** **** ****');
      expect(maskCardNumber(null as any)).toBe('**** **** **** ****');
    });
  });
});
