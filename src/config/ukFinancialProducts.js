// UK Financial Products Configuration
// Comprehensive product definitions for renewal tracking system
// Based on technical specification for comprehensive renewal system

const UK_FINANCIAL_PRODUCTS = {
  'Finance': {
    'Car Finance PCP': {
      reminderDays: [120, 90, 60, 30, 14],
      urgencyLevel: 'important',
      endDateType: 'hard_end',
      requiresAction: true,
      regulatoryType: 'fca_regulated',
      averageTerm: '36 months',
      renewalNotes: 'Consider buying, returning, or new PCP deal',
      noticePeriod: 30,
      namePatterns: ['pcp', 'personal contract purchase', 'car finance'],
      providerPatterns: ['bmw', 'audi', 'mercedes', 'finance', 'leasing'],
      complianceNotes: 'FCA regulated agreement - check final payment options'
    },
    'Car Finance HP': {
      reminderDays: [90, 60, 30, 14],
      urgencyLevel: 'important', 
      endDateType: 'hard_end',
      requiresAction: false,
      averageTerm: '48 months',
      regulatoryType: 'fca_regulated',
      namePatterns: ['hire purchase', 'car loan', 'hp agreement'],
      providerPatterns: ['finance', 'bank', 'credit'],
      renewalNotes: 'Ownership transfers automatically on final payment'
    },
    'Personal Loan': {
      reminderDays: [90, 60, 30],
      urgencyLevel: 'important',
      endDateType: 'hard_end',
      requiresAction: false,
      averageTerm: '5 years',
      regulatoryType: 'fca_regulated',
      namePatterns: ['personal loan', 'unsecured loan'],
      providerPatterns: ['bank', 'building society', 'credit union'],
      renewalNotes: 'Loan completes automatically - no action required'
    },
    'Mortgage Fixed Rate': {
      reminderDays: [180, 120, 90, 60, 30],
      urgencyLevel: 'strategic',
      endDateType: 'review_date',
      requiresAction: true,
      regulatoryType: 'fca_regulated',
      renewalNotes: 'Review rates 6 months before end of fixed term',
      namePatterns: ['mortgage', 'fixed rate', 'remortgage'],
      providerPatterns: ['bank', 'building society', 'mortgage lender'],
      complianceNotes: 'Consider remortgaging or rate switching options'
    },
    'Credit Card Promotional Rate': {
      reminderDays: [60, 30, 14, 7],
      urgencyLevel: 'important',
      endDateType: 'review_date',
      requiresAction: true,
      regulatoryType: 'fca_regulated',
      namePatterns: ['credit card', '0% offer', 'promotional rate'],
      providerPatterns: ['visa', 'mastercard', 'amex', 'bank'],
      renewalNotes: 'Standard rate applies after promotional period'
    },
    'Store Finance Deal': {
      reminderDays: [60, 30, 14, 7],
      urgencyLevel: 'important',
      endDateType: 'hard_end',
      requiresAction: true,
      regulatoryType: 'fca_regulated',
      namePatterns: ['buy now pay later', 'store credit', 'finance deal'],
      providerPatterns: ['klarna', 'clearpay', 'paypal', 'very', 'currys'],
      renewalNotes: 'Interest may apply if not paid by end date'
    }
  },
  
  'Contracts': {
    'Mobile Contract': {
      reminderDays: [90, 60, 30, 14],
      urgencyLevel: 'important',
      endDateType: 'hard_end',
      requiresAction: true,
      noticePeriod: 30,
      averageTerm: '24 months',
      regulatoryType: 'contractual',
      namePatterns: ['mobile', 'phone contract', 'sim only'],
      providerPatterns: ['ee', 'o2', 'three', 'vodafone', 'giffgaff', 'tesco mobile'],
      renewalNotes: 'Contract may auto-renew or switch to monthly rolling'
    },
    'Broadband Contract': {
      reminderDays: [90, 60, 30],
      urgencyLevel: 'important',
      endDateType: 'hard_end',
      requiresAction: true,
      noticePeriod: 30,
      averageTerm: '18 months',
      regulatoryType: 'contractual',
      namePatterns: ['broadband', 'fibre', 'internet', 'wifi'],
      providerPatterns: ['bt', 'sky', 'virgin', 'plusnet', 'talktalk', 'hyperoptic'],
      renewalNotes: 'May auto-renew at higher rate - compare deals'
    },
    'Energy Fixed Deal': {
      reminderDays: [60, 30, 14, 7],
      urgencyLevel: 'important',
      endDateType: 'review_date',
      requiresAction: true,
      regulatoryType: 'ofgem_regulated',
      namePatterns: ['energy', 'gas', 'electricity', 'dual fuel', 'fixed tariff'],
      providerPatterns: ['british gas', 'eon', 'edf', 'scottish power', 'sse', 'octopus'],
      renewalNotes: 'Switch before default tariff applies - use comparison sites',
      complianceNotes: 'Ofgem regulated - 14-day cooling off period applies'
    },
    'Tenancy Agreement': {
      reminderDays: [60, 30, 14],
      urgencyLevel: 'critical',
      endDateType: 'hard_end',
      requiresAction: true,
      noticePeriod: 30,
      averageTerm: '12 months',
      regulatoryType: 'contractual',
      namePatterns: ['tenancy', 'rental agreement', 'lease'],
      providerPatterns: ['estate agent', 'landlord', 'lettings'],
      renewalNotes: 'Give notice if not renewing - deposit implications',
      complianceNotes: 'Check deposit protection scheme requirements'
    },
    'Gym Membership': {
      reminderDays: [60, 30, 14],
      urgencyLevel: 'important',
      endDateType: 'auto_renewal',
      requiresAction: true,
      noticePeriod: 30,
      averageTerm: '12 months',
      regulatoryType: 'contractual',
      namePatterns: ['gym', 'fitness', 'health club'],
      providerPatterns: ['puregym', 'the gym', 'david lloyd', 'virgin active'],
      renewalNotes: 'Usually auto-renews - give notice to cancel'
    },
    'TV Streaming Contract': {
      reminderDays: [30, 14, 7],
      urgencyLevel: 'important',
      endDateType: 'auto_renewal',
      requiresAction: false,
      averageTerm: '12 months',
      regulatoryType: 'contractual',
      namePatterns: ['tv', 'streaming', 'subscription'],
      providerPatterns: ['sky', 'virgin', 'now tv', 'netflix', 'amazon prime'],
      renewalNotes: 'Most streaming services auto-renew monthly'
    }
  },
  
  'Insurance': {
    'Car Insurance': {
      reminderDays: [60, 30, 14, 7],
      urgencyLevel: 'critical',
      endDateType: 'auto_renewal',
      requiresAction: true,
      regulatoryType: 'fca_regulated',
      namePatterns: ['car insurance', 'motor insurance', 'vehicle insurance'],
      providerPatterns: ['aviva', 'axa', 'direct line', 'admiral', 'churchill', 'confused.com'],
      renewalNotes: 'Compare prices before auto-renewal - legal requirement to have cover',
      complianceNotes: 'Legal requirement - cannot drive without valid insurance'
    },
    'Home Insurance': {
      reminderDays: [60, 30, 14, 7],
      urgencyLevel: 'critical',
      endDateType: 'auto_renewal',
      requiresAction: true,
      regulatoryType: 'fca_regulated',
      namePatterns: ['home insurance', 'house insurance', 'buildings', 'contents'],
      providerPatterns: ['aviva', 'axa', 'direct line', 'halifax', 'nationwide'],
      renewalNotes: 'Review cover levels and compare prices annually',
      complianceNotes: 'Buildings insurance may be required by mortgage lender'
    },
    'Life Insurance': {
      reminderDays: [60, 30, 14],
      urgencyLevel: 'important',
      endDateType: 'auto_renewal',
      requiresAction: false,
      regulatoryType: 'fca_regulated',
      namePatterns: ['life insurance', 'life cover', 'term insurance'],
      providerPatterns: ['aviva', 'axa', 'legal & general', 'zurich'],
      renewalNotes: 'Premiums may increase with age - review regularly'
    },
    'Income Protection': {
      reminderDays: [60, 30, 14],
      urgencyLevel: 'important',
      endDateType: 'auto_renewal',
      requiresAction: false,
      regulatoryType: 'fca_regulated',
      namePatterns: ['income protection', 'salary insurance', 'sick pay insurance'],
      providerPatterns: ['aviva', 'axa', 'legal & general', 'vitality'],
      renewalNotes: 'Review benefit levels match current salary'
    },
    'Travel Insurance': {
      reminderDays: [30, 14, 7],
      urgencyLevel: 'important',
      endDateType: 'auto_renewal',
      requiresAction: false,
      namePatterns: ['travel insurance', 'holiday insurance', 'annual travel'],
      providerPatterns: ['aviva', 'axa', 'post office', 'columbus direct'],
      renewalNotes: 'Annual policies often better value than single trip'
    },
    'Pet Insurance': {
      reminderDays: [30, 14, 7],
      urgencyLevel: 'important',
      endDateType: 'auto_renewal',
      requiresAction: false,
      regulatoryType: 'fca_regulated',
      namePatterns: ['pet insurance', 'dog insurance', 'cat insurance'],
      providerPatterns: ['petplan', 'more than', 'direct line', 'animal friends'],
      renewalNotes: 'Pre-existing conditions excluded if you switch providers'
    },
    'Landlord Insurance': {
      reminderDays: [60, 30, 14],
      urgencyLevel: 'important',
      endDateType: 'auto_renewal',
      requiresAction: true,
      regulatoryType: 'fca_regulated',
      namePatterns: ['landlord insurance', 'buy to let', 'rental property'],
      providerPatterns: ['aviva', 'axa', 'direct line', 'simply business'],
      renewalNotes: 'Review rental income and property values annually'
    }
  },
  
  'Official': {
    'MOT Certificate': {
      reminderDays: [30, 14, 7, 3, 1],
      urgencyLevel: 'critical',
      endDateType: 'expiry_date',
      requiresAction: true,
      regulatoryType: 'government_required',
      renewalNotes: 'Legal requirement - book MOT test early',
      namePatterns: ['mot', 'mot test', 'mot certificate'],
      providerPatterns: ['kwik fit', 'halfords', 'ats euromaster', 'garage'],
      complianceNotes: 'Cannot legally drive on public roads without valid MOT'
    },
    'TV Licence': {
      reminderDays: [30, 14, 7],
      urgencyLevel: 'critical',
      endDateType: 'expiry_date',
      requiresAction: true,
      regulatoryType: 'government_required',
      renewalNotes: 'Required for live TV/BBC iPlayer',
      namePatterns: ['tv licence', 'television licence'],
      providerPatterns: ['tv licensing', 'bbc'],
      complianceNotes: 'Legal requirement for watching live TV or BBC iPlayer'
    },
    'Driving Licence': {
      reminderDays: [365, 180, 90, 30],
      urgencyLevel: 'critical',
      endDateType: 'expiry_date',
      requiresAction: true,
      regulatoryType: 'government_required',
      renewalNotes: 'Cannot drive with expired licence - renew online via DVLA',
      namePatterns: ['driving licence', 'drivers license'],
      providerPatterns: ['dvla', 'driving'],
      complianceNotes: 'Must renew every 10 years (every 3 years if over 70)'
    },
    'Passport': {
      reminderDays: [365, 180, 90],
      urgencyLevel: 'important',
      endDateType: 'expiry_date',
      requiresAction: true,
      regulatoryType: 'government_required',
      renewalNotes: 'Some countries require 6+ months validity - renew early',
      namePatterns: ['passport', 'british passport'],
      providerPatterns: ['hm passport office', 'gov.uk'],
      complianceNotes: 'Allow 6+ weeks for renewal, longer in peak season'
    },
    'Vehicle Tax VED': {
      reminderDays: [14, 7, 3, 1],
      urgencyLevel: 'critical',
      endDateType: 'expiry_date',
      requiresAction: true,
      regulatoryType: 'government_required',
      renewalNotes: 'Cannot drive on public roads without valid tax',
      namePatterns: ['vehicle tax', 'road tax', 'ved', 'car tax'],
      providerPatterns: ['dvla', 'gov.uk'],
      complianceNotes: 'Automatic penalties apply from day after expiry'
    },
    'Professional Licence': {
      reminderDays: [90, 60, 30],
      urgencyLevel: 'critical',
      endDateType: 'expiry_date',
      requiresAction: true,
      regulatoryType: 'government_required',
      namePatterns: ['professional licence', 'trade licence', 'certification'],
      providerPatterns: ['professional body', 'regulatory authority'],
      renewalNotes: 'May require CPD evidence or examination',
      complianceNotes: 'Cannot practice profession without valid licence'
    }
  },
  
  'Savings': {
    'Fixed Rate Bond': {
      reminderDays: [60, 30, 14, 7],
      urgencyLevel: 'strategic',
      endDateType: 'hard_end',
      requiresAction: true,
      regulatoryType: 'fca_regulated',
      renewalNotes: 'Compare rates before auto-renewal or withdrawal',
      namePatterns: ['fixed rate bond', 'term deposit', 'savings bond'],
      providerPatterns: ['bank', 'building society', 'ns&i'],
      complianceNotes: 'FSCS protected up to £85,000 per institution'
    },
    'ISA Annual Limit': {
      reminderDays: [90, 60, 30, 14],
      urgencyLevel: 'strategic',
      endDateType: 'review_date',
      requiresAction: false,
      renewalNotes: 'Use full allowance before April 5th - tax year end',
      namePatterns: ['isa', 'individual savings account', 'stocks and shares isa'],
      providerPatterns: ['bank', 'building society', 'investment platform'],
      complianceNotes: 'Annual limit resets April 6th each tax year'
    },
    'Savings Bonus Rate': {
      reminderDays: [30, 14, 7],
      urgencyLevel: 'strategic',
      endDateType: 'review_date',
      requiresAction: true,
      renewalNotes: 'Rate may drop significantly after bonus period',
      namePatterns: ['bonus rate', 'introductory rate', 'regular saver'],
      providerPatterns: ['bank', 'building society'],
      complianceNotes: 'Standard rate usually much lower than bonus rate'
    },
    'Investment Term': {
      reminderDays: [90, 60, 30],
      urgencyLevel: 'strategic',
      endDateType: 'hard_end',
      requiresAction: true,
      regulatoryType: 'fca_regulated',
      namePatterns: ['investment term', 'structured product', 'growth bond'],
      providerPatterns: ['investment platform', 'bank', 'financial advisor'],
      renewalNotes: 'Review performance and consider alternatives'
    },
    'Premium Bonds Review': {
      reminderDays: [365, 180],
      urgencyLevel: 'strategic',
      endDateType: 'review_date',
      requiresAction: false,
      renewalNotes: 'Annual review of holdings vs other savings options',
      namePatterns: ['premium bonds', 'ernie'],
      providerPatterns: ['ns&i', 'national savings'],
      complianceNotes: 'Tax-free prizes but no guaranteed return'
    }
  },
  
  'Warranties': {
    'Appliance Extended Warranty': {
      reminderDays: [90, 60, 30],
      urgencyLevel: 'important',
      endDateType: 'auto_renewal',
      requiresAction: false,
      renewalNotes: 'Consider if still cost-effective vs replacement',
      namePatterns: ['warranty', 'extended warranty', 'appliance cover'],
      providerPatterns: ['currys', 'ao.com', 'john lewis', 'argos'],
      complianceNotes: 'May be cheaper to self-insure for older appliances'
    },
    'Car Extended Warranty': {
      reminderDays: [90, 60, 30, 14],
      urgencyLevel: 'important',
      endDateType: 'hard_end',
      requiresAction: true,
      renewalNotes: 'Compare with independent warranty providers',
      namePatterns: ['car warranty', 'extended warranty', 'vehicle warranty'],
      providerPatterns: ['manufacturer', 'dealer', 'warranty provider'],
      complianceNotes: 'Check what repairs are covered and exclusions'
    },
    'Boiler Service Plan': {
      reminderDays: [30, 14, 7],
      urgencyLevel: 'important',
      endDateType: 'auto_renewal',
      requiresAction: false,
      renewalNotes: 'Annual service maintains warranty and safety',
      namePatterns: ['boiler cover', 'heating cover', 'service plan'],
      providerPatterns: ['british gas', 'eon', 'homeserve', 'local engineer'],
      complianceNotes: 'Annual service required for warranty and safety'
    },
    'Home Emergency Cover': {
      reminderDays: [30, 14, 7],
      urgencyLevel: 'important',
      endDateType: 'auto_renewal',
      requiresAction: false,
      renewalNotes: 'Check what emergencies are covered',
      namePatterns: ['home emergency', 'emergency cover', 'home assistance'],
      providerPatterns: ['british gas', 'homeserve', 'home insurance provider'],
      complianceNotes: 'Often cheaper as add-on to home insurance'
    },
    'Breakdown Cover': {
      reminderDays: [30, 14, 7],
      urgencyLevel: 'important',
      endDateType: 'auto_renewal',
      requiresAction: false,
      renewalNotes: 'Compare AA, RAC and insurance provider options',
      namePatterns: ['breakdown cover', 'roadside assistance', 'recovery'],
      providerPatterns: ['aa', 'rac', 'green flag', 'insurance provider'],
      complianceNotes: 'Check coverage levels and call-out limits'
    }
  },
  
  'Professional': {
    'Professional Body Membership': {
      reminderDays: [60, 30, 14],
      urgencyLevel: 'important',
      endDateType: 'expiry_date',
      requiresAction: true,
      renewalNotes: 'Required for professional status and practice',
      namePatterns: ['membership', 'professional body', 'institute'],
      providerPatterns: ['professional body', 'institute', 'chartered'],
      complianceNotes: 'May require CPD evidence for renewal'
    },
    'Trade Union Membership': {
      reminderDays: [30, 14],
      urgencyLevel: 'important',
      endDateType: 'auto_renewal',
      requiresAction: false,
      renewalNotes: 'Provides workplace representation and legal support',
      namePatterns: ['union', 'trade union', 'union membership'],
      providerPatterns: ['unite', 'unison', 'gmb', 'trade union'],
      complianceNotes: 'Workplace protection and legal representation'
    },
    'Professional Qualification CPD': {
      reminderDays: [90, 60, 30],
      urgencyLevel: 'important',
      endDateType: 'expiry_date',
      requiresAction: true,
      renewalNotes: 'Complete CPD hours before deadline',
      namePatterns: ['cpd', 'continuing professional development', 'qualification'],
      providerPatterns: ['professional body', 'training provider'],
      complianceNotes: 'Evidence of learning required for most professions'
    },
    'Club Membership': {
      reminderDays: [60, 30, 14],
      urgencyLevel: 'important',
      endDateType: 'auto_renewal',
      requiresAction: false,
      renewalNotes: 'Consider usage vs membership costs',
      namePatterns: ['club membership', 'sports club', 'social club'],
      providerPatterns: ['club', 'society', 'association'],
      complianceNotes: 'Often discounts for multi-year payments'
    },
    'Certification Renewal': {
      reminderDays: [90, 60, 30],
      urgencyLevel: 'important',
      endDateType: 'expiry_date',
      requiresAction: true,
      renewalNotes: 'May require examination or assessment',
      namePatterns: ['certification', 'certificate', 'accreditation'],
      providerPatterns: ['certifying body', 'examination board'],
      complianceNotes: 'Check renewal requirements well in advance'
    }
  }
};

module.exports = UK_FINANCIAL_PRODUCTS;