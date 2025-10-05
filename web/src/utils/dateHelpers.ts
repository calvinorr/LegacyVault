// web/src/utils/dateHelpers.ts
// Helper functions for date formatting

/**
 * Format date in human-friendly relative format
 * Examples: "Tomorrow", "In 5 days", "Next week", "Yesterday", "3 days ago"
 */
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // Past dates
  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    if (absDays === 0) return 'Today';
    if (absDays === 1) return 'Yesterday';
    if (absDays < 7) return `${absDays} days ago`;
    if (absDays < 14) return 'Last week';
    if (absDays < 30) return `${Math.floor(absDays / 7)} weeks ago`;
    if (absDays < 60) return 'Last month';
    return `${Math.floor(absDays / 30)} months ago`;
  }

  // Future dates
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 14) return 'Next week';
  if (diffDays < 30) return `In ${Math.floor(diffDays / 7)} weeks`;
  if (diffDays < 60) return 'Next month';
  return `In ${Math.floor(diffDays / 30)} months`;
};

/**
 * Format date as UK standard (DD/MM/YYYY)
 */
export const formatUKDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Format date with relative and absolute date
 * Example: "In 5 days (12/10/2025)"
 */
export const formatDateWithRelative = (dateString: string): string => {
  const relative = formatRelativeDate(dateString);
  const absolute = formatUKDate(dateString);

  return `${relative} (${absolute})`;
};
