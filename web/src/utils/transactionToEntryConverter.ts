import { CategorySuggestion } from "../services/categorySuggestionService";

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  originalText: string;
}

export interface ConvertedEntryData {
  title: string;
  provider: string;
  type: "bill" | "account" | "investment" | "property" | "policy";
  category: string;
  subCategory: string;
  accountDetails: {
    billType: string;
    monthlyAmount: string;
    paymentDate: string;
    directDebit: boolean;
    accountType: string;
    accountNumber: string;
    sortCode: string;
    branch: string;
  };
  notes: string;
  confidential: boolean;
}

/**
 * Extract provider name from transaction description
 */
export function extractProviderFromDescription(description: string): string {
  // Remove common payment prefixes and suffixes
  const cleanDesc = description
    .replace(/^(DD|DIRECT DEBIT|PAYMENT|CARD|ONLINE|TXN|FPO)\s*/gi, '')
    .replace(/\s*(PAYMENT|DD|DIRECT DEBIT|CARD|ONLINE|TXN|FPO)$/gi, '')
    .trim();

  // Handle specific UK patterns
  const patterns = [
    // British Gas variations
    { pattern: /BRITISH\s*GAS/i, provider: 'British Gas' },
    { pattern: /BG\s*ENERGY/i, provider: 'British Gas' },
    
    // Other common UK utilities
    { pattern: /E\.?ON/i, provider: 'E.ON' },
    { pattern: /EDF\s*ENERGY/i, provider: 'EDF Energy' },
    { pattern: /SCOTTISH\s*POWER/i, provider: 'Scottish Power' },
    { pattern: /THAMES\s*WATER/i, provider: 'Thames Water' },
    { pattern: /COUNCIL\s*TAX/i, provider: 'Council Tax' },
    
    // Telecoms
    { pattern: /BT\s*(GROUP|MOBILE)?/i, provider: 'BT' },
    { pattern: /THREE\s*UK/i, provider: 'Three' },
    { pattern: /VODAFONE/i, provider: 'Vodafone' },
    { pattern: /O2/i, provider: 'O2' },
    
    // Banks
    { pattern: /HSBC/i, provider: 'HSBC' },
    { pattern: /BARCLAYS/i, provider: 'Barclays' },
    { pattern: /LLOYDS/i, provider: 'Lloyds' },
    { pattern: /NATWEST/i, provider: 'NatWest' },
    
    // Streaming services
    { pattern: /NETFLIX/i, provider: 'Netflix' },
    { pattern: /AMAZON\s*PRIME/i, provider: 'Amazon Prime' },
    { pattern: /SPOTIFY/i, provider: 'Spotify' },
    
    // Insurance
    { pattern: /AVIVA/i, provider: 'Aviva' },
    { pattern: /DIRECT\s*LINE/i, provider: 'Direct Line' },
    { pattern: /ADMIRAL/i, provider: 'Admiral' },
  ];

  // Check for known patterns first
  for (const { pattern, provider } of patterns) {
    if (pattern.test(description)) {
      return provider;
    }
  }

  // Fallback: extract first 1-2 meaningful words
  const words = cleanDesc.split(/\s+/).filter(word => 
    word.length > 2 && 
    !/^\d+$/.test(word) && // Not just numbers
    !/^[A-Z]{2,3}\d+/.test(word) && // Not reference codes like ABC123, AB123, etc.
    !/(LTD|LIMITED|INC|CORP)$/i.test(word) // Filter out common corporate suffixes
  );
  
  if (words.length >= 2) {
    return words.slice(0, 2).join(' ');
  } else if (words.length === 1) {
    return words[0];
  }
  
  return cleanDesc || 'Unknown Provider';
}

/**
 * Generate a user-friendly title for the entry
 */
export function generateEntryTitle(description: string, provider: string): string {
  // Special cases for common UK bill types
  const billTypePatterns = [
    { pattern: /gas|energy/i, suffix: 'Gas Bill' },
    { pattern: /electric/i, suffix: 'Electricity Bill' },
    { pattern: /water/i, suffix: 'Water Bill' },
    { pattern: /council\s*tax/i, suffix: 'Council Tax' },
    { pattern: /mobile|phone/i, suffix: 'Mobile Phone' },
    { pattern: /internet|broadband/i, suffix: 'Internet' },
    { pattern: /insurance/i, suffix: 'Insurance' },
    { pattern: /netflix|streaming|subscription|prime/i, suffix: 'Subscription' },
    { pattern: /mortgage/i, suffix: 'Mortgage' },
    { pattern: /rent/i, suffix: 'Rent' },
  ];

  for (const { pattern, suffix } of billTypePatterns) {
    if (pattern.test(description) || pattern.test(provider)) {
      return `${provider} ${suffix}`;
    }
  }

  return `${provider} Payment`;
}

