import { isValidPostcode, isValidSortCode, isValidNINumber } from '../ukValidation';

describe('UK Validation Utils', () => {
  describe('isValidPostcode', () => {
    it('validates correct UK postcodes', () => {
      expect(isValidPostcode('SW1A 1AA')).toBe(true);
      expect(isValidPostcode('M1 1AE')).toBe(true);
      expect(isValidPostcode('B33 8TH')).toBe(true);
      expect(isValidPostcode('CR2 6XH')).toBe(true);
      expect(isValidPostcode('DN55 1PT')).toBe(true);
    });

    it('validates postcodes without spaces', () => {
      expect(isValidPostcode('SW1A1AA')).toBe(true);
      expect(isValidPostcode('M11AE')).toBe(true);
    });

    it('rejects invalid postcodes', () => {
      expect(isValidPostcode('INVALID')).toBe(false);
      expect(isValidPostcode('12345')).toBe(false);
      expect(isValidPostcode('ABC')).toBe(false);
      expect(isValidPostcode('')).toBe(false);
    });
  });

  describe('isValidSortCode', () => {
    it('validates correct sort codes', () => {
      expect(isValidSortCode('12-34-56')).toBe(true);
      expect(isValidSortCode('00-00-00')).toBe(true);
      expect(isValidSortCode('99-99-99')).toBe(true);
    });

    it('rejects invalid sort codes', () => {
      expect(isValidSortCode('123456')).toBe(false);
      expect(isValidSortCode('12-3456')).toBe(false);
      expect(isValidSortCode('12-34-5')).toBe(false);
      expect(isValidSortCode('')).toBe(false);
    });
  });

  describe('isValidNINumber', () => {
    it('validates correct NI numbers', () => {
      expect(isValidNINumber('AB 12 34 56 C')).toBe(true);
      expect(isValidNINumber('AB123456C')).toBe(true);
      expect(isValidNINumber('JK 98 76 54 D')).toBe(true);
    });

    it('rejects invalid NI numbers', () => {
      expect(isValidNINumber('INVALID')).toBe(false);
      expect(isValidNINumber('12345678')).toBe(false);
      expect(isValidNINumber('')).toBe(false);
    });
  });
});
