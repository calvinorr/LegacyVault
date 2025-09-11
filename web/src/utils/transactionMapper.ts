interface Transaction {
  date: string;
  description: string;
  amount: number;
  originalText: string;
}

interface MappedEntry {
  title: string;
  provider: string;
  accountDetails: {
    billType: string;
    customerNumber: string;
    meterNumber: string;
    tariffType: string;
    paymentMethod: string;
    billingFrequency: string;
    emergencyNumber: string;
    onlineAccountUrl: string;
    category: string;
  };
  notes: string;
  confidential: boolean;
  category: string;
  subCategory: string;
  supplier: string;
  tags: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Bill type options from AddBillModal
const BILL_TYPE_OPTIONS = [
  "Electricity", "Gas", "Water", "Council Tax", "Internet/Broadband",
  "Mobile Phone", "Landline Phone", "TV Licence", "Sky TV/Satellite",
  "Virgin Media", "BT Sport", "Home Insurance", "Contents Insurance",
  "Life Insurance", "Travel Insurance", "Car Insurance", "Motorbike Insurance",
  "Health/Medical Insurance", "Pet Insurance", "Gym Membership",
  "Netflix/Streaming", "Spotify/Music", "Amazon Prime", "Other Subscription", "Other"
];

const VALID_CATEGORIES = ["Bills", "Insurance", "Subscriptions", "Banking", "Investments"];

// Payment method detection patterns
const PAYMENT_METHOD_PATTERNS = {
  'Direct Debit': [/^DD\s/i, /DIRECT DEBIT/i, /DIRCT DBT/i],
  'Standing Order': [/^SO\s/i, /STANDING ORDER/i, /STG ORD/i],
  'Card Payment': [/CARD/i, /VISA/i, /MASTERCARD/i, /DEBIT CARD/i]
};

// Provider and bill type mappings
const PROVIDER_MAPPINGS = {
  // Energy providers
  'British Gas': { billType: 'Gas', category: 'Bills', subCategory: 'Energy', supplier: 'British Gas' },
  'EDF Energy': { billType: 'Electricity', category: 'Bills', subCategory: 'Energy', supplier: 'EDF Energy' },
  'E.ON': { billType: 'Electricity', category: 'Bills', subCategory: 'Energy', supplier: 'E.ON' },
  'Octopus Energy': { billType: 'Electricity', category: 'Bills', subCategory: 'Energy', supplier: 'Octopus Energy' },
  'Ovo Energy': { billType: 'Electricity', category: 'Bills', subCategory: 'Energy', supplier: 'Ovo Energy' },
  'SSE': { billType: 'Electricity', category: 'Bills', subCategory: 'Energy', supplier: 'SSE' },
  'Scottish Power': { billType: 'Electricity', category: 'Bills', subCategory: 'Energy', supplier: 'Scottish Power' },
  
  // Water providers
  'Thames Water': { billType: 'Water', category: 'Bills', subCategory: 'Water', supplier: 'Thames Water' },
  'Anglian Water': { billType: 'Water', category: 'Bills', subCategory: 'Water', supplier: 'Anglian Water' },
  'United Utilities': { billType: 'Water', category: 'Bills', subCategory: 'Water', supplier: 'United Utilities' },
  
  // Communications
  'BT': { billType: 'Internet/Broadband', category: 'Bills', subCategory: 'Communications', supplier: 'BT' },
  'Virgin Media': { billType: 'Virgin Media', category: 'Bills', subCategory: 'Communications', supplier: 'Virgin Media' },
  'Sky': { billType: 'Sky TV/Satellite', category: 'Bills', subCategory: 'Entertainment', supplier: 'Sky' },
  'TalkTalk': { billType: 'Internet/Broadband', category: 'Bills', subCategory: 'Communications', supplier: 'TalkTalk' },
  
  // Mobile providers
  'Three': { billType: 'Mobile Phone', category: 'Bills', subCategory: 'Communications', supplier: 'Three' },
  'O2': { billType: 'Mobile Phone', category: 'Bills', subCategory: 'Communications', supplier: 'O2' },
  'EE': { billType: 'Mobile Phone', category: 'Bills', subCategory: 'Communications', supplier: 'EE' },
  'Vodafone': { billType: 'Mobile Phone', category: 'Bills', subCategory: 'Communications', supplier: 'Vodafone' },
  
  // Streaming services
  'Netflix': { billType: 'Netflix/Streaming', category: 'Subscriptions', subCategory: 'Streaming', supplier: 'Netflix' },
  'Amazon Prime': { billType: 'Amazon Prime', category: 'Subscriptions', subCategory: 'Streaming', supplier: 'Amazon' },
  'Spotify': { billType: 'Spotify/Music', category: 'Subscriptions', subCategory: 'Streaming', supplier: 'Spotify' },
  
  // Insurance
  'Aviva': { billType: 'Home Insurance', category: 'Insurance', subCategory: 'Home Insurance', supplier: 'Aviva' },
  'Direct Line': { billType: 'Car Insurance', category: 'Insurance', subCategory: 'Car Insurance', supplier: 'Direct Line' },
  'Admiral': { billType: 'Car Insurance', category: 'Insurance', subCategory: 'Car Insurance', supplier: 'Admiral' }
};

/**
 * Extract provider name from transaction description
 */
function extractProvider(description: string): string {
  // Remove common prefixes and clean up the description
  const cleanDescription = description
    .replace(/^(DD|SO|CARD|DIRECT DEBIT|STANDING ORDER)\s+/i, '')
    .replace(/\s+(PAYMENT|BILL|SUBSCRIPTION|ENERGY|GAS|ELECTRIC)$/i, '')
    .trim();

  // Try to match against known providers
  for (const [provider] of Object.entries(PROVIDER_MAPPINGS)) {
    if (cleanDescription.toUpperCase().includes(provider.toUpperCase())) {
      return provider;
    }
  }

  // For council tax, extract council name
  if (cleanDescription.toUpperCase().includes('COUNCIL TAX')) {
    const councilMatch = cleanDescription.match(/^(.+?)\s+COUNCIL/i);
    if (councilMatch) {
      return `${councilMatch[1]} Council`;
    }
  }

  // Extract first meaningful part as provider name
  const words = cleanDescription.split(' ');
  if (words.length >= 2) {
    return words.slice(0, 2).join(' ');
  }
  
  return cleanDescription || 'Unknown Provider';
}

/**
 * Infer bill type from transaction description
 */
export function inferBillTypeFromDescription(description: string): string {
  const upperDesc = description.toUpperCase();
  
  // Check for specific patterns
  if (upperDesc.includes('COUNCIL TAX')) return 'Council Tax';
  if (upperDesc.includes('TV LICENCE')) return 'TV Licence';
  if (upperDesc.includes('GYM') || upperDesc.includes('FITNESS')) return 'Gym Membership';
  
  // Check against provider mappings
  for (const [provider, mapping] of Object.entries(PROVIDER_MAPPINGS)) {
    if (upperDesc.includes(provider.toUpperCase())) {
      return mapping.billType;
    }
  }
  
  // Fallback patterns
  if (upperDesc.includes('GAS')) return 'Gas';
  if (upperDesc.includes('ELECTRIC') || upperDesc.includes('POWER')) return 'Electricity';
  if (upperDesc.includes('WATER')) return 'Water';
  if (upperDesc.includes('BROADBAND') || upperDesc.includes('INTERNET')) return 'Internet/Broadband';
  if (upperDesc.includes('MOBILE') || upperDesc.includes('PHONE')) return 'Mobile Phone';
  if (upperDesc.includes('INSURANCE')) return 'Home Insurance';
  if (upperDesc.includes('NETFLIX')) return 'Netflix/Streaming';
  if (upperDesc.includes('SPOTIFY')) return 'Spotify/Music';
  if (upperDesc.includes('AMAZON')) return 'Amazon Prime';
  
  return 'Other';
}

/**
 * Infer payment method from amount and description
 */
export function inferPaymentMethodFromAmount(amount: number, originalText: string): string {
  const upperText = originalText.toUpperCase();
  
  // Check for specific payment method indicators
  for (const [method, patterns] of Object.entries(PAYMENT_METHOD_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(upperText))) {
      return method;
    }
  }
  
