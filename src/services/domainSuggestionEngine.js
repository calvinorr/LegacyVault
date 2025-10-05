// src/services/domainSuggestionEngine.js
// Story 2.4: Domain suggestion engine for Bank Import
// Maps transactions to appropriate life domains based on UK provider patterns

/**
 * Domain Suggestion Engine
 *
 * Maps Bank Import transactions to life domains with confidence scoring.
 * Target: ≥80% accuracy for common UK providers
 *
 * Domains: property, vehicles, finance, employment, government, insurance, legal, services
 */

// UK Provider patterns mapped to domains
const DOMAIN_PATTERNS = {
  // PROPERTY domain (utilities, council tax, home insurance, mortgage)
  property: {
    providers: [
      // Energy providers
      'british gas', 'bg energy', 'eon', 'e.on', 'edf', 'edf energy', 'octopus energy',
      'bulb', 'ovo energy', 'scottish power', 'sse', 'shell energy', 'utilita',
      // Water providers
      'thames water', 'severn trent', 'united utilities', 'yorkshire water',
      'south west water', 'anglian water', 'wessex water', 'northumbrian water',
      // Council tax
      'council tax', 'borough council', 'city council', 'county council',
      // Broadband/Phone (home services)
      'bt broadband', 'sky broadband', 'virgin media', 'talktalk', 'plusnet',
      // Home insurance & mortgage
      'home insurance', 'buildings insurance', 'contents insurance',
      'nationwide mortgage', 'halifax mortgage', 'santander mortgage', 'hsbc mortgage'
    ],
    keywords: [
      'electric', 'electricity', 'gas', 'energy', 'power', 'utility', 'utilities',
      'water', 'sewerage', 'council tax', 'rates', 'broadband', 'internet', 'wifi',
      'mortgage', 'home insurance', 'buildings', 'contents'
    ],
    recordTypes: {
      'energy': 'utility-electric',
      'electric': 'utility-electric',
      'gas': 'utility-gas',
      'water': 'utility-water',
      'council': 'council-tax',
      'broadband': 'utility-broadband',
      'internet': 'utility-broadband',
      'mortgage': 'mortgage',
      'insurance': 'home-insurance'
    }
  },

  // VEHICLES domain (car insurance, MOT, road tax, fuel, finance)
  vehicles: {
    providers: [
      // Car insurance
      'admiral', 'direct line', 'aviva', 'axa', 'churchill', 'esure', 'hastings direct',
      'lv=', 'more than', 'rac', 'aa insurance', 'confused.com', 'comparethemarket',
      // Vehicle finance
      'black horse', 'santander consumer', 'motonovo', 'hitachi capital', 'pcp finance',
      // MOT/Service
      'kwik fit', 'halfords', 'ats euromaster', 'mot test', 'garage', 'servicing',
      // Fuel
      'shell', 'bp', 'esso', 'tesco fuel', 'sainsburys fuel', 'asda fuel', 'morrisons fuel'
    ],
    keywords: [
      'car insurance', 'motor insurance', 'vehicle', 'mot', 'road tax', 'dvla',
      'car finance', 'pcp', 'hp finance', 'lease', 'fuel', 'petrol', 'diesel',
      'breakdown', 'recovery', 'garage', 'servicing', 'tyres'
    ],
    recordTypes: {
      'insurance': 'insurance',
      'mot': 'mot',
      'tax': 'road-tax',
      'finance': 'finance',
      'fuel': 'fuel',
      'service': 'service'
    }
  },

  // FINANCE domain (bank accounts, credit cards, loans, savings)
  finance: {
    providers: [
      // Banks
      'hsbc', 'barclays', 'lloyds', 'halifax', 'natwest', 'rbs', 'santander',
      'nationwide', 'first direct', 'metro bank', 'monzo', 'starling', 'revolut',
      // Credit cards
      'amex', 'american express', 'mastercard', 'visa', 'capital one', 'mbna',
      // Loans & finance
      'zopa', 'vanquis', 'aqua', 'lending works', 'funding circle'
    ],
    keywords: [
      'bank', 'current account', 'savings', 'isa', 'credit card', 'loan',
      'overdraft', 'interest', 'transfer', 'payment', 'balance'
    ],
    recordTypes: {
      'current': 'current-account',
      'savings': 'savings',
      'credit': 'credit-card',
      'loan': 'loan',
      'isa': 'isa'
    }
  },

  // INSURANCE domain (life, health, income protection, travel)
  insurance: {
    providers: [
      // Life insurance
      'legal & general', 'aviva life', 'zurich', 'prudential', 'scottish widows',
      // Health insurance
      'bupa', 'axa health', 'vitality health', 'benenden health', 'simply health',
      // Travel insurance
      'post office travel', 'staysure', 'age uk travel', 'moneysupermarket travel',
      // Pet insurance
      'pet plan', 'direct line pet', 'bought by many', 'animal friends'
    ],
    keywords: [
      'life insurance', 'life cover', 'critical illness', 'income protection',
      'health insurance', 'private health', 'dental', 'travel insurance',
      'pet insurance', 'protection'
    ],
    recordTypes: {
      'life': 'life-insurance',
      'health': 'health-insurance',
      'travel': 'travel-insurance',
      'income': 'income-protection',
      'pet': 'pet-insurance'
    }
  },

  // GOVERNMENT domain (passport, driving licence, TV licence, HMRC)
  government: {
    providers: [
      'dvla', 'hm passport', 'passport office', 'hmrc', 'self assessment',
      'tv licensing', 'tv licence', 'bbc', 'post office', 'gov.uk'
    ],
    keywords: [
      'passport', 'driving licence', 'photocard', 'tv licence', 'tax return',
      'self assessment', 'hmrc', 'vat', 'national insurance', 'ni contributions'
    ],
    recordTypes: {
      'passport': 'passport',
      'driving': 'driving-licence',
      'tv': 'tv-licence',
      'tax': 'tax-return',
      'ni': 'ni-contributions'
    }
  },

  // SERVICES domain (subscriptions, memberships, professional services)
  services: {
    providers: [
      // Streaming services
      'netflix', 'amazon prime', 'disney+', 'apple tv', 'spotify', 'youtube premium',
      // Gym & fitness
      'puregym', 'david lloyd', 'virgin active', 'nuffield health', 'the gym',
      // Professional services
      'aa membership', 'rac membership', 'which?', 'nationwide flex'
    ],
    keywords: [
      'subscription', 'membership', 'streaming', 'gym', 'fitness', 'professional',
      'breakdown cover', 'magazine', 'software', 'cloud storage'
    ],
    recordTypes: {
      'streaming': 'subscription',
      'gym': 'membership',
      'breakdown': 'breakdown-cover',
      'professional': 'professional-membership'
    }
  },

  // EMPLOYMENT domain (salary, pension, benefits)
  employment: {
    providers: [
      'salary', 'wages', 'payroll', 'paye', 'pension', 'nest pension',
      'workplace pension', 'auto enrolment', 'employee benefits'
    ],
    keywords: [
      'salary', 'wages', 'payroll', 'employer', 'pension contribution',
      'workplace pension', 'benefits', 'income'
    ],
    recordTypes: {
      'salary': 'salary',
      'pension': 'pension',
      'benefits': 'benefits'
    }
  },

  // LEGAL domain (solicitor, will, power of attorney)
  legal: {
    providers: [
      'solicitor', 'solicitors', 'law firm', 'legal services', 'will writing',
      'co-op legal', 'which? legal'
    ],
    keywords: [
      'solicitor', 'legal', 'will', 'power of attorney', 'probate',
      'legal advice', 'conveyancing', 'estate planning'
    ],
    recordTypes: {
      'will': 'will',
      'solicitor': 'legal-service',
      'power': 'power-of-attorney'
    }
  }
};

