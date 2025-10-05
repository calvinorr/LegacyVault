/**
 * UK-Specific Validation Utilities
 * Validates UK financial and government formats
 */

/**
 * Validate UK sort code (XX-XX-XX format)
 * @param {string} sortCode - Sort code to validate
 * @returns {boolean} - True if valid
 */
const isValidSortCode = (sortCode) => {
  if (!sortCode) return false;
  const sortCodeRegex = /^\d{2}-\d{2}-\d{2}$/;
  return sortCodeRegex.test(sortCode);
};

/**
 * Validate UK National Insurance number
 * Format: XX 12 34 56 X (or XX123456X without spaces)
 * Excludes invalid prefixes (D, F, I, Q, U, V) and suffixes (E-Z)
 * @param {string} niNumber - NI number to validate
 * @returns {boolean} - True if valid
 */
const isValidNINumber = (niNumber) => {
  if (!niNumber) return false;
  const niRegex = /^[A-CEGHJ-PR-TW-Z]{1}[A-CEGHJ-NPR-TW-Z]{1}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]{1}$/i;
  return niRegex.test(niNumber);
};

/**
 * Validate UK vehicle registration plate
 * Formats: AB12 CDE, AB12CDE (current style)
 * @param {string} regPlate - Registration plate to validate
 * @returns {boolean} - True if valid
 */
const isValidRegistrationPlate = (regPlate) => {
  if (!regPlate) return false;
  const regPlateRegex = /^[A-Z]{2}\d{2}\s?[A-Z]{3}$/i;
  return regPlateRegex.test(regPlate);
};

/**
 * Validate UK postcode
 * Formats: SW1A 1AA, M1 1AE, B33 8TH, etc.
 * @param {string} postcode - Postcode to validate
 * @returns {boolean} - True if valid
 */
const isValidPostcode = (postcode) => {
  if (!postcode) return false;
  // UK postcode regex: allows formats like SW1A 1AA, M1 1AE, B33 8TH
  const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
  return postcodeRegex.test(postcode);
};

/**
 * Validate MOT date is in future or within 30 days
 * @param {Date|string} motDate - MOT expiry date
 * @returns {Object} - { valid: boolean, error?: string }
 */
const isValidMOTDate = (motDate) => {
  if (!motDate) return { valid: true }; // Optional field

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to midnight for date comparison

  const motExpiry = new Date(motDate);
  motExpiry.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  if (motExpiry < thirtyDaysAgo) {
    return {
      valid: false,
      error: 'MOT expired more than 30 days ago'
    };
  }

  return { valid: true };
};

module.exports = {
  isValidSortCode,
  isValidNINumber,
  isValidRegistrationPlate,
  isValidPostcode,
  isValidMOTDate
};