  // Default based on amount patterns (rough heuristics)
  if (Math.abs(amount) > 100) {
    return 'Direct Debit'; // Large regular payments are often DD
  }
  
  return 'Monthly Payment'; // Default fallback
}

/**
 * Get category mapping for a provider
 */
function getCategoryMapping(provider: string, billType: string) {
  const mapping = PROVIDER_MAPPINGS[provider as keyof typeof PROVIDER_MAPPINGS];
  if (mapping) {
    return mapping;
  }
  
  // Special cases based on bill type
  if (billType === 'Council Tax') {
    return {
      category: 'Bills',
      subCategory: 'Council Services',
      supplier: provider
    };
  }
  
  // Default mapping
  return {
    category: 'Bills',
    subCategory: '',
    supplier: provider
  };
}

/**
 * Map transaction to entry format
 */
export function mapTransactionToEntry(transaction: Transaction): MappedEntry {
  const provider = extractProvider(transaction.description);
  const billType = inferBillTypeFromDescription(transaction.description);
  const paymentMethod = inferPaymentMethodFromAmount(transaction.amount, transaction.originalText);
  const categoryMapping = getCategoryMapping(provider, billType);
  
  // Format the transaction date to UK format
  const transactionDate = new Date(transaction.date).toLocaleDateString('en-GB');
  
  // Format amount with sign indication
  const isCredit = transaction.amount > 0;
  const amountText = `£${Math.abs(transaction.amount).toFixed(2)}${isCredit ? ' (Credit)' : ''}`;
  
  return {
    title: transaction.description,
    provider: provider,
    accountDetails: {
      billType: billType,
      customerNumber: '',
      meterNumber: '',
      tariffType: '',
      paymentMethod: paymentMethod,
      billingFrequency: 'Monthly',
      emergencyNumber: '',
      onlineAccountUrl: '',
      category: 'bill'
    },
    notes: `Transaction Date: ${transactionDate}\nAmount: ${amountText}\nOriginal Text: ${transaction.originalText}`,
    confidential: true,
    category: categoryMapping.category,
    subCategory: categoryMapping.subCategory || '',
    supplier: categoryMapping.supplier,
    tags: []
  };
}

/**
 * Validate mapped entry data
 */
export function validateMappedEntry(entry: MappedEntry): ValidationResult {
  const errors: string[] = [];
  
  // Required fields validation
  if (!entry.title?.trim()) {
    errors.push('Title is required');
  }
  
  if (!entry.provider?.trim()) {
    errors.push('Provider is required');
  }
  
  if (!entry.accountDetails?.billType?.trim()) {
    errors.push('Bill type is required');
  }
  
  // Validate bill type against allowed options
  if (entry.accountDetails?.billType && !BILL_TYPE_OPTIONS.includes(entry.accountDetails.billType)) {
    errors.push('Invalid bill type');
  }
  
  // Validate category
  if (entry.category && !VALID_CATEGORIES.includes(entry.category)) {
    errors.push('Invalid category');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get suggestions for similar transactions
 */
export function getSimilarTransactionSuggestions(transaction: Transaction, existingEntries: MappedEntry[]): MappedEntry[] {
  const provider = extractProvider(transaction.description);
  
  return existingEntries.filter(entry => 
    entry.provider.toLowerCase() === provider.toLowerCase() ||
    entry.title.toLowerCase().includes(provider.toLowerCase())
  ).slice(0, 3); // Return top 3 suggestions
}