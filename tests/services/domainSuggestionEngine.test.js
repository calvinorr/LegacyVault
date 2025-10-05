// tests/services/domainSuggestionEngine.test.js
// Story 2.4: Domain suggestion engine tests (≥80% accuracy target)

const { suggestDomain } = require('../../src/services/domainSuggestionEngine');

describe('Domain Suggestion Engine', () => {
  describe('Property domain suggestions', () => {
    test('should detect British Gas as property domain', () => {
      const result = suggestDomain({ payee: 'BRITISH GAS', category: 'utilities', amount: -85.50 });
      expect(result.domain).toBe('property');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    test('should detect Octopus Energy as property domain', () => {
      const result = suggestDomain({ payee: 'Octopus Energy', category: 'utilities', amount: -120 });
      expect(result.domain).toBe('property');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    test('should detect Thames Water as property domain', () => {
      const result = suggestDomain({ payee: 'THAMES WATER', category: 'utilities', amount: -45 });
      expect(result.domain).toBe('property');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    test('should detect Council Tax as property domain', () => {
      const result = suggestDomain({ payee: 'LONDON BOROUGH COUNCIL', category: 'council_tax', amount: -150 });
      expect(result.domain).toBe('property');
    });

    test('should detect broadband providers as property domain', () => {
      const result = suggestDomain({ payee: 'BT BROADBAND', category: 'telecoms', amount: -35 });
      expect(result.domain).toBe('property');
    });
  });

  describe('Vehicles domain suggestions', () => {
    test('should detect Admiral as vehicles domain', () => {
      const result = suggestDomain({ payee: 'Admiral Insurance', category: 'insurance', amount: -45 });
      expect(result.domain).toBe('vehicles');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    test('should detect Direct Line as vehicles domain', () => {
      const result = suggestDomain({ payee: 'DIRECT LINE', category: 'insurance', amount: -60 });
      expect(result.domain).toBe('vehicles');
    });

    test('should detect MOT as vehicles domain', () => {
      const result = suggestDomain({ payee: 'Kwik Fit MOT', category: 'other', amount: -54.85 });
      expect(result.domain).toBe('vehicles');
    });

    test('should detect fuel stations as vehicles domain', () => {
      const result = suggestDomain({ payee: 'SHELL PETROL', category: 'other', amount: -75 });
      expect(result.domain).toBe('vehicles');
    });
  });

  describe('Insurance domain suggestions', () => {
    test('should detect life insurance as insurance domain', () => {
      const result = suggestDomain({ payee: 'Legal & General', category: 'insurance', amount: -25 });
      expect(result.domain).toBe('insurance');
    });

    test('should detect health insurance as insurance domain', () => {
      const result = suggestDomain({ payee: 'BUPA HEALTH', category: 'insurance', amount: -120 });
      expect(result.domain).toBe('insurance');
    });

    test('should detect travel insurance as insurance domain', () => {
      const result = suggestDomain({ payee: 'Post Office Travel Insurance', category: 'insurance', amount: -35 });
      expect(result.domain).toBe('insurance');
    });
  });

  describe('Government domain suggestions', () => {
    test('should detect DVLA as government domain', () => {
      const result = suggestDomain({ payee: 'DVLA VEHICLE TAX', category: 'other', amount: -165 });
      expect(result.domain).toBe('government');
    });

    test('should detect TV Licence as government domain', () => {
      const result = suggestDomain({ payee: 'TV LICENSING', category: 'other', amount: -159 });
      expect(result.domain).toBe('government');
    });

    test('should detect passport fees as government domain', () => {
      const result = suggestDomain({ payee: 'HM PASSPORT OFFICE', category: 'other', amount: -82.50 });
      expect(result.domain).toBe('government');
    });
  });

  describe('Services domain suggestions', () => {
    test('should detect Netflix as services domain', () => {
      const result = suggestDomain({ payee: 'NETFLIX', category: 'subscription', amount: -10.99 });
      expect(result.domain).toBe('services');
    });

    test('should detect gym memberships as services domain', () => {
      const result = suggestDomain({ payee: 'PUREGYM', category: 'subscription', amount: -25 });
      expect(result.domain).toBe('services');
    });

    test('should detect AA membership as services domain', () => {
      const result = suggestDomain({ payee: 'AA MEMBERSHIP', category: 'other', amount: -12 });
      expect(result.domain).toBe('services');
    });
  });

  describe('Finance domain suggestions (fallback)', () => {
    test('should default unknown transactions to finance domain', () => {
      const result = suggestDomain({ payee: 'UNKNOWN MERCHANT ABC', category: 'other', amount: -50 });
      expect(result.domain).toBe('finance');
      expect(result.confidence).toBeLessThan(0.5); // Low confidence fallback
    });

    test('should detect banks as finance domain', () => {
      const result = suggestDomain({ payee: 'HSBC TRANSFER', category: 'other', amount: -500 });
      expect(result.domain).toBe('finance');
    });
  });

  describe('Accuracy testing', () => {
    test('should achieve ≥80% accuracy on UK provider sample', () => {
      const testCases = [
        { payee: 'BRITISH GAS', expected: 'property' },
        { payee: 'OCTOPUS ENERGY', expected: 'property' },
        { payee: 'THAMES WATER', expected: 'property' },
        { payee: 'COUNCIL TAX', expected: 'property' },
        { payee: 'SKY BROADBAND', expected: 'property' },
        { payee: 'ADMIRAL', expected: 'vehicles' },
        { payee: 'DIRECT LINE', expected: 'vehicles' },
        { payee: 'MOT TEST', expected: 'vehicles' },
        { payee: 'SHELL', expected: 'vehicles' },
        { payee: 'LEGAL & GENERAL', expected: 'insurance' },
        { payee: 'BUPA', expected: 'insurance' },
        { payee: 'DVLA', expected: 'government' },
        { payee: 'TV LICENSING', expected: 'government' },
        { payee: 'NETFLIX', expected: 'services' },
        { payee: 'PUREGYM', expected: 'services' },
        { payee: 'HSBC', expected: 'finance' }
      ];

      let correct = 0;
      testCases.forEach(({ payee, expected }) => {
        const result = suggestDomain({ payee, category: 'other', amount: -50 });
        if (result.domain === expected) correct++;
      });

      const accuracy = (correct / testCases.length) * 100;
      console.log(`Domain suggestion accuracy: ${accuracy}% (${correct}/${testCases.length})`);
      expect(accuracy).toBeGreaterThanOrEqual(80);
    });
  });
});
