/**
 * Mask account number - show only last 4 digits
 * Example: "12345678" → "**** 5678"
 */
export const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length < 4) return '****';
  const lastFour = accountNumber.slice(-4);
  return `**** ${lastFour}`;
};

/**
 * Mask sort code - show only last 2 digits
 * Example: "12-34-56" → "**-**-56"
 */
export const maskSortCode = (sortCode: string): string => {
  if (!sortCode) return '**-**-**';

  const parts = sortCode.split('-');
  if (parts.length !== 3) return '**-**-**';

  return `**-**-${parts[2]}`;
};

/**
 * Mask card number - show only last 4 digits
 * Example: "1234567812345678" → "**** **** **** 5678"
 */
export const maskCardNumber = (cardNumber: string): string => {
  if (!cardNumber || cardNumber.length < 4) return '**** **** **** ****';
  const lastFour = cardNumber.slice(-4);
  return `**** **** **** ${lastFour}`;
};
