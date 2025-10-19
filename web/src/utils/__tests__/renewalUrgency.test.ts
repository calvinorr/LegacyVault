// web/src/utils/__tests__/renewalUrgency.test.ts
// Tests for renewal urgency utilities

import {
  calculateRenewalUrgency,
  getUrgencyColors,
  formatRenewalDate,
  hasUrgentRenewals,
  shouldExpandSection
} from '../renewalUrgency';

describe('renewalUrgency utilities', () => {
  describe('calculateRenewalUrgency', () => {
    test('returns none level for undefined date', () => {
      const result = calculateRenewalUrgency(undefined);

      expect(result.level).toBe('none');
      expect(result.daysRemaining).toBeNull();
      expect(result.isUrgent).toBe(false);
    });

    test('returns none for empty string', () => {
      const result = calculateRenewalUrgency('');

      expect(result.level).toBe('none');
      expect(result.message).toBe('No renewal date set');
    });

    test('returns critical for dates < 30 days away', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      const dateString = futureDate.toISOString();

      const result = calculateRenewalUrgency(dateString);

      expect(result.level).toBe('critical');
      expect(result.isUrgent).toBe(true);
      expect(result.daysRemaining).toBeLessThan(30);
      expect(result.message).toContain('URGENT');
    });

    test('returns important for dates 30-90 days away', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 60);
      const dateString = futureDate.toISOString();

      const result = calculateRenewalUrgency(dateString);

      expect(result.level).toBe('important');
      expect(result.isUrgent).toBe(false);
      expect(result.daysRemaining).toBeGreaterThanOrEqual(30);
      expect(result.daysRemaining).toBeLessThan(90);
    });

    test('returns upcoming for dates > 90 days away', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 120);
      const dateString = futureDate.toISOString();

      const result = calculateRenewalUrgency(dateString);

      expect(result.level).toBe('upcoming');
      expect(result.isUrgent).toBe(false);
      expect(result.daysRemaining).toBeGreaterThan(90);
    });

    test('returns none for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      const dateString = pastDate.toISOString();

      const result = calculateRenewalUrgency(dateString);

      expect(result.level).toBe('none');
      expect(result.isUrgent).toBe(false);
      expect(result.daysRemaining).toBeLessThan(0);
      expect(result.message).toContain('Expired');
    });

    test('returns singular "day" when 1 day remaining', () => {
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      tomorrowDate.setHours(0, 0, 0, 0);
      const dateString = tomorrowDate.toISOString();

      const result = calculateRenewalUrgency(dateString);

      expect(result.message).toContain('day');
      expect(result.message).not.toContain('days');
    });
  });

  describe('getUrgencyColors', () => {
    test('returns red colors for critical', () => {
      const colors = getUrgencyColors('critical');

      expect(colors.border).toBe('#ef4444');
      expect(colors.bg).toBe('#fef2f2');
      expect(colors.text).toBe('#991b1b');
    });

    test('returns orange colors for important', () => {
      const colors = getUrgencyColors('important');

      expect(colors.border).toBe('#f97316');
      expect(colors.bg).toBe('#fff7ed');
      expect(colors.text).toBe('#92400e');
    });

    test('returns blue colors for upcoming', () => {
      const colors = getUrgencyColors('upcoming');

      expect(colors.border).toBe('#3b82f6');
      expect(colors.bg).toBe('#eff6ff');
      expect(colors.text).toBe('#1e3a8a');
    });

    test('returns gray colors for none', () => {
      const colors = getUrgencyColors('none');

      expect(colors.border).toBe('#cbd5e1');
      expect(colors.bg).toBe('#f1f5f9');
      expect(colors.text).toBe('#64748b');
    });
  });

  describe('formatRenewalDate', () => {
    test('formats date as "DD MMM YYYY"', () => {
      const date = '2025-12-25';
      const formatted = formatRenewalDate(date);

      expect(formatted).toMatch(/\d+ \w+ \d+/);
      expect(formatted).toContain('25');
      expect(formatted).toContain('Dec');
    });

    test('returns dash for undefined', () => {
      expect(formatRenewalDate(undefined)).toBe('—');
    });

    test('returns dash for empty string', () => {
      expect(formatRenewalDate('')).toBe('—');
    });
  });

  describe('hasUrgentRenewals', () => {
    test('returns false for undefined records', () => {
      expect(hasUrgentRenewals(undefined)).toBe(false);
    });

    test('returns false for empty array', () => {
      expect(hasUrgentRenewals([])).toBe(false);
    });

    test('returns true if any record has critical renewal', () => {
      const records = [
        {
          _id: '1',
          parentId: 'p1',
          recordType: 'Insurance' as const,
          name: 'Urgent',
          fields: {},
          status: 'active' as const,
          attachments: [],
          createdAt: '2025-10-01T00:00:00Z',
          updatedAt: '2025-10-01T00:00:00Z',
          renewalDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      expect(hasUrgentRenewals(records)).toBe(true);
    });

    test('returns false if no critical renewals', () => {
      const records = [
        {
          _id: '1',
          parentId: 'p1',
          recordType: 'Insurance' as const,
          name: 'Not Urgent',
          fields: {},
          status: 'active' as const,
          attachments: [],
          createdAt: '2025-10-01T00:00:00Z',
          updatedAt: '2025-10-01T00:00:00Z',
          renewalDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      expect(hasUrgentRenewals(records)).toBe(false);
    });
  });

  describe('shouldExpandSection', () => {
    test('returns false for empty records', () => {
      expect(shouldExpandSection([], false)).toBe(false);
    });

    test('returns false for undefined records', () => {
      expect(shouldExpandSection(undefined, false)).toBe(false);
    });

    test('returns true if has records', () => {
      const records = [
        {
          _id: '1',
          parentId: 'p1',
          recordType: 'Insurance' as const,
          name: 'Test',
          fields: {},
          status: 'active' as const,
          attachments: [],
          createdAt: '2025-10-01T00:00:00Z',
          updatedAt: '2025-10-01T00:00:00Z'
        }
      ];

      expect(shouldExpandSection(records, false)).toBe(true);
    });

    test('returns true if has urgent renewals', () => {
      expect(shouldExpandSection([], true)).toBe(true);
    });
  });
});
