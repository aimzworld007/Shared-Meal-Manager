/**
 * @file formatters.ts
 * @summary Utility functions for formatting data like currency and dates.
 */

/**
 * Formats a number as an AED currency string.
 * @param {number} amount - The number to format.
 * @returns {string} The formatted currency string (e.g., "AED 1,234.56").
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
  }).format(amount);
};

/**
 * Formats a number as an AED currency string with no fractional digits.
 * @param {number} amount - The number to format.
 * @returns {string} The formatted currency string (e.g., "AED 1,235").
 */
export const formatCurrencyShort = (amount: number): string => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
};
