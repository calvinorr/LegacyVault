/**
 * UK-Specific Validation Utilities (Frontend)
 */

export const isValidPostcode = (postcode: string): boolean => {
  if (!postcode) return false;
  // UK postcode regex: allows formats like SW1A 1AA, M1 1AE, B33 8TH
  const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
  return postcodeRegex.test(postcode);
};

/**
 * Validate UK sort code format
 * Expected format: XX-XX-XX (6 digits with hyphens)
 */
export const isValidSortCode = (sortCode: string): boolean => {
  if (!sortCode) return false;

  // Remove spaces and convert to uppercase
  const cleaned = sortCode.replace(/\s/g, '');

  // Check format: XX-XX-XX
  const sortCodePattern = /^\d{2}-\d{2}-\d{2}$/;

  return sortCodePattern.test(cleaned);
};

/**
 * Format sort code input as user types
 * Automatically adds hyphens: 123456 → 12-34-56
 */
export const formatSortCodeInput = (input: string): string => {
  // Remove all non-digits
  const digits = input.replace(/\D/g, '');

  // Add hyphens after 2nd and 4th digits
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 6)}`;
};

/**
 * Validate UK National Insurance number
 * Format: XX 12 34 56 A
 * - First 2 letters (not BG, GB, NK, KN, TN, NT, ZZ)
 * - 6 digits
 * - 1 final letter (A, B, C, D, or space)
 */
export const isValidNINumber = (niNumber: string): boolean => {
  if (!niNumber) return false;

  // Remove spaces and convert to uppercase
  const cleaned = niNumber.replace(/\s/g, '').toUpperCase();

  // Pattern: 2 letters, 6 digits, 1 letter
  const niPattern = /^[A-CEGHJ-PR-TW-Z]{2}\d{6}[A-D]?$/;

  if (!niPattern.test(cleaned)) return false;

  // Check for invalid prefix combinations
  const invalidPrefixes = ['BG', 'GB', 'NK', 'KN', 'TN', 'NT', 'ZZ'];
  const prefix = cleaned.substring(0, 2);

  return !invalidPrefixes.includes(prefix);
};

/**
 * Format NI number for display: XX123456A → XX 12 34 56 A
 */
export const formatNINumber = (niNumber: string): string => {
  const cleaned = niNumber.replace(/\s/g, '').toUpperCase();

  if (cleaned.length < 2) return cleaned;
  if (cleaned.length < 4) return `${cleaned.substring(0, 2)} ${cleaned.substring(2)}`;
  if (cleaned.length < 6) return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4)}`;
  if (cleaned.length < 8) return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6)}`;

  return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8)}`;
};

/**
 * Validate UK and Northern Ireland vehicle registration plates
 * Supports various UK formats:
 * - Current format: AB12 CDE (2001-present)
 * - Prefix format: A123 BCD (1983-2001)
 * - Suffix format: ABC 123D (1963-1983)
 * - Dateless format: ABC 123 (pre-1963)
 * - Northern Ireland: IZ (letters) followed by 1-4 digits (e.g., IZ 1234)
 */
export const isValidUKRegistration = (registration: string): boolean => {
  if (!registration) return false;

  const reg = registration.replace(/\s/g, '').toUpperCase();

  // Current format (2001-present): AB12CDE
  const currentFormat = /^[A-Z]{2}[0-9]{2}[A-Z]{3}$/;

  // Prefix format (1983-2001): A123BCD
  const prefixFormat = /^[A-Z][0-9]{1,3}[A-Z]{3}$/;

  // Suffix format (1963-1983): ABC123D
  const suffixFormat = /^[A-Z]{3}[0-9]{1,3}[A-Z]$/;

  // Dateless format (pre-1963): ABC123
  const datelessFormat = /^[A-Z]{1,3}[0-9]{1,4}$/;

  // Northern Ireland format: IZ (letters) followed by 1-4 digits
  const northernIrelandFormat = /^[I-N][A-Z]{1,2}[0-9]{1,4}$/;

  return (
    currentFormat.test(reg) ||
    prefixFormat.test(reg) ||
    suffixFormat.test(reg) ||
    datelessFormat.test(reg) ||
    northernIrelandFormat.test(reg)
  );
};