/**
 * Extract payment date (day of month) from transaction date
 */
export function extractPaymentDate(transactionDate: string): string {
  try {
    const date = new Date(transactionDate);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.getDate().toString();
  } catch {
    return '';
  }
}

/**
 * Determine if transaction is likely a direct debit
 */
export function isDirectDebit(originalText: string): boolean {
  const ddPatterns = [
    /^DD\s/i,
    /DIRECT\s*DEBIT/i,
    /\bDD\b/i,
    /FPO/i, // HSBC uses FPO for some direct debits
  ];

  return ddPatterns.some(pattern => pattern.test(originalText));
}

/**
 * Determine entry type based on transaction characteristics
 */
export function determineEntryType(description: string, amount: number): "bill" | "account" | "investment" | "property" | "policy" {
  const desc = description.toLowerCase();
  
  // Check for investment-related keywords
  if (/pension|sipp|isa|investment|stocks|shares|fund/.test(desc)) {
    return 'investment';
  }
  
  // Check for property-related keywords
  if (/mortgage|rent|property|estate|council\s*tax/.test(desc)) {
    return 'property';
  }
  
  // Check for insurance-related keywords
  if (/insurance|policy|cover|protection/.test(desc)) {
    return 'policy';
  }
  
  // Check for account transfers or banking
  if (/transfer|deposit|withdrawal|savings/.test(desc) && !/current\s*account/.test(desc)) {
    return 'account';
  }
  
  // Default to bill for most utility/service payments
  return 'bill';
}

/**
 * Convert transaction to entry data with category suggestions
 */
export function convertTransactionToEntry(
  transaction: Transaction,
  categorySuggestion?: CategorySuggestion
): ConvertedEntryData {
  const provider = extractProviderFromDescription(transaction.description);
  const title = generateEntryTitle(transaction.description, provider);
  const amount = Math.abs(transaction.amount).toFixed(2);
  const paymentDate = extractPaymentDate(transaction.date);
  const directDebit = isDirectDebit(transaction.originalText);
  const entryType = determineEntryType(transaction.description, transaction.amount);

  const baseData: ConvertedEntryData = {
    title,
    provider,
    type: entryType,
    category: categorySuggestion?.rootCategoryName || '',
    subCategory: categorySuggestion?.categoryName || '',
    accountDetails: {
      billType: categorySuggestion?.suggestedBillType || 'Other',
      monthlyAmount: amount,
      paymentDate,
      directDebit,
      accountType: '',
      accountNumber: '',
      sortCode: '',
      branch: '',
    },
    notes: `Auto-generated from bank transaction: ${transaction.originalText}`,
    confidential: true,
  };

  // Add category-specific notes if we have a suggestion
  if (categorySuggestion) {
    baseData.notes += `\n\nCategory suggestion: ${categorySuggestion.categoryPath} (${(categorySuggestion.confidence * 100).toFixed(0)}% confidence)`;
    baseData.notes += `\nReason: ${categorySuggestion.reason}`;
  }

  return baseData;
}

/**
 * Batch convert multiple transactions to entry data
 */
export function batchConvertTransactions(
  transactions: Transaction[],
  suggestions: Map<string, CategorySuggestion> = new Map()
): ConvertedEntryData[] {
  return transactions.map(transaction => {
    const transactionKey = `${transaction.date}-${transaction.description}-${transaction.amount}`;
    const suggestion = suggestions.get(transactionKey);
    return convertTransactionToEntry(transaction, suggestion);
  });
}

/**
 * Validate converted entry data
 */
export function validateEntryData(entryData: ConvertedEntryData): string[] {
  const errors: string[] = [];

  if (!entryData.title.trim()) {
    errors.push('Title is required');
  }

  if (!entryData.provider.trim()) {
    errors.push('Provider is required');
  }

  if (entryData.accountDetails.monthlyAmount && isNaN(parseFloat(entryData.accountDetails.monthlyAmount))) {
    errors.push('Monthly amount must be a valid number');
  }

  if (entryData.accountDetails.paymentDate) {
    const day = parseInt(entryData.accountDetails.paymentDate);
    if (isNaN(day) || day < 1 || day > 31) {
      errors.push('Payment date must be a valid day of the month (1-31)');
    }
  }

  return errors;
}

/**
 * Clean and format monetary amount
 */
export function formatAmount(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '0.00';
  return Math.abs(numAmount).toFixed(2);
}

/**
 * Generate preview text for bulk operations
 */
export function generateEntryPreview(entryData: ConvertedEntryData): string {
  const amount = entryData.accountDetails.monthlyAmount;
  const category = entryData.subCategory || entryData.category;
  return `${entryData.title} • ${entryData.provider} • £${amount}${category ? ` • ${category}` : ''}`;
}