/**
 * Suggest domain for a transaction
 * @param {Object} transaction - Transaction object with payee, category, amount
 * @returns {Object} { domain, confidence, recordType, reasoning }
 */
function suggestDomain(transaction) {
  const { payee, category, amount, subcategory } = transaction;
  const payeeLower = (payee || '').toLowerCase();
  const categoryLower = (category || '').toLowerCase();
  const subcategoryLower = (subcategory || '').toLowerCase();

  let bestMatch = {
    domain: 'finance', // Default fallback
    confidence: 0.3,
    recordType: 'other',
    reasoning: 'Default (no specific match found)'
  };

  // Check each domain for matches
  for (const [domain, config] of Object.entries(DOMAIN_PATTERNS)) {
    let confidence = 0;
    let matchType = '';
    let recordType = 'other';

    // Provider exact match (highest confidence)
    const providerMatch = config.providers.find(provider =>
      payeeLower.includes(provider.toLowerCase())
    );
    if (providerMatch) {
      confidence = 0.95;
      matchType = `provider match: "${providerMatch}"`;

      // Determine record type from provider or keywords
      for (const [keyword, type] of Object.entries(config.recordTypes)) {
        if (payeeLower.includes(keyword) || categoryLower.includes(keyword)) {
          recordType = type;
          break;
        }
      }
    }

    // Keyword match (medium confidence)
    if (confidence === 0) {
      const keywordMatch = config.keywords.find(keyword =>
        payeeLower.includes(keyword) ||
        categoryLower.includes(keyword) ||
        subcategoryLower.includes(keyword)
      );
      if (keywordMatch) {
        confidence = 0.75;
        matchType = `keyword match: "${keywordMatch}"`;

        // Determine record type
        for (const [key, type] of Object.entries(config.recordTypes)) {
          if (keywordMatch.includes(key)) {
            recordType = type;
            break;
          }
        }
      }
    }

    // Update best match if this domain has higher confidence
    if (confidence > bestMatch.confidence) {
      bestMatch = {
        domain,
        confidence,
        recordType: recordType || 'other',
        reasoning: matchType
      };
    }
  }

  // Boost confidence for category-based matches
  if (categoryLower === 'utilities' && bestMatch.domain === 'property') {
    bestMatch.confidence = Math.min(0.95, bestMatch.confidence + 0.1);
  }
  if (categoryLower === 'insurance' && bestMatch.domain === 'insurance') {
    bestMatch.confidence = Math.min(0.95, bestMatch.confidence + 0.1);
  }

  return bestMatch;
}

/**
 * Batch suggest domains for multiple transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} Array of suggestions with domain info
 */
function batchSuggestDomains(transactions) {
  return transactions.map(transaction => ({
    ...transaction,
    domainSuggestion: suggestDomain(transaction)
  }));
}

/**
 * Get domain model class for a given domain name
 * @param {string} domainName - Domain name (e.g., 'property', 'vehicles')
 * @returns {Object} Mongoose model
 */
function getDomainModel(domainName) {
  const modelMap = {
    property: require('../models/domain/PropertyRecord'),
    vehicles: require('../models/domain/VehicleRecord'),
    finance: require('../models/domain/FinanceRecord'),
    employment: require('../models/domain/EmploymentRecord'),
    government: require('../models/domain/GovernmentRecord'),
    insurance: require('../models/domain/InsuranceRecord'),
    legal: require('../models/domain/LegalRecord'),
    services: require('../models/domain/ServicesRecord')
  };

  return modelMap[domainName] || modelMap.finance; // Default to finance
}

module.exports = {
  suggestDomain,
  batchSuggestDomains,
  getDomainModel,
  DOMAIN_PATTERNS
};